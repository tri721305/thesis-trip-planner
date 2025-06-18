import mongoose, { Document, Schema, Types } from "mongoose";

// Enums for transportation types and statuses
export enum TransportationType {
  FLIGHT = "flight",
  TRAIN = "train",
  BUS = "bus",
  CAR_RENTAL = "car_rental",
  TAXI = "taxi",
  RIDESHARE = "rideshare",
  FERRY = "ferry",
  METRO = "metro",
  WALKING = "walking",
  CYCLING = "cycling",
  OTHER = "other",
}

export enum TransportationStatus {
  PLANNED = "planned",
  BOOKED = "booked",
  CONFIRMED = "confirmed",
  CHECKED_IN = "checked_in",
  IN_TRANSIT = "in_transit",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  DELAYED = "delayed",
  MISSED = "missed",
}

export enum SeatClass {
  ECONOMY = "economy",
  PREMIUM_ECONOMY = "premium_economy",
  BUSINESS = "business",
  FIRST = "first",
  BASIC = "basic",
  STANDARD = "standard",
  PREMIUM = "premium",
}

// Interfaces for nested objects
interface FlightDetails {
  airline: string;
  flightNumber: string;
  aircraft?: string;
  terminal?: string;
  gate?: string;
  seatNumber?: string;
  seatClass: SeatClass;
  baggage?: {
    carryOn: boolean;
    checked: number;
    weight?: number;
  };
  layovers?: Array<{
    airport: string;
    duration: number; // minutes
    city?: string;
  }>;
}

interface TrainDetails {
  operator: string;
  trainNumber: string;
  trainType?: string; // high-speed, regional, etc.
  carNumber?: string;
  seatNumber?: string;
  seatClass: SeatClass;
  platform?: string;
}

interface BusDetails {
  operator: string;
  busNumber?: string;
  busType?: string; // luxury, standard, sleeper
  seatNumber?: string;
  terminal?: string;
  platform?: string;
}

interface CarRentalDetails {
  company: string;
  vehicleType: string;
  vehicleModel?: string;
  licensePlate?: string;
  pickupLocation: {
    name: string;
    address: string;
    coordinates?: [number, number]; // [longitude, latitude]
  };
  dropoffLocation: {
    name: string;
    address: string;
    coordinates?: [number, number];
  };
  insurance?: {
    type: string;
    coverage: string[];
    cost: number;
  };
  fuelPolicy?: string;
  mileageLimit?: number;
}

interface LocationPoint {
  name: string;
  address: string;
  coordinates?: [number, number]; // [longitude, latitude]
  placeId?: Types.ObjectId; // Reference to Place model
  googlePlaceId?: string;
  airport?: {
    code: string; // IATA/ICAO code
    terminal?: string;
  };
  station?: {
    code?: string;
    platform?: string;
  };
}

interface CostBreakdown {
  basePrice: number;
  taxes: number;
  fees: number;
  insurance?: number;
  extras?: number;
  total: number;
  currency: string;
}

interface BookingInfo {
  confirmationNumber: string;
  bookingReference?: string;
  bookingPlatform?: string;
  bookingUrl?: string;
  eTicket?: {
    url: string;
    qrCode?: string;
    barcode?: string;
  };
  contactInfo?: {
    phone?: string;
    email?: string;
  };
}

// Main Transportation interface
export interface ITransportation extends Document {
  _id: Types.ObjectId;
  travelPlan: Types.ObjectId;
  day?: Types.ObjectId;
  user: Types.ObjectId;

  // Basic transportation info
  type: TransportationType;
  status: TransportationStatus;
  title: string;
  description?: string;

  // Location and timing
  departure: {
    location: LocationPoint;
    dateTime: Date;
    timezone?: string;
  };
  arrival: {
    location: LocationPoint;
    dateTime: Date;
    timezone?: string;
  };
  duration: number; // minutes

  // Type-specific details (discriminated union)
  details: FlightDetails | TrainDetails | BusDetails | CarRentalDetails | null;

  // Booking and cost information
  booking?: BookingInfo;
  cost?: CostBreakdown;
  paymentMethod?: string;

  // Travel companions
  passengers?: Array<{
    name: string;
    email?: string;
    phone?: string;
    documentNumber?: string;
    seatNumber?: string;
    specialRequests?: string[];
  }>;

  // Additional information
  notes?: string;
  alerts?: Array<{
    type: "delay" | "gate_change" | "cancellation" | "reminder";
    message: string;
    timestamp: Date;
    acknowledged: boolean;
  }>;

  // Real-time tracking
  realTimeInfo?: {
    currentStatus: string;
    estimatedArrival?: Date;
    delay?: number; // minutes
    currentLocation?: [number, number];
    nextUpdate?: Date;
  };

  // Integration data
  externalBookingId?: string;
  emailIntegrationId?: Types.ObjectId;
  calendarEventId?: string;

