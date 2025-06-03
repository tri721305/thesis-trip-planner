import { model, models, Schema, Types } from "mongoose";

export interface IAdministractiveRegion {
  name: string; // Name of the administrative region
  nameEn?: string; // English name of the administrative region
  codeName: string; // Unique code name for the administrative region
  codeNameEn?: string; // English code name for the administrative region
  isActive: boolean; // Field to indicate if the region is active
}

const AdministractiveRegionSchema = new Schema<IAdministractiveRegion>(
  {
    name: { type: String, required: true },
    nameEn: { type: String },
    codeName: { type: String, required: true, unique: true }, // Unique code name for the administrative region
    codeNameEn: { type: String },
    isActive: { type: Boolean, default: true }, // Field to indicate if the region is active
  },
  { timestamps: true }
);

const AdministractiveRegion =
  models?.AdministractiveRegion ||
  model<IAdministractiveRegion>(
    "AdministractiveRegion",
    AdministractiveRegionSchema
  );

export default AdministractiveRegion;
