import mongoose, { model, models, Schema, Document } from "mongoose";
import { BaseDocument } from "./province.model";

export interface ILocation extends BaseDocument {
  address: {
    line1: string;
    line2?: string;
    streetName?: string;
    buildingName?: string;
    buildingNumber?: string;
    postalCode?: string;
  };
  coordinates: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  ward: {
    id: mongoose.Types.ObjectId;
    name: string;
    nameEn?: string;
    code: string;
  };
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
  locationType:
    | "residential"
    | "commercial"
    | "industrial"
    | "public"
    | "educational"
    | "other"
    | "hotel"
    | "restaurant"
    | "touristAttraction";

  description?: string;
  fullAddress: string;
  fullAddressEn?: string;
  isActive?: boolean;
}
const LocationSchema = new Schema<ILocation>(
  {
    address: {
      line1: { type: String, required: true },
      line2: { type: String },
      streetName: { type: String },
      buildingName: { type: String },
      buildingNumber: { type: String },
      postalCode: { type: String },
    },
    coordinates: {
      type: { type: String, enum: ["Point"], required: true },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    ward: {
      id: { type: Schema.Types.ObjectId, ref: "Ward", required: true },
      name: { type: String, required: true },
      nameEn: { type: String },
      code: { type: String, required: true },
    },
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
    locationType: {
      type: String,
      enum: [
        "residential",
        "commercial",
        "industrial",
        "government",
        "educational",
        "hotel",
        "restaurant",
        "touristAttraction",
        "public",
        "other",
      ],
      default: "residential",
    },
    description: { type: String },
    fullAddress: { type: String, required: true },
    fullAddressEn: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
LocationSchema.index({
  coordinates: "2dsphere",
});
LocationSchema.index({ fullAddress: "text", fullAddressEn: "text" });
const Location =
  models?.Location || model<ILocation>("Location", LocationSchema);

export default Location;
