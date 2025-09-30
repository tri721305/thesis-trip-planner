/**
 * Các hàm tiện ích cho xử lý booking
 */

import { HotelBooking } from "@/database";
import dbConnect from "@/lib/mongoose";

/**
 * Lấy MongoDB ObjectId từ bookingId chuỗi
 * @param bookingId - Chuỗi bookingId (ví dụ: HBMG4RYAHO)
 * @returns MongoDB ObjectId hoặc null nếu không tìm thấy
 */
export async function getBookingMongoIdFromBookingId(bookingId: string) {
  await dbConnect();

  try {
    const booking = await HotelBooking.findOne({ bookingId });
    if (!booking) return null;

    return booking._id;
  } catch (error) {
    console.error(`Error finding booking with ID ${bookingId}:`, error);
    return null;
  }
}
