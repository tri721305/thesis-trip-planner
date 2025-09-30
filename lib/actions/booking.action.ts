"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

import { HotelBooking } from "@/database";
import { handleError } from "@/lib/handler/error";
import action from "@/lib/handler/action";
import {
  CreateHotelBookingSchema,
  GetHotelBookingsSchema,
  UpdateBookingStatusSchema,
  CancelBookingSchema,
} from "@/lib/validation";
import dbConnect from "@/lib/mongoose";

/**
 * Create a new hotel booking
 */
export async function createHotelBooking(
  params: CreateHotelBookingParams
): Promise<ActionResponse<HotelBooking>> {
  const validationResult = await action({
    params,
    schema: CreateHotelBookingSchema,
    authorize: true,
  });
  console.log("validationResult", validationResult);

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const {
    hotelId,
    hotelName,
    hotelLocation,
    hotelAddress,
    hotelImages,
    hotelAmenities,
    hotelRating,
    rooms,
    checkInDate,
    checkOutDate,
    guestInfo,
    guestCount,
    pricing,
    specialRequests,
    source = "web",
  } = validationResult.params!;

  const userId = validationResult.session?.user?.id;

  console.log("userId", userId);
  if (!userId) {
    return handleError(new Error("Unauthorized")) as ErrorResponse;
  }

  try {
    await dbConnect();

    // Calculate number of nights
    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);
    const nights = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (nights < 1) {
      throw new Error("Check-out date must be after check-in date");
    }

    // Create booking with custom bookingId if provided
    const bookingData: any = {
      // Sử dụng bookingId được truyền từ client nếu có
      ...(validationResult.params!.hasOwnProperty("bookingId") && {
        bookingId: (validationResult.params! as any).bookingId,
      }),
      userId,
      hotel: {
        hotelId,
        name: hotelName,
        location: hotelLocation,
        address: hotelAddress,
        images: hotelImages,
        amenities: hotelAmenities,
        rating: hotelRating,
      },
      rooms,
      checkInDate: startDate,
      checkOutDate: endDate,
      nights,
      guestInfo,
      guestCount,
      pricing,
      status: "pending",
      paymentStatus: "pending",
      source,
      confirmationEmailSent: false,
      specialRequests,
    };
    console.log("bookingData", bookingData);
    // Tạo booking với dữ liệu đã chuẩn bị
    const booking = await HotelBooking.create(bookingData);

    console.log("Created booking", booking);
    revalidatePath("/bookings");

    // Convert to a safe plain JavaScript object
    const plainBooking = JSON.parse(
      JSON.stringify({
        _id: booking._id.toString(),
        bookingId: booking.bookingId,
        userId: booking.userId.toString(),
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        nights: booking.nights,
        pricing: booking.pricing,
        guestInfo: booking.guestInfo,
        guestCount: booking.guestCount,
        hotel: {
          hotelId: booking.hotel.hotelId,
          name: booking.hotel.name,
          location: booking.hotel.location,
        },
        rooms: booking.rooms.map((room) => ({
          roomName: room.roomName,
          roomType: room.roomType,
          pricePerNight: room.pricePerNight,
          currency: room.currency,
          quantity: room.quantity,
        })),
        source: booking.source,
        confirmationEmailSent: booking.confirmationEmailSent,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      })
    );

    console.log(
      "Plain booking data:",
      JSON.stringify(plainBooking).slice(0, 200) + "..."
    );

    return {
      success: true,
      data: plainBooking as any, // Type assertion to avoid TS errors
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

/**
 * Get hotel bookings
 */
export async function getHotelBookings(params: GetHotelBookingsParams): Promise<
  ActionResponse<{
    bookings: HotelBooking[];
    isNext: boolean;
    totalCount: number;
  }>
> {
  const validationResult = await action({
    params,
    schema: GetHotelBookingsSchema,
    authorize: params.userId ? true : false,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const {
    userId,
    status,
    page = 1,
    pageSize = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = validationResult.params!;

  try {
    await dbConnect();

    // Build query
    const query: Record<string, any> = {};

    // If specific user, filter by userId
    if (userId) {
      // Ensure user can only access their own bookings
      if (
        validationResult.session &&
        validationResult.session.user?.id !== userId
      ) {
        throw new Error("Unauthorized to access other users' bookings");
      }

      query.userId = userId;
    }

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Get total count
    const totalCount = await HotelBooking.countDocuments(query);

    // Calculate pagination
    const skipAmount = (page - 1) * pageSize;

    // Sort order
    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Get bookings
    const bookings = await HotelBooking.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize)
      .populate("userId", "name email image")
      .populate("paymentId");

    // Check if there are more bookings
    const isNext = totalCount > skipAmount + bookings.length;

    return {
      success: true,
      data: {
        bookings: bookings,
        isNext,
        totalCount,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

/**
 * Get booking by ID
 */
export async function getBookingById(
  bookingId: string
): Promise<ActionResponse<HotelBooking>> {
  try {
    await dbConnect();

    const booking = await HotelBooking.findOne({ bookingId })
      .populate("userId", "name email image")
      .populate("paymentId");

    if (!booking) {
      throw new Error("Booking not found");
    }

    return {
      success: true,
      data: booking,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
  params: UpdateBookingStatusParams
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: UpdateBookingStatusSchema,
    authorize: true,
    // admin: true, // Only admin can update status
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { bookingId, status, notes } = validationResult.params!;

  try {
    await dbConnect();

    const booking = await HotelBooking.findOne({ bookingId });

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Update booking status
    booking.status = status;

    if (notes) {
      booking.notes = notes;
    }

    await booking.save();

    revalidatePath("/bookings");

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

/**
 * Cancel booking
 */
export async function cancelBooking(
  params: CancelBookingParams
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: CancelBookingSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { bookingId, reason, refundAmount } = validationResult.params!;

  const userId = validationResult.session?.user?.id;

  if (!userId) {
    return handleError(new Error("Unauthorized")) as ErrorResponse;
  }

  try {
    await dbConnect();

    const booking = await HotelBooking.findOne({ bookingId });

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Ensure user can only cancel their own bookings
    if (booking.userId.toString() !== userId) {
      throw new Error("Unauthorized to cancel this booking");
    }

    // Check if booking is already cancelled
    if (booking.status === "cancelled") {
      throw new Error("Booking is already cancelled");
    }

    // Check if booking can be cancelled (not completed or no-show)
    if (booking.status === "completed" || booking.status === "no-show") {
      throw new Error("Cannot cancel a completed or no-show booking");
    }

    // Update booking status
    booking.status = "cancelled";
    booking.cancellation = {
      reason,
      cancelledAt: new Date(),
      refundAmount: refundAmount || 0,
      refundStatus: refundAmount ? "pending" : undefined,
    };

    await booking.save();

    revalidatePath("/bookings");

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
