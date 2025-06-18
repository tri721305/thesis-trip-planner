import { Schema, model, models, Types } from "mongoose";

// Accommodation Model
export interface IAccommodation {
  _id: Types.ObjectId;
  travelPlanId: Types.ObjectId;

  // Basic Info
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };

  // Booking Details
  checkIn: Date;
  checkOut: Date;
  nights: number;

  // Room Details
  roomType?: string;
  guests: number;
  rooms: number;

  // Booking Info
  confirmationNumber?: string;
  bookingPlatform?: string; // Booking.com, Airbnb, etc
  bookingUrl?: string;

  // Cost
  totalCost: number;
  currency: string;
  costPerNight?: number;
  taxes?: number;
  fees?: number;

  // Details
  rating?: number;
  amenities?: string[];
  photos?: string[];
  notes?: string;

  // Status
  status: "booked" | "confirmed" | "checked_in" | "checked_out" | "cancelled";

  createdAt: Date;
  updatedAt: Date;
}

const AccommodationSchema = new Schema<IAccommodation>(
  {
    travelPlanId: {
      type: Schema.Types.ObjectId,
      ref: "TravelPlan",
      required: true,
      index: true,
    },
    name: { type: String, required: true, maxlength: 200 },
    address: { type: String, required: true, maxlength: 500 },
    coordinates: {
      lat: { type: Number, required: true, min: -90, max: 90 },
      lng: { type: Number, required: true, min: -180, max: 180 },
    },

    // Booking Details
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    nights: { type: Number, required: true, min: 1 },

    // Room Details
    roomType: { type: String, maxlength: 100 },
    guests: { type: Number, required: true, min: 1 },
    rooms: { type: Number, required: true, min: 1 },

    // Booking Info
    confirmationNumber: { type: String, maxlength: 50 },
    bookingPlatform: { type: String, maxlength: 50 },
    bookingUrl: { type: String },

    // Cost
    totalCost: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "USD" },
    costPerNight: { type: Number, min: 0 },
    taxes: { type: Number, min: 0 },
    fees: { type: Number, min: 0 },

    // Details
    rating: { type: Number, min: 0, max: 5 },
    amenities: [{ type: String, maxlength: 50 }],
    photos: [{ type: String }],
    notes: { type: String, maxlength: 2000 },

    // Status
    status: {
      type: String,
      enum: ["booked", "confirmed", "checked_in", "checked_out", "cancelled"],
      default: "booked",
    },
  },
  { timestamps: true }
);

// Indexes
AccommodationSchema.index({ travelPlanId: 1 });
AccommodationSchema.index({ checkIn: 1, checkOut: 1 });
AccommodationSchema.index({ status: 1 });

// Middleware để validate dates và tính nights
AccommodationSchema.pre("save", function (next) {
  if (this.checkIn >= this.checkOut) {
    next(new Error("Check-out date must be after check-in date"));
  }

  // Auto-calculate nights
  const diffTime = Math.abs(this.checkOut.getTime() - this.checkIn.getTime());
  this.nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  next();
});

const Accommodation =
  models?.Accommodation ||
  model<IAccommodation>("Accommodation", AccommodationSchema);
export default Accommodation;
