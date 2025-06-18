import mongoose, { Document, Schema, Types } from "mongoose";

// Enums for booking types and statuses
export enum BookingType {
  ACCOMMODATION = "accommodation",
  TRANSPORTATION = "transportation",
  ACTIVITY = "activity",
  RESTAURANT = "restaurant",
  TOUR = "tour",
  EVENT = "event",
  RENTAL = "rental",
  SERVICE = "service",
  OTHER = "other",
}

export enum BookingStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
  NO_SHOW = "no_show",
  REFUNDED = "refunded",
  MODIFIED = "modified",
  EXPIRED = "expired",
}

export enum BookingSource {
  DIRECT = "direct",
  EMAIL_IMPORT = "email_import",
  THIRD_PARTY = "third_party",
  MANUAL = "manual",
  API_INTEGRATION = "api_integration",
}

export enum CancellationPolicy {
  FREE = "free",
  PARTIAL_REFUND = "partial_refund",
  NO_REFUND = "no_refund",
  FLEXIBLE = "flexible",
  MODERATE = "moderate",
  STRICT = "strict",
}

// Interfaces for nested objects
interface BookingProvider {
  name: string;
  website?: string;
  phone?: string;
  email?: string;
  logo?: string;
  apiId?: string;
}

interface BookingContact {
  name: string;
  phone?: string;
  email?: string;
  role?: string; // host, concierge, guide, etc.
}

interface CostBreakdown {
  basePrice: number;
  taxes: number;
  fees: number;
  discounts: number;
  total: number;
  currency: string;
  perNight?: number;
  perPerson?: number;
}

interface PaymentInfo {
  method: string; // credit_card, paypal, cash, etc.
  status: "pending" | "paid" | "failed" | "refunded" | "partial";
  paidAmount: number;
  remainingAmount: number;
  paymentDate?: Date;
  refundAmount?: number;
  refundDate?: Date;
  transactionId?: string;
}

interface Guest {
  name: string;
  email?: string;
  phone?: string;
  age?: number;
  documentNumber?: string;
  specialRequests?: string[];
}

interface Modification {
  date: Date;
  modifiedBy: Types.ObjectId;
  changes: Record<string, any>;
  reason?: string;
  cost?: number; // modification fee
}

interface CancellationInfo {
  date: Date;
  cancelledBy: Types.ObjectId;
  reason?: string;
  refundAmount?: number;
  refundDate?: Date;
  policy: CancellationPolicy;
  fee?: number;
}

interface Voucher {
  type: "qr_code" | "barcode" | "pdf" | "email" | "physical";
  data?: string; // QR code data, barcode number, etc.
  url?: string; // URL to download voucher
  instructions?: string;
}

// Main Booking interface
export interface IBooking extends Document {
  _id: Types.ObjectId;
  travelPlan: Types.ObjectId;
  user: Types.ObjectId;

  // Basic booking information
  type: BookingType;
  status: BookingStatus;
  source: BookingSource;
  title: string;
  description?: string;

  // Reference to related entities
  accommodationId?: Types.ObjectId;
  transportationId?: Types.ObjectId;
  placeId?: Types.ObjectId;

  // Provider and contact information
  provider: BookingProvider;
  contacts?: BookingContact[];

  // Booking identifiers
  confirmationNumber: string;
  bookingReference?: string;
  externalBookingId?: string;

  // Dates and timing
  bookingDate: Date;
  checkIn?: Date;
  checkOut?: Date;
  startDate?: Date;
  endDate?: Date;
  duration?: number; // in minutes or days depending on type

  // Location information
  location?: {
    name: string;
    address: string;
    coordinates?: [number, number]; // [longitude, latitude]
    placeId?: Types.ObjectId;
    googlePlaceId?: string;
    instructions?: string;
  };

  // Guest and participant information
  guests: Guest[];
  guestCount: number;
  primaryGuest: Guest;

  // Cost and payment
  cost: CostBreakdown;
  payment: PaymentInfo;

  // Policies and terms
  cancellationPolicy: {
    type: CancellationPolicy;
    description?: string;
    deadlines?: Array<{
      hoursBeforeCheckIn: number;
      refundPercentage: number;
    }>;
  };

  // Booking details and amenities
  details?: Record<string, any>; // Flexible structure for type-specific details
  amenities?: string[];
  inclusions?: string[];
  exclusions?: string[];

  // Special requests and notes
  specialRequests?: string[];
  notes?: string;
  internalNotes?: string; // Staff notes

  // Documents and vouchers
  vouchers?: Voucher[];
  documents?: Array<{
    type: "contract" | "invoice" | "receipt" | "voucher" | "ticket" | "other";
    name: string;
    url: string;
    uploadDate: Date;
  }>;

  // Modification and cancellation history
  modifications?: Modification[];
  cancellation?: CancellationInfo;

