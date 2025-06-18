import mongoose, { Document, Schema, Types } from "mongoose";

// Enums for email integration
export enum EmailProvider {
  GMAIL = "gmail",
  OUTLOOK = "outlook",
  YAHOO = "yahoo",
  IMAP = "imap",
  EXCHANGE = "exchange",
  OTHER = "other",
}

export enum ProcessingStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  SKIPPED = "skipped",
  MANUAL_REVIEW = "manual_review",
}

export enum EmailType {
  BOOKING_CONFIRMATION = "booking_confirmation",
  BOOKING_MODIFICATION = "booking_modification",
  BOOKING_CANCELLATION = "booking_cancellation",
  ITINERARY = "itinerary",
  E_TICKET = "e_ticket",
  RECEIPT = "receipt",
  REMINDER = "reminder",
  CHECK_IN = "check_in",
  TRAVEL_ALERT = "travel_alert",
  OTHER = "other",
}

export enum ConfidenceLevel {
  HIGH = "high", // 90-100%
  MEDIUM = "medium", // 70-89%
  LOW = "low", // 50-69%
  VERY_LOW = "very_low", // <50%
}

// Interfaces for nested objects
interface EmailAccount {
  provider: EmailProvider;
  email: string;
  displayName?: string;
  isEnabled: boolean;
  lastSyncDate?: Date;
  syncFrequency: number; // minutes
  accessToken?: string; // encrypted
  refreshToken?: string; // encrypted
  settings?: {
    syncFromDate?: Date;
    autoProcess: boolean;
    folders?: string[]; // which folders to monitor
    excludeKeywords?: string[];
    includeKeywords?: string[];
  };
}

interface ParsedBookingData {
  type: string; // accommodation, flight, etc.
  provider: string;
  confirmationNumber?: string;
  bookingReference?: string;
  title?: string;
  checkIn?: Date;
  checkOut?: Date;
  startDate?: Date;
  endDate?: Date;
  location?: {
    name?: string;
    address?: string;
    coordinates?: [number, number];
  };
  guests?: Array<{
    name: string;
    email?: string;
  }>;
  cost?: {
    total?: number;
    currency?: string;
  };
  additionalData?: Record<string, any>;
}

interface ProcessingResult {
  success: boolean;
  createdBookingId?: Types.ObjectId;
  createdTransportationId?: Types.ObjectId;
  createdAccommodationId?: Types.ObjectId;
  errors?: string[];
  warnings?: string[];
  requiresManualReview?: boolean;
  reviewReason?: string;
}

interface Attachment {
  filename: string;
  contentType: string;
  size: number;
  contentId?: string;
  data?: Buffer; // encrypted
  url?: string; // for cloud storage
  extractedText?: string;
  extractedData?: Record<string, any>;
}

interface SenderInfo {
  name?: string;
  email: string;
  domain?: string;
  isKnownProvider?: boolean;
  reputation?: "trusted" | "unknown" | "suspicious";
}

// Main EmailIntegration interface
export interface IEmailIntegration extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;

  // Email account configuration
  accounts: EmailAccount[];

  // Email message details
  messageId: string; // unique email message ID
  threadId?: string; // email thread ID
  subject: string;
  sender: SenderInfo;
  recipients: string[];
  date: Date;

  // Email content
  textContent?: string;
  htmlContent?: string; // encrypted
  attachments?: Attachment[];

  // Processing information
  processingStatus: ProcessingStatus;
  emailType: EmailType;
  confidenceLevel: ConfidenceLevel;
  confidenceScore: number; // 0-100

  // Parsed data
  parsedData?: ParsedBookingData;
  processingResult?: ProcessingResult;

  // Manual review
  requiresReview: boolean;
  reviewReason?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  reviewNotes?: string;

  // Processing history
  processingAttempts: Array<{
    attemptNumber: number;
    date: Date;
    status: ProcessingStatus;
    error?: string;
    aiModel?: string;
    processingTime?: number; // milliseconds
  }>;

  // AI/ML processing metadata
  aiProcessing?: {
    model: string;
    version: string;
    extractedEntities?: Array<{
      type: string;
      value: string;
      confidence: number;
      startPosition?: number;
      endPosition?: number;
    }>;
    keywords?: string[];
    language?: string;
    sentiment?: string;
  };

  // Linking and relationships
  linkedBooking?: Types.ObjectId;
  linkedTransportation?: Types.ObjectId;
  linkedAccommodation?: Types.ObjectId;
  relatedEmails?: Types.ObjectId[]; // related email messages

  // User interaction
  userActions?: Array<{
    action: "approve" | "reject" | "modify" | "ignore" | "bookmark";
    date: Date;
    notes?: string;
  }>;

  // Security and privacy
  isEncrypted: boolean;
  encryptionKey?: string;
  dataRetentionDate?: Date; // when to delete the email data

  // Flags and tags
  isImportant: boolean;
  isArchived: boolean;
  tags?: string[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastProcessedAt?: Date;
}

