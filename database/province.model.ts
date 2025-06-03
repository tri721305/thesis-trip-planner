import mongoose, { model, models, Schema, Types } from "mongoose";

export interface BaseDocument {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
export interface IProvince extends BaseDocument {
  code: string;
  name: string;
  nameEn?: string;
  fullName: string;
  fullNameEn?: string;
  administractiveUnit: {
    id: mongoose.Types.ObjectId;
    name: string;
    nameEn?: string;
  };
  administractiveRegion: {
    id: mongoose.Types.ObjectId;
    name: string;
    nameEn?: string;
  };
  stats: {
    distrcitCount: number;
    wardCount: number;
    locationCount: number;
  };
}

const ProvinceSchema = new Schema<IProvince>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    nameEn: {
      type: String,
    },
    fullName: {
      type: String,
      required: true,
    },
    fullNameEn: {
      type: String,
    },
    administractiveUnit: {
      id: { type: Types.ObjectId, required: true, ref: "AdministractiveUnit" },
      name: { type: String, required: true },
      nameEn: { type: String },
    },
    administractiveRegion: {
      id: {
        type: Types.ObjectId,
        required: true,
        ref: "AdministractiveRegion",
      },
      name: { type: String, required: true },
      nameEn: { type: String },
    },
    stats: {
      distrcitCount: { type: Number, default: 0 },
      wardCount: { type: Number, default: 0 },
      locationCount: { type: Number, default: 0 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Province =
  models?.Province || model<IProvince>("Province", ProvinceSchema);

export default Province;
