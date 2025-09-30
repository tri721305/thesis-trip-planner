import { Document, model, models, Schema, Types } from "mongoose";

// Interface cho thông tin khách
export interface IGuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialRequests?: string;
}

// Interface cho thông tin phòng đã đặt
export interface IBookedRoom {
  roomName: string;
  roomType: string;
  maxPeople: {
    total?: number;
    adults?: number;
    children?: number;
  };
  areaSquareMeters?: number;
  amenities: string[];
  bedGroups?: string[];
  pricePerNight: number;
  currency: string;
  quantity: number; // Số lượng phòng đặt
}

// Interface cho thông tin khách sạn
export interface IBookedHotel {
  hotelId: number; // Reference to hotel_offers.hotel_id
  name: string;
  location: {
    longitude: number;
    latitude: number;
  };
  address?: string;
  images?: Array<{
    url: string;
    thumbnailUrl?: string;
  }>;
  amenities?: string[];
  rating?: {
    value: number;
    source: string;
  };
}

// Interface cho thông tin đặt phòng
export interface IHotelBooking {
  bookingId: string; // Unique booking reference
  userId: Types.ObjectId; // Reference to User
  paymentId?: Types.ObjectId; // Reference to Payment

  // Thông tin khách sạn
  hotel: IBookedHotel;

  // Thông tin phòng
  rooms: IBookedRoom[];

  // Thông tin thời gian
  checkInDate: Date;
  checkOutDate: Date;
  nights: number;

  // Thông tin khách
  guestInfo: IGuestInfo;
  guestCount: {
    adults: number;
    children: number;
    childrenAges?: number[];
  };

  // Thông tin giá
  pricing: {
    subtotal: number; // Tổng tiền phòng
    taxes: number; // Thuế
    fees: number; // Phí dịch vụ
    total: number; // Tổng cộng
    currency: string;
  };

  // Trạng thái đặt phòng
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no-show";

  // Thông tin thanh toán
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod?: string;

  // Thông tin hủy
  cancellation?: {
    reason: string;
    cancelledAt: Date;
    refundAmount?: number;
    refundStatus?: "pending" | "processed" | "failed";
  };

  // Metadata
  source: string; // Nguồn booking (web, mobile, etc.)
  confirmationEmailSent: boolean;
  specialRequests?: string;
  notes?: string;
}

export interface IHotelBookingDoc extends IHotelBooking, Document {}

// Schema cho thông tin khách
const GuestInfoSchema = new Schema<IGuestInfo>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    phone: { type: String, trim: true },
    specialRequests: { type: String, trim: true },
  },
  { _id: false }
);

// Schema cho thông tin phòng đã đặt
const BookedRoomSchema = new Schema<IBookedRoom>(
  {
    roomName: { type: String, required: true },
    roomType: { type: String, required: true },
    maxPeople: {
      total: { type: Number },
      adults: { type: Number },
      children: { type: Number },
    },
    areaSquareMeters: { type: Number },
    amenities: [{ type: String }],
    bedGroups: [{ type: String }],
    pricePerNight: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "VND" },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
);

// Schema cho thông tin khách sạn
const BookedHotelSchema = new Schema<IBookedHotel>(
  {
    hotelId: { type: Number, required: true, index: true },
    name: { type: String, required: true, trim: true },
    location: {
      longitude: { type: Number, required: true },
      latitude: { type: Number, required: true },
    },
    address: { type: String, trim: true },
    images: [
      {
        url: { type: String, required: true },
        thumbnailUrl: { type: String },
      },
    ],
    amenities: [{ type: String }],
    rating: {
      value: { type: Number, min: 0, max: 10 },
      source: { type: String },
    },
  },
  { _id: false }
);

// Schema chính
const HotelBookingSchema = new Schema<IHotelBooking>(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      index: true,
    },

    hotel: { type: BookedHotelSchema, required: true },
    rooms: [BookedRoomSchema],

    checkInDate: { type: Date, required: true, index: true },
    checkOutDate: { type: Date, required: true, index: true },
    nights: { type: Number, required: true, min: 1 },

    guestInfo: { type: GuestInfoSchema, required: true },
    guestCount: {
      adults: { type: Number, required: true, min: 1 },
      children: { type: Number, default: 0, min: 0 },
      childrenAges: [{ type: Number, min: 0, max: 17 }],
    },

    pricing: {
      subtotal: { type: Number, required: true, min: 0 },
      taxes: { type: Number, default: 0, min: 0 },
      fees: { type: Number, default: 0, min: 0 },
      total: { type: Number, required: true, min: 0 },
      currency: { type: String, required: true, default: "VND" },
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "no-show"],
      default: "pending",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    paymentMethod: { type: String },

    cancellation: {
      reason: { type: String },
      cancelledAt: { type: Date },
      refundAmount: { type: Number, min: 0 },
      refundStatus: {
        type: String,
        enum: ["pending", "processed", "failed"],
      },
    },

    source: { type: String, default: "web" },
    confirmationEmailSent: { type: Boolean, default: false },
    specialRequests: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  {
    timestamps: true,
    collection: "hotel_bookings",
  }
);

// Indexes for performance
HotelBookingSchema.index({ bookingId: 1 });
HotelBookingSchema.index({ userId: 1, status: 1 });
HotelBookingSchema.index({ "hotel.hotelId": 1 });
HotelBookingSchema.index({ checkInDate: 1, checkOutDate: 1 });
HotelBookingSchema.index({ status: 1, paymentStatus: 1 });
HotelBookingSchema.index({ "guestInfo.email": 1 });
HotelBookingSchema.index({ createdAt: -1 });

// Virtual for full guest name
HotelBookingSchema.virtual("guestInfo.fullName").get(function () {
  return `${this.guestInfo.firstName} ${this.guestInfo.lastName}`;
});

// Pre-save middleware to generate booking ID
HotelBookingSchema.pre("save", function (next) {
  if (!this.bookingId) {
    // Generate booking ID: HB + timestamp + random
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.bookingId = `HB${timestamp}${random}`;
  }
  next();
});

// Pre-save middleware to calculate nights
HotelBookingSchema.pre("save", function (next) {
  if (this.checkInDate && this.checkOutDate) {
    const diffTime = this.checkOutDate.getTime() - this.checkInDate.getTime();
    this.nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  next();
});

// Static methods
HotelBookingSchema.statics.findByBookingId = function (bookingId: string) {
  return this.findOne({ bookingId }).populate("userId paymentId");
};

HotelBookingSchema.statics.findByUser = function (userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 }).populate("paymentId");
};

HotelBookingSchema.statics.findByStatus = function (status: string) {
  return this.find({ status }).sort({ createdAt: -1 });
};

const HotelBooking =
  models?.HotelBooking ||
  model<IHotelBooking>("HotelBooking", HotelBookingSchema);

export default HotelBooking;
