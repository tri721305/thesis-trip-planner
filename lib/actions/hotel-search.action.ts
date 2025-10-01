"use server";

import Hotel from "@/database/hotel.model";
import HotelBooking from "@/database/hotel-booking.model";
import { handleError } from "../handler/error";
import action from "../handler/action";
import { FilterQuery } from "mongoose";

// Interface cho tham số tìm kiếm
interface SearchHotelAvailabilityParams {
  checkInDate: Date | string;
  checkOutDate: Date | string;
  adults?: number;
  children?: number;
  roomCount?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  location?: string;
  amenities?: string[];
  page?: number;
  pageSize?: number;
}

/**
 * Tìm kiếm khách sạn có phòng trống dựa trên điều kiện
 */
export async function searchAvailableHotels(
  params: SearchHotelAvailabilityParams
): Promise<
  ActionResponse<{
    hotels: any[];
    isNext: boolean;
  }>
> {
  try {
    const {
      checkInDate: rawCheckInDate,
      checkOutDate: rawCheckOutDate,
      adults = 2,
      children = 0,
      roomCount = 1,
      minPrice,
      maxPrice,
      minRating,
      location,
      amenities,
      page = 1,
      pageSize = 10,
    } = params;

    // Đảm bảo các ngày là đối tượng Date hợp lệ
    const checkInDate = new Date(rawCheckInDate);
    const checkOutDate = new Date(rawCheckOutDate);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      throw new Error("Ngày check-in hoặc check-out không hợp lệ");
    }

    console.log(
      `Searching for hotels with check-in: ${checkInDate.toISOString()}, check-out: ${checkOutDate.toISOString()}, rooms: ${roomCount}`
    );

    // 1. Tìm các booking hiện tại trong khoảng thời gian
    let existingBookings;

    try {
      existingBookings = await HotelBooking.find({
        $or: [
          // Booking hiện tại nằm trong khoảng thời gian tìm kiếm
          {
            checkInDate: { $gte: checkInDate, $lt: checkOutDate },
          },
          // Booking hiện tại bao quanh khoảng thời gian tìm kiếm
          {
            checkInDate: { $lte: checkInDate },
            checkOutDate: { $gte: checkOutDate },
          },
          // Booking hiện tại có checkout sau checkin tìm kiếm
          {
            checkOutDate: { $gt: checkInDate, $lte: checkOutDate },
          },
        ],
        status: { $nin: ["cancelled", "refunded", "no-show"] },
      });
    } catch (error) {
      console.error("Error searching for bookings:", error);
      existingBookings = []; // Nếu có lỗi, giả sử không có booking
    }

    console.log(`Found ${existingBookings.length} bookings in the date range`);

    // 2. Tạo map số phòng đã đặt cho từng khách sạn
    const hotelBookingMap = new Map<string, number>();

    existingBookings.forEach((booking) => {
      const hotelId = booking.hotel.hotelId;
      const currentBookedRooms = hotelBookingMap.get(hotelId) || 0;

      // Tính tổng số phòng đã đặt
      let roomsBookedInThisBooking = 0;
      booking.rooms.forEach((room: any) => {
        roomsBookedInThisBooking += room.quantity;
      });

      hotelBookingMap.set(
        hotelId,
        currentBookedRooms + roomsBookedInThisBooking
      );
    });

    // 3. Xây dựng các điều kiện tìm kiếm cơ bản
    const filterQuery: FilterQuery<typeof Hotel> = {};

    // Lọc theo địa điểm nếu có
    if (location) {
      // Đảm bảo location là chuỗi
      const locationStr =
        typeof location === "string" ? location : String(location);
      console.log("Filtering by location:", locationStr);

      // Mở rộng tìm kiếm cho nhiều trường hơn
      filterQuery.$or = filterQuery.$or || [];
      filterQuery.$or.push(
        { "lodging.address": { $regex: locationStr, $options: "i" } },
        { "lodging.cityName": { $regex: locationStr, $options: "i" } },
        { "lodging.name": { $regex: locationStr, $options: "i" } },
        { "lodging.province": { $regex: locationStr, $options: "i" } },
        { "lodging.district": { $regex: locationStr, $options: "i" } }
      );
    }

    // Lọc theo giá nếu có
    if (minPrice !== undefined || maxPrice !== undefined) {
      filterQuery["priceRate.total.amount"] = {};

      if (minPrice !== undefined) {
        filterQuery["priceRate.total.amount"].$gte = minPrice;
      }

      if (maxPrice !== undefined) {
        filterQuery["priceRate.total.amount"].$lte = maxPrice;
      }
    }

    // Lọc theo đánh giá
    if (minRating !== undefined) {
      filterQuery.$or = filterQuery.$or || [];
      filterQuery.$or.push(
        { "lodging.rating.value": { $gte: minRating } },
        { "lodging.wanderlogRating": { $gte: minRating } }
      );
    }

    // Lọc theo tiện nghi nếu có
    if (amenities && amenities.length > 0) {
      filterQuery["lodging.amenities.name"] = { $all: amenities };
    }

    // 4. Lấy danh sách khách sạn phù hợp với các điều kiện cơ bản
    const skip = (page - 1) * pageSize;

    // Thử lấy tất cả khách sạn trước nếu điều kiện tìm kiếm quá chặt
    let hotels: any[] = [];
    try {
      hotels = await Hotel.find(filterQuery).skip(skip).limit(pageSize).lean();

      console.log(`Found ${hotels.length} hotels matching basic criteria`);
      console.log("Filter criteria:", JSON.stringify(filterQuery));

      if (hotels.length === 0 && location) {
        // Nếu không tìm thấy khách sạn nào, thử tìm kiếm không có điều kiện location
        console.log(
          "No hotels found with location filter, trying without location filter"
        );
        const noLocationFilter = { ...filterQuery };
        delete noLocationFilter.$or;

        hotels = await Hotel.find(noLocationFilter)
          .skip(skip)
          .limit(pageSize)
          .lean();
        console.log(`Found ${hotels.length} hotels without location filter`);
      }

      // Nếu vẫn không tìm thấy, thử tìm tất cả khách sạn
      if (hotels.length === 0) {
        console.log("No hotels found with filters, trying all hotels");
        hotels = await Hotel.find({}).skip(skip).limit(pageSize).lean();
        console.log(`Found ${hotels.length} hotels without any filters`);
      }
    } catch (error) {
      console.error("Error finding hotels:", error);
      hotels = [];
    }

    // 5. Lọc khách sạn theo tính khả dụng của phòng
    const availableHotels = hotels.filter((hotel) => {
      try {
        // Số phòng đã đặt cho khách sạn này
        const bookedRooms = hotelBookingMap.get(hotel.offerId) || 0;

        // Tổng số phòng của khách sạn (giả sử có trường này, nếu không có thì default là 20)
        const totalRooms = hotel.totalRooms || 20;

        // Kiểm tra xem còn đủ phòng trống không
        return totalRooms - bookedRooms >= roomCount;
      } catch (error) {
        console.error("Error filtering hotel:", hotel._id, error);
        return false; // Loại bỏ khách sạn có lỗi
      }
    });

    console.log(`${availableHotels.length} hotels have available rooms`);

    // 6. Thêm thông tin phòng trống vào kết quả
    const hotelsWithAvailability = availableHotels.map((hotel) => {
      const bookedRooms = hotelBookingMap.get(hotel.offerId) || 0;
      const totalRooms = hotel.totalRooms || 20;

      return {
        ...hotel,
        availableRooms: totalRooms - bookedRooms,
        isLowAvailability: totalRooms - bookedRooms <= 3, // Cảnh báo sắp hết phòng
      };
    });

    // 7. Sắp xếp theo đánh giá hoặc giá
    const sortedHotels = hotelsWithAvailability.sort((a: any, b: any) => {
      // Ưu tiên sắp xếp theo đánh giá cao
      const ratingA =
        a.lodging?.rating?.value || a.lodging?.wanderlogRating || 0;
      const ratingB =
        b.lodging?.rating?.value || b.lodging?.wanderlogRating || 0;

      if (ratingB !== ratingA) {
        return ratingB - ratingA;
      }

      // Nếu đánh giá bằng nhau, sắp xếp theo giá tăng dần
      const priceA = a.priceRate?.total?.amount || a.priceRate?.amount || 0;
      const priceB = b.priceRate?.total?.amount || b.priceRate?.amount || 0;

      return priceA - priceB;
    });

    const totalCount = await Hotel.countDocuments(filterQuery);
    const isNext = totalCount > skip + hotelsWithAvailability.length;

    // Chuyển đổi dữ liệu để có thể truyền từ Server Components sang Client Components
    const serializedHotels = sortedHotels.map((hotel) => {
      // Chuyển _id từ ObjectId sang string
      const serialized = {
        ...hotel,
        _id: hotel._id?.toString(),
        // Chuyển đổi các ngày thành chuỗi ISO
        createdAt: hotel.createdAt
          ? typeof hotel.createdAt.toISOString === "function"
            ? hotel.createdAt.toISOString()
            : hotel.createdAt
          : undefined,
        updatedAt: hotel.updatedAt
          ? typeof hotel.updatedAt.toISOString === "function"
            ? hotel.updatedAt.toISOString()
            : hotel.updatedAt
          : undefined,
      };

      // Xử lý thêm các trường có thể chứa đối tượng MongoDB ObjectID
      if (hotel.lodging?._id) {
        serialized.lodging._id = hotel.lodging._id.toString();
      }

      return serialized;
    });

    // Thêm log để debug
    console.log(`Final result: ${serializedHotels.length} hotels available`);

    return {
      success: true,
      data: {
        hotels: serializedHotels,
        isNext,
      },
    };
  } catch (error) {
    console.error("Error in searchAvailableHotels:", error);
    return handleError(error) as ErrorResponse;
  }
}
