import { Schema, model, models, Document, Types } from "mongoose";

// Enhanced Travel Plan
export interface ITravelPlan {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  destination: string;
  startDate?: Date;
  endDate?: Date;

  // Ownership & Collaboration
  author: Types.ObjectId;
  collaborators: Types.ObjectId[];
  collaborationSettings: {
    allowEditing: boolean;
    allowCommenting: boolean;
    allowExpenses: boolean;
  };

  // Visibility & Sharing
  isPublic: boolean;
  isTemplate: boolean; // Can be used as template
  shareLink?: string;

  // Status & Planning
  status: "planning" | "active" | "completed" | "archived";
  coverImage?: string;
  tags: Types.ObjectId[];

  // Trip Details
  tripType: "solo" | "couple" | "family" | "friends" | "business";
  travelerCount: number;

  // Budget & Currency
  budget: {
    total?: number;
    currency: string;
    categories: Map<string, number>; // accommodation, food, transport, etc
  };

  // Location & Route
  bounds?: {
    // Map bounds for the trip
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };

  // Statistics
  totalDays: number;
  totalPlaces: number;
  totalDistance?: number;
  estimatedCost?: number;

  // Engagement
  viewCount: number;
  likeCount: number;
  copyCount: number; // How many times used as template

  createdAt: Date;
  updatedAt: Date;
}

const TravelPlanSchema = new Schema<ITravelPlan>(
  {
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, maxlength: 2000 },
    destination: { type: String, required: true, maxlength: 100 },
    startDate: { type: Date },
    endDate: { type: Date },

    // Ownership & Collaboration
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    collaborators: [{ type: Schema.Types.ObjectId, ref: "User" }],
    collaborationSettings: {
      allowEditing: { type: Boolean, default: true },
      allowCommenting: { type: Boolean, default: true },
      allowExpenses: { type: Boolean, default: true },
    },

    // Visibility & Sharing
    isPublic: { type: Boolean, default: false },
    isTemplate: { type: Boolean, default: false },
    shareLink: { type: String, unique: true, sparse: true },

    // Status & Planning
    status: {
      type: String,
      enum: ["planning", "active", "completed", "archived"],
      default: "planning",
    },
    coverImage: { type: String },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],

    // Trip Details
    tripType: {
      type: String,
      enum: ["solo", "couple", "family", "friends", "business"],
      default: "solo",
    },
    travelerCount: { type: Number, default: 1, min: 1 },

    // Budget & Currency
    budget: {
      total: { type: Number, min: 0 },
      currency: { type: String, default: "USD", maxlength: 3 },
      categories: { type: Map, of: Number },
    },

    // Location & Route
    bounds: {
      northeast: {
        lat: { type: Number, min: -90, max: 90 },
        lng: { type: Number, min: -180, max: 180 },
      },
      southwest: {
        lat: { type: Number, min: -90, max: 90 },
        lng: { type: Number, min: -180, max: 180 },
      },
    },

    // Statistics
    totalDays: { type: Number, default: 0, min: 0 },
    totalPlaces: { type: Number, default: 0, min: 0 },
    totalDistance: { type: Number, min: 0 },
    estimatedCost: { type: Number, min: 0 },

    // Engagement
    viewCount: { type: Number, default: 0, min: 0 },
    likeCount: { type: Number, default: 0, min: 0 },
    copyCount: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate for days
TravelPlanSchema.virtual("days", {
  ref: "Day",
  localField: "_id",
  foreignField: "travelPlanId",
  options: { sort: { dayNumber: 1 } },
});

// Virtual populate for accommodations
TravelPlanSchema.virtual("accommodations", {
  ref: "Accommodation",
  localField: "_id",
  foreignField: "travelPlanId",
  options: { sort: { checkIn: 1 } },
});

// Virtual populate for expenses
TravelPlanSchema.virtual("expenses", {
  ref: "Expense",
  localField: "_id",
  foreignField: "travelPlanId",
  options: { sort: { expenseDate: -1 } },
});

// Indexes for performance
TravelPlanSchema.index({ author: 1, status: 1 });
TravelPlanSchema.index({ collaborators: 1 });
TravelPlanSchema.index({ isPublic: 1, status: 1 });
TravelPlanSchema.index({ destination: 1 });
TravelPlanSchema.index({ tags: 1 });
TravelPlanSchema.index({ createdAt: -1 });
TravelPlanSchema.index({ viewCount: -1 });
TravelPlanSchema.index({ likeCount: -1 });
TravelPlanSchema.index({ shareLink: 1 });

// Middleware to validate date range
TravelPlanSchema.pre("save", function (next) {
  if (this.startDate && this.endDate && this.startDate >= this.endDate) {
    next(new Error("End date must be after start date"));
  }

  // Calculate total days
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(
      this.endDate.getTime() - this.startDate.getTime()
    );
    this.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  next();
});

const TravelPlan =
  models?.TravelPlan || model<ITravelPlan>("TravelPlan", TravelPlanSchema);

TravelPlanSchema.virtual("days", {
  ref: "Day",
  localField: "_id",
  foreignField: "travelPlanId",
  options: { sort: { dayNumber: 1 } },
});

// Virtual populate cho hotels
TravelPlanSchema.virtual("hotels", {
  ref: "Hotel",
  localField: "_id",
  foreignField: "travelPlanId",
  options: { sort: { checkIn: 1 } },
});

TravelPlanSchema.index({ userId: 1, status: 1 });
TravelPlanSchema.index({ collaborators: 1 });
TravelPlanSchema.index({ isPublic: 1, status: 1 });
TravelPlanSchema.index({ destination: 1 });
TravelPlanSchema.index({ tags: 1 });
TravelPlanSchema.index({ createdAt: -1 });

TravelPlanSchema.pre("save", function (next) {
  if (this.startDate && this.endDate && this.startDate >= this.endDate) {
    next(new Error("End date must be after start date"));
  }
  next();
});

const TravelPlan =
  models?.TravelPlan || model<ITravelPlan>("TravelPlan", TravelPlanSchema);
export default TravelPlan;
