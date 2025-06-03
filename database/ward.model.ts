import mongoose, { model, models, Schema, Types } from "mongoose";
import { BaseDocument } from "./province.model";

export interface IWard extends BaseDocument {
  code: string;
  name: string;
  nameEn?: string;
  fullName: string;
  fullNameEn?: string;
  district: {
    id: mongoose.Types.ObjectId;
    name: string;
    nameEn?: string;
    code: string;
  };
  province: {
    id: mongoose.Types.ObjectId;
    name: string;
    nameEn?: string;
    code: string;
  };
  administrativeUnit: {
    id: mongoose.Types.ObjectId;
    name: string;
    nameEn?: string;
  };
  stats: {
    locationCount: number;
  };
}

const WardSchema = new Schema<IWard>(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    nameEn: { type: String },
    fullName: { type: String, required: true },
    fullNameEn: { type: String },
    district: {
      id: { type: Schema.Types.ObjectId, ref: "District", required: true },
      name: { type: String, required: true },
      nameEn: { type: String },
      code: { type: String, required: true },
    },
    province: {
      id: { type: Schema.Types.ObjectId, ref: "Province", required: true },
      name: { type: String, required: true },
      nameEn: { type: String },
      code: { type: String, required: true },
    },
    administrativeUnit: {
      id: {
        type: Schema.Types.ObjectId,
        ref: "AdministrativeUnit",
        required: true,
      },
      name: { type: String, required: true },
      nameEn: { type: String },
    },
    stats: {
      locationCount: { type: Number, default: 0 },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Ward = models?.Ward || model<IWard>("Ward", WardSchema);

export default Ward;
