"use server";

import action from "../handler/action";
import { handleError } from "../handler/error";
import mongoose, { Types } from "mongoose";
import Guide from "@/database/guide.model";
import User from "@/database/user.model"; // Import User model for populate
import {
  CreateTravelPlannerSchema,
  UpdateTravelPlannerSchema,
} from "../validation";
import {
  uploadMultipleImagesAction,
  deleteMultipleImagesFromS3,
} from "./upload.action";

interface CreateGuideParams {
  title?: string;
  image?: string;
  note?: string;
  author?: string;
  tripmates?: Array<{
    name: string;
    email?: string;
    image?: string;
    userId?: string;
  }>;
  state?: "planning" | "ongoing" | "completed" | "cancelled";
  type?: "public" | "private" | "friend";
  destination: {
    name: string;
    coordinates: [number, number]; // [longitude, latitude]
    type: "province" | "ward";
    provinceId?: string;
    wardId?: string;
  };
  startDate?: Date;
  endDate?: Date;
  generalTips?: string;
  lodging?: Array<any>;
  details?: Array<any>;
  upvotes?: number;
  downvotes?: number;
  views?: number;
  comments?: number;
}

interface UpdateGuideParams {
  guideId: string;
  title?: string;
  image?: string;
  note?: string;
  tripmates?: Array<{
    name: string;
    email?: string;
    image?: string;
    userId?: string;
  }>;
  state?: "planning" | "ongoing" | "completed" | "cancelled";
  type?: "public" | "private" | "friend";
  destination?: {
    name: string;
    coordinates: [number, number]; // [longitude, latitude]
    type: "province" | "ward";
    provinceId?: string;
    wardId?: string;
  };
  startDate?: Date;
  endDate?: Date;
  generalTips?: string;
  lodging?: Array<any>;
  details?: Array<any>;
  upvotes?: number;
  downvotes?: number;
  views?: number;
  comments?: number;
}

