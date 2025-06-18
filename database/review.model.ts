import { Schema, model, models, Types } from "mongoose";

// Reviews System
export interface IReview {
  _id: Types.ObjectId;

  // What's being reviewed
  targetType: "place" | "guide" | "travel_plan" | "accommodation";
  targetId: Types.ObjectId;

  // Review Content
  author: Types.ObjectId;
  rating: number; // 1-5 stars
  title?: string;
  content: string;
  photos?: string[];

  // Context
  visitDate?: Date; // When they visited the place
  travelType?: "solo" | "couple" | "family" | "friends" | "business";

  // Engagement
  helpfulCount: number;
  reportCount: number;

  // Moderation
  isApproved: boolean;
  moderatedBy?: Types.ObjectId;
  moderatedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    // Target
    targetType: {
      type: String,
      enum: ["place", "guide", "travel_plan", "accommodation"],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    // Review Content
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, maxlength: 200 },
    content: { type: String, required: true, maxlength: 5000 },
    photos: [{ type: String }],

    // Context
    visitDate: { type: Date },
    travelType: {
      type: String,
      enum: ["solo", "couple", "family", "friends", "business"],
    },

    // Engagement
    helpfulCount: { type: Number, default: 0, min: 0 },
    reportCount: { type: Number, default: 0, min: 0 },

    // Moderation
    isApproved: { type: Boolean, default: true },
    moderatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    moderatedAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes
ReviewSchema.index({ targetType: 1, targetId: 1 });
ReviewSchema.index({ author: 1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ createdAt: -1 });
ReviewSchema.index({ isApproved: 1 });
ReviewSchema.index({ helpfulCount: -1 });

// Compound index to prevent duplicate reviews
ReviewSchema.index({ author: 1, targetType: 1, targetId: 1 }, { unique: true });

const Review = models?.Review || model<IReview>("Review", ReviewSchema);
export default Review;
