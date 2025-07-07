import { model, models, Schema, Types, Document } from "mongoose";

export interface ILodging {
  name: string;
  checkIn: Date;
  checkOut: Date;
  price: number;
  address?: string;
  note?: string;
}

export interface IBlog {
  title: string;
  description: string;
  note: string;
  tags: Types.ObjectId[];
  views: number;
  upvotes: number;
  downvotes: number;
  comments: number;
  author: Types.ObjectId;
  lodging: ILodging[];
}

const ModelSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    views: { type: Number, default: 0 },
    note: { type: String },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    lodging: [
      {
        name: { type: String, required: true },
        checkIn: { type: Date, required: true },
        checkOut: { type: Date, required: true },
        price: { type: Number, required: true },
        address: { type: String },
        note: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export interface IBlogDoc extends IBlog, Document {}
const Blog = models?.Model || model<IBlog>("Model", ModelSchema);

export default Blog;
