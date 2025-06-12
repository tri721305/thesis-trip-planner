import { auth } from "@/auth";
import { model, models, Schema, Types } from "mongoose";

export interface IGuide {
  title: string;
  content: string;
  tags: Types.ObjectId[];
  views: number;
  upvotes: number;
  downvotes: number;
  answers: number;
  author: Types.ObjectId;
  details?: {
    name: string;
    description?: string;
    place: Types.ObjectId; // Reference to a place
  }[];
}

export interface IGuideDoc extends IGuide, Document {}

const GuideSchema = new Schema<IGuide>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: [{ type: Types.ObjectId, ref: "Tag", required: true }],
    views: { type: Number, default: 0 },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    answers: { type: Number, default: 0 },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    details: [
      {
        name: { type: String, required: true },
        description: { type: String },
        place: { type: Schema.Types.ObjectId, ref: "Place" }, // Reference to a place
      },
    ],
  },
  { timestamps: true }
);

const Guide = models?.Model || model<IGuide>("Guide", GuideSchema);

export default Guide;
