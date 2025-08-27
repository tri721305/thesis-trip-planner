"use server";

import Hotel from "@/database/hotel.model";
import action from "../handler/action";
import { handleError } from "../handler/error";
import {
  PaginatedSearchParamsHotelSchema,
  PaginatedSearchParamsSchema,
} from "../validation";
import { FilterQuery } from "mongoose";

interface FilterOptions {
  source?: string;
  sortBy?: string;
}

export async function getHotels(
  params: PaginatedSearchHotelParams & { filter?: FilterOptions }
): Promise<
  ActionResponse<{
    hotels: Hotel[];
    isNext: boolean;
  }>
> {
  const validationResult = await action({
    params,
    // schema: PaginatedSearchParamsSchema,
    schema: PaginatedSearchParamsHotelSchema,
    authorize: false,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, query, filter } = params;
  console.log("filter", filter);

  const skip = (Number(page) - 1) * pageSize;
  const limit = pageSize;

  const filterQuery: FilterQuery<typeof Hotel> = {};

  let sortCriteria = {};

  try {
    if (query) {
      filterQuery.$or = [
        { "lodging.name": { $regex: query, $options: "i" } },
        { "lodging.address": { $regex: query, $options: "i" } },
        { source: { $regex: query, $options: "i" } },
      ];
    }

    // Handle filter for specific source
    if (filter?.source) {
      filterQuery["source"] = filter.source;
    }

    // Handle sort criteria
    if (filter?.sortBy === "wanderlog") {
      // Sort by wanderlog source first, then by rating
      sortCriteria = {
        source: -1, // wanderlog will come first alphabetically (w > other letters)
        "lodging.wanderlogRating": -1,
      };
    } else if (filter?.sortBy === "rating") {
      sortCriteria = { "lodging.wanderlogRating": -1 };
    } else if (filter?.sortBy === "price") {
      sortCriteria = { "priceRate.total.amount": 1 };
    }

    const totalHotels = await Hotel.countDocuments(filterQuery);

    const hotels = await Hotel.find(filterQuery)
      .skip(skip)
      .limit(limit)
      .sort(sortCriteria)
      .lean();
    console.log("hotel after filter", hotels);
    const isNext = totalHotels > skip + hotels.length;

    return {
      success: true,
      data: {
        isNext,
        hotels: JSON.parse(JSON.stringify(hotels)),
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
