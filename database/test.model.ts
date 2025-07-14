import { Document, model, models, Schema, Types } from "mongoose";

// Interface cho Author
export interface IAuthor {
  name: string;
  image?: string;
}

// Interface cho Cost
export interface ICost {
  type: string; // VND, USD, etc.
  value: number;
}

// Interface cho Lodging
export interface ILodging {
  name: string;
  address: string;
  checkIn?: string;
  checkOut?: string;
  confirmation?: string;
  notes?: string;
  cost?: ICost;
}

// Interface cho Location (GeoJSON Point)
export interface ILocation {
  type: string; // "Point"
  coordinates: [number, number]; // [longitude, latitude]
}

// Interface cho Place Data
export interface IPlaceData {
  name: string;
  address: string;
  description?: string;
  tags?: string[];
  phone?: string;
  images?: string[];
  website?: string;
  location?: ILocation;
  note?: string;
}

// Interface cho Note Item
export interface INoteItem {
  type: "note";
  data: string;
}

// Interface cho Checklist Item
export interface IChecklistItem {
  type: "checklist";
  data: string[];
}

// Interface cho Place Item
export interface IPlaceItem {
  type: "place";
  data: IPlaceData;
}

// Union type cho các loại item trong detail
export type IDetailItem = INoteItem | IChecklistItem | IPlaceItem;

// Interface cho Detail (Route hoặc List)
export interface IDetail {
  type?: "route" | "list";
  name: string;
  index: number;
  data: IDetailItem[];
}

// Interface chính cho Test Guide
export interface ITestGuide {
  title: string;
  note?: string;
  author: IAuthor;
  generalTips?: string;
  lodging?: ILodging[];
  details?: IDetail[];
  createdBy?: Types.ObjectId;
  isPublished?: boolean;
}

export interface ITestGuideDoc extends ITestGuide, Document {}

// Schema cho Author
const AuthorSchema = new Schema<IAuthor>(
  {
    name: { type: String, required: true },
    image: { type: String, required: false },
  },
  { _id: false }
);

// Schema cho Cost
const CostSchema = new Schema<ICost>(
  {
    type: { type: String, required: true, default: "VND" },
    value: { type: Number, required: true },
  },
  { _id: false }
);

// Schema cho Lodging
const LodgingSchema = new Schema<ILodging>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    checkIn: { type: String, required: false },
    checkOut: { type: String, required: false },
    confirmation: { type: String, required: false },
    notes: { type: String, required: false },
    cost: { type: CostSchema, required: false },
  },
  { _id: false }
);

// Schema cho Location (GeoJSON Point)
const LocationSchema = new Schema<ILocation>(
  {
    type: { type: String, required: true, default: "Point" },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  },
  { _id: false }
);

// Schema cho Place Data
const PlaceDataSchema = new Schema<IPlaceData>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    description: { type: String, required: false },
    tags: [{ type: String }],
    phone: { type: String, required: false },
    images: [{ type: String }],
    website: { type: String, required: false },
    location: { type: LocationSchema, required: false },
    note: { type: String, required: false },
  },
  { _id: false }
);

// Schema cho Detail Item (sử dụng discriminated union)
const DetailItemSchema = new Schema(
  {
    type: { type: String, required: true, enum: ["note", "checklist", "place"] },
    data: { type: Schema.Types.Mixed, required: true },
  },
  { 
    _id: false,
    discriminatorKey: "type" 
  }
);

// Schema cho Detail
const DetailSchema = new Schema<IDetail>(
  {
    type: { type: String, required: false, enum: ["route", "list"], default: "route" },
    name: { type: String, required: true },
    index: { type: Number, required: true },
    data: [DetailItemSchema],
  },
  { _id: false }
);

// Schema chính cho Test Guide
const TestGuideSchema = new Schema<ITestGuide>(
  {
    title: { type: String, required: true },
    note: { type: String, required: false },
    author: { type: AuthorSchema, required: true },
    generalTips: { type: String, required: false },
    lodging: [LodgingSchema],
    details: [DetailSchema],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: false },
    isPublished: { type: Boolean, required: false, default: false },
  },
  {
    timestamps: true,
  }
);

// Tạo indexes cho tìm kiếm
TestGuideSchema.index({ title: "text", "author.name": "text" });
TestGuideSchema.index({ createdBy: 1 });
TestGuideSchema.index({ isPublished: 1 });
TestGuideSchema.index({ createdAt: -1 });

// Tạo index cho location nếu cần tìm kiếm theo địa lý
TestGuideSchema.index({ "details.data.data.location": "2dsphere" });

const TestGuide = models?.TestGuide || model<ITestGuide>("TestGuide", TestGuideSchema);
export default TestGuide;
