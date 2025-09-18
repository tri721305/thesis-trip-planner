"use server";

import action from "../handler/action";
import { handleError } from "../handler/error";
import mongoose, { Types } from "mongoose";
import TravelPlan from "@/database/plan.model";
import {
  CreateTravelPlannerSchema,
  UpdateTravelPlannerSchema,
} from "../validation";
import {
  uploadMultipleImagesAction,
  deleteMultipleImagesFromS3,
} from "./upload.action";

export async function createPlanner(
  params: CreatePlannerParams
): Promise<ActionResponse<TravelPlan>> {
  const validationResult = await action({
    params,
    authorize: true,
    schema: CreateTravelPlannerSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, destination, startDate, endDate, type, details } =
    validationResult.params!;
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
      const planStartDate = new Date(startDate);
      const startOfStartDate = new Date(
        planStartDate.getFullYear(),
        planStartDate.getMonth(),
        planStartDate.getDate()
      );

      const initialState = startOfStartDate <= today ? "ongoing" : "planning";

      // Create travel plan with basic structure
      const [planner] = await TravelPlan.create(
        [
          {
            title: title.trim(),
            author: new mongoose.Types.ObjectId(userId),
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
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            type,
            state: initialState,
            tripmates: [], // Empty initially, can be added later
            lodging: [], // Empty initially, can be added later
            details: details || [], // Empty initially, can be added later
          },
        ],
        { session }
      );

      if (!planner) {
        throw new Error("Failed to create planner");
      }

      console.log("Planner created:", planner._id);

      // Commit transaction
      await session.commitTransaction();
      console.log("MongoDB transaction committed successfully");

      return {
        success: true,
        data: JSON.parse(JSON.stringify(planner)),
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
    console.error("Error creating planner:", error);
    return handleError(error) as ErrorResponse;
  }
}

/**
 * Get planner by ID
 * @param plannerId - The planner ID
 * @returns Planner data or error
 */
export async function getPlannerById(params: {
  plannerId: string;
}): Promise<ActionResponse<TravelPlan>> {
  const validationResult = await action({
    params,
    authorize: false,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { plannerId } = validationResult.params!;

  try {
    if (!Types.ObjectId.isValid(plannerId)) {
      return {
        success: false,
        error: {
          message: "Invalid planner ID",
        },
      };
    }

    const planner = await TravelPlan.findById(plannerId);

    if (!planner) {
      return {
        success: false,
        error: {
          message: "Planner not found",
        },
      };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(planner)),
    };
  } catch (error) {
    console.error("Error fetching planner:", error);
    return handleError(error) as ErrorResponse;
  }
}

/**
 * Get all planners by user ID
 * @param params - User ID and optional filters
 * @returns Array of planner data or error
 */
export async function getPlannerByUserId(params: {
  userId?: string; // Optional, if not provided, use current user from session
  state?: "planning" | "ongoing" | "completed" | "cancelled"; // Optional filter by state
  limit?: number; // Optional limit, default 20
  offset?: number; // Optional offset for pagination, default 0
  sortBy?: "createdAt" | "startDate" | "title"; // Optional sort field, default "createdAt"
  sortOrder?: "asc" | "desc"; // Optional sort order, default "desc"
}): Promise<
  ActionResponse<{
    planners: TravelPlan[];
    total: number;
    hasMore: boolean;
  }>
> {
  const validationResult = await action({
    params,
    authorize: true, // Require authentication
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const {
    userId: providedUserId,
    state,
    limit = 20,
    offset = 0,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = validationResult.params!;

  // Use provided userId or current user's ID from session
  const targetUserId = providedUserId || validationResult?.session?.user?.id;

  if (!targetUserId) {
    return {
      success: false,
      error: {
        message: "User ID is required",
      },
    };
  }

  try {
    if (!Types.ObjectId.isValid(targetUserId)) {
      return {
        success: false,
        error: {
          message: "Invalid user ID",
        },
      };
    }

    // Build query filter
    const filter: any = {
      $or: [
        { author: new Types.ObjectId(targetUserId) }, // User is the author
        { "tripmates.userId": targetUserId }, // User is a tripmate
      ],
    };

    // Add state filter if provided
    if (state) {
      filter.state = state;
    }

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Get total count for pagination
    const total = await TravelPlan.countDocuments(filter);

    // Get planners with pagination and sorting
    const planners = await TravelPlan.find(filter)
      .sort(sortObj)
      .skip(offset)
      .limit(limit)
      .populate("author", "name email image") // Populate author info
      .lean(); // Use lean for better performance

    // Calculate if there are more results
    const hasMore = offset + limit < total;

    console.log(`Found ${planners.length} planners for user ${targetUserId}`);

    return {
      success: true,
      data: {
        planners: JSON.parse(JSON.stringify(planners)),
        total,
        hasMore,
      },
    };
  } catch (error) {
    console.error("Error fetching planners by user ID:", error);
    return handleError(error) as ErrorResponse;
  }
}

/**
 * Get recent planners for dashboard (simplified version of getPlannerByUserId)
 * @param params - Optional limit for recent planners
 * @returns Array of recent planner data or error
 */
export async function getRecentPlanners(params: {
  limit?: number; // Optional limit, default 5
}): Promise<ActionResponse<TravelPlan[]>> {
  const { limit = 5 } = params;

  const result = await getPlannerByUserId({
    limit,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  if (!result.success || !result.data) {
    return {
      success: false,
      error: result.error || { message: "Failed to fetch recent planners" },
    };
  }

  return {
    success: true,
    data: result.data.planners,
  };
}

export async function updatePlanner(
  params: UpdatePlannerParams
): Promise<ActionResponse<TravelPlan>> {
  console.log("🔍 updatePlanner called with params:", {
    plannerId: params.plannerId,
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
    schema: UpdateTravelPlannerSchema,
  });

  if (validationResult instanceof Error) {
    console.error("❌ Validation failed:", validationResult.message);
    return handleError(validationResult) as ErrorResponse;
  }

  console.log("✅ Validation passed");

  const { plannerId, ...updateData } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  // 🔍 DEBUG: Check if cost data survives validation
  console.log(
    "🔍 Raw params from validation:",
    JSON.stringify(validationResult.params, null, 2)
  );
  if (updateData.details) {
    updateData.details.forEach((detail: any, detailIndex: number) => {
      if (detail.data) {
        detail.data.forEach((item: any, itemIndex: number) => {
          if (item.type === "place" && item.cost) {
            console.log(
              `💰 POST-VALIDATION Cost data [${detailIndex}-${itemIndex}]:`,
              {
                name: item.name,
                costValue: item.cost?.value,
                fullCost: JSON.stringify(item.cost, null, 2),
              }
            );
          }
        });
      }
    });
  }

  console.log("updateData", updateData);

  try {
    // PHASE: Database operations in transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Check if planner exists and user has permission to update
      const existingPlanner =
        await TravelPlan.findById(plannerId).session(session);

      if (!existingPlanner) {
        throw new Error("Planner not found");
      }

      // Check if user is the author or a tripmate
      const isAuthor = existingPlanner.author.toString() === userId;
      const isTripmate = existingPlanner.tripmates.some(
        (tripmate: any) =>
          tripmate.userId && tripmate.userId.toString() === userId
      );

      if (!isAuthor && !isTripmate) {
        throw new Error(
          "Permission denied: You are not authorized to update this planner"
        );
      }

      console.log("🔍 DEBUG - updatePlanner received data:", {
        hasDetails: !!updateData.details,
        detailsLength: updateData.details?.length,
        firstDetailSample: updateData.details?.[0],
      });

      // Debug: Check place items in details for location data
      if (updateData.details) {
        updateData.details.forEach((detail: any, detailIndex: number) => {
          if (detail.data) {
            detail.data.forEach((item: any, itemIndex: number) => {
              if (item.type === "place") {
                console.log(`🔍 Place item [${detailIndex}-${itemIndex}]:`, {
                  name: item.name,
                  hasLocation: !!item.location,
                  location: item.location,
                  coordinates: item.location?.coordinates,
                });
              }
            });
          }
        });
      }

      // Prepare update object
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

      // Dates with error handling
      if (updateData.startDate) {
        try {
          updateObject.startDate = new Date(updateData.startDate);
          console.log("✅ startDate parsed:", updateObject.startDate);
        } catch (error) {
          console.error(
            "❌ Error parsing startDate:",
            updateData.startDate,
            error
          );
          throw new Error(`Invalid startDate format: ${updateData.startDate}`);
        }
      }
      if (updateData.endDate) {
        try {
          updateObject.endDate = new Date(updateData.endDate);
          console.log("✅ endDate parsed:", updateObject.endDate);
        } catch (error) {
          console.error("❌ Error parsing endDate:", updateData.endDate, error);
          throw new Error(`Invalid endDate format: ${updateData.endDate}`);
        }
      }

      // Arrays - replace entirely if provided
      if (updateData.tripmates) updateObject.tripmates = updateData.tripmates;
      if (updateData.lodging) updateObject.lodging = updateData.lodging;
      if (updateData.details) updateObject.details = updateData.details;

      console.log("udpateObject", updateObject.details[0].data);

      // 🔍 DEBUG: Log cost data before update
      if (updateObject.details) {
        updateObject.details.forEach((detail: any, detailIndex: number) => {
          if (detail.data) {
            detail.data.forEach((item: any, itemIndex: number) => {
              if (item.type === "place" && item.cost) {
                console.log(
                  `💰 BEFORE UPDATE - Cost data [${detailIndex}-${itemIndex}]:`,
                  {
                    name: item.name,
                    costValue: item.cost?.value,
                    costType: item.cost?.type,
                    costDescription: item.cost?.description,
                    splitBetweenCount: item.cost?.splitBetween?.length,
                    fullCostObject: JSON.stringify(item.cost, null, 2),
                  }
                );
              }
            });
          }
        });
      }

      // Update the planner
      const updatedPlanner = await TravelPlan.findByIdAndUpdate(
        plannerId,
        { $set: updateObject },
        {
          new: true,
          runValidators: false,
          session,
        }
      );

      if (!updatedPlanner) {
        throw new Error("Failed to update planner");
      }

      console.log("Planner updated:", updatedPlanner._id);

      // 🔍 DEBUG: Log cost data after update to verify persistence
      if (updatedPlanner.details) {
        updatedPlanner.details.forEach((detail: any, detailIndex: number) => {
          if (detail.data) {
            detail.data.forEach((item: any, itemIndex: number) => {
              if (item.type === "place") {
                console.log(
                  `💰 AFTER UPDATE - Place item [${detailIndex}-${itemIndex}]:`,
                  {
                    name: item.name,
                    hasCost: !!item.cost,
                    costValue: item.cost?.value,
                    costType: item.cost?.type,
                    costDescription: item.cost?.description,
                    splitBetweenCount: item.cost?.splitBetween?.length,
                    fullCostObject: item.cost
                      ? JSON.stringify(item.cost, null, 2)
                      : "NO COST DATA",
                  }
                );
              }
            });
          }
        });
      }

      console.log(
        "Updated details:",
        JSON.stringify(updatedPlanner.details, null, 2)
      );

      // Commit transaction
      await session.commitTransaction();
      console.log("MongoDB transaction committed successfully");

      return {
        success: true,
        data: JSON.parse(JSON.stringify(updatedPlanner)),
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
    console.error("Error updating planner:", error);
    return handleError(error) as ErrorResponse;
  }
}

/**
 * Partial update planner - only update specific fields without affecting others
 * @param params - Partial update parameters
 * @returns Updated planner data or error
 */
export async function partialUpdatePlanner(
  params: Partial<UpdatePlannerParams> & { plannerId: string }
): Promise<ActionResponse<TravelPlan>> {
  const validationResult = await action({
    params,
    authorize: true,
    // No schema validation for partial updates to allow flexibility
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { plannerId, ...updateData } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  try {
    // Check if planner exists and user has permission
    const existingPlanner = await TravelPlan.findById(plannerId);

    if (!existingPlanner) {
      return {
        success: false,
        error: {
          message: "Planner not found",
        },
      };
    }

    // Check permissions
    const isAuthor = existingPlanner.author.toString() === userId;
    const isTripmate = existingPlanner.tripmates.some(
      (tripmate: any) =>
        tripmate.userId && tripmate.userId.toString() === userId
    );

    if (!isAuthor && !isTripmate) {
      return {
        success: false,
        error: {
          message:
            "Permission denied: You are not authorized to update this planner",
        },
      };
    }

    // Build update object only with provided fields
    const updateObject: any = {};
    Object.keys(updateData).forEach((key) => {
      if (updateData[key as keyof typeof updateData] !== undefined) {
        if (key === "startDate" || key === "endDate") {
          updateObject[key] = new Date(
            updateData[key as keyof typeof updateData] as string | Date
          );
        } else if (
          key === "title" &&
          typeof updateData[key as keyof typeof updateData] === "string"
        ) {
          updateObject[key] = (
            updateData[key as keyof typeof updateData] as string
          ).trim();
        } else if (key === "destination" && updateData.destination) {
          updateObject[key] = {
            ...updateData.destination,
            name: updateData.destination.name.trim(),
          };
        } else {
          updateObject[key] = updateData[key as keyof typeof updateData];
        }
      }
    });

    const updatedPlanner = await TravelPlan.findByIdAndUpdate(
      plannerId,
      { $set: updateObject },
      {
        new: true,
        runValidators: false,
      }
    );

    if (!updatedPlanner) {
      return {
        success: false,
        error: {
          message: "Failed to update planner",
        },
      };
    }

    console.log("Planner partially updated:", updatedPlanner._id);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedPlanner)),
    };
  } catch (error) {
    console.error("Error partially updating planner:", error);
    return handleError(error) as ErrorResponse;
  }
}

/**
 * Add tripmate to existing planner
 * @param params - Add tripmate parameters
 * @returns Updated planner data or error
 */
export async function addTripmate(params: {
  plannerId: string;
  tripmate: {
    name: string;
    email?: string;
    image?: string;
    userId?: string;
  };
}): Promise<ActionResponse<TravelPlan>> {
  const validationResult = await action({
    params,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { plannerId, tripmate } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  try {
    const existingPlanner = await TravelPlan.findById(plannerId);

    if (!existingPlanner) {
      return {
        success: false,
        error: {
          message: "Planner not found",
        },
      };
    }

    // Check permissions
    const isAuthor = existingPlanner.author.toString() === userId;
    if (!isAuthor) {
      return {
        success: false,
        error: {
          message: "Only the planner author can add tripmates",
        },
      };
    }

    const updatedPlanner = await TravelPlan.findByIdAndUpdate(
      plannerId,
      { $push: { tripmates: tripmate } },
      { new: true, runValidators: false }
    );

    // Auto-sync existing expenses with new tripmate
    if (updatedPlanner) {
      let hasExpenseChanges = false;

      // Helper function to get all available people (current user + tripmates)
      const getAllAvailablePeople = (existingTripmates: any[]) => [
        { name: "You", userId: "current-user" },
        ...existingTripmates.map((tm: any) => ({
          name: tm.name,
          userId: tm.userId || "",
        })),
      ];

      // Helper function to sync splitBetween array with current tripmates
      const syncSplitBetween = (
        existingSplitBetween: any[],
        allPeople: any[]
      ) => {
        const synced = [];
        for (const person of allPeople) {
          const existing = existingSplitBetween.find(
            (split) =>
              split.name === person.name || split.userId === person.userId
          );
          synced.push({
            userId: person.userId,
            name: person.name,
            amount: existing?.amount || 0,
            settled: existing?.settled || false,
            selected:
              existing?.selected !== undefined ? existing.selected : true,
          });
        }
        return synced;
      };

      const allAvailablePeople = getAllAvailablePeople(
        updatedPlanner.tripmates
      );

      // Sync lodging expenses
      if (updatedPlanner.lodging) {
        updatedPlanner.lodging = updatedPlanner.lodging.map((lodging: any) => {
          if (
            lodging.cost?.splitBetween &&
            lodging.cost.splitBetween.length > 0
          ) {
            lodging.cost.splitBetween = syncSplitBetween(
              lodging.cost.splitBetween,
              allAvailablePeople
            );
            hasExpenseChanges = true;
          }
          return lodging;
        });
      }

      // Sync place expenses
      if (updatedPlanner.details) {
        updatedPlanner.details = updatedPlanner.details.map((detail: any) => ({
          ...detail,
          data:
            detail.data?.map((item: any) => {
              if (
                item.type === "place" &&
                item.cost?.splitBetween &&
                item.cost.splitBetween.length > 0
              ) {
                item.cost.splitBetween = syncSplitBetween(
                  item.cost.splitBetween,
                  allAvailablePeople
                );
                hasExpenseChanges = true;
              }
              return item;
            }) || [],
        }));
      }

      // Save changes if any expenses were updated
      if (hasExpenseChanges) {
        await updatedPlanner.save();
        console.log("✅ Auto-synced existing expenses with new tripmate");
      }
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedPlanner)),
    };
  } catch (error) {
    console.error("Error adding tripmate:", error);
    return handleError(error) as ErrorResponse;
  }
}

/**
 * Add lodging to existing planner
 * @param params - Add lodging parameters
 * @returns Updated planner data or error
 */
export async function addLodging(params: {
  plannerId: string;
  lodging: {
    name: string;
    address?: string;
    checkIn?: Date | string;
    checkOut?: Date | string;
    confirmation?: string;
    notes?: string;
    cost?: {
      type: string;
      value: number;
    };
  };
}): Promise<ActionResponse<TravelPlan>> {
  const validationResult = await action({
    params,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { plannerId, lodging } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  try {
    const existingPlanner = await TravelPlan.findById(plannerId);

    if (!existingPlanner) {
      return {
        success: false,
        error: {
          message: "Planner not found",
        },
      };
    }

    // Check permissions
    const isAuthor = existingPlanner.author.toString() === userId;
    const isTripmate = existingPlanner.tripmates.some(
      (tripmate: any) =>
        tripmate.userId && tripmate.userId.toString() === userId
    );

    if (!isAuthor && !isTripmate) {
      return {
        success: false,
        error: {
          message: "Permission denied",
        },
      };
    }

    // Process dates if provided
    const processedLodging = {
      ...lodging,
      ...(lodging.checkIn && { checkIn: new Date(lodging.checkIn) }),
      ...(lodging.checkOut && { checkOut: new Date(lodging.checkOut) }),
    };

    const updatedPlanner = await TravelPlan.findByIdAndUpdate(
      plannerId,
      { $push: { lodging: processedLodging } },
      { new: true, runValidators: false }
    );

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedPlanner)),
    };
  } catch (error) {
    console.error("Error adding lodging:", error);
    return handleError(error) as ErrorResponse;
  }
}

/**
 * Upload images and update travel planner with image URLs
 * @param params - Image upload and update parameters
 * @returns Updated planner data or error
 */
export async function updatePlannerImages(params: {
  plannerId: string;
  imageFiles: File[];
  targetType: "main" | "general" | "place" | "tripmate";
  targetIndex?: number; // For place or tripmate specific images
  detailIndex?: number; // For place images within details array
  placeIndex?: number; // For specific place within detail data
}): Promise<ActionResponse<TravelPlan>> {
  const validationResult = await action({
    params: { plannerId: params.plannerId },
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { plannerId } = validationResult.params!;
  const { imageFiles, targetType, targetIndex, detailIndex, placeIndex } =
    params;
  const userId = validationResult?.session?.user?.id;

  try {
    // Validate planner exists and user has permission
    const existingPlanner = await TravelPlan.findById(plannerId);

    if (!existingPlanner) {
      return {
        success: false,
        error: {
          message: "Planner not found",
        },
      };
    }

    // Check permissions
    const isAuthor = existingPlanner.author.toString() === userId;
    const isTripmate = existingPlanner.tripmates.some(
      (tripmate: any) =>
        tripmate.userId && tripmate.userId.toString() === userId
    );

    if (!isAuthor && !isTripmate) {
      return {
        success: false,
        error: {
          message:
            "Permission denied: You are not authorized to update this planner",
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
          // Update main planner image (single image)
          updateObject.image = imageUrls[0];
          break;

        case "general":
          // Update general planner images (multiple images)
          updateObject.images = [
            ...(existingPlanner.images || []),
            ...imageUrls,
          ];
          break;

        case "tripmate":
          // Update specific tripmate image
          if (
            targetIndex !== undefined &&
            existingPlanner.tripmates[targetIndex]
          ) {
            updateObject = {
              [`tripmates.${targetIndex}.image`]: imageUrls[0],
            };
          } else {
            throw new Error("Invalid tripmate index");
          }
          break;

        case "place":
          // Update place images within details
          if (detailIndex !== undefined && placeIndex !== undefined) {
            const detail = existingPlanner.details[detailIndex];
            if (detail && detail.data && detail.data[placeIndex]) {
              const placeItem = detail.data[placeIndex];
              if (placeItem.type === "place") {
                // Update both images and imageKeys arrays
                const updatedImages = [
                  ...(placeItem.images || []),
                  ...imageUrls,
                ];
                const updatedImageKeys = [
                  ...(placeItem.imageKeys || []),
                  ...imageUrls.map((url) => {
                    // Extract key from URL for imageKeys
                    const urlParts = url.split("/");
                    return urlParts.slice(-2).join("/"); // Get "images/filename.jpg"
                  }),
                ];

                updateObject = {
                  [`details.${detailIndex}.data.${placeIndex}.images`]:
                    updatedImages,
                  [`details.${detailIndex}.data.${placeIndex}.imageKeys`]:
                    updatedImageKeys,
                };
              } else {
                throw new Error("Target is not a place item");
              }
            } else {
              throw new Error("Invalid detail or place index");
            }
          } else {
            throw new Error(
              "Detail index and place index are required for place images"
            );
          }
          break;

        default:
          throw new Error("Invalid target type");
      }

      // Update the planner
      const updatedPlanner = await TravelPlan.findByIdAndUpdate(
        plannerId,
        { $set: updateObject },
        {
          new: true,
          runValidators: false,
          session,
        }
      );

      if (!updatedPlanner) {
        throw new Error("Failed to update planner with image URLs");
      }

      console.log("Planner updated with images:", updatedPlanner._id);

      // Commit transaction
      await session.commitTransaction();
      console.log("MongoDB transaction committed successfully");

      return {
        success: true,
        data: JSON.parse(JSON.stringify(updatedPlanner)),
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
    console.error("Error updating planner images:", error);
    return handleError(error) as ErrorResponse;
  }
}

/**
 * Upload single image for travel planner (main image)
 * @param params - Single image upload parameters
 * @returns Updated planner data or error
 */
export async function updatePlannerMainImage(params: {
  plannerId: string;
  imageFile: File;
}): Promise<ActionResponse<TravelPlan>> {
  return updatePlannerImages({
    plannerId: params.plannerId,
    imageFiles: [params.imageFile],
    targetType: "main",
  });
}

/**
 * Upload multiple images for travel planner general gallery
 * @param params - Multiple images upload parameters
 * @returns Updated planner data or error
 */
export async function updatePlannerGeneralImages(params: {
  plannerId: string;
  imageFiles: File[];
}): Promise<ActionResponse<TravelPlan>> {
  return updatePlannerImages({
    plannerId: params.plannerId,
    imageFiles: params.imageFiles,
    targetType: "general",
  });
}

/**
 * Upload image for specific tripmate
 * @param params - Tripmate image upload parameters
 * @returns Updated planner data or error
 */
export async function updateTripmateImage(params: {
  plannerId: string;
  imageFile: File;
  tripmateIndex: number;
}): Promise<ActionResponse<TravelPlan>> {
  return updatePlannerImages({
    plannerId: params.plannerId,
    imageFiles: [params.imageFile],
    targetType: "tripmate",
    targetIndex: params.tripmateIndex,
  });
}

/**
 * Upload images for specific place in travel plan
 * @param params - Place image upload parameters
 * @returns Updated planner data or error
 */
export async function updatePlaceImages(params: {
  plannerId: string;
  imageFiles: File[];
  detailIndex: number;
  placeIndex: number;
}): Promise<ActionResponse<TravelPlan>> {
  return updatePlannerImages({
    plannerId: params.plannerId,
    imageFiles: params.imageFiles,
    targetType: "place",
    detailIndex: params.detailIndex,
    placeIndex: params.placeIndex,
  });
}

/**
 * Upload images from FormData for travel planner
 * @param formData - FormData containing images and planner info
 * @returns Updated planner data or error
 */
export async function updatePlannerImagesFromFormData(
  formData: FormData
): Promise<ActionResponse<TravelPlan>> {
  try {
    const plannerId = formData.get("plannerId") as string;
    const targetType = formData.get("targetType") as
      | "main"
      | "general"
      | "place"
      | "tripmate";
    const targetIndex = formData.get("targetIndex")
      ? parseInt(formData.get("targetIndex") as string)
      : undefined;
    const detailIndex = formData.get("detailIndex")
      ? parseInt(formData.get("detailIndex") as string)
      : undefined;
    const placeIndex = formData.get("placeIndex")
      ? parseInt(formData.get("placeIndex") as string)
      : undefined;

    if (!plannerId || !targetType) {
      return {
        success: false,
        error: {
          message: "plannerId and targetType are required",
        },
      };
    }

    // Extract image files from FormData
    const imageFiles: File[] = [];
    const files = formData.getAll("images") as File[];

    for (const file of files) {
      if (file && file.size > 0) {
        imageFiles.push(file);
      }
    }

    if (imageFiles.length === 0) {
      return {
        success: false,
        error: {
          message: "No valid image files found",
        },
      };
    }

    return updatePlannerImages({
      plannerId,
      imageFiles,
      targetType,
      targetIndex,
      detailIndex,
      placeIndex,
    });
  } catch (error) {
    console.error("Error processing FormData for planner images:", error);
    return handleError(error) as ErrorResponse;
  }
}
