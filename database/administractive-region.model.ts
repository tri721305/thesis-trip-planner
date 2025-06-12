import { model, models, Schema } from "mongoose";

export interface IAdministrativeRegion {
  id: number;
  name: string;
  nameEn: string;
  codeName: string;
  codeNameEn: string;
}

export interface IAdministrativeRegionDoc
  extends IAdministrativeRegion,
    Document {}

const AdministrativeRegionSchema = new Schema<IAdministrativeRegion>({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  nameEn: { type: String, required: true },
  codeName: { type: String, required: true },
  codeNameEn: { type: String, required: true },
});

const AdministrativeRegion =
  models?.AdministrativeRegion ||
  model<IAdministrativeRegion>(
    "AdministrativeRegion",
    AdministrativeRegionSchema
  );

export default AdministrativeRegion;
