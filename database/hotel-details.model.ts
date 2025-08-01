import { Document, model, models, Schema } from "mongoose";

// Sub-schemas for nested objects
const ImageSchema = new Schema(
  {
    url: { type: String, required: true },
    thumbnailUrl: { type: String },
  },
  { _id: false }
);

const LocationSchema = new Schema(
  {
    longitude: { type: Number, required: true },
    latitude: { type: Number, required: true },
  },
  { _id: false }
);

const AmenitySchema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String },
  },
  { _id: false }
);

const AttributeSchema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String },
  },
  { _id: false }
);

const RatingSchema = new Schema(
  {
    source: { type: String, required: true },
    value: { type: Number, required: true },
  },
  { _id: false }
);

const NearbyAttractionSchema = new Schema(
  {
    id: { type: Number },
    name: { type: String, required: true },
    longitude: { type: Number },
    latitude: { type: Number },
  },
  { _id: false }
);

const CheckInInfoSchema = new Schema(
  {
    beginTime: { type: String },
    endTime: { type: String },
    instructions: { type: String },
    specialInstructions: { type: String },
    minAge: { type: Number },
    is24Hour: { type: Boolean },
  },
  { _id: false }
);

const FeesSchema = new Schema(
  {
    optional: { type: String },
  },
  { _id: false }
);

const LodgingIdSchema = new Schema(
  {
    type: { type: String, required: true },
    propertyId: { type: Number, required: true },
  },
  { _id: false }
);

const LodgingSchema = new Schema(
  {
    id: { type: LodgingIdSchema, required: true },
    name: { type: String, required: true },
    hotelClass: { type: Number },
    images: [ImageSchema],
    rating: { type: RatingSchema },
    wanderlogRating: { type: Schema.Types.Mixed },
    ratingCount: { type: Number },
    location: { type: LocationSchema, required: true },
    amenities: [AmenitySchema],
    attributes: [AttributeSchema],
    nearbyAttractions: [NearbyAttractionSchema],
    description: { type: String },
    address: { type: String },
    checkInInfo: { type: CheckInInfoSchema },
    checkOutTime: { type: String },
    fees: { type: FeesSchema },
    policies: { type: String },
  },
  { _id: false }
);

const OriginalHotelSchema = new Schema(
  {
    name: { type: String, required: true },
    location: { type: LocationSchema, required: true },
  },
  { _id: false }
);

const DetailsSchema = new Schema(
  {
    success: { type: Boolean, required: true },
    data: { type: LodgingSchema },
  },
  { _id: false }
);

// Main HotelDetails interface and schema
export interface IHotelDetails {
  hotel_id: number;
  original_hotel: {
    name: string;
    location: {
      longitude: number;
      latitude: number;
    };
  };
  details: {
    success: boolean;
    data?: {
      lodging: {
        id: {
          type: string;
          propertyId: number;
        };
        name: string;
        hotelClass?: number;
        images?: Array<{
          url: string;
          thumbnailUrl?: string;
        }>;
        rating?: {
          source: string;
          value: number;
        };
        wanderlogRating?: any;
        ratingCount?: number;
        location: {
          longitude: number;
          latitude: number;
        };
        amenities?: Array<{
          name: string;
          category?: string;
        }>;
        attributes?: Array<{
          name: string;
          category?: string;
        }>;
        nearbyAttractions?: Array<{
          id?: number;
          name: string;
          longitude?: number;
          latitude?: number;
        }>;
        description?: string;
        address?: string;
        checkInInfo?: {
          beginTime?: string;
          endTime?: string;
          instructions?: string;
          specialInstructions?: string;
          minAge?: number;
          is24Hour?: boolean;
        };
        checkOutTime?: string;
        fees?: {
          optional?: string;
        };
        policies?: string;
      };
    };
  };
  fetched_at: Date;
}

export interface IHotelDetailsDoc extends IHotelDetails, Document {}

const HotelDetailsSchema = new Schema<IHotelDetails>(
  {
    hotel_id: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    original_hotel: {
      type: OriginalHotelSchema,
      required: true,
    },
    details: {
      type: DetailsSchema,
      required: true,
    },
    fetched_at: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "hotel_details",
  }
);

// Create indexes for better performance
HotelDetailsSchema.index({ hotel_id: 1 });
HotelDetailsSchema.index({ "original_hotel.name": 1 });
HotelDetailsSchema.index({ "original_hotel.location": "2dsphere" });
HotelDetailsSchema.index({ "details.data.lodging.location": "2dsphere" });
HotelDetailsSchema.index({ "details.data.lodging.hotelClass": 1 });
HotelDetailsSchema.index({ "details.data.lodging.rating.value": 1 });

const HotelDetails =
  models?.HotelDetails ||
  model<IHotelDetails>("HotelDetails", HotelDetailsSchema);
export default HotelDetails;
