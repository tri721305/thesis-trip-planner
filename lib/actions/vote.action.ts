"use server";

import mongoose, { ClientSession } from "mongoose";
import { revalidatePath } from "next/cache";

import Guide from "@/database/guide.model";
import Vote from "@/database/vote.model";

import action from "../handler/action";
import { handleError } from "../handler/error";
import { CreateVoteSchema, HasVotedSchema } from "../validation";

async function recalculateVoteCounts(
  targetId: string,
  targetType: "guide" | "comment"
): Promise<ActionResponse> {
  try {
    // Count actual votes from database (NO SESSION - outside transaction)
    const upvotes = await Vote.countDocuments({
      actionId: targetId,
      actionType: targetType,
      voteType: "upvote",
    });

    const downvotes = await Vote.countDocuments({
      actionId: targetId,
      actionType: targetType,
      voteType: "downvote",
    });

    // Update the target document with actual counts (NO SESSION - outside transaction)
    const Model = targetType === "guide" ? Guide : null;
    if (!Model) {
      return handleError(new Error("Unsupported target type")) as ErrorResponse;
    }

    await Model.findByIdAndUpdate(
      targetId,
      {
        upvotes,
        downvotes,
      }
      // No session parameter - run outside transaction
    );

    console.log(`📊 Recalculated votes for ${targetType} ${targetId}:`, {
      upvotes,
      downvotes,
    });

    return { success: true };
  } catch (error) {
    console.error("❌ Failed to recalculate vote counts:", error);
    return handleError(error) as ErrorResponse;
  }
}

export async function createVote(
  params: CreateVoteParams
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: CreateVoteSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { targetId, targetType, voteType } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  if (!userId) return handleError(new Error("Unauthorized")) as ErrorResponse;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const Model = targetType === "guide" ? Guide : null;

    if (!Model) {
      throw new Error("Unsupported target type");
    }

    const contentDoc = await Model.findById(targetId).session(session);
    if (!contentDoc) throw new Error("Content not found");

    const contentAuthorId = contentDoc.author.toString();

    const existingVote = await Vote.findOne({
      author: userId,
      actionId: targetId,
      actionType: targetType,
    }).session(session);

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // If user is voting again with the same vote type, remove the vote
        await Vote.deleteOne({ _id: existingVote._id }).session(session);
      } else {
        // If user is changing their vote, update voteType and recalculate counts
        await Vote.findByIdAndUpdate(
          existingVote._id,
          { voteType },
          { new: true, session }
        );
      }
    } else {
      // First-time vote creation
      await Vote.create(
        [
          {
            author: userId,
            actionId: targetId,
            actionType: targetType,
            voteType,
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    // Recalculate vote counts OUTSIDE transaction to avoid write conflicts
    await recalculateVoteCounts(targetId, targetType);

    revalidatePath(`/guides/${targetId}`);

    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return handleError(error) as ErrorResponse;
  }
}

export async function hasVoted(
  params: HasVotedParams
): Promise<ActionResponse<HasVotedResponse>> {
  const validationResult = await action({
    params,
    schema: HasVotedSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { targetId, targetType } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  try {
    const vote = await Vote.findOne({
      author: userId,
      actionId: targetId,
      actionType: targetType,
    });

    if (!vote)
      return {
        success: false,
        data: {
          hasUpvoted: false,
          hasDownvoted: false,
        },
      };

    return {
      success: true,
      data: {
        hasUpvoted: vote.voteType === "upvote",
        hasDownvoted: vote.voteType === "downvote",
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
