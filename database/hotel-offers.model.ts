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

const MaxPeopleSchema = new Schema(
  {
    total: { type: Number },
    children: { type: Number },
    adults: { type: Number },
  },
  { _id: false }
);

const AmenityAttributeSchema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String },
  },
  { _id: false }
);

const CancellationPolicySchema = new Schema(
  {
    type: { type: String },
    policyEndDateTime: { type: String },
  },
  { _id: false }
);

const TotalSchema = new Schema(
  {
    amount: { type: Number, required: true },
    currencyCode: { type: String, required: true },
  },
  { _id: false }
);

const BedGroupSchema = new Schema(
  {
    id: { type: String },
    bookingUrl: { type: String },
    description: { type: String },
  },
  { _id: false }
);

const PriceRateSchema = new Schema(
  {
    amount: { type: Number, required: true },
    currencyCode: { type: String, required: true },
    source: { type: String, required: true },
    site: { type: String, required: true },
    frequency: { type: String },
    bookingUrl: { type: String },
    hasMemberDeal: { type: Boolean },
    nightlyStrikethrough: { type: Schema.Types.Mixed },
    cancellationPolicy: { type: CancellationPolicySchema },
    total: { type: TotalSchema },
    bedGroups: [BedGroupSchema],
    amenities: [String],
  },
  { _id: false }
);

const OfferSchema = new Schema(
  {
    name: { type: String, required: true },
    images: [ImageSchema],
    maxPeople: { type: MaxPeopleSchema },
    areaSquareMeters: { type: Number },
    amenitiesAndAttributes: [AmenityAttributeSchema],
    priceRate: { type: PriceRateSchema },
    priceRates: [PriceRateSchema],
    hotelDealInfo: { type: Schema.Types.Mixed },
    includesDueAtPropertyFees: { type: Boolean },
  },
  { _id: false }
);

const OffersDataSchema = new Schema(
  {
    success: { type: Boolean, required: true },
    data: {
      offers: [OfferSchema],
    },
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

const SearchParamsSchema = new Schema(
  {
    dates: {
      startDate: { type: String, required: true },
      endDate: { type: String, required: true },
    },
    guests: {
      adultCount: { type: Number, required: true },
      roomCount: { type: Number, required: true },
      childrenAges: [Number],
    },
  },
  { _id: false }
);

// Main HotelOffers interface and schema
export interface IHotelOffers {
  hotel_id: number;
  original_hotel: {
    name: string;
    location: {
      longitude: number;
      latitude: number;
    };
  };
  offers: {
    success: boolean;
    data?: {
      offers: Array<{
        name: string;
        images?: Array<{
          url: string;
          thumbnailUrl?: string;
        }>;
        maxPeople?: {
          total?: number;
          children?: number;
          adults?: number;
        };
        areaSquareMeters?: number;
        amenitiesAndAttributes?: Array<{
          name: string;
          category?: string;
        }>;
        priceRate?: {
          amount: number;
          currencyCode: string;
          source: string;
          site: string;
          frequency?: string;
          bookingUrl?: string;
          hasMemberDeal?: boolean;
          nightlyStrikethrough?: any;
          cancellationPolicy?: {
            type?: string;
            policyEndDateTime?: string;
          };
          total?: {
            amount: number;
            currencyCode: string;
          };
          bedGroups?: Array<{
            id?: string;
            bookingUrl?: string;
            description?: string;
          }>;
          amenities?: string[];
        };
        priceRates?: Array<{
          amount: number;
          currencyCode: string;
          source: string;
          site: string;
          frequency?: string;
          bookingUrl?: string;
          hasMemberDeal?: boolean;
          nightlyStrikethrough?: any;
          cancellationPolicy?: {
            type?: string;
            policyEndDateTime?: string;
          };
          total?: {
            amount: number;
            currencyCode: string;
          };
          bedGroups?: Array<{
            id?: string;
            bookingUrl?: string;
            description?: string;
          }>;
          amenities?: string[];
        }>;
        hotelDealInfo?: any;
        includesDueAtPropertyFees?: boolean;
      }>;
    };
  };
  search_params: {
    dates: {
      startDate: string;
      endDate: string;
    };
    guests: {
      adultCount: number;
      roomCount: number;
      childrenAges: number[];
    };
  };
  fetched_at: Date;
}

export interface IHotelOffersDoc extends IHotelOffers, Document {}

const HotelOffersSchema = new Schema<IHotelOffers>(
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
    offers: {
      type: OffersDataSchema,
      required: true,
    },
    search_params: {
      type: SearchParamsSchema,
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
    collection: "hotel_offers",
  }
);

// Create indexes for better performance
HotelOffersSchema.index({ hotel_id: 1 });
HotelOffersSchema.index({ "original_hotel.name": 1 });
HotelOffersSchema.index({ "original_hotel.location": "2dsphere" });
HotelOffersSchema.index({ "offers.data.offers.priceRate.amount": 1 });
HotelOffersSchema.index({ "offers.data.offers.priceRate.currencyCode": 1 });
HotelOffersSchema.index({ "offers.data.offers.priceRate.site": 1 });
HotelOffersSchema.index({ "search_params.dates.startDate": 1 });
HotelOffersSchema.index({ "search_params.dates.endDate": 1 });

const HotelOffers =
  models?.HotelOffers || model<IHotelOffers>("HotelOffers", HotelOffersSchema);
export default HotelOffers;
