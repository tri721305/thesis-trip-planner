import { Schema, model, models, Types } from "mongoose";

// Expense Tracking
export interface IExpense {
  _id: Types.ObjectId;
  travelPlanId: Types.ObjectId;
  dayId?: Types.ObjectId;
  placeId?: Types.ObjectId;

  // Basic Info
  title: string;
  description?: string;
  amount: number;
  currency: string;

  // Categorization
  category:
    | "accommodation"
    | "food"
    | "transport"
    | "activities"
    | "shopping"
    | "other";
  subcategory?: string;

  // Payment Info
  paymentMethod: "cash" | "card" | "bank_transfer" | "digital_wallet" | "other";
  paidBy: Types.ObjectId; // User who paid

  // Date & Location
  expenseDate: Date;
  location?: string;

  // Receipt & Proof
  receipt?: string; // Image URL
  notes?: string;

  // Splitting
  isSplit: boolean;
  splitType?: "equal" | "custom" | "percentage";

  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    travelPlanId: {
      type: Schema.Types.ObjectId,
      ref: "TravelPlan",
      required: true,
      index: true,
    },
    dayId: { type: Schema.Types.ObjectId, ref: "Day" },
    placeId: { type: Schema.Types.ObjectId, ref: "Place" },

    // Basic Info
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, maxlength: 1000 },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "USD" },

    // Categorization
    category: {
      type: String,
      enum: [
        "accommodation",
        "food",
        "transport",
        "activities",
        "shopping",
        "other",
      ],
      required: true,
    },
    subcategory: { type: String, maxlength: 50 },

    // Payment Info
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "bank_transfer", "digital_wallet", "other"],
      required: true,
    },
    paidBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Date & Location
    expenseDate: { type: Date, required: true },
    location: { type: String, maxlength: 200 },

    // Receipt & Proof
    receipt: { type: String },
    notes: { type: String, maxlength: 1000 },

    // Splitting
    isSplit: { type: Boolean, default: false },
    splitType: {
      type: String,
      enum: ["equal", "custom", "percentage"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate for splits
ExpenseSchema.virtual("splits", {
  ref: "ExpenseSplit",
  localField: "_id",
  foreignField: "expenseId",
});

// Indexes
ExpenseSchema.index({ travelPlanId: 1, expenseDate: -1 });
ExpenseSchema.index({ paidBy: 1 });
ExpenseSchema.index({ category: 1 });
ExpenseSchema.index({ dayId: 1 });

const Expense = models?.Expense || model<IExpense>("Expense", ExpenseSchema);
export default Expense;
