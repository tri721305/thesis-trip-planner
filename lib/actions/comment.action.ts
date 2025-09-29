"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
// import { after } from "next/server";

import ROUTES from "@/constants/route";
import { Guide, Vote } from "@/database";
import Comment, { IComment } from "@/database/comment.model";

import action from "../handler/action";
import { handleError } from "../handler/error";
import {
  CommentServerSchema,
  DeleteCommentSchema,
  GetCommentsSchema,
  UpdateCommentSchema,
  GetRepliesSchema,
} from "../validation";
// import { createInteraction } from "./interaction.action";

export async function createComment(
  params: CreateCommentParams
): Promise<ActionResponse<IComment>> {
  const validationResult = await action({
    params,
    schema: CommentServerSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { content, guideId, parentComment } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if the guide exists
    const guide = await Guide.findById(guideId);
    if (!guide) throw new Error("Guide not found");

    // If this is a reply, check if parent comment exists
    let parentCommentDoc = null;
    if (parentComment) {
      parentCommentDoc = await Comment.findById(parentComment);
      if (!parentCommentDoc) throw new Error("Parent comment not found");
      if (parentCommentDoc.guide.toString() !== guideId) {
        throw new Error("Parent comment does not belong to this guide");
      }
    }

    const [newComment] = await Comment.create(
      [
        {
          author: userId,
          guide: guideId,
          content,
          parentComment: parentComment || null,
        },
      ],
      { session }
    );

    if (!newComment) throw new Error("Failed to create the comment");

    // Update the guide comments count (only for top-level comments)
    if (!parentComment) {
      guide.comments += 1;
      await guide.save({ session });
    }

    // If this is a reply, add it to parent comment's replies array
    if (parentComment && parentCommentDoc) {
      await parentCommentDoc.addReply(newComment._id);
    }

    // Log the interaction
    // after(async () => {
    //   await createInteraction({
    //     action: "post",
    //     actionId: newComment._id.toString(),
    //     actionTarget: "comment",
    //     authorId: userId as string,
    //   });
    // });

    await session.commitTransaction();

    revalidatePath(ROUTES.GUIDE(guideId));

    return { success: true, data: JSON.parse(JSON.stringify(newComment)) };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export async function getComments(params: GetCommentsParams): Promise<
  ActionResponse<{
    comments: Comment[];
    isNext: boolean;
    totalComments: number;
  }>
> {
  const validationResult = await action({
    params,
    schema: GetCommentsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { guideId, page = 1, pageSize = 10, filter } = params;

  const skip = (Number(page) - 1) * pageSize;
  const limit = pageSize;

  let sortCriteria = {};

  switch (filter) {
    case "latest":
      sortCriteria = { createdAt: -1 };
      break;
    case "oldest":
      sortCriteria = { createdAt: 1 };
      break;
    case "popular":
      sortCriteria = { upvotes: -1 };
      break;
    default:
      sortCriteria = { createdAt: -1 };
      break;
  }

  try {
    // Only get top-level comments (not replies)
    const totalComments = await Comment.countDocuments({
      guide: guideId,
      parentComment: null,
      isDeleted: false,
    });

    const comments = await Comment.find({
      guide: guideId,
      parentComment: null,
      isDeleted: false,
    })
      .populate("author", "_id name image username")
      .populate({
        path: "replies",
        populate: {
          path: "author",
          select: "_id name image username",
        },
        match: { isDeleted: false },
        options: { sort: { createdAt: 1 } }, // Replies sorted oldest first
      })
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);

    const isNext = totalComments > skip + comments.length;

    return {
      success: true,
      data: {
        comments: JSON.parse(JSON.stringify(comments)),
        isNext,
        totalComments,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deleteComment(
  params: DeleteCommentParams
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: DeleteCommentSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { commentId } = validationResult.params!;
  const { user } = validationResult.session!;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) throw new Error("Comment not found");

    if (comment.author.toString() !== user?.id)
      throw new Error("You're not allowed to delete this comment");

    // Soft delete the comment
    await comment.softDelete();

    // If this is a top-level comment, reduce the guide comments count
    if (!comment.parentComment) {
      await Guide.findByIdAndUpdate(
        comment.guide,
        { $inc: { comments: -1 } },
        { new: true }
      );
    }

    // If this is a reply, remove it from parent's replies array
    if (comment.parentComment) {
      const parentComment = await Comment.findById(comment.parentComment);
      if (parentComment) {
        await parentComment.removeReply(commentId);
      }
    }

    // Delete votes associated with comment
    await Vote.deleteMany({ actionId: commentId, actionType: "comment" });

    // Log the interaction
    // after(async () => {
    //   await createInteraction({
    //     action: "delete",
    //     actionId: commentId,
    //     actionTarget: "comment",
    //     authorId: user?.id as string,
    //   });
    // });

    revalidatePath(`/profile/${user?.id}`);
    revalidatePath(ROUTES.GUIDE(comment.guide.toString()));

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function updateComment(
  params: UpdateCommentParams
): Promise<ActionResponse<IComment>> {
  const validationResult = await action({
    params,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { commentId, content } = validationResult.params!;
  const { user } = validationResult.session!;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) throw new Error("Comment not found");

    if (comment.author.toString() !== user?.id)
      throw new Error("You're not allowed to edit this comment");

    if (comment.isDeleted) throw new Error("Cannot edit a deleted comment");

    // Update the comment content
    comment.content = content;
    await comment.markAsEdited();

    // Log the interaction
    // after(async () => {
    //   await createInteraction({
    //     action: "edit",
    //     actionId: commentId,
    //     actionTarget: "comment",
    //     authorId: user?.id as string,
    //   });
    // });

    revalidatePath(ROUTES.GUIDE(comment.guide.toString()));

    return { success: true, data: JSON.parse(JSON.stringify(comment)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getReplies(params: GetRepliesParams): Promise<
  ActionResponse<{
    replies: Comment[];
    isNext: boolean;
    totalReplies: number;
  }>
> {
  const validationResult = await action({
    params,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { parentCommentId, page = 1, pageSize = 5 } = params;

  const skip = (Number(page) - 1) * pageSize;
  const limit = pageSize;

  try {
    const totalReplies = await Comment.countDocuments({
      parentComment: parentCommentId,
      isDeleted: false,
    });

    const replies = await Comment.find({
      parentComment: parentCommentId,
      isDeleted: false,
    })
      .populate("author", "_id name image username")
      .sort({ createdAt: 1 }) // Replies sorted oldest first
      .skip(skip)
      .limit(limit);

    const isNext = totalReplies > skip + replies.length;

    return {
      success: true,
      data: {
        replies: JSON.parse(JSON.stringify(replies)),
        isNext,
        totalReplies,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
