import { HotelBooking } from "@/database";
import mongoose from "mongoose";

// Định nghĩa model HotelBooking để fix lỗi TypeScript
export interface HotelBookingAdapterProps {
  bookingId?: string; // Add optional bookingId
  hotelId: string;
  hotelName: string;
  hotelLocation: string;
  hotelAddress: string;
  hotelImages?: string[];
  hotelRating?: number;
  rooms: {
    roomId: string;
    roomType: string;
    roomNumber: string;
    price: number;
    discountedPrice?: number;
    capacity: number;
    amenities: string[];
  }[];
  checkInDate: Date;
  checkOutDate: Date;
  guestInfo: {
    fullName: string;
    email: string;
    phone: string;
    specialRequests?: string;
  };
  guestCount: {
    adults: number;
    children?: number;
  };
  pricing: {
    basePrice: number;
    taxes: number;
    fees: number;
    discounts: number;
    total: number;
  };
  specialRequests?: string;
  userId: string;
}

// Adapter để chuyển đổi giữa form và model
export function adaptFormToModel(props: HotelBookingAdapterProps): any {
  // Create the base adapted data as an object with an index signature to allow dynamic properties
  const adaptedData: { [key: string]: any } = {
    userId: props.userId,
    hotel: {
      hotelId: props.hotelId,
      name: props.hotelName,
      location: {
        longitude: 0, // Giả định tọa độ cho location
        latitude: 0,
      },
      address: props.hotelAddress,
      images: props.hotelImages?.map((url) => ({ url })) || [],
      rating: {
        value: props.hotelRating || 0,
        source: "default",
      },
    },
    rooms: props.rooms.map((room) => ({
      roomName: room.roomType,
      roomType: room.roomType,
      maxPeople: {
        total: room.capacity,
        adults: room.capacity,
        children: 0,
      },
      amenities: room.amenities,
      pricePerNight: room.price,
      currency: "usd",
      quantity: 1,
    })),
    checkInDate: props.checkInDate,
    checkOutDate: props.checkOutDate,
    guestInfo: {
      firstName: props.guestInfo.fullName.split(" ")[0],
      lastName: props.guestInfo.fullName.split(" ").slice(1).join(" ") || "",
      email: props.guestInfo.email,
      phone: props.guestInfo.phone,
      specialRequests: props.guestInfo.specialRequests,
    },
    guestCount: {
      adults: props.guestCount.adults,
      children: props.guestCount.children || 0,
      childrenAges: [],
    },
    pricing: {
      subtotal: props.pricing.basePrice,
      taxes: props.pricing.taxes,
      fees: props.pricing.fees,
      total: props.pricing.total,
      currency: "usd",
    },
    status: "pending",
    paymentStatus: "pending",
    source: "web",
    specialRequests: props.specialRequests,
  };

  // Add bookingId to the adapted data if it exists in the props
  if (props.bookingId) {
    adaptedData.bookingId = props.bookingId;
  }

  return adaptedData;
}
