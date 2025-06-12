// Địa điểm chi tiết

import { model, models, Schema, Types } from "mongoose";

export interface IPlace {
  name: string;
  description?: string;
  tags: Types.ObjectId[];
  //   Tỉnh quận huyện
  location: Types.ObjectId;
  image?: string[];
  coordinates: {
    type: string;
    coordinates: [number, number]; // Assuming coordinates are stored as [longitude, latitude]
  };
  // address: string;
  phone?: string; // Optional phone number
  website?: string; // Optional website URL
  type: string; // Type of place (e.g., restaurant, park, museum)
  openingHours?: string[]; // Optional opening hours
  rating?: number; // Optional rating
  reviews?: string[]; // Optional array of review IDs
}

const PlaceSchema = new Schema<IPlace>(
  {
    name: { type: String, required: true },
    description: { type: String },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    location: { type: Schema.Types.ObjectId, ref: "Location", required: true }, // Reference to a location
    image: [{ type: String }],
    coordinates: {
      type: { type: String, enum: ["Point"], required: true },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    phone: { type: String },
    website: { type: String },
    type: { type: String, required: true }, // Type of place
    openingHours: [{ type: String }],
    rating: { type: Number, min: 0, max: 5 }, // Rating between 0 and 5
    reviews: [{ type: String }], // Array of review IDs (could be ObjectId if you have a Review model)
  },
  { timestamps: true }
);

const Place = models?.Place || model<IPlace>("Place", PlaceSchema);

export default Place;
