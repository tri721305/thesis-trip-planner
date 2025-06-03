import { model, models, Schema, Document, Types } from "mongoose";

export interface IPlanner {
  name: string;
  description?: string;
  tags: Types.ObjectId[];
  locationFrom: Types.ObjectId;
  locationTo: Types.ObjectId;
  views: number;
  upvotes: number;
  downvotes: number;
  author: Types.ObjectId;
}

const PlannerSchema = new Schema<IPlanner>({
  name: { type: String, required: true },
  description: { type: String },
  tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
  locationFrom: { type: Schema.Types.ObjectId, ref: "Location" },
  locationTo: { type: Schema.Types.ObjectId, ref: "Location" },
  views: { type: Number, default: 0 },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

const Planner = models?.Planner || model<IPlanner>("Planner", PlannerSchema);
export default Planner;
