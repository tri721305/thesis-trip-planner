import { Schema, model, models, Types } from "mongoose";

// Activity Feed
export interface IActivity {
  _id: Types.ObjectId;

  // Actor
  user: Types.ObjectId;

  // Action
  action:
    | "created_plan"
    | "updated_plan"
    | "added_place"
    | "added_photo"
    | "left_review"
    | "published_guide"
    | "joined_plan"
    | "completed_trip"
    | "added_expense"
    | "followed_user";

  // Target
  targetType:
    | "travel_plan"
    | "place"
    | "guide"
    | "photo"
    | "review"
    | "user"
    | "expense";
  targetId: Types.ObjectId;

  // Context
  metadata?: {
    planTitle?: string;
    placeName?: string;
    guideTitle?: string;
    rating?: number;
    amount?: number;
    currency?: string;
    [key: string]: any;
  };

  // Visibility
  isPublic: boolean;

  // Engagement
  likeCount: number;
  commentCount: number;

  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    // Actor
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Action
    action: {
      type: String,
      enum: [
        "created_plan",
        "updated_plan",
        "added_place",
        "added_photo",
        "left_review",
        "published_guide",
        "joined_plan",
        "completed_trip",
        "added_expense",
        "followed_user",
      ],
      required: true,
    },

    // Target
    targetType: {
      type: String,
      enum: [
        "travel_plan",
        "place",
        "guide",
        "photo",
        "review",
        "user",
        "expense",
      ],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    // Context
    metadata: { type: Schema.Types.Mixed },

    // Visibility
    isPublic: { type: Boolean, default: true },

    // Engagement
    likeCount: { type: Number, default: 0, min: 0 },
    commentCount: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only need createdAt for activities
  }
);

// Indexes
ActivitySchema.index({ user: 1, createdAt: -1 });
ActivitySchema.index({ targetType: 1, targetId: 1 });
ActivitySchema.index({ isPublic: 1, createdAt: -1 });
ActivitySchema.index({ action: 1 });

const Activity =
  models?.Activity || model<IActivity>("Activity", ActivitySchema);
export default Activity;
