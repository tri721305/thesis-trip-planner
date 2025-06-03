import mongoose, { model, models, Schema, Types } from "mongoose";
import { BaseDocument } from "./province.model";

export interface IDistrict extends BaseDocument {
  code: string;
  name: string;
  nameEn?: string;
  fullName: string;
  fullNameEn?: string;
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
    wardCount: number;
    locationCount: number;
  };
}

const DistrictSchema = new Schema<IDistrict>(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    nameEn: { type: String },
    fullName: { type: String, required: true },
    fullNameEn: { type: String },
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
      wardCount: { type: Number, default: 0 },
      locationCount: { type: Number, default: 0 },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const District = models?.Model || model<IDistrict>("District", DistrictSchema);

export default District;
