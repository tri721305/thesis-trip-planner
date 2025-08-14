"use server";

import action from "../handler/action";
import { handleError } from "../handler/error";
import mongoose, { Types } from "mongoose";
import TravelPlan from "@/database/plan.model";
import {
  CreateTravelPlannerSchema,
  UpdateTravelPlannerSchema,
} from "../validation";

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

  const { title, destination, startDate, endDate, type } =
    validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  try {
    // PHASE: Database operations in transaction
    console.log("Starting MongoDB transaction...");
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
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
            state: "planning",
            tripmates: [], // Empty initially, can be added later
            lodging: [], // Empty initially, can be added later
            details: [], // Empty initially, can be added later
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
 * Update planner with all information
 * @param params - Update planner parameters
 * @returns Updated planner data or error
 */
export async function updatePlanner(
  params: UpdatePlannerParams
): Promise<ActionResponse<TravelPlan>> {
  const validationResult = await action({
    params,
    authorize: true,
    schema: UpdateTravelPlannerSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { plannerId, ...updateData } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  try {
    // PHASE: Database operations in transaction
    console.log("Starting MongoDB transaction for update...");
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

      // Dates
      if (updateData.startDate)
        updateObject.startDate = new Date(updateData.startDate);
      if (updateData.endDate)
        updateObject.endDate = new Date(updateData.endDate);

      // Arrays - replace entirely if provided
      if (updateData.tripmates) updateObject.tripmates = updateData.tripmates;
      if (updateData.lodging) updateObject.lodging = updateData.lodging;
      if (updateData.details) updateObject.details = updateData.details;

      // Update the planner
      const updatedPlanner = await TravelPlan.findByIdAndUpdate(
        plannerId,
        { $set: updateObject },
        {
          new: true,
          runValidators: true,
          session,
        }
      );

      if (!updatedPlanner) {
        throw new Error("Failed to update planner");
      }

      console.log("Planner updated:", updatedPlanner._id);

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
        runValidators: true,
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
      { new: true, runValidators: true }
    );

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
      { new: true, runValidators: true }
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
