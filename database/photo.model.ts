import { Schema, model, models, Types } from "mongoose";

// Photos & Memories
export interface IPhoto {
  _id: Types.ObjectId;

  // Image Data
  url: string;
  thumbnailUrl?: string;
  originalUrl?: string;

  // File Info
  filename: string;
  size: number; // File size in bytes
  mimeType: string;

  // Context
  uploader: Types.ObjectId;
  travelPlanId?: Types.ObjectId;
  dayId?: Types.ObjectId;
  placeId?: Types.ObjectId;
  guideId?: Types.ObjectId;
  reviewId?: Types.ObjectId;

  // Metadata
  caption?: string;
  tags?: string[];
  location?: {
    name: string;
    coordinates: { lat: number; lng: number };
  };
  takenAt?: Date;

  // Camera/Device Info
  exifData?: {
    camera?: string;
    lens?: string;
    focalLength?: string;
    aperture?: string;
    shutterSpeed?: string;
    iso?: string;
  };

  // Engagement
  likeCount: number;

  // Privacy
  isPublic: boolean;

  // Processing
  isProcessed: boolean;
  processingStatus: "pending" | "processing" | "completed" | "failed";

  createdAt: Date;
  updatedAt: Date;
}

const PhotoSchema = new Schema<IPhoto>(
  {
    // Image Data
    url: { type: String, required: true },
    thumbnailUrl: { type: String },
    originalUrl: { type: String },

    // File Info
    filename: { type: String, required: true },
    size: { type: Number, required: true, min: 0 },
    mimeType: { type: String, required: true },

    // Context
    uploader: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    travelPlanId: { type: Schema.Types.ObjectId, ref: "TravelPlan" },
    dayId: { type: Schema.Types.ObjectId, ref: "Day" },
    placeId: { type: Schema.Types.ObjectId, ref: "Place" },
    guideId: { type: Schema.Types.ObjectId, ref: "Guide" },
    reviewId: { type: Schema.Types.ObjectId, ref: "Review" },

    // Metadata
    caption: { type: String, maxlength: 1000 },
    tags: [{ type: String, maxlength: 50 }],
    location: {
      name: { type: String, maxlength: 200 },
      coordinates: {
        lat: { type: Number, min: -90, max: 90 },
        lng: { type: Number, min: -180, max: 180 },
      },
    },
    takenAt: { type: Date },

    // Camera/Device Info
    exifData: {
      camera: { type: String },
      lens: { type: String },
      focalLength: { type: String },
      aperture: { type: String },
      shutterSpeed: { type: String },
      iso: { type: String },
    },

    // Engagement
    likeCount: { type: Number, default: 0, min: 0 },

    // Privacy
    isPublic: { type: Boolean, default: true },

    // Processing
    isProcessed: { type: Boolean, default: false },
    processingStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Indexes
PhotoSchema.index({ uploader: 1 });
PhotoSchema.index({ travelPlanId: 1 });
PhotoSchema.index({ dayId: 1 });
PhotoSchema.index({ placeId: 1 });
PhotoSchema.index({ guideId: 1 });
PhotoSchema.index({ isPublic: 1 });
PhotoSchema.index({ createdAt: -1 });
PhotoSchema.index({ likeCount: -1 });
PhotoSchema.index({ tags: 1 });

const Photo = models?.Photo || model<IPhoto>("Photo", PhotoSchema);
export default Photo;
