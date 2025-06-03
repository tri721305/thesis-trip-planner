import { model, models, Schema, Types } from "mongoose";

export interface IGuide {
  title: string;
  content: string;
  tags: Types.ObjectId[];
}

const GuideSchema = new Schema<IGuide>({}, { timestamps: true });

const Guide = models?.Model || model<IGuide>("Guide", GuideSchema);

export default Guide;
