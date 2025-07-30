"use server";

import Hotel from "@/database/hotel.model";
import action from "../handler/action";
import { handleError } from "../handler/error";
import { PaginatedSearchParamsSchema } from "../validation";
import { FilterQuery } from "mongoose";

export async function getHotels(params: PaginatedSearchParams): Promise<
  ActionResponse<{
    hotels: Hotel[];
    isNext: boolean;
  }>
> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
    authorize: false,
  });

  console.log("params get hotels", params);
  console.log("validationresult", validationResult);
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, query, filter } = params;
  const skip = (Number(page) - 1) * pageSize;
  const limit = pageSize;

  const filterQuery: FilterQuery<typeof Hotel> = {};

  let sortCriteria = {};

  try {
    if (query) {
      filterQuery.$or = [
        { "lodging.name": { $regex: query, $options: "i" } },
        { "lodging.address": { $regex: query, $options: "i" } },
      ];
    }

    const totalHotels = await Hotel.countDocuments(filterQuery);

    const hotels = await Hotel.find(filterQuery)
      .skip(skip)
      .limit(limit)
      .sort(sortCriteria)
      .lean();

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
