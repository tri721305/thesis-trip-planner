import mongoose, { Schema } from "mongoose";

const InvitationSchema = new Schema(
  {
    plannerId: {
      type: Schema.Types.ObjectId,
      ref: "TravelPlan",
      required: true,
    },
    inviterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    inviteeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
    message: {
      type: String,
    },
    respondedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Tạo unique index để tránh duplicate lời mời
InvitationSchema.index({ plannerId: 1, inviteeId: 1 }, { unique: true });

const Invitation =
  mongoose.models?.Invitation || mongoose.model("Invitation", InvitationSchema);

export default Invitation;
