"use server";

import action from "../handler/action";
import { GuideSchema } from "../validation";
import { handleError } from "../handler/error";
import mongoose from "mongoose";
import { uploadImageAction, uploadMultipleImagesAction } from "./upload.action";
import Guide from "@/database/guide.model";
import Tag from "@/database/tag.model";
import TagGuide from "@/database/tag-guide.model";
export async function createGuide(
  params: CreateGuideParams
): Promise<ActionResponse<Guide>> {
  const validationResult = await action({
    params,
    authorize: true,
    schema: GuideSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, content, tags, images1 } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [guide] = await Guide.create(
      [
        {
          title,
          content,
          tags,
          images1,
          author: userId,
        },
      ],
      { session }
    );
    console.log("params", params, guide);

    if (!guide) {
      throw new Error("Failed to create guide");
    }

    const tagIds: mongoose.Types.ObjectId[] = [];
    const tagGuideDocuments = [];

    for (const tag of tags) {
      const existingTag = await Tag.findOneAndUpdate(
        {
          name: { $regex: new RegExp(`^${tag}$`, "i") },
        },
        {
          $setOnInsert: { name: tag },
          $inc: { guides: 1 },
        },
        {
          upsert: true,
          new: true,
          session,
        }
      );

      tagIds.push(existingTag?._id);
      tagGuideDocuments.push({
        tag: existingTag._id,
        guide: guide._id,
      });
    }

    await TagGuide.insertMany(tagGuideDocuments, { session });
    await Guide.findByIdAndUpdate(
      guide._id,
      {
        $push: { tags: { $each: tagIds } },
      },
      { session }
    );

    await session.commitTransaction();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(guide)),
    };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    session.endSession();
  }
}
