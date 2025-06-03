import { model, models, Schema, Types } from "mongoose";

export interface ITagDetail {
  tag: Types.ObjectId;
  planner?: Types.ObjectId;
  place?: Types.ObjectId;
  guide?: Types.ObjectId;
}

const TagDetailSchema = new Schema<ITagDetail>(
  {
    tag: { type: Schema.Types.ObjectId, ref: "Tag", required: true },
    planner: { type: Schema.Types.ObjectId, ref: "Planner", required: true },
    place: { type: Schema.Types.ObjectId, ref: "Place", required: true },
    guide: { type: Schema.Types.ObjectId, ref: "Guide", required: true },
  },
  { timestamps: true }
);

const TagDetail =
  models?.TagDetail || model<ITagDetail>("TagDetail", TagDetailSchema);

export default TagDetail;
