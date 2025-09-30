import { Types } from "mongoose";

// Room type definitions
export interface Room {
  roomId: string;
  roomType: string;
  roomNumber: string;
  price: number;
  discountedPrice?: number;
  capacity: number;
  amenities: string[];
}

// Guest information
export interface GuestInfo {
  fullName: string;
  email: string;
  phone: string;
  specialRequests?: string;
}

// Price breakdown
export interface PriceBreakdown {
  basePrice: number;
  taxes: number;
  fees: number;
  discounts: number;
  total: number;
}

// Booking status
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "refunded";

// Base Booking Interface
export interface IBooking {
  _id?: string | Types.ObjectId;
  bookingId?: string;
  userId?: string | Types.ObjectId;
  hotelId: string | Types.ObjectId;
  checkInDate: Date;
  checkOutDate: Date;
  nights: number;
  rooms: Room[];
  guests: {
    adults: number;
    children: number;
  };
  guestInfo: GuestInfo;
  priceBreakdown: PriceBreakdown;
  paymentId?: string | Types.ObjectId;
  paymentStatus: "pending" | "processing" | "completed" | "failed" | "refunded";
  bookingStatus: BookingStatus;
  specialRequests?: string;
  createdAt?: Date;
  updatedAt?: Date;
  cancellationReason?: string;
  cancellationDate?: Date;
  isRefundable: boolean;
  refundableUntil?: Date;
}

// Create Booking Input
export interface CreateBookingParams {
  userId: string;
  hotelId: string;
  checkInDate: Date | string;
  checkOutDate: Date | string;
  rooms: Room[];
  guests: {
    adults: number;
    children: number;
  };
  guestInfo: GuestInfo;
  specialRequests?: string;
  isRefundable?: boolean;
}

// Update Booking Input
export interface UpdateBookingParams {
  bookingId: string;
  bookingStatus?: BookingStatus;
  paymentStatus?:
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "refunded";
  cancellationReason?: string;
}

// Get Bookings Input
export interface GetBookingsParams {
  userId?: string;
  hotelId?: string;
  bookingStatus?: BookingStatus;
  page?: number;
  limit?: number;
}

// Booking Response
export interface BookingResponse {
  booking: IBooking;
  success: boolean;
  message: string;
}

// Bookings Response
export interface BookingsResponse {
  bookings: IBooking[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  success: boolean;
}
