"use server";

import Hotel from "@/database/hotel.model";
import action from "../handler/action";
import { handleError } from "../handler/error";
import {
  GetHotelDetailByIdSchema,
  GetHotelOfferByIdSchema,
  PaginatedSearchParamsHotelSchema,
  PaginatedSearchParamsSchema,
} from "../validation";
import { FilterQuery } from "mongoose";
import HotelDetails from "@/database/hotel-details.model";
import HotelOffers from "@/database/hotel-offers.model";

interface FilterOptions {
  source?: string;
  sortBy?: string;
  sortOrder?: number; // 1 for ascending, -1 for descending
}

export async function getHotels(
  params: PaginatedSearchHotelParams & { filter?: FilterOptions }
): Promise<
  ActionResponse<{
    hotels: any[];
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
    if (query && typeof query === "string") {
      filterQuery.$or = [
        { "lodging.name": { $regex: query, $options: "i" } },
        { "lodging.address": { $regex: query, $options: "i" } },
        { source: { $regex: query, $options: "i" } },
      ];
    } else if (query) {
      // Nếu query không phải là string, ép kiểu thành string hoặc bỏ qua
      console.warn("Query is not a string:", query);
      // Chuyển đổi query thành string nếu có thể
      const queryStr = String(query);
      filterQuery.$or = [
        { "lodging.name": { $regex: queryStr, $options: "i" } },
        { "lodging.address": { $regex: queryStr, $options: "i" } },
        { source: { $regex: queryStr, $options: "i" } },
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

    // Chuyển đổi dữ liệu để có thể truyền từ Server Components sang Client Components
    const serializedHotels = hotels.map((hotel: any) => {
      // Chuyển _id từ ObjectId sang string
      return {
        ...hotel,
        _id: hotel._id ? hotel._id.toString() : undefined,
        // Chuyển đổi các ngày thành chuỗi ISO
        createdAt: hotel.createdAt ? hotel.createdAt.toISOString() : undefined,
        updatedAt: hotel.updatedAt ? hotel.updatedAt.toISOString() : undefined,
      };
    });

    console.log(
      "hotel after filter and serialization",
      serializedHotels.length
    );
    const isNext = totalHotels > skip + hotels.length;

    return {
      success: true,
      data: {
        isNext,
        hotels: serializedHotels,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getHotelDetailById(
  params: GetHotelDetailByIdParams
): Promise<ActionResponse<{ hotel: {} }>> {
  const validationResult = await action({
    params,
    schema: GetHotelDetailByIdSchema,
    authorize: false,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }
  const { hotelId } = params;

  try {
    // Tìm kiếm theo hotel_id hoặc theo offerId
    const hotelQuery = hotelId.startsWith("offer-")
      ? { offerId: hotelId.replace("offer-", "") }
      : { hotel_id: hotelId };

    const hotel = await HotelDetails.findOne(hotelQuery);

    if (!hotel) {
      // Nếu không tìm thấy chi tiết khách sạn, thử tìm theo _id hoặc offerId trong Hotel collection
      const originalHotel = hotelId.startsWith("offer-")
        ? await Hotel.findOne({ offerId: hotelId.replace("offer-", "") })
        : await Hotel.findOne({ _id: hotelId });

      if (!originalHotel) throw new Error("Hotel not found");

      // Nếu tìm thấy, nhưng không có chi tiết, trả về dữ liệu cơ bản
      return {
        success: true,
        data: {
          hotel: {
            original_hotel: JSON.parse(JSON.stringify(originalHotel)),
            details: {
              data: {
                // Thêm dữ liệu cơ bản từ originalHotel
                description: "Chi tiết đang được cập nhật",
                address: originalHotel.lodging.address,
                nearbyAttractions: [],
                lodging: {
                  amenities: [],
                },
              },
            },
          },
        },
      };
    }

    // Nếu tìm thấy hotel details, tìm thêm thông tin từ Hotel collection
    const originalHotel = await Hotel.findOne(hotelQuery);

    // Trả về kết hợp cả hai
    return {
      success: true,
      data: {
        hotel: {
          ...JSON.parse(JSON.stringify(hotel)),
          original_hotel: originalHotel
            ? JSON.parse(JSON.stringify(originalHotel))
            : null,
        },
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getHotelOfferById(
  params: GetHotelOfferByIdParams
): Promise<ActionResponse<{ hotel: {} }>> {
  console.log("paramsOffer", params);
  const validationResult = await action({
    params,
    schema: GetHotelOfferByIdSchema,
    authorize: false,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { hotelId } = params;

  try {
    const hotel = await HotelOffers.findOne({
      hotel_id: hotelId,
    });
    if (!hotel) throw new Error("Hotel not found");

    return {
      success: true,
      data: { hotel: JSON.parse(JSON.stringify(hotel)) },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

/**
 * Lấy danh sách khách sạn có priceRate.site là "Wanderlog"
 * @param params Tham số phân trang và lọc
 * @returns Danh sách khách sạn từ nguồn Wanderlog
 */
export async function getHotelsByWanderlog(
  params: PaginatedSearchHotelParams & { filter?: FilterOptions }
): Promise<ActionResponse<{ hotels: any[]; isNext: boolean }>> {
  const { page = 1, pageSize = 10, filter } = params;
  const sortBy = filter?.sortBy || "rating";
  const sortOrder = filter?.sortOrder || -1;

  const skip = (Number(page) - 1) * pageSize;
  const limit = pageSize;

  try {
    // Tạo query để lọc các khách sạn có priceRate.site là "Wanderlog"
    const filterQuery = { "priceRate.site": "Wanderlog" };

    // Tính tổng số khách sạn tìm thấy
    const totalHotels = await Hotel.countDocuments(filterQuery);

    // Xác định cách sắp xếp
    let sortCriteria = {};
    if (sortBy === "rating") {
      sortCriteria = { "lodging.wanderlogRating": sortOrder };
    } else if (sortBy === "price") {
      sortCriteria = { "priceRate.amount": sortOrder };
    } else if (sortBy === "popularity") {
      sortCriteria = { "lodging.ratingCount": sortOrder };
    }

    // Truy vấn cơ sở dữ liệu
    const hotels = await Hotel.find(filterQuery)
      .skip(skip)
      .limit(limit)
      .sort(sortCriteria)
      .lean();

    // Chuyển đổi dữ liệu để có thể truyền từ Server Components sang Client Components
    const serializedHotels = hotels.map((hotel: any) => {
      return {
        ...hotel,
        _id: hotel._id ? hotel._id.toString() : undefined,
        createdAt: hotel.createdAt ? hotel.createdAt.toISOString() : undefined,
        updatedAt: hotel.updatedAt ? hotel.updatedAt.toISOString() : undefined,
      };
    });

    console.log("Wanderlog hotels found:", serializedHotels.length);

    const isNext = totalHotels > skip + hotels.length;

    return {
      success: true,
      data: {
        hotels: serializedHotels,
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
