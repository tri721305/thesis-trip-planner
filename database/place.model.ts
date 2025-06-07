// Địa điểm chi tiết

import { model, models, Schema, Types } from "mongoose";

export interface IPlace {
  name: string;
  description?: string;
  tags: Types.ObjectId[];
  //   Tỉnh quận huyện
  location: Types.ObjectId;
  image?: string;
  coordinates: string[];
  // address: string;
  phone?: string; // Optional phone number
  website?: string; // Optional website URL
  type: string; // Type of place (e.g., restaurant, park, museum)
  openingHours?: string; // Optional opening hours
  rating?: number; // Optional rating
  reviews?: string[]; // Optional array of review IDs
}

const PlaceSchema = new Schema<IPlace>(
  {
    name: { type: String, required: true },
    description: { type: String },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    location: { type: Schema.Types.ObjectId, ref: "Location", required: true },
    image: { type: String },
    coordinates: { type: [String], required: true }, // Assuming coordinates are stored as an array of strings
    address: { type: String, required: true }, // Address of the place
  },
  { timestamps: true }
);

const Place = models?.Place || model<IPlace>("Place", PlaceSchema);

export default Place;
