import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPlace {
  name: string;
  address: string;
  description?: string;
  tags: Types.ObjectId[];
  phone?: string;
  images?: string[];
  website?: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  category:
    | "hotel"
    | "restaurant"
    | "attraction"
    | "activity"
    | "transportation"
    | "other";

  rating?: number;
  priceRange?: "budget" | "mid" | "luxury";
  openingHours?: {
    [key: string]: string; // monday: "9:00-17:00"
  };
}

export interface IPlaceDoc extends IPlace, Document {}

const PlaceSchema = new Schema<IPlaceDoc>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    description: { type: String, maxlength: 1000 },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    phone: { type: String, maxlength: 20 },
    images: [{ type: String }], // URLs of uploaded images
    website: { type: String },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function (coords: number[]) {
            return coords.length === 2;
          },
          message:
            "Coordinates must contain exactly 2 numbers [longitude, latitude]",
        },
      },
    },
    category: {
      type: String,
      enum: [
        "hotel",
        "restaurant",
        "attraction",
        "activity",
        "transportation",
        "other",
      ],
      required: true,
    },
    rating: { type: Number, min: 0, max: 5 },
    priceRange: {
      type: String,
      enum: ["budget", "mid", "luxury"],
    },
    openingHours: {
      type: Map,
      of: String,
    },
  },
  { timestamps: true }
);

PlaceSchema.index({ location: "2dsphere" });
PlaceSchema.index({ tags: 1 });
PlaceSchema.index({ category: 1 });

export const Place =
  mongoose.models.Place || mongoose.model<IPlace>("Place", PlaceSchema);
export default Place;