export async function createGuide(
  params: CreateGuideParams
): Promise<ActionResponse<any>> {
  const validationResult = await action({
    params,
    authorize: true,
    // Temporarily disable schema validation to avoid type conflicts
    // schema: CreateTravelPlannerSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const {
    title,
    image,
    note,
    tripmates,
    state,
    type,
    destination,
    startDate,
    endDate,
    generalTips,
    lodging,
    details,
  } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  try {
    // PHASE: Database operations in transaction
    console.log("Starting MongoDB transaction...");
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Determine initial state based on start date
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const planStartDate = new Date(startDate || new Date());
      const startOfStartDate = new Date(
        planStartDate.getFullYear(),
        planStartDate.getMonth(),
        planStartDate.getDate()
      );

      const initialState = startOfStartDate <= today ? "ongoing" : "planning";

      // Create travel guide with basic structure
      const [guide] = await Guide.create(
        [
          {
            title: (title || "New Travel Guide").trim(),
            image,
            note,
            author: new mongoose.Types.ObjectId(userId),
            tripmates: tripmates || [],
            state: state || initialState,
            type: type || "public",
            destination: {
              name: destination.name.trim(),
              coordinates: destination.coordinates,
              type: destination.type,
              ...(destination.provinceId && {
                provinceId: destination.provinceId,
              }),
              ...(destination.wardId && {
                wardId: destination.wardId,
              }),
            },
            startDate: new Date(startDate || new Date()),
            endDate: new Date(
              endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            ),
            generalTips,
            lodging: lodging || [],
            details: details || [],
            upvotes: 0,
            downvotes: 0,
            views: 0,
            comments: 0,
          },
        ],
        { session }
      );

      if (!guide) {
        throw new Error("Failed to create guide");
      }

      console.log("Guide created:", guide._id);

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
      throw mongoError;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Error creating guide:", error);
    return handleError(error) as ErrorResponse;
  }
}

/**
 * Get planner by ID
 * @param guideId - The planner ID
 * @returns Guide data or error
 */

export async function getGuideById(params: { guideId: string }) {
  const validationResult = await action({
    params,
    authorize: false,
  });
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { guideId } = validationResult.params!;

  try {
    if (!Types.ObjectId.isValid(guideId)) {
      return {
        success: false,
        error: {
          message: "Invalid guide ID",
        },
      };
    }
    const guide = await Guide.findById(guideId).populate({
      path: "author",
      model: "User",
      select: "username image name",
    });

    if (!guide) {
      return {
        success: false,
        error: {
          message: "Guide note found",
        },
      };
    }

    // Debug logging for populate
    console.log("🔍 Debug populate result:");
    console.log("- guide.author:", guide.author);
    console.log("- guide.author type:", typeof guide.author);
    console.log("- guide.author populated:", guide.populated("author"));

    // Structure the response with authorDetails
    const guideData = JSON.parse(JSON.stringify(guide));

    // More robust check for author data
    let authorDetails = null;
    if (guide.author && typeof guide.author === "object" && guide.author._id) {
      // Author was populated successfully
      authorDetails = {
        username: guide.author.username,
        image: guide.author.image,
        name: guide.author.name,
      };
    } else if (guide.author) {
      // Author is just an ID, try to fetch separately
      console.log("Author not populated, fetching separately...");
      try {
        const authorUser = await User.findById(guide.author).select(
          "username image name"
        );
        if (authorUser) {
          authorDetails = {
            username: authorUser.username,
            image: authorUser.image,
            name: authorUser.name,
          };
        }
      } catch (err) {
        console.error("Error fetching author separately:", err);
      }
    }

    console.log("- final authorDetails:", authorDetails);

    const result = {
      ...guideData,
      authorDetails,
    };

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function updateGuide(
  params: UpdateGuideParams
): Promise<ActionResponse<any>> {
  console.log("🔍 updateGuide called with params:", {
    guideId: params.guideId,
    hasTitle: !!params.title,
    hasStartDate: !!params.startDate,
    hasEndDate: !!params.endDate,
    hasDestination: !!params.destination,
    hasDetails: !!params.details,
    detailsCount: params.details?.length || 0,
  });

  const validationResult = await action({
    params,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    console.error("❌ Validation failed:", validationResult.message);
    return handleError(validationResult) as ErrorResponse;
  }

  console.log("✅ Validation passed");

  const { guideId, ...updateData } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  console.log("updateData", updateData);

  try {
    // PHASE: Database operations in transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Check if guide exists and user has permission
      const existingGuide = await Guide.findById(guideId).session(session);

      if (!existingGuide) {
        throw new Error("Guide not found");
      }

      // Debug logging for permission check
      console.log("🔍 Permission debug:");
      console.log("- existingGuide.author:", existingGuide.author);
      console.log("- existingGuide.author type:", typeof existingGuide.author);
      console.log("- userId:", userId);
      console.log("- userId type:", typeof userId);

      // Check if user is the author or a tripmate (same logic as planner)
      const isAuthor = existingGuide.author?.toString() === userId;
      const isTripmate = existingGuide.tripmates?.some(
        (tripmate: any) =>
          tripmate.userId && tripmate.userId.toString() === userId
      );

      // Special case: if guide has no author, allow current user to claim it
      const canClaimOwnership =
        !existingGuide.author ||
        existingGuide.author === null ||
        existingGuide.author === undefined;

      console.log("- isAuthor:", isAuthor);
      console.log("- isTripmate:", isTripmate);
      console.log("- canClaimOwnership:", canClaimOwnership);
      console.log("- tripmates count:", existingGuide.tripmates?.length || 0);

      if (!isAuthor && !isTripmate && !canClaimOwnership) {
        throw new Error(
          "Permission denied: You are not authorized to update this guide"
        );
      }

      // Build update object only with provided fields
      const updateObject: any = {};

      // Basic fields
      if (updateData.title) updateObject.title = updateData.title.trim();
      if (updateData.image) updateObject.image = updateData.image;
      if (updateData.note) updateObject.note = updateData.note;
      if (updateData.generalTips)
        updateObject.generalTips = updateData.generalTips;
      if (updateData.type) updateObject.type = updateData.type;
      if (updateData.state) updateObject.state = updateData.state;

      // Destination
      if (updateData.destination) {
        updateObject.destination = {
          name: updateData.destination.name.trim(),
          coordinates: updateData.destination.coordinates,
          type: updateData.destination.type,
          ...(updateData.destination.provinceId && {
            provinceId: updateData.destination.provinceId,
          }),
          ...(updateData.destination.wardId && {
            wardId: updateData.destination.wardId,
          }),
        };
      }

      // Dates
      if (updateData.startDate) {
        updateObject.startDate = new Date(updateData.startDate);
      }
      if (updateData.endDate) {
        updateObject.endDate = new Date(updateData.endDate);
      }

      // Arrays (allow empty arrays to clear data)
      if (updateData.tripmates !== undefined) {
        updateObject.tripmates = updateData.tripmates;
      }
      if (updateData.lodging !== undefined) {
        updateObject.lodging = updateData.lodging;
      }
      if (updateData.details !== undefined) {
        updateObject.details = updateData.details;
      }

      // Update the guide
      const updatedGuide = await Guide.findByIdAndUpdate(
        guideId,
        { $set: updateObject },
        {
          new: true,
          runValidators: false,
          session,
        }
      );

      if (!updatedGuide) {
        throw new Error("Failed to update guide");
      }

      await session.commitTransaction();
      console.log("Guide updated successfully:", updatedGuide._id);

      return {
        success: true,
        data: JSON.parse(JSON.stringify(updatedGuide)),
      };
    } catch (mongoError) {
      await session.abortTransaction();
      throw mongoError;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Error updating guide:", error);
    return handleError(error) as ErrorResponse;
  }
}

/**
 * Upload images and update travel guide with image URLs
 * @param params - Image upload and update parameters
 * @returns Updated guide data or error
 */
export async function updateGuideImages(params: {
  guideId: string;
  imageFiles: File[];
  targetType: "main" | "general" | "place" | "tripmate";
  targetIndex?: number; // For place or tripmate specific images
  detailIndex?: number; // For place images within details array
  placeIndex?: number; // For specific place within detail data
}): Promise<ActionResponse<any>> {
  const validationResult = await action({
    params: { guideId: params.guideId },
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { guideId } = validationResult.params!;
  const { imageFiles, targetType, targetIndex, detailIndex, placeIndex } =
    params;
  const userId = validationResult?.session?.user?.id;

  try {
    // Validate guide exists and user has permission
    const existingGuide = await Guide.findById(guideId);

    if (!existingGuide) {
      return {
        success: false,
        error: {
          message: "Guide not found",
        },
      };
    }

    // Check permissions (same logic as updateGuide)
    const isAuthor = existingGuide.author?.toString() === userId;
    const isTripmate = existingGuide.tripmates?.some(
      (tripmate: any) =>
        tripmate.userId && tripmate.userId.toString() === userId
    );
    const canClaimOwnership =
      !existingGuide.author ||
      existingGuide.author === null ||
      existingGuide.author === undefined;

    if (!isAuthor && !isTripmate && !canClaimOwnership) {
      return {
        success: false,
        error: {
          message:
            "Permission denied: You are not authorized to update this guide",
        },
      };
    }

    // Upload images to S3
    console.log(`Uploading ${imageFiles.length} images to S3...`);
    const uploadResult = await uploadMultipleImagesAction(imageFiles);

    if (!uploadResult.success || !uploadResult.data) {
      return {
        success: false,
        error: {
          message: uploadResult.error || "Failed to upload images to S3",
        },
      };
    }

    const imageUrls = uploadResult.data.map((img) => img.url);
    console.log("Successfully uploaded images:", imageUrls);

    // Start database transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      let updateObject: any = {};

      switch (targetType) {
        case "main":
          updateObject.image = imageUrls[0]; // Set main image
          break;

        case "general":
          // Add to general images array (if Guide model has this field)
          updateObject.$push = { generalImages: { $each: imageUrls } };
          break;

        case "tripmate":
          if (targetIndex !== undefined) {
            updateObject[`tripmates.${targetIndex}.image`] = imageUrls[0];
          }
          break;

        case "place":
          if (detailIndex !== undefined && placeIndex !== undefined) {
            // Update place image within details array
            updateObject[`details.${detailIndex}.data.${placeIndex}.image`] =
              imageUrls[0];
          }
          break;

        default:
          throw new Error("Invalid target type");
      }

      // Update the guide
      const updatedGuide = await Guide.findByIdAndUpdate(
        guideId,
        updateObject,
        {
          new: true,
          runValidators: false,
          session,
        }
      );

      if (!updatedGuide) {
        throw new Error("Failed to update guide with image URLs");
      }

      console.log("Guide updated with images:", updatedGuide._id);

      // Commit transaction
      await session.commitTransaction();
      console.log("MongoDB transaction committed successfully");

      return {
        success: true,
        data: JSON.parse(JSON.stringify(updatedGuide)),
      };
    } catch (dbError) {
      // Rollback database transaction
      await session.abortTransaction();
      console.error("Database transaction failed, rolling back:", dbError);

      // Also rollback S3 uploads
      console.log("Rolling back S3 uploads...");
      await deleteMultipleImagesFromS3(imageUrls);

      throw dbError;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Error updating guide images:", error);
    return handleError(error) as ErrorResponse;
  }
}

/**
 * Upload single image for travel guide (main image)
 * @param params - Single image upload parameters
 * @returns Updated guide data or error
 */
export async function updateGuideMainImage(params: {
  guideId: string;
  imageFile: File;
}): Promise<ActionResponse<any>> {
  return updateGuideImages({
    guideId: params.guideId,
    imageFiles: [params.imageFile],
    targetType: "main",
  });
}

/**
 * Upload multiple images for travel guide general gallery
 * @param params - Multiple images upload parameters
 * @returns Updated guide data or error
 */
export async function updateGuideGeneralImages(params: {
  guideId: string;
  imageFiles: File[];
}): Promise<ActionResponse<any>> {
  return updateGuideImages({
    guideId: params.guideId,
    imageFiles: params.imageFiles,
    targetType: "general",
  });
}

/**
 * Upload image for specific tripmate in guide
 * @param params - Tripmate image upload parameters
 * @returns Updated guide data or error
 */
export async function updateGuideTripmateImage(params: {
  guideId: string;
  imageFile: File;
  tripmateIndex: number;
}): Promise<ActionResponse<any>> {
  return updateGuideImages({
    guideId: params.guideId,
    imageFiles: [params.imageFile],
    targetType: "tripmate",
    targetIndex: params.tripmateIndex,
  });
}

/**
 * Upload images for specific place in travel guide
 * @param params - Place image upload parameters
 * @returns Updated guide data or error
 */
export async function updateGuidePlaceImages(params: {
  guideId: string;
  imageFiles: File[];
  detailIndex: number;
  placeIndex: number;
}): Promise<ActionResponse<any>> {
  return updateGuideImages({
    guideId: params.guideId,
    imageFiles: params.imageFiles,
    targetType: "place",
    detailIndex: params.detailIndex,
    placeIndex: params.placeIndex,
  });
}

/**
 * Increment view count for a guide
 * @param guideId - Guide ID to increment views
 * @returns Success response
 */
export async function incrementGuideViews(
  guideId: string
): Promise<ActionResponse> {
  try {
    const guide = await Guide.findById(guideId);
    if (!guide) {
      return handleError(new Error("Guide not found")) as ErrorResponse;
    }

    await guide.incrementViews();

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
