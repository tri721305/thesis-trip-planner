"use server";

import { ActionResponse, ErrorResponse } from "@/types/global";
import action from "../handler/action";
import { GuideSchema } from "../validation";
import { handleError } from "../handler/error";
import mongoose from "mongoose";
import { uploadImageAction, uploadMultipleImagesAction } from "./upload.action";
import Guide from "@/database/guide.model";
export async function createGuide(
  params: CreateGuideParams
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    authorize: true,
    schema: GuideSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, content, tags, images } = params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const imageUrls: string[] = [];

    if (images && images.length > 0) {
      console.log(`Uploading ${images.length} images to S3...`);

      // Use the new multiple upload function
      const uploadResult = await uploadMultipleImagesAction(images);

      if (!uploadResult.success) {
        throw new Error(`Failed to upload images: ${uploadResult.error}`);
      }

      if (uploadResult.data) {
        // Extract URLs from successful uploads
        imageUrls.push(...uploadResult.data.map((item) => item.url));
      }

      // Log any failed uploads
      if (uploadResult.failedUploads && uploadResult.failedUploads.length > 0) {
        console.warn(
          "Some images failed to upload:",
          uploadResult.failedUploads
        );
        // Optionally, you can decide whether to proceed or fail the entire operation
        // For now, we'll proceed with successfully uploaded images
      }

      console.log(`Successfully uploaded ${imageUrls.length} images`);
    }
    const newGuide = await Guide.create(
      {
        title,
        content,
        tags,
        images: imageUrls,
      },
      { session }
    );
    await session.commitTransaction();

    console.log(`Guide created successfully with ID:?`);
    return { success: true, data: JSON.parse(JSON.stringify(newGuide)) };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    session.endSession();
  }
}
