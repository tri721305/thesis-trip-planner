"use server";

import action from "../handler/action";
import { handleError } from "../handler/error";
import mongoose, { Types } from "mongoose";
import Guide from "@/database/guide.model";

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

export async function createGuide(
  params: CreateGuideParams
): Promise<ActionResponse<any>> {
  try {
    const {
      title = "New Travel Guide",
      image,
      note,
      author,
      tripmates = [],
      state = "planning",
      type = "public",
      destination,
      startDate = new Date(),
      endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      generalTips,
      lodging = [],
      details = [],
      upvotes = 0,
      downvotes = 0,
      views = 0,
      comments = 0,
    } = params;

    // Validate required destination field
    if (!destination || !destination.name || !destination.coordinates) {
      throw new Error("Destination with name and coordinates is required");
    }

    const newGuide = new Guide({
      title,
      image,
      note,
      author: author ? new mongoose.Types.ObjectId(author) : undefined,
      tripmates,
      state,
      type,
      destination,
      startDate,
      endDate,
      generalTips,
      lodging,
      details,
      upvotes,
      downvotes,
      views,
      comments,
    });

    const savedGuide = await newGuide.save();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(savedGuide)),
    };
  } catch (error: any) {
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
    const guide = await Guide.findById(guideId);

    if (!guide) {
      return {
        success: false,
        error: {
          message: "Guide note found",
        },
      };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(guide)),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
