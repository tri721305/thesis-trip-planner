import mongoose, { model, models, Schema, Types } from "mongoose";

export interface IWard {
  code: string;
  name: string;
  nameEn?: string;
  fullName: string;
  fullNameEn?: string;
  codeName?: string;
  districtCode: string;
  administrativeUnitId: number;
}

const WardSchema = new Schema<IWard>(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    nameEn: { type: String },
    fullName: { type: String, required: true },
    fullNameEn: { type: String },
    codeName: { type: String },
    districtCode: { type: String, required: true },
    administrativeUnitId: { type: Number, required: true },
  },
  { timestamps: true }
);

const Ward = models?.Ward || model<IWard>("Ward", WardSchema);

export default Ward;
