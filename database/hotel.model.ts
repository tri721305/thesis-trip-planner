import { Document, model, models, Schema } from "mongoose";

// Interface cho hình ảnh
export interface IHotelImage {
  url: string;
  thumbnailUrl: string;
}

// Interface cho ID khách sạn
export interface IHotelId {
  type: string;
  kayakKey: string;
}

// Interface cho đánh giá
export interface IRating {
  source: string;
  value: number;
}

// Interface cho vị trí
export interface ILocation {
  longitude: number;
  latitude: number;
}

// Interface cho chính sách hủy
export interface ICancellationPolicy {
  type: string;
  policyEndDateTime: string;
}

// Interface cho tổng tiền
export interface ITotal {
  amount: number;
  currencyCode: string;
}

// Interface cho thông tin lodging
export interface ILodging {
  id: IHotelId;
  name: string;
  hotelClass: number;
  images: IHotelImage[];
  amenities: string[];
  attributes: string[];
  rating?: IRating;
  wanderlogRating?: number;
  ratingCount: number;
  location: ILocation;
}

// Interface cho giá phòng
export interface IPriceRate {
  source: string;
  currencyCode: string;
  amount: number;
  frequency: string;
  site: string;
  bookingUrl: string;
  hasMemberDeal: boolean;
  nightlyStrikethrough?: number;
  cancellationPolicy: ICancellationPolicy;
  total: ITotal;
  amenities: string[];
  bedGroups: string[];
  isTotalBeforeTaxes: boolean;
  hasFreeCancellation: boolean;
}

// Interface chính cho Hotel
export interface IHotel {
  offerId: string;
  lodging: ILodging;
  source: string;
  priceRates: IPriceRate[];
  priceRate: IPriceRate;
  includesDueAtPropertyFees: boolean;
}

export interface IHotelDoc extends IHotel, Document {}

// Schema cho hình ảnh
const HotelImageSchema = new Schema<IHotelImage>(
  {
    url: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
  },
  { _id: false }
);

// Schema cho ID khách sạn
const HotelIdSchema = new Schema<IHotelId>(
  {
    type: { type: String, required: true },
    kayakKey: { type: String, required: true },
  },
  { _id: false }
);

// Schema cho đánh giá
const RatingSchema = new Schema<IRating>(
  {
    source: { type: String, required: true },
    value: { type: Number, required: true },
  },
  { _id: false }
);

// Schema cho vị trí
const LocationSchema = new Schema<ILocation>(
  {
    longitude: { type: Number, required: true },
    latitude: { type: Number, required: true },
  },
  { _id: false }
);

// Schema cho chính sách hủy
const CancellationPolicySchema = new Schema<ICancellationPolicy>(
  {
    type: { type: String, required: true },
    policyEndDateTime: { type: String, required: true },
  },
  { _id: false }
);

// Schema cho tổng tiền
const TotalSchema = new Schema<ITotal>(
  {
    amount: { type: Number, required: true },
    currencyCode: { type: String, required: true },
  },
  { _id: false }
);

// Schema cho thông tin lodging
const LodgingSchema = new Schema<ILodging>(
  {
    id: { type: HotelIdSchema, required: true },
    name: { type: String, required: true },
    hotelClass: { type: Number, required: true },
    images: [HotelImageSchema],
    amenities: [{ type: String }],
    attributes: [{ type: String }],
    rating: { type: RatingSchema, required: true },
    wanderlogRating: { type: Number },
    ratingCount: { type: Number, required: true },
    location: { type: LocationSchema, required: true },
  },
  { _id: false }
);

// Schema cho giá phòng
const PriceRateSchema = new Schema<IPriceRate>(
  {
    source: { type: String, required: true },
    currencyCode: { type: String, required: true },
    amount: { type: Number, required: true },
    frequency: { type: String, required: true },
    site: { type: String, required: true },
    bookingUrl: { type: String, required: true },
    hasMemberDeal: { type: Boolean, required: true },
    nightlyStrikethrough: { type: Number },
    cancellationPolicy: { type: CancellationPolicySchema, required: true },
    total: { type: TotalSchema, required: true },
    amenities: [{ type: String }],
    bedGroups: [{ type: String }],
    isTotalBeforeTaxes: { type: Boolean, required: true },
    hasFreeCancellation: { type: Boolean, required: true },
  },
  { _id: false }
);

// Schema chính cho Hotel
const HotelSchema = new Schema<IHotel>(
  {
    offerId: { type: String, required: true, unique: true },
    lodging: { type: LodgingSchema, required: true },
    source: { type: String, required: true },
    priceRates: [PriceRateSchema],
    priceRate: { type: PriceRateSchema, required: true },
    includesDueAtPropertyFees: { type: Boolean, required: true },
  },
  {
    timestamps: true,
  }
);

// Tạo index cho tìm kiếm
HotelSchema.index({ offerId: 1 });
HotelSchema.index({ "lodging.name": "text" });
HotelSchema.index({ "lodging.location": "2dsphere" });
HotelSchema.index({ "priceRate.amount": 1 });
HotelSchema.index({ "lodging.rating.value": 1 });

const Hotel = models?.Hotel || model<IHotel>("Hotel", HotelSchema);
export default Hotel;