  // Communication log
  communications?: Array<{
    date: Date;
    type: "email" | "phone" | "sms" | "chat" | "in_person";
    direction: "inbound" | "outbound";
    subject?: string;
    summary: string;
    attachments?: string[];
  }>;

  // Reviews and ratings
  review?: {
    rating: number;
    comment?: string;
    photos?: Types.ObjectId[];
    reviewDate: Date;
  };

  // Reminders and notifications
  reminders?: Array<{
    type: "check_in" | "payment" | "cancellation_deadline" | "custom";
    date: Date;
    message: string;
    sent: boolean;
  }>;

  // Integration data
  emailIntegrationId?: Types.ObjectId;
  calendarEventId?: string;
  syncData?: Record<string, any>;

  // Metadata
  isArchived: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: Types.ObjectId;
  lastModifiedBy: Types.ObjectId;
}

// Mongoose schema definition
const BookingSchema = new Schema<IBooking>(
  {
    travelPlan: {
      type: Schema.Types.ObjectId,
      ref: "TravelPlan",
      required: true,
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
      enum: Object.values(BookingType),
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
      index: true,
    },
    source: {
      type: String,
      enum: Object.values(BookingSource),
      default: BookingSource.MANUAL,
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

    accommodationId: {
      type: Schema.Types.ObjectId,
      ref: "Accommodation",
    },
    transportationId: {
      type: Schema.Types.ObjectId,
      ref: "Transportation",
    },
    placeId: {
      type: Schema.Types.ObjectId,
      ref: "Place",
    },

    provider: {
      name: { type: String, required: true, trim: true },
      website: { type: String, trim: true },
      phone: { type: String, trim: true },
      email: { type: String, trim: true },
      logo: { type: String, trim: true },
      apiId: { type: String, trim: true },
    },

    contacts: [
      {
        name: { type: String, required: true, trim: true },
        phone: { type: String, trim: true },
        email: { type: String, trim: true },
        role: { type: String, trim: true },
      },
    ],

    confirmationNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    bookingReference: {
      type: String,
      trim: true,
      index: true,
    },
    externalBookingId: {
      type: String,
      trim: true,
      index: true,
    },

    bookingDate: {
      type: Date,
      required: true,
      index: true,
    },
    checkIn: {
      type: Date,
      index: true,
    },
    checkOut: {
      type: Date,
      index: true,
    },
    startDate: {
      type: Date,
      index: true,
    },
    endDate: {
      type: Date,
      index: true,
    },
    duration: {
      type: Number,
      min: 0,
    },

    location: {
      name: { type: String, trim: true },
      address: { type: String, trim: true },
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
      instructions: { type: String, trim: true },
    },

    guests: [
      {
        name: { type: String, required: true, trim: true },
        email: { type: String, trim: true },
        phone: { type: String, trim: true },
        age: { type: Number, min: 0, max: 150 },
        documentNumber: { type: String, trim: true },
        specialRequests: [{ type: String, trim: true }],
      },
    ],
    guestCount: {
      type: Number,
      required: true,
      min: 1,
      max: 50,
    },
    primaryGuest: {
      name: { type: String, required: true, trim: true },
      email: { type: String, trim: true },
      phone: { type: String, trim: true },
      age: { type: Number, min: 0, max: 150 },
      documentNumber: { type: String, trim: true },
      specialRequests: [{ type: String, trim: true }],
    },

    cost: {
      basePrice: { type: Number, required: true, min: 0 },
      taxes: { type: Number, min: 0, default: 0 },
      fees: { type: Number, min: 0, default: 0 },
      discounts: { type: Number, min: 0, default: 0 },
      total: { type: Number, required: true, min: 0 },
      currency: { type: String, required: true, default: "USD", length: 3 },
      perNight: { type: Number, min: 0 },
      perPerson: { type: Number, min: 0 },
    },

    payment: {
      method: { type: String, required: true, trim: true },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded", "partial"],
        default: "pending",
      },
      paidAmount: { type: Number, min: 0, default: 0 },
      remainingAmount: { type: Number, min: 0 },
      paymentDate: Date,
      refundAmount: { type: Number, min: 0 },
      refundDate: Date,
      transactionId: { type: String, trim: true },
    },

    cancellationPolicy: {
      type: {
        type: String,
        enum: Object.values(CancellationPolicy),
        required: true,
      },
      description: { type: String, trim: true },
      deadlines: [
        {
          hoursBeforeCheckIn: { type: Number, min: 0 },
          refundPercentage: { type: Number, min: 0, max: 100 },
        },
      ],
    },

    details: {
      type: Schema.Types.Mixed,
    },
    amenities: [{ type: String, trim: true }],
    inclusions: [{ type: String, trim: true }],
    exclusions: [{ type: String, trim: true }],

    specialRequests: [{ type: String, trim: true }],
    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    internalNotes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    vouchers: [
      {
        type: {
          type: String,
          enum: ["qr_code", "barcode", "pdf", "email", "physical"],
          required: true,
        },
        data: { type: String, trim: true },
        url: { type: String, trim: true },
        instructions: { type: String, trim: true },
      },
    ],

    documents: [
      {
        type: {
          type: String,
          enum: [
            "contract",
            "invoice",
            "receipt",
            "voucher",
            "ticket",
            "other",
          ],
          required: true,
        },
        name: { type: String, required: true, trim: true },
        url: { type: String, required: true, trim: true },
        uploadDate: { type: Date, default: Date.now },
      },
    ],

    modifications: [
      {
        date: { type: Date, required: true },
        modifiedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        changes: { type: Schema.Types.Mixed, required: true },
        reason: { type: String, trim: true },
        cost: { type: Number, min: 0 },
      },
    ],

    cancellation: {
      date: Date,
      cancelledBy: { type: Schema.Types.ObjectId, ref: "User" },
      reason: { type: String, trim: true },
      refundAmount: { type: Number, min: 0 },
      refundDate: Date,
      policy: {
        type: String,
        enum: Object.values(CancellationPolicy),
      },
      fee: { type: Number, min: 0 },
    },

    communications: [
      {
        date: { type: Date, required: true },
        type: {
          type: String,
          enum: ["email", "phone", "sms", "chat", "in_person"],
          required: true,
        },
        direction: {
          type: String,
          enum: ["inbound", "outbound"],
          required: true,
        },
        subject: { type: String, trim: true },
        summary: { type: String, required: true, trim: true },
        attachments: [{ type: String, trim: true }],
      },
    ],

    review: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, trim: true, maxlength: 1000 },
      photos: [{ type: Schema.Types.ObjectId, ref: "Photo" }],
      reviewDate: { type: Date, default: Date.now },
    },

    reminders: [
      {
        type: {
          type: String,
          enum: ["check_in", "payment", "cancellation_deadline", "custom"],
          required: true,
        },
        date: { type: Date, required: true },
        message: { type: String, required: true, trim: true },
        sent: { type: Boolean, default: false },
      },
    ],

    emailIntegrationId: {
      type: Schema.Types.ObjectId,
      ref: "EmailIntegration",
    },
    calendarEventId: {
      type: String,
      trim: true,
    },
    syncData: {
      type: Schema.Types.Mixed,
    },

    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    tags: [{ type: String, trim: true }],

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
BookingSchema.index({ travelPlan: 1, status: 1 });
BookingSchema.index({ user: 1, type: 1, status: 1 });
BookingSchema.index({ confirmationNumber: 1 }, { unique: true });
BookingSchema.index({ bookingReference: 1 });
BookingSchema.index({ externalBookingId: 1 });
BookingSchema.index({ "provider.name": 1 });
BookingSchema.index({ checkIn: 1, checkOut: 1 });
BookingSchema.index({ startDate: 1, endDate: 1 });
BookingSchema.index({ bookingDate: -1 });

