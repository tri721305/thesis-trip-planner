import { model, models, Schema, Types } from "mongoose";

export interface IAdministractiveUnit {
  fullName: string;
  fullNameEn?: string;
  shortName?: string;
  shortNameEn?: string;
  codeName?: string;
  codeNameEn?: string;
  isActive: boolean; // Field to indicate if the unit is active
}

const AdministractiveUnitSchema = new Schema<IAdministractiveUnit>(
  {
    fullName: { type: String, required: true },
    fullNameEn: { type: String },
    shortName: { type: String, required: true },
    shortNameEn: { type: String },
    codeName: { type: String, required: true, unique: true }, // Unique code name for the administrative unit
    codeNameEn: { type: String },
    isActive: { type: Boolean, default: true }, // Field to indicate if the unit is active
  },
  { timestamps: true }
);

const AdministractiveUnit =
  models?.AdministractiveUnit ||
  model<IAdministractiveUnit>("AdministractiveUnit", AdministractiveUnitSchema);

export default AdministractiveUnit;
