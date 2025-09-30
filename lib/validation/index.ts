import { z } from "zod";

// Base booking schema
export const CreateHotelBookingSchema = z.object({
  bookingId: z.string().optional(),
  hotelId: z.number(),
  hotelName: z.string().min(1, { message: "Hotel name is required" }),
  hotelLocation: z.object({
    longitude: z.number(),
    latitude: z.number(),
  }),
  hotelAddress: z.string().optional(),
  hotelImages: z
    .array(
      z.object({
        url: z.string(),
        thumbnailUrl: z.string().optional(),
      })
    )
    .optional(),
  hotelAmenities: z.array(z.string()).optional(),
  hotelRating: z
    .object({
      value: z.number(),
      source: z.string(),
    })
    .optional(),

  // Room details
  rooms: z.array(
    z.object({
      roomName: z.string(),
      roomType: z.string(),
      maxPeople: z.object({
        total: z.number().optional(),
        adults: z.number().optional(),
        children: z.number().optional(),
      }),
      pricePerNight: z.number().positive(),
      currency: z.string(),
      quantity: z.number().int().positive(),
      amenities: z.array(z.string()).optional().default([]),
      bedGroups: z.array(z.string()).optional(),
    })
  ),

  // Dates
  checkInDate: z.coerce.date(),
  checkOutDate: z.coerce.date(),

  // Guest information
  guestInfo: z.object({
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    email: z.string().email({ message: "Valid email is required" }),
    phone: z.string().optional(),
    specialRequests: z.string().optional(),
  }),

  guestCount: z.object({
    adults: z.number().int().positive(),
    children: z.number().int().nonnegative(),
    childrenAges: z.array(z.number()).optional(),
  }),

  // Pricing
  pricing: z.object({
    subtotal: z.number().nonnegative(),
    taxes: z.number().nonnegative(),
    fees: z.number().nonnegative(),
    total: z.number().nonnegative(),
    currency: z.string(),
  }),

  // Additional fields
  specialRequests: z.string().optional(),
  source: z.string().optional(),
});

// Get bookings schema
export const GetHotelBookingsSchema = z.object({
  userId: z.string().optional(),
  status: z
    .enum(["pending", "confirmed", "completed", "cancelled", "no-show"])
    .optional(),
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().optional().default(10),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// Update booking status schema
export const UpdateBookingStatusSchema = z.object({
  bookingId: z.string().min(1, { message: "Booking ID is required" }),
  status: z.enum(["pending", "confirmed", "completed", "cancelled", "no-show"]),
  notes: z.string().optional(),
});

// Cancel booking schema
export const CancelBookingSchema = z.object({
  bookingId: z.string().min(1, { message: "Booking ID is required" }),
  reason: z.string().min(1, { message: "Cancellation reason is required" }),
  refundAmount: z.number().nonnegative().optional(),
});

// Payment schemas
export const CreatePaymentSchema = z.object({
  bookingId: z.string().min(1, { message: "Booking ID is required" }),
  amount: z.number().positive(),
  currency: z
    .string()
    .min(1, { message: "Currency is required" })
    .default("usd"),
  paymentMethod: z.string().min(1, { message: "Payment method is required" }),
  breakdown: z
    .object({
      subtotal: z.number().nonnegative(),
      taxes: z.number().nonnegative(),
      fees: z.number().nonnegative(),
    })
    .optional(),
  billingDetails: z
    .object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      address: z
        .object({
          line1: z.string().optional(),
          line2: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          postal_code: z.string().optional(),
          country: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  description: z.string().optional(),
  source: z.string().optional(),
});

export const CreateStripePaymentIntentSchema = z.object({
  paymentId: z.string().min(1, { message: "Payment ID is required" }),
  amount: z.number().positive(),
  currency: z
    .string()
    .min(1, { message: "Currency is required" })
    .default("usd"),
  description: z.string().optional(),
  metadata: z.record(z.string()).optional(),
});

export const UpdatePaymentStatusSchema = z.object({
  paymentId: z.string().min(1, { message: "Payment ID is required" }),
  status: z.enum([
    "pending",
    "processing",
    "succeeded",
    "failed",
    "refunded",
    "partially_refunded",
  ]),
  stripeInfo: z
    .object({
      paymentIntentId: z.string().optional(),
      clientSecret: z.string().optional(),
      chargeId: z.string().optional(),
    })
    .optional(),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
});

export const ProcessRefundSchema = z.object({
  paymentId: z.string().min(1, { message: "Payment ID is required" }),
  amount: z.number().positive(),
  reason: z.string().min(1, { message: "Refund reason is required" }),
  stripeRefundId: z.string().optional(),
});

export const GetPaymentsSchema = z.object({
  userId: z.string().optional(),
  bookingId: z.string().optional(),
  status: z
    .enum([
      "pending",
      "processing",
      "succeeded",
      "failed",
      "refunded",
      "partially_refunded",
    ])
    .optional(),
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().optional().default(10),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});