// Mongoose schema definition
const EmailIntegrationSchema = new Schema<IEmailIntegration>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    accounts: [
      {
        provider: {
          type: String,
          enum: Object.values(EmailProvider),
          required: true,
        },
        email: {
          type: String,
          required: true,
          trim: true,
          lowercase: true,
        },
        displayName: {
          type: String,
          trim: true,
        },
        isEnabled: {
          type: Boolean,
          default: true,
        },
        lastSyncDate: Date,
        syncFrequency: {
          type: Number,
          default: 60, // 1 hour
          min: 5, // minimum 5 minutes
          max: 1440, // maximum 24 hours
        },
        accessToken: String, // This should be encrypted in real implementation
        refreshToken: String, // This should be encrypted in real implementation
        settings: {
          syncFromDate: Date,
          autoProcess: { type: Boolean, default: true },
          folders: [String],
          excludeKeywords: [String],
          includeKeywords: [String],
        },
      },
    ],

    messageId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    threadId: {
      type: String,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    sender: {
      name: { type: String, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      domain: { type: String, trim: true, lowercase: true },
      isKnownProvider: { type: Boolean, default: false },
      reputation: {
        type: String,
        enum: ["trusted", "unknown", "suspicious"],
        default: "unknown",
      },
    },

    recipients: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    date: {
      type: Date,
      required: true,
      index: true,
    },

    textContent: {
      type: String,
      maxlength: 50000, // 50KB limit for text content
    },
    htmlContent: {
      type: String,
      maxlength: 100000, // 100KB limit for HTML content
    },

    attachments: [
      {
        filename: { type: String, required: true, trim: true },
        contentType: { type: String, required: true, trim: true },
        size: { type: Number, required: true, min: 0 },
        contentId: String,
        data: Buffer, // This should be encrypted in real implementation
        url: String,
        extractedText: String,
        extractedData: Schema.Types.Mixed,
      },
    ],

    processingStatus: {
      type: String,
      enum: Object.values(ProcessingStatus),
      default: ProcessingStatus.PENDING,
      index: true,
    },

    emailType: {
      type: String,
      enum: Object.values(EmailType),
      default: EmailType.OTHER,
      index: true,
    },

    confidenceLevel: {
      type: String,
      enum: Object.values(ConfidenceLevel),
      default: ConfidenceLevel.LOW,
      index: true,
    },

    confidenceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    parsedData: {
      type: {
        type: String,
        trim: true,
      },
      provider: {
        type: String,
        trim: true,
      },
      confirmationNumber: {
        type: String,
        trim: true,
      },
      bookingReference: {
        type: String,
        trim: true,
      },
      title: {
        type: String,
        trim: true,
      },
      checkIn: Date,
      checkOut: Date,
      startDate: Date,
      endDate: Date,
      location: {
        name: String,
        address: String,
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
      },
      guests: [
        {
          name: { type: String, required: true, trim: true },
          email: { type: String, trim: true },
        },
      ],
      cost: {
        total: { type: Number, min: 0 },
        currency: { type: String, length: 3 },
      },
      additionalData: Schema.Types.Mixed,
    },

    processingResult: {
      success: { type: Boolean, required: true },
      createdBookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
      createdTransportationId: {
        type: Schema.Types.ObjectId,
        ref: "Transportation",
      },
      createdAccommodationId: {
        type: Schema.Types.ObjectId,
        ref: "Accommodation",
      },
      errors: [String],
      warnings: [String],
      requiresManualReview: { type: Boolean, default: false },
      reviewReason: String,
    },

    requiresReview: {
      type: Boolean,
      default: false,
      index: true,
    },
    reviewReason: String,
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: Date,
    reviewNotes: String,

    processingAttempts: [
      {
        attemptNumber: { type: Number, required: true },
        date: { type: Date, required: true },
        status: {
          type: String,
          enum: Object.values(ProcessingStatus),
          required: true,
        },
        error: String,
        aiModel: String,
        processingTime: { type: Number, min: 0 },
      },
    ],

    aiProcessing: {
      model: String,
      version: String,
      extractedEntities: [
        {
          type: { type: String, required: true },
          value: { type: String, required: true },
          confidence: { type: Number, min: 0, max: 100 },
          startPosition: Number,
          endPosition: Number,
        },
      ],
      keywords: [String],
      language: String,
      sentiment: String,
    },

    linkedBooking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
    },
    linkedTransportation: {
      type: Schema.Types.ObjectId,
      ref: "Transportation",
    },
    linkedAccommodation: {
      type: Schema.Types.ObjectId,
      ref: "Accommodation",
    },
    relatedEmails: [
      {
        type: Schema.Types.ObjectId,
        ref: "EmailIntegration",
      },
    ],

    userActions: [
      {
        action: {
          type: String,
          enum: ["approve", "reject", "modify", "ignore", "bookmark"],
          required: true,
        },
        date: { type: Date, required: true },
        notes: String,
      },
    ],

    isEncrypted: {
      type: Boolean,
      default: false,
    },
    encryptionKey: String,
    dataRetentionDate: {
      type: Date,
      index: { expireAfterSeconds: 0 }, // TTL index for automatic cleanup
    },

    isImportant: {
      type: Boolean,
      default: false,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    tags: [{ type: String, trim: true }],

    lastProcessedAt: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for optimal query performance
EmailIntegrationSchema.index({ user: 1, processingStatus: 1 });
EmailIntegrationSchema.index({ user: 1, emailType: 1, date: -1 });
EmailIntegrationSchema.index({ user: 1, requiresReview: 1 });
EmailIntegrationSchema.index({ "sender.email": 1, date: -1 });
EmailIntegrationSchema.index({ "parsedData.confirmationNumber": 1 });
EmailIntegrationSchema.index({ confidenceLevel: 1, processingStatus: 1 });

// Compound indexes for common queries
EmailIntegrationSchema.index({ user: 1, processingStatus: 1, date: -1 });
EmailIntegrationSchema.index({ user: 1, emailType: 1, processingStatus: 1 });
EmailIntegrationSchema.index({ user: 1, isArchived: 1, date: -1 });

// Text search index
EmailIntegrationSchema.index({
  subject: "text",
  textContent: "text",
  "sender.name": "text",
  "parsedData.title": "text",
});

// Pre-save middleware for data validation and auto-processing
EmailIntegrationSchema.pre("save", function (next) {
  // Set confidence level based on score
  if (this.confidenceScore >= 90) {
    this.confidenceLevel = ConfidenceLevel.HIGH;
  } else if (this.confidenceScore >= 70) {
    this.confidenceLevel = ConfidenceLevel.MEDIUM;
  } else if (this.confidenceScore >= 50) {
    this.confidenceLevel = ConfidenceLevel.LOW;
  } else {
    this.confidenceLevel = ConfidenceLevel.VERY_LOW;
  }

  // Auto-detect email type from subject and sender
  if (!this.emailType || this.emailType === EmailType.OTHER) {
    this.emailType = this.detectEmailType();
  }

  // Set data retention date (1 year from creation)
  if (!this.dataRetentionDate) {
    this.dataRetentionDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  }

  next();
});

// Instance methods for email type detection
EmailIntegrationSchema.methods.detectEmailType = function (): EmailType {
  const subject = this.subject.toLowerCase();
  const senderEmail = this.sender.email.toLowerCase();

  // Check for booking confirmation keywords
  if (
    subject.includes("confirmation") ||
    subject.includes("booking") ||
    subject.includes("reservation")
  ) {
    return EmailType.BOOKING_CONFIRMATION;
  }

  // Check for e-ticket keywords
  if (
    subject.includes("e-ticket") ||
    subject.includes("ticket") ||
    subject.includes("boarding pass")
  ) {
    return EmailType.E_TICKET;
  }

  // Check for itinerary keywords
  if (subject.includes("itinerary") || subject.includes("travel plan")) {
    return EmailType.ITINERARY;
  }

  // Check for receipt keywords
  if (subject.includes("receipt") || subject.includes("invoice")) {
    return EmailType.RECEIPT;
  }

  // Check for cancellation keywords
  if (subject.includes("cancel") || subject.includes("refund")) {
    return EmailType.BOOKING_CANCELLATION;
  }

  // Check for modification keywords
  if (
    subject.includes("change") ||
    subject.includes("modify") ||
    subject.includes("update")
  ) {
    return EmailType.BOOKING_MODIFICATION;
  }

  // Check for check-in keywords
  if (subject.includes("check-in") || subject.includes("check in")) {
    return EmailType.CHECK_IN;
  }

  return EmailType.OTHER;
};

// Method to calculate confidence score based on various factors
EmailIntegrationSchema.methods.calculateConfidenceScore = function (): number {
  let score = 0;

  // Check sender reputation
  if (this.sender.reputation === "trusted") score += 30;
  else if (this.sender.reputation === "unknown") score += 10;

  // Check for known provider domains
  if (this.sender.isKnownProvider) score += 20;

  // Check for confirmation numbers in content
  if (this.textContent && /[A-Z0-9]{6,}/g.test(this.textContent)) score += 15;

  // Check for dates in content
  if (
    this.textContent &&
    /\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}/g.test(this.textContent)
  )
    score += 10;

  // Check for price/cost information
  if (
    this.textContent &&
    /\$\d+|\d+\.\d{2}|total|price|cost/gi.test(this.textContent)
  )
    score += 10;

  // Check email type relevance
  if (this.emailType !== EmailType.OTHER) score += 15;

  return Math.min(score, 100);
};

// Method to add processing attempt
EmailIntegrationSchema.methods.addProcessingAttempt = function (
  status: ProcessingStatus,
  error?: string,
  options: any = {}
) {
  this.processingAttempts = this.processingAttempts || [];
  const attemptNumber = this.processingAttempts.length + 1;

  this.processingAttempts.push({
    attemptNumber,
    date: new Date(),
    status,
    error,
    ...options,
  });

  this.processingStatus = status;
  if (status === ProcessingStatus.COMPLETED) {
    this.lastProcessedAt = new Date();
  }

  return this.save();
};

// Method to link with booking/transportation/accommodation
EmailIntegrationSchema.methods.linkWith = function (
  type: "booking" | "transportation" | "accommodation",
  id: Types.ObjectId
) {
  switch (type) {
    case "booking":
      this.linkedBooking = id;
      break;
    case "transportation":
      this.linkedTransportation = id;
      break;
    case "accommodation":
      this.linkedAccommodation = id;
      break;
  }
  return this.save();
};

// Static methods for common queries
EmailIntegrationSchema.statics.findPendingProcessing = function (
  userId?: Types.ObjectId
) {
  const query: any = { processingStatus: ProcessingStatus.PENDING };
  if (userId) query.user = userId;

  return this.find(query).sort({ date: -1 }).limit(100).exec();
};

EmailIntegrationSchema.statics.findRequiringReview = function (
  userId: Types.ObjectId
) {
  return this.find({
    user: userId,
    requiresReview: true,
    reviewedAt: { $exists: false },
  })
    .sort({ date: -1 })
    .exec();
};

EmailIntegrationSchema.statics.findByConfirmationNumber = function (
  confirmationNumber: string
) {
  return this.findOne({
    "parsedData.confirmationNumber": confirmationNumber,
  }).exec();
};

EmailIntegrationSchema.statics.findBySender = function (
  senderEmail: string,
  userId?: Types.ObjectId
) {
  const query: any = { "sender.email": senderEmail };
  if (userId) query.user = userId;

  return this.find(query).sort({ date: -1 }).exec();
};

EmailIntegrationSchema.statics.getProcessingStats = function (
  userId: Types.ObjectId,
  days: number = 30
) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  return this.aggregate([
    {
      $match: {
        user: userId,
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$processingStatus",
        count: { $sum: 1 },
      },
    },
  ]).exec();
};

// Virtual for processing success rate
EmailIntegrationSchema.virtual("successRate").get(function () {
  if (!this.processingAttempts || this.processingAttempts.length === 0)
    return 0;

  const successfulAttempts = this.processingAttempts.filter(
    (attempt) => attempt.status === ProcessingStatus.COMPLETED
  ).length;

  return Math.round(
    (successfulAttempts / this.processingAttempts.length) * 100
  );
});

// Virtual for age in days
EmailIntegrationSchema.virtual("ageInDays").get(function () {
  return Math.floor((Date.now() - this.date.getTime()) / (1000 * 60 * 60 * 24));
});

// Export the model
const EmailIntegration = mongoose.model<IEmailIntegration>(
  "EmailIntegration",
  EmailIntegrationSchema
);
export default EmailIntegration;
