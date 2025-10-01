"use server";

import Attraction, { IAttraction } from "@/database/attraction.model";
import action from "../handler/action";
import { handleError } from "../handler/error";
import { PaginatedSearchParamsSchema } from "../validation";
import { FilterQuery } from "mongoose";
import Province from "@/database/province.model";
import Ward from "@/database/ward.model";

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
      // Đảm bảo query là chuỗi
      const queryStr = typeof query === "string" ? query : String(query);

      filterQuery.$or = [
        { name: { $regex: queryStr, $options: "i" } },
        { description: { $regex: queryStr, $options: "i" } },
        { generatedDescription: { $regex: queryStr, $options: "i" } },
        { "address.fullAddress": { $regex: queryStr, $options: "i" } },
        { "address.city": { $regex: queryStr, $options: "i" } },
        { categories: { $in: [new RegExp(queryStr, "i")] } },
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

    console.log(
      "🔍 getPlaces - Database results (first 2):",
      places.slice(0, 2).map((place) => ({
        name: place.name,
        hasLocation: !!place.location,
        location: place.location,
        coordinates: place.location?.coordinates,
      }))
    );

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

export async function getAdministrativeUnit(
  params: PaginatedSearchParams
): Promise<ActionResponse<[]>> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
    authorize: false,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 12, query, filter } = params;

  const skip = (Number(page) - 1) * pageSize;
  const limit = pageSize;

  const filterQuery: FilterQuery<typeof Province> = {};
  const filterQueryWard: FilterQuery<typeof Ward> = {};
  let sortCriteria = {};

  try {
    if (query) {
      // Đảm bảo query là chuỗi
      const queryStr = typeof query === "string" ? query : String(query);

      filterQuery.$or = [
        // {
        //   tenhc: { $regex: queryStr, $options: "i" },
        // },
        {
          truocsapnhap: { $regex: queryStr, $options: "i" },
        },
        {
          tentinh: { $regex: queryStr, $options: "i" },
        },
      ];
      filterQueryWard.$or = [
        {
          loai: { $regex: queryStr, $options: "i" },
        },
        {
          tenhc: { $regex: queryStr, $options: "i" },
        },
        {
          truocsapnhap: { $regex: queryStr, $options: "i" },
        },
      ];
    }

    const locations = await Province.find(filterQuery)
      .skip(skip)
      .limit(limit)
      .lean();

    const locationWards = await Ward.find(filterQueryWard)
      .skip(skip)
      .limit(limit)
      .lean();
    console.log(locations, locationWards);
    const list = [...locations, ...locationWards];
    return {
      success: true,
      data: JSON.parse(JSON.stringify(list)),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
