import { Document, model, models, Schema } from "mongoose";

// Interface cho attraction
export interface IAttraction extends Document {
  attractionId: number;
  name: string;
  placePageType?: string;
  placeId?: string;
  description?: string;
  generatedDescription?: string;
  categories: string[];
  address: {
    street?: string;
    city?: string;
    country?: string;
    fullAddress?: string;
  };
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  website?: string;
  internationalPhoneNumber?: string;
  rating?: number;
  numRatings?: number;
  tripadvisorRating?: number;
  tripadvisorNumRatings?: number;
  ratingDistribution?: {
    Google?: {
      [key: string]: number;
    };
  };
  imageKeys?: string[];
  images?: Array<{
    key: string;
    width: number;
    height: number;
  }>;
  reviews?: Array<{
    reviewId: string;
    time: Date;
    reviewerName: string;
    rating: number;
    rank: number;
    reviewText: string;
  }>;
  openingPeriods?: Array<{
    open: {
      day: number;
      time: string;
    };
    close: {
      day: number;
      time: string;
    };
  }>;
  priceLevel?: number;
  permanentlyClosed?: boolean;
  businessStatus?: string;
  utcOffset?: number;
  hasDetails?: boolean;
  minMinutesSpent?: number;
  maxMinutesSpent?: number;
  sources?: Array<{
    id: string;
    type: string;
    url: string;
    sourceSite: string;
    snippet?: string;
    siteName: string;
    shortName: string;
    indexInSource: number;
    iconSiteId: number;
    showIcon: boolean;
    showInternalLink: boolean;
    showExternalLink: boolean;
    showSiteNameOnWeb: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Schema cho address
const AddressSchema = new Schema(
  {
    street: { type: String },
    city: { type: String },
    country: { type: String },
    fullAddress: { type: String },
  },
  { _id: false }
);

// Schema cho location (GeoJSON Point)
const LocationSchema = new Schema(
  {
    type: { type: String, enum: ["Point"], required: true, default: "Point" },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function (coords: number[]) {
          return (
            coords.length === 2 &&
            coords[0] >= -180 &&
            coords[0] <= 180 && // longitude
            coords[1] >= -90 &&
            coords[1] <= 90
          ); // latitude
        },
        message: "Coordinates must be [longitude, latitude] with valid ranges",
      },
    },
  },
  { _id: false }
);

// Schema cho images
const ImageSchema = new Schema(
  {
    key: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  { _id: false }
);

// Schema cho reviews
const ReviewSchema = new Schema(
  {
    reviewId: { type: String, required: true },
    time: { type: Date, required: true },
    reviewerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    rank: { type: Number, required: true },
    reviewText: { type: String, required: true },
  },
  { _id: false }
);

// Schema cho opening periods
const OpeningPeriodSchema = new Schema(
  {
    open: {
      day: { type: Number, required: true, min: 0, max: 6 },
      time: { type: String, required: true }, // Format: "HHMM"
    },
    close: {
      day: { type: Number, required: true, min: 0, max: 6 },
      time: { type: String, required: true },
    },
  },
  { _id: false }
);

// Schema cho sources
const SourceSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    url: { type: String, required: true },
    sourceSite: { type: String, required: true },
    snippet: { type: String },
    siteName: { type: String, required: true },
    shortName: { type: String, required: true },
    indexInSource: { type: Number, required: true },
    iconSiteId: { type: Number, required: true },
    showIcon: { type: Boolean, required: true },
    showInternalLink: { type: Boolean, required: true },
    showExternalLink: { type: Boolean, required: true },
    showSiteNameOnWeb: { type: Boolean, required: true },
  },
  { _id: false }
);

// Schema chính cho Attraction
const AttractionSchema = new Schema<IAttraction>(
  {
    attractionId: { type: Number, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    placePageType: { type: String },
    placeId: { type: String },
    description: { type: String },
    generatedDescription: { type: String },
    categories: [{ type: String }],
    address: { type: AddressSchema, required: true },
    location: { type: LocationSchema, required: true },
    website: { type: String },
    internationalPhoneNumber: { type: String },
    rating: { type: Number, min: 0, max: 5 },
    numRatings: { type: Number, min: 0 },
    tripadvisorRating: { type: Number, min: 0, max: 5 },
    tripadvisorNumRatings: { type: Number, min: 0 },
    ratingDistribution: { type: Schema.Types.Mixed },
    imageKeys: [{ type: String }],
    images: [ImageSchema],
    reviews: [ReviewSchema],
    openingPeriods: [OpeningPeriodSchema],
    priceLevel: { type: Number, min: 0, max: 4 },
    permanentlyClosed: { type: Boolean, default: false },
    businessStatus: { type: String },
    utcOffset: { type: Number },
    hasDetails: { type: Boolean, default: false },
    minMinutesSpent: { type: Number, min: 0 },
    maxMinutesSpent: { type: Number, min: 0 },
    sources: [SourceSchema],
  },
  {
    timestamps: true,
    collection: "attractions", // Tên collection trong MongoDB
  }
);

// Tạo các index cần thiết
AttractionSchema.index({ location: "2dsphere" }); // Index cho tìm kiếm địa lý
AttractionSchema.index({
  name: "text",
  description: "text",
  generatedDescription: "text",
}); // Index cho tìm kiếm text
AttractionSchema.index({ categories: 1 }); // Index cho categories
AttractionSchema.index({ "address.city": 1 }); // Index cho city
AttractionSchema.index({ rating: -1 }); // Index cho rating
AttractionSchema.index({ attractionId: 1 }, { unique: true }); // Index unique cho attractionId

// Export model
const Attraction =
  models?.Attraction || model<IAttraction>("Attraction", AttractionSchema);

export default Attraction;