  // Social features
  isPublic: boolean;
  photos?: Types.ObjectId[];
  reviews?: Types.ObjectId[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: Types.ObjectId;
  lastModifiedBy: Types.ObjectId;
}

// Mongoose schema definition
const TransportationSchema = new Schema<ITransportation>(
  {
    travelPlan: {
      type: Schema.Types.ObjectId,
      ref: "TravelPlan",
      required: true,
      index: true,
    },
    day: {
      type: Schema.Types.ObjectId,
      ref: "Day",
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: Object.values(TransportationType),
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(TransportationStatus),
      default: TransportationStatus.PLANNED,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    departure: {
      location: {
        name: { type: String, required: true, trim: true },
        address: { type: String, required: true, trim: true },
        coordinates: {
          type: [Number],
          validate: {
            validator: function (v: number[]) {
              return (
                v.length === 2 &&
                v[0] >= -180 &&
                v[0] <= 180 &&
                v[1] >= -90 &&
                v[1] <= 90
              );
            },
            message:
              "Coordinates must be [longitude, latitude] with valid ranges",
          },
        },
        placeId: { type: Schema.Types.ObjectId, ref: "Place" },
        googlePlaceId: String,
        airport: {
          code: String,
          terminal: String,
        },
        station: {
          code: String,
          platform: String,
        },
      },
      dateTime: { type: Date, required: true, index: true },
      timezone: String,
    },

    arrival: {
      location: {
        name: { type: String, required: true, trim: true },
        address: { type: String, required: true, trim: true },
        coordinates: {
          type: [Number],
          validate: {
            validator: function (v: number[]) {
              return (
                v.length === 2 &&
                v[0] >= -180 &&
                v[0] <= 180 &&
                v[1] >= -90 &&
                v[1] <= 90
              );
            },
            message:
              "Coordinates must be [longitude, latitude] with valid ranges",
          },
        },
        placeId: { type: Schema.Types.ObjectId, ref: "Place" },
        googlePlaceId: String,
        airport: {
          code: String,
          terminal: String,
        },
        station: {
          code: String,
          platform: String,
        },
      },
      dateTime: { type: Date, required: true, index: true },
      timezone: String,
    },

    duration: {
      type: Number,
      required: true,
      min: 0,
    },

    details: {
      type: Schema.Types.Mixed,
      validate: {
        validator: function (this: ITransportation, details: any) {
          if (!details) return true;

          switch (this.type) {
            case TransportationType.FLIGHT:
              return (
                details.airline && details.flightNumber && details.seatClass
              );
            case TransportationType.TRAIN:
              return (
                details.operator && details.trainNumber && details.seatClass
              );
            case TransportationType.BUS:
              return details.operator;
            case TransportationType.CAR_RENTAL:
              return (
                details.company &&
                details.vehicleType &&
                details.pickupLocation &&
                details.dropoffLocation
              );
            default:
              return true;
          }
        },
        message: "Invalid details for transportation type",
      },
    },

    booking: {
      confirmationNumber: { type: String, trim: true },
      bookingReference: { type: String, trim: true },
      bookingPlatform: { type: String, trim: true },
      bookingUrl: { type: String, trim: true },
      eTicket: {
        url: String,
        qrCode: String,
        barcode: String,
      },
      contactInfo: {
        phone: String,
        email: String,
      },
    },

    cost: {
      basePrice: { type: Number, min: 0 },
      taxes: { type: Number, min: 0, default: 0 },
      fees: { type: Number, min: 0, default: 0 },
      insurance: { type: Number, min: 0 },
      extras: { type: Number, min: 0 },
      total: { type: Number, min: 0 },
      currency: { type: String, default: "USD", length: 3 },
    },

    paymentMethod: {
      type: String,
      trim: true,
    },

    passengers: [
      {
        name: { type: String, required: true, trim: true },
        email: { type: String, trim: true },
        phone: { type: String, trim: true },
        documentNumber: { type: String, trim: true },
        seatNumber: { type: String, trim: true },
        specialRequests: [{ type: String, trim: true }],
      },
    ],

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    alerts: [
      {
        type: {
          type: String,
          enum: ["delay", "gate_change", "cancellation", "reminder"],
          required: true,
        },
        message: { type: String, required: true, trim: true },
        timestamp: { type: Date, required: true },
        acknowledged: { type: Boolean, default: false },
      },
    ],

    realTimeInfo: {
      currentStatus: { type: String, trim: true },
      estimatedArrival: Date,
      delay: { type: Number, min: 0 },
      currentLocation: {
        type: [Number],
        validate: {
          validator: function (v: number[]) {
            return (
              v.length === 2 &&
              v[0] >= -180 &&
              v[0] <= 180 &&
              v[1] >= -90 &&
              v[1] <= 90
            );
          },
          message:
            "Coordinates must be [longitude, latitude] with valid ranges",
        },
      },
      nextUpdate: Date,
    },

    externalBookingId: {
      type: String,
      trim: true,
      index: true,
    },
    emailIntegrationId: {
      type: Schema.Types.ObjectId,
      ref: "EmailIntegration",
    },
    calendarEventId: {
      type: String,
      trim: true,
    },

    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
    photos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Photo",
      },
    ],
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastModifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for optimal query performance
TransportationSchema.index({ travelPlan: 1, "departure.dateTime": 1 });
TransportationSchema.index({ user: 1, status: 1, "departure.dateTime": 1 });
TransportationSchema.index({ type: 1, status: 1 });
TransportationSchema.index({ "departure.dateTime": 1, "arrival.dateTime": 1 });
TransportationSchema.index({ "booking.confirmationNumber": 1 });
TransportationSchema.index({ externalBookingId: 1 });

// Compound indexes for common queries
TransportationSchema.index({ travelPlan: 1, type: 1, status: 1 });
TransportationSchema.index({ user: 1, type: 1, "departure.dateTime": -1 });

// Geospatial indexes for location-based queries
TransportationSchema.index({ "departure.location.coordinates": "2dsphere" });
TransportationSchema.index({ "arrival.location.coordinates": "2dsphere" });

// Pre-save middleware for data validation and auto-calculation
TransportationSchema.pre("save", function (next) {
  // Auto-calculate duration if not provided
  if (!this.duration && this.departure.dateTime && this.arrival.dateTime) {
    this.duration = Math.round(
      (this.arrival.dateTime.getTime() - this.departure.dateTime.getTime()) /
        (1000 * 60)
    );
  }

  // Validate that arrival is after departure
  if (
    this.departure.dateTime &&
    this.arrival.dateTime &&
    this.departure.dateTime >= this.arrival.dateTime
  ) {
    return next(new Error("Arrival time must be after departure time"));
  }

  // Auto-calculate total cost if components are provided
  if (this.cost && !this.cost.total) {
    this.cost.total =
      (this.cost.basePrice || 0) +
      (this.cost.taxes || 0) +
      (this.cost.fees || 0) +
      (this.cost.insurance || 0) +
      (this.cost.extras || 0);
  }

  // Set lastModifiedBy
  if (this.isModified() && !this.isNew) {
    this.lastModifiedBy = this.createdBy; // This would be set by the calling code
  }

  next();
});

// Virtual for formatted duration
TransportationSchema.virtual("formattedDuration").get(function () {
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
});

// Virtual for trip distance (if coordinates available)
TransportationSchema.virtual("distance").get(function () {
  if (
    this.departure.location.coordinates &&
    this.arrival.location.coordinates
  ) {
    const [depLng, depLat] = this.departure.location.coordinates;
    const [arrLng, arrLat] = this.arrival.location.coordinates;

    // Haversine formula for distance calculation
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((arrLat - depLat) * Math.PI) / 180;
    const dLng = ((arrLng - depLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((depLat * Math.PI) / 180) *
        Math.cos((arrLat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }
  return null;
});

// Static methods for common queries
TransportationSchema.statics.findByTravelPlan = function (
  travelPlanId: Types.ObjectId,
  options: any = {}
) {
  return this.find({ travelPlan: travelPlanId })
    .sort({ "departure.dateTime": 1 })
    .populate("photos reviews")
    .exec();
};

TransportationSchema.statics.findUpcoming = function (
  userId: Types.ObjectId,
  days: number = 7
) {
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return this.find({
    user: userId,
    "departure.dateTime": { $gte: now, $lte: futureDate },
    status: {
      $in: [TransportationStatus.BOOKED, TransportationStatus.CONFIRMED],
    },
  })
    .sort({ "departure.dateTime": 1 })
    .populate("travelPlan", "title destination")
    .exec();
};

TransportationSchema.statics.findByType = function (
  type: TransportationType,
  filters: any = {}
) {
  return this.find({ type, ...filters })
    .sort({ "departure.dateTime": -1 })
    .exec();
};

// Instance methods
TransportationSchema.methods.isInPast = function () {
  return this.arrival.dateTime < new Date();
};

TransportationSchema.methods.isToday = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  return this.departure.dateTime >= today && this.departure.dateTime < tomorrow;
};

TransportationSchema.methods.canCheckIn = function () {
  const now = new Date();
  const checkInWindow = new Date(
    this.departure.dateTime.getTime() - 24 * 60 * 60 * 1000
  ); // 24 hours before

  return (
    now >= checkInWindow &&
    now <= this.departure.dateTime &&
    this.status === TransportationStatus.BOOKED
  );
};

TransportationSchema.methods.addAlert = function (
  type: string,
  message: string
) {
  this.alerts = this.alerts || [];
  this.alerts.push({
    type: type as any,
    message,
    timestamp: new Date(),
    acknowledged: false,
  });
  return this.save();
};

// Export the model
const Transportation = mongoose.model<ITransportation>(
  "Transportation",
  TransportationSchema
);
export default Transportation;