// Compound indexes for common queries
BookingSchema.index({ user: 1, status: 1, checkIn: 1 });
BookingSchema.index({ travelPlan: 1, type: 1, status: 1 });
BookingSchema.index({ type: 1, status: 1, bookingDate: -1 });

// Geospatial index for location-based queries
BookingSchema.index({ "location.coordinates": "2dsphere" });

// Text search index
BookingSchema.index({
  title: "text",
  description: "text",
  "provider.name": "text",
  notes: "text",
});

// Pre-save middleware for data validation and auto-calculation
BookingSchema.pre("save", function (next) {
  // Auto-calculate remaining payment amount
  if (this.payment) {
    this.payment.remainingAmount = this.cost.total - this.payment.paidAmount;
  }

  // Validate check-in/check-out dates
  if (this.checkIn && this.checkOut && this.checkIn >= this.checkOut) {
    return next(new Error("Check-out date must be after check-in date"));
  }

  // Validate start/end dates
  if (this.startDate && this.endDate && this.startDate >= this.endDate) {
    return next(new Error("End date must be after start date"));
  }

  // Set guest count from guests array if not provided
  if (!this.guestCount && this.guests && this.guests.length > 0) {
    this.guestCount = this.guests.length;
  }

  // Set primary guest from first guest if not provided
  if (!this.primaryGuest && this.guests && this.guests.length > 0) {
    this.primaryGuest = this.guests[0];
  }

  // Set lastModifiedBy
  if (this.isModified() && !this.isNew) {
    this.lastModifiedBy = this.createdBy; // This would be set by the calling code
  }

  next();
});

