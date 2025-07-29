"use server";

import Attraction, { IAttraction } from "@/database/attraction.model";
import action from "../handler/action";
import { handleError } from "../handler/error";
import { PaginatedSearchParamsSchema } from "../validation";
import { FilterQuery } from "mongoose";

export async function getPlaces(params: PaginatedSearchParams): Promise<
  ActionResponse<{
    places: IAttraction[];
    isNext: boolean;
    totalCount?: number;
    currentPage?: number;
    totalPages?: number;
  }>
> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
    authorize: false,
  });

  console.log("params get places", params);
  console.log("validationresult", validationResult);

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, query, filter } = params;
  const skip = (Number(page) - 1) * pageSize;
  const limit = pageSize;

  const filterQuery: FilterQuery<typeof Attraction> = {};
  let sortCriteria = {};

  try {
    // Search query
    if (query) {
      filterQuery.$or = [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { generatedDescription: { $regex: query, $options: "i" } },
        { "address.fullAddress": { $regex: query, $options: "i" } },
        { "address.city": { $regex: query, $options: "i" } },
        { categories: { $in: [new RegExp(query, "i")] } },
      ];
    }

    // Filter by category if provided
    if (filter) {
      try {
        const filterObj = JSON.parse(filter);

        if (filterObj.category) {
          filterQuery.categories = { $in: [filterObj.category] };
        }

        if (filterObj.city) {
          filterQuery["address.city"] = {
            $regex: filterObj.city,
            $options: "i",
          };
        }

        if (filterObj.rating && filterObj.rating.min) {
          filterQuery.rating = { $gte: Number(filterObj.rating.min) };
        }

        if (filterObj.hasDetails !== undefined) {
          filterQuery.hasDetails = filterObj.hasDetails;
        }

        // Geolocation filter
        if (
          filterObj.location &&
          filterObj.location.latitude &&
          filterObj.location.longitude
        ) {
          const { latitude, longitude, radius = 5000 } = filterObj.location; // default 5km
          filterQuery.location = {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [longitude, latitude],
              },
              $maxDistance: radius,
            },
          };
        }
      } catch (error) {
        console.warn("Invalid filter JSON:", filter);
      }
    }

    // Sort criteria
    const sortOptions: { [key: string]: any } = {
      rating: { rating: -1, numRatings: -1 },
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      name: { name: 1 },
      popular: { numRatings: -1, rating: -1 },
      default: { rating: -1, numRatings: -1 },
    };

    // Parse sort from filter if provided
    if (filter) {
      try {
        const filterObj = JSON.parse(filter);
        if (filterObj.sort && sortOptions[filterObj.sort]) {
          sortCriteria = sortOptions[filterObj.sort];
        }
      } catch (error) {
        // Use default sort
      }
    }

    if (Object.keys(sortCriteria).length === 0) {
      sortCriteria = sortOptions.default;
    }

    const totalPlaces = await Attraction.countDocuments(filterQuery);

    const places = await Attraction.find(filterQuery)
      .skip(skip)
      .limit(limit)
      .sort(sortCriteria)
      .lean();

    const isNext = totalPlaces > skip + places.length;

    return {
      success: true,
      data: {
        isNext,
        places: JSON.parse(JSON.stringify(places)),
        totalCount: totalPlaces,
        currentPage: Number(page),
        totalPages: Math.ceil(totalPlaces / limit),
      },
    };
  } catch (error) {
    console.error("Error in getPlaces:", error);
    return handleError(error) as ErrorResponse;
  }
}

// Helper function to get place by ID
export async function getPlaceById(
  id: string
): Promise<ActionResponse<{ place: IAttraction | null }>> {
  try {
    if (!id) {
      throw new Error("Place ID is required");
    }
    const place = await Attraction.findById(id).lean();

    return {
      success: true,
      data: {
        place: place ? JSON.parse(JSON.stringify(place)) : null,
      },
    };
  } catch (error) {
    console.error("Error in getPlaceById:", error);
    return handleError(error) as ErrorResponse;
  }
}

// Helper function to get places by category
export async function getPlacesByCategory(
  category: string,
  limit = 10
): Promise<ActionResponse<{ places: IAttraction[] }>> {
  try {
    const places = await Attraction.find({
      categories: { $in: [category] },
    })
      .sort({ rating: -1, numRatings: -1 })
      .limit(limit)
      .lean();

    return {
      success: true,
      data: {
        places: JSON.parse(JSON.stringify(places)),
      },
    };
  } catch (error) {
    console.error("Error in getPlacesByCategory:", error);
    return handleError(error) as ErrorResponse;
  }
}

// Helper function to get nearby places
export async function getNearbyPlaces(
  latitude: number,
  longitude: number,
  radius = 5000, // meters
  limit = 20
): Promise<ActionResponse<{ places: IAttraction[] }>> {
  try {
    const places = await Attraction.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: radius,
        },
      },
    })
      .limit(limit)
      .lean();

    return {
      success: true,
      data: {
        places: JSON.parse(JSON.stringify(places)),
      },
    };
  } catch (error) {
    console.error("Error in getNearbyPlaces:", error);
    return handleError(error) as ErrorResponse;
  }
}

// Helper function to get popular places
export async function getPopularPlaces(
  limit = 10
): Promise<ActionResponse<{ places: IAttraction[] }>> {
  try {
    const places = await Attraction.find({
      rating: { $gte: 4.0 },
      numRatings: { $gte: 100 },
    })
      .sort({ numRatings: -1, rating: -1 })
      .limit(limit)
      .lean();

    return {
      success: true,
      data: {
        places: JSON.parse(JSON.stringify(places)),
      },
    };
  } catch (error) {
    console.error("Error in getPopularPlaces:", error);
    return handleError(error) as ErrorResponse;
  }
}
