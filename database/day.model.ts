import { Schema, model, models, Types } from "mongoose";

// Day Planning
export interface IDay {
  _id: Types.ObjectId;
  travelPlanId: Types.ObjectId;
  dayNumber: number;
  title: string;
  subheading?: string;
  date?: Date;

  // Route & Transportation
  route: {
    isOptimized: boolean;
    totalDistance?: number;
    totalDuration?: number;
    startLocation?: { lat: number; lng: number };
    endLocation?: { lat: number; lng: number };
    transportMode: "driving" | "walking" | "cycling" | "transit" | "mixed";
  };

  // Day Summary
  summary?: string;
  weather?: {
    temperature?: number;
    condition?: string;
    forecast?: string;
  };

  // Timing
  startTime?: string; // "09:00"
  endTime?: string; // "18:00"

  createdAt: Date;
  updatedAt: Date;
}

const DaySchema = new Schema<IDay>(
  {
    travelPlanId: {
      type: Schema.Types.ObjectId,
      ref: "TravelPlan",
      required: true,
      index: true,
    },
    dayNumber: { type: Number, required: true, min: 1 },
    title: { type: String, required: true, maxlength: 100 },
    subheading: { type: String, maxlength: 200 },
    date: { type: Date },

    // Route & Transportation
    route: {
      isOptimized: { type: Boolean, default: false },
      totalDistance: { type: Number, min: 0 },
      totalDuration: { type: Number, min: 0 },
      startLocation: {
        lat: { type: Number, min: -90, max: 90 },
        lng: { type: Number, min: -180, max: 180 },
      },
      endLocation: {
        lat: { type: Number, min: -90, max: 90 },
        lng: { type: Number, min: -180, max: 180 },
      },
      transportMode: {
        type: String,
        enum: ["driving", "walking", "cycling", "transit", "mixed"],
        default: "driving",
      },
    },

    // Day Summary
    summary: { type: String, maxlength: 1000 },
    weather: {
      temperature: { type: Number },
      condition: { type: String },
      forecast: { type: String },
    },

    // Timing
    startTime: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    endTime: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate relationships
DaySchema.virtual("places", {
  ref: "Place",
  localField: "_id",
  foreignField: "dayId",
  options: { sort: { order: 1 } },
});

DaySchema.virtual("notes", {
  ref: "Note",
  localField: "_id",
  foreignField: "dayId",
  options: { sort: { order: 1 } },
});

DaySchema.virtual("checklists", {
  ref: "Checklist",
  localField: "_id",
  foreignField: "dayId",
  options: { sort: { order: 1 } },
});

// Compound index for unique day numbers per travel plan
DaySchema.index({ travelPlanId: 1, dayNumber: 1 }, { unique: true });

const Day = models?.Day || model<IDay>("Day", DaySchema);
export default Day;
