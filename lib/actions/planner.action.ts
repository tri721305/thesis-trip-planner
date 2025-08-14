"use server";

import action from "../handler/action";
import { handleError } from "../handler/error";
import mongoose, { Types } from "mongoose";
import TravelPlan from "@/database/plan.model";
import { CreateTravelPlannerSchema } from "../validation";

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
