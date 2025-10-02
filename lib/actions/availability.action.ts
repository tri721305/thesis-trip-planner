"use server";

import HotelBooking from "@/database/hotel-booking.model";
import HotelOffers from "@/database/hotel-offers.model";
import action from "../handler/action";
import { handleError } from "../handler/error";
import { z } from "zod";

// Schema validation cho parameters
const GetAvailableRoomsSchema = z.object({
  hotelId: z.string().or(z.number()), // Chấp nhận cả string và number cho hotelId
  checkInDate: z.string().or(z.date()),
  checkOutDate: z.string().or(z.date()),
  adults: z.number().int().min(1).optional().default(2),
  children: z.number().int().min(0).optional().default(0),
  rooms: z.number().int().min(1).optional().default(1),
});

type GetAvailableRoomsParams = z.infer<typeof GetAvailableRoomsSchema>;

/**
 * Lấy danh sách các phòng còn trống dựa vào ngày check-in/check-out, số người và số phòng
 */
export async function getAvailableRooms(
  params: GetAvailableRoomsParams
): Promise<
  ActionResponse<{
    availableRooms: any[];
    unavailableRooms: string[];
  }>
> {
  console.log("Getting available rooms with params:", params);

  const validationResult = await action({
    params,
    schema: GetAvailableRoomsSchema,
    authorize: false,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const {
    hotelId,
    checkInDate,
    checkOutDate,
    adults = 2,
    children = 0,
    rooms = 1,
  } = validationResult.params!;

  try {
    // Chuyển đổi tham số ngày từ string sang Date nếu cần
    const parsedCheckInDate =
      typeof checkInDate === "string" ? new Date(checkInDate) : checkInDate;
    const parsedCheckOutDate =
      typeof checkOutDate === "string" ? new Date(checkOutDate) : checkOutDate;

    // Kiểm tra xem ngày nhập vào có hợp lệ không
    if (
      isNaN(parsedCheckInDate.getTime()) ||
      isNaN(parsedCheckOutDate.getTime())
    ) {
      throw new Error("Invalid date format");
    }

    if (parsedCheckInDate >= parsedCheckOutDate) {
      throw new Error("Check-out date must be after check-in date");
    }

    // Tính tổng số người
    const totalGuests = adults + children;

    // 1. Lấy tất cả danh sách phòng của khách sạn
    // Chuyển đổi hotelId thành số một cách an toàn
    const hotelIdNumber =
      typeof hotelId === "string" ? parseInt(hotelId) : hotelId;

    const hotelOffer = await HotelOffers.findOne({ hotel_id: hotelIdNumber });
    if (!hotelOffer) {
      throw new Error("Hotel not found");
    }

    // Extract all room offers
    const allRoomOffers = hotelOffer?.offers?.data?.offers || [];
    console.log(`Found ${allRoomOffers.length} rooms for hotel ${hotelId}`);

    // 2. Lấy các booking hiện tại cho khách sạn này trong khoảng thời gian được chọn
    const existingBookings = await HotelBooking.find({
      "hotel.hotelId": hotelIdNumber, // Sử dụng hotelIdNumber đã được chuyển đổi
      status: { $in: ["pending", "confirmed"] }, // Chỉ tính những booking còn hiệu lực
      // Booking có thời gian chồng lấn với thời gian được chọn
      $or: [
        // Check-in trong khoảng thời gian đặt phòng
        { checkInDate: { $gte: parsedCheckInDate, $lt: parsedCheckOutDate } },
        // Check-out trong khoảng thời gian đặt phòng
        { checkOutDate: { $gt: parsedCheckInDate, $lte: parsedCheckOutDate } },
        // Khoảng thời gian đặt phòng bao gồm khoảng thời gian được chọn
        {
          checkInDate: { $lte: parsedCheckInDate },
          checkOutDate: { $gte: parsedCheckOutDate },
        },
      ],
    });

    console.log(
      `Found ${existingBookings.length} bookings in the selected date range`
    );

    // 3. Tính số phòng đã được đặt cho từng loại phòng
    const bookedRoomCounts: Record<string, number> = {};
    // Lưu danh sách tên phòng đã được đặt
    const bookedRoomNames: string[] = [];

    console.log("Checking existing bookings:", existingBookings.length);

    // In ra thông tin chi tiết về các booking để debug
    console.log(
      "All bookings in date range:",
      JSON.stringify(
        existingBookings.map((booking: any) => ({
          bookingId: booking.bookingId,
          hotelId: booking.hotel?.hotelId,
          checkIn: new Date(booking.checkInDate).toISOString(),
          checkOut: new Date(booking.checkOutDate).toISOString(),
          rooms: booking.rooms.map((r: any) => ({
            name: r.roomName,
            quantity: r.quantity || 1,
          })),
        })),
        null,
        2
      )
    );

    existingBookings.forEach((booking: any) => {
      console.log(
        `Processing booking ${booking.bookingId} from ${new Date(booking.checkInDate).toLocaleDateString()} to ${new Date(booking.checkOutDate).toLocaleDateString()}`
      );

      booking.rooms.forEach((room: any) => {
        const roomName = room.roomName;
        const roomQuantity = Number(room.quantity) || 1; // Đảm bảo số lượng phòng là số

        console.log(`  Room: ${roomName}, Quantity: ${roomQuantity}`);

        // Lưu lại tên phòng đã đặt
        if (!bookedRoomNames.includes(roomName)) {
          bookedRoomNames.push(roomName);
        }

        // Đếm số lượng phòng đã được đặt (theo tên chính xác)
        if (!bookedRoomCounts[roomName]) {
          bookedRoomCounts[roomName] = 0;
        }
        bookedRoomCounts[roomName] += roomQuantity;
      });
    });

    console.log("Booked room counts:", bookedRoomCounts);
    console.log("Booked room names:", bookedRoomNames);

    // 4. Lọc các phòng phù hợp và kiểm tra tính khả dụng
    const availableRooms: any[] = [];
    const unavailableRooms: string[] = [];

    allRoomOffers.forEach((offer: any) => {
      // Đảm bảo offer có name
      if (!offer || !offer.name) {
        console.log("Skipping invalid room offer without name");
        return;
      }

      console.log(`\nEvaluating room: ${offer.name}`);

      // Kiểm tra sức chứa của phòng cho số người lớn
      const adultCapacity = offer.maxPeople?.adults || 2;
      // Kiểm tra sức chứa cho trẻ em
      const childrenCapacity = offer.maxPeople?.children || 0;
      // Tổng sức chứa
      const roomCapacity = offer.maxPeople?.total || 2;

      // Kiểm tra xem phòng có đủ chỗ cho số người lớn không
      if (adultCapacity < adults) {
        console.log(
          `Room ${offer.name} has insufficient capacity for ${adults} adults (max: ${adultCapacity})`
        );
        unavailableRooms.push(offer.name);
        return;
      }

      // Kiểm tra sức chứa cho trẻ em
      if (childrenCapacity < children) {
        console.log(
          `Room ${offer.name} has insufficient capacity for ${children} children (max: ${childrenCapacity})`
        );
        unavailableRooms.push(offer.name);
        return;
      }

      // Kiểm tra tổng sức chứa
      if (roomCapacity < adults + children) {
        console.log(
          `Room ${offer.name} has insufficient total capacity for ${adults + children} guests (max: ${roomCapacity})`
        );
        unavailableRooms.push(offer.name);
        return;
      }

      // Mỗi phòng offer chỉ tương ứng với 1 phòng thực tế
      const totalRoomsOfType = 1;

      // Kiểm tra xem phòng này đã được đặt chưa
      const bookedRoomsOfType = bookedRoomCounts[offer.name] || 0;

      // Phòng được coi là đã đặt nếu có booking với tên phòng này
      const isRoomBooked = bookedRoomsOfType > 0;
      const availableRoomsOfType = isRoomBooked ? 0 : 1;

      console.log(`Room "${offer.name}":`);
      console.log(`- Total rooms: ${totalRoomsOfType}`);
      console.log(`- Is booked: ${isRoomBooked ? "Yes" : "No"}`);
      console.log(`- Available: ${availableRoomsOfType}`);

      // Kiểm tra xem phòng có khả dụng không (không bị đặt trước)
      if (!isRoomBooked) {
        // Phòng này còn trống
        console.log(`Room ${offer.name} is AVAILABLE`, offer);

        availableRooms.push({
          ...offer, // Giữ nguyên toàn bộ thông tin gốc của offer (bao gồm priceRate, images, v.v.)
          availableCount: 1,
          isAvailable: true,
        });
      } else {
        // Phòng này đã được đặt
        console.log(`Room ${offer.name} is NOT AVAILABLE - already booked`);
        unavailableRooms.push(offer.name);

        // Không thêm phòng đã đặt vào availableRooms nữa
      }
    });

    console.log(
      `Returning ${availableRooms.length} available rooms and ${unavailableRooms.length} unavailable rooms`
    );

    // Trích xuất dữ liệu thuần túy từ mỗi phòng để loại bỏ các thuộc tính Mongoose
    const cleanedRooms = availableRooms.map((room) => {
      // Sử dụng _doc để lấy dữ liệu thuần túy của phòng từ MongoDB Document
      const cleanRoom = room._doc ? { ...room._doc } : { ...room };

      // Thêm các thuộc tính availableCount và isAvailable vào dữ liệu thuần túy
      cleanRoom.availableCount = 1;
      cleanRoom.isAvailable = true;

      return cleanRoom;
    });

    console.log("Cleaned rooms:", cleanedRooms.length);

    return {
      success: true,
      data: {
        availableRooms: JSON.parse(JSON.stringify(cleanedRooms)),
        unavailableRooms: unavailableRooms,
      },
    };
  } catch (error) {
    console.error("Error getting available rooms:", error);
    return handleError(error) as ErrorResponse;
  }
}
