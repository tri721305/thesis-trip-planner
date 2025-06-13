import { model, models, Schema, Types, Document } from "mongoose";

export interface ITagGuide {
  tag: Types.ObjectId;
  guide: Types.ObjectId;
}

export interface ITagGuideDoc extends ITagGuide, Document {}
const TagGuideSchema = new Schema<ITagGuide>(
  {
    tag: { type: Schema.Types.ObjectId, ref: "Tag", required: true },
    guide: { type: Schema.Types.ObjectId, ref: "Guide", required: true },
  },
  { timestamps: true }
);

const TagGuide =
  models?.TagGuide || model<ITagGuide>("TagGuide", TagGuideSchema);

export default TagGuide;