// Virtual for booking duration in days
BookingSchema.virtual("durationInDays").get(function () {
  if (this.checkIn && this.checkOut) {
    return Math.ceil(
      (this.checkOut.getTime() - this.checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );
  }
  if (this.startDate && this.endDate) {
    return Math.ceil(
      (this.endDate.getTime() - this.startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );
  }
  return null;
});

// Virtual for total paid percentage
BookingSchema.virtual("paidPercentage").get(function () {
  if (this.cost.total === 0) return 100;
  return Math.round((this.payment.paidAmount / this.cost.total) * 100);
});

// Virtual for cancellation deadline
BookingSchema.virtual("cancellationDeadline").get(function () {
  if (
    !this.cancellationPolicy.deadlines ||
    this.cancellationPolicy.deadlines.length === 0
  ) {
    return null;
  }

  const earliestDeadline = Math.max(
    ...this.cancellationPolicy.deadlines.map((d) => d.hoursBeforeCheckIn)
  );
  const checkInDate = this.checkIn || this.startDate;

  if (checkInDate) {
    return new Date(checkInDate.getTime() - earliestDeadline * 60 * 60 * 1000);
  }

  return null;
});

// Static methods for common queries
BookingSchema.statics.findByTravelPlan = function (
  travelPlanId: Types.ObjectId,
  options: any = {}
) {
  return this.find({ travelPlan: travelPlanId, isArchived: false })
    .sort({ checkIn: 1, startDate: 1, bookingDate: -1 })
    .populate("accommodationId transportationId placeId")
    .exec();
};

BookingSchema.statics.findUpcoming = function (
  userId: Types.ObjectId,
  days: number = 30
) {
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return this.find({
    user: userId,
    isArchived: false,
    status: { $in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
    $or: [
      { checkIn: { $gte: now, $lte: futureDate } },
      { startDate: { $gte: now, $lte: futureDate } },
    ],
  })
    .sort({ checkIn: 1, startDate: 1 })
    .populate("travelPlan", "title destination")
    .exec();
};

BookingSchema.statics.findByConfirmationNumber = function (
  confirmationNumber: string
) {
  return this.findOne({ confirmationNumber }).exec();
};

BookingSchema.statics.findByProvider = function (
  providerName: string,
  options: any = {}
) {
  return this.find({
    "provider.name": new RegExp(providerName, "i"),
    ...options,
  })
    .sort({ bookingDate: -1 })
    .exec();
};

// Instance methods
BookingSchema.methods.isActive = function () {
  return [BookingStatus.CONFIRMED, BookingStatus.PENDING].includes(this.status);
};

BookingSchema.methods.isInPast = function () {
  const endDate = this.checkOut || this.endDate;
  return endDate && endDate < new Date();
};

BookingSchema.methods.canCancel = function () {
  if (this.status === BookingStatus.CANCELLED || this.isInPast()) {
    return false;
  }

  const cancellationDeadline = this.cancellationDeadline;
  return !cancellationDeadline || new Date() < cancellationDeadline;
};

BookingSchema.methods.calculateRefund = function () {
  if (!this.canCancel()) return 0;

  const now = new Date();
  const checkInDate = this.checkIn || this.startDate;

  if (!checkInDate || !this.cancellationPolicy.deadlines) {
    return this.cancellationPolicy.type === CancellationPolicy.FREE
      ? this.payment.paidAmount
      : 0;
  }

  const hoursUntilCheckIn =
    (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  // Find applicable refund percentage
  let refundPercentage = 0;
  for (const deadline of this.cancellationPolicy.deadlines) {
    if (hoursUntilCheckIn >= deadline.hoursBeforeCheckIn) {
      refundPercentage = Math.max(refundPercentage, deadline.refundPercentage);
    }
  }

  return Math.round((this.payment.paidAmount * refundPercentage) / 100);
};

BookingSchema.methods.addCommunication = function (
  type: string,
  direction: string,
  summary: string,
  options: any = {}
) {
  this.communications = this.communications || [];
  this.communications.push({
    date: new Date(),
    type: type as any,
    direction: direction as any,
    summary,
    ...options,
  });
  return this.save();
};

BookingSchema.methods.addReminder = function (
  type: string,
  date: Date,
  message: string
) {
  this.reminders = this.reminders || [];
  this.reminders.push({
    type: type as any,
    date,
    message,
    sent: false,
  });
  return this.save();
};

BookingSchema.methods.modifyBooking = function (
  changes: Record<string, any>,
  modifiedBy: Types.ObjectId,
  reason?: string
) {
  this.modifications = this.modifications || [];
  this.modifications.push({
    date: new Date(),
    modifiedBy,
    changes,
    reason,
  });

  // Apply changes
  Object.assign(this, changes);
  this.lastModifiedBy = modifiedBy;

  return this.save();
};

// Export the model
const Booking = mongoose.model<IBooking>("Booking", BookingSchema);
export default Booking;
