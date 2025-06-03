import { model, models, Schema, Types } from "mongoose";

export interface ITag {
  name: string;
  planners: number;
  places: number;
  guides: number;
}

const TagSchema = new Schema<ITag>(
  {
    name: { type: String, required: true, unique: true },
    planners: { type: Number, default: 0 },
    places: { type: Number, default: 0 },
    guides: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Tag = models?.Tag || model<ITag>("Tag", TagSchema);

export default Tag;
