"use server";

import action from "../handler/action";
// import { GuideSchema } from "../validation";
import { handleError } from "../handler/error";
import mongoose from "mongoose";
import {
  uploadMultipleImagesAction,
  deleteMultipleImagesFromS3,
} from "./upload.action";
import Guide from "@/database/guide.model";
import Tag from "@/database/tag.model";
import TagGuide from "@/database/tag-guide.model";
import { GuideSchema } from "../validation";

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

  // Track uploaded images for potential cleanup
  let uploadedImageUrls: string[] = [];

  try {
    // PHASE 1: Upload images to S3 first (outside transaction)
    if (images1 && images1.length > 0) {
      console.log(`Phase 1: Uploading ${images1.length} images to S3...`);

      const uploadResult = await uploadMultipleImagesAction(images1);

      if (!uploadResult.success) {
        throw new Error(`S3 upload failed: ${uploadResult.error}`);
      }

      if (uploadResult.data) {
        uploadedImageUrls = uploadResult.data.map((item) => item.url);
        console.log(`S3 upload successful: ${uploadedImageUrls.length} images`);
      }

      // Log any partial failures but continue
      if (uploadResult.failedUploads && uploadResult.failedUploads.length > 0) {
        console.warn(
          "Some images failed to upload:",
          uploadResult.failedUploads
        );
      }
    }

    // PHASE 2: Database operations in transaction
    console.log("Phase 2: Starting MongoDB transaction...");
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Create guide with S3 URLs
      const [guide] = await Guide.create(
        [
          {
            title,
            content,
            tags: [], // Will be updated after tag processing
            images: uploadedImageUrls, // Use S3 URLs
            author: userId,
          },
        ],
        { session }
      );

      if (!guide) {
        throw new Error("Failed to create guide");
      }

      console.log("Guide created:", guide._id);

      // Process tags
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

      // Create tag-guide relationships
      if (tagGuideDocuments.length > 0) {
        await TagGuide.insertMany(tagGuideDocuments, { session });
      }

      // Update guide with tag IDs
      await Guide.findByIdAndUpdate(
        guide._id,
        {
          $push: { tags: { $each: tagIds } },
        },
        { session }
      );

      // Commit transaction
      await session.commitTransaction();
      console.log("MongoDB transaction committed successfully");

      return {
        success: true,
        data: JSON.parse(JSON.stringify(guide)),
      };
    } catch (mongoError) {
      // Rollback MongoDB transaction
      await session.abortTransaction();
      console.error("MongoDB transaction failed:", mongoError);

      // COMPENSATING ACTION: Clean up S3 uploads
      if (uploadedImageUrls.length > 0) {
        console.log("Compensating action: Cleaning up S3 uploads...");
        try {
          const cleanupResult =
            await deleteMultipleImagesFromS3(uploadedImageUrls);
          if (cleanupResult.success) {
            console.log(
              `Successfully cleaned up ${cleanupResult.deletedCount} S3 files`
            );
          } else {
            console.error(
              `Partial S3 cleanup: ${cleanupResult.deletedCount} deleted, ${cleanupResult.errors.length} failed`
            );
          }
        } catch (cleanupError) {
          console.error("Failed to cleanup S3 files:", cleanupError);
          // Even if cleanup fails, we still want to report the original MongoDB error
        }
      }

      throw mongoError;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Error creating guide:", error);
    return handleError(error) as ErrorResponse;
  }
}
