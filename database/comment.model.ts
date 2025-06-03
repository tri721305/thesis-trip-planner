import { model, models, Schema, Types } from "mongoose";

export interface IComment {
  author: Types.ObjectId;
  planner: Types.ObjectId;
  content: string;
  upvotes: number;
  downvotes: number;
}

const CommentSchema = new Schema<IComment>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    planner: { type: Schema.Types.ObjectId, ref: "Planner", required: true },
    content: { type: String, required: true },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
  },
  { timestamps: true }
);
const Comment = models?.Comment || model<IComment>("Comment", CommentSchema);

export default Comment;
