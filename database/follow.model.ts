import { Schema, model, models, Types } from "mongoose";

// User Following System
export interface IFollow {
  _id: Types.ObjectId;
  follower: Types.ObjectId; // User who follows
  following: Types.ObjectId; // User being followed
  createdAt: Date;
}

const FollowSchema = new Schema<IFollow>(
  {
    follower: { type: Schema.Types.ObjectId, ref: "User", required: true },
    following: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate follows
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });
FollowSchema.index({ follower: 1 });
FollowSchema.index({ following: 1 });

const Follow = models?.Follow || model<IFollow>("Follow", FollowSchema);
export default Follow;
