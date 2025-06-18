import { Schema, model, models, Types } from "mongoose";

// Notification System
export interface INotification {
  _id: Types.ObjectId;
  recipient: Types.ObjectId;

  // Notification Type
  type:
    | "trip_invitation"
    | "trip_update"
    | "new_comment"
    | "new_review"
    | "expense_added"
    | "booking_reminder"
    | "system"
    | "follow"
    | "like"
    | "mention";

  // Content
  title: string;
  message: string;

  // Sender (optional, for user-generated notifications)
  sender?: Types.ObjectId;

  // Action Data
  actionUrl?: string;
  actionData?: {
    travelPlanId?: Types.ObjectId;
    dayId?: Types.ObjectId;
    placeId?: Types.ObjectId;
    guideId?: Types.ObjectId;
    [key: string]: any;
  };

  // Status
  isRead: boolean;
  readAt?: Date;

  // Delivery
  channels: Array<"in_app" | "email" | "push">;
  deliveryStatus: {
    in_app?: "pending" | "delivered" | "failed";
    email?: "pending" | "sent" | "delivered" | "failed";
    push?: "pending" | "sent" | "delivered" | "failed";
  };

  // Priority
  priority: "low" | "normal" | "high" | "urgent";

  // Expiration
  expiresAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Notification Type
    type: {
      type: String,
      enum: [
        "trip_invitation",
        "trip_update",
        "new_comment",
        "new_review",
        "expense_added",
        "booking_reminder",
        "system",
        "follow",
        "like",
        "mention",
      ],
      required: true,
    },

    // Content
    title: { type: String, required: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 1000 },

    // Sender
    sender: { type: Schema.Types.ObjectId, ref: "User" },

    // Action Data
    actionUrl: { type: String },
    actionData: { type: Schema.Types.Mixed },

    // Status
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },

    // Delivery
    channels: [
      {
        type: String,
        enum: ["in_app", "email", "push"],
      },
    ],
    deliveryStatus: {
      in_app: {
        type: String,
        enum: ["pending", "delivered", "failed"],
      },
      email: {
        type: String,
        enum: ["pending", "sent", "delivered", "failed"],
      },
      push: {
        type: String,
        enum: ["pending", "sent", "delivered", "failed"],
      },
    },

    // Priority
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },

    // Expiration
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes
NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ sender: 1 });
NotificationSchema.index({ expiresAt: 1 });
NotificationSchema.index({ priority: 1 });

// TTL index for expired notifications
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Notification =
  models?.Notification ||
  model<INotification>("Notification", NotificationSchema);
export default Notification;
