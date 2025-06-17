import { auth } from "@/auth";
import { model, models, Schema, Types, Document } from "mongoose";

export interface IGuide {
  title: string;
  content: string;
  tags: Types.ObjectId[]; // Array of tag ObjectIds
  images: string[]; // URLs of uploaded images from S3
  author: Types.ObjectId; // Reference to User
  createdAt: Date;
  updatedAt: Date;
  views?: number;
  upvotes?: number;
  downvotes?: number;
}

export interface IGuideDoc extends IGuide, Document {}

const GuideSchema = new Schema<IGuideDoc>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: [{ type: Types.ObjectId, ref: "Tag" }],
    images: { type: [String], default: [] }, // Array of S3 image URLs
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    views: { type: Number, default: 0 },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Guide = models?.Guide || model<IGuideDoc>("Guide", GuideSchema);

export default Guide;
