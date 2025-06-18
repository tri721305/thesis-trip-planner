import { Schema, model, models, Types } from "mongoose";

// Expense Splitting
export interface IExpenseSplit {
  _id: Types.ObjectId;
  expenseId: Types.ObjectId;
  user: Types.ObjectId;
  amount: number;
  currency: string;
  percentage?: number;
  isPaid: boolean;
  paidAt?: Date;
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSplitSchema = new Schema<IExpenseSplit>(
  {
    expenseId: {
      type: Schema.Types.ObjectId,
      ref: "Expense",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "USD" },
    percentage: { type: Number, min: 0, max: 100 },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    notes: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

// Indexes
ExpenseSplitSchema.index({ expenseId: 1 });
ExpenseSplitSchema.index({ user: 1 });
ExpenseSplitSchema.index({ isPaid: 1 });

// Compound index to prevent duplicate splits
ExpenseSplitSchema.index({ expenseId: 1, user: 1 }, { unique: true });

const ExpenseSplit =
  models?.ExpenseSplit ||
  model<IExpenseSplit>("ExpenseSplit", ExpenseSplitSchema);
export default ExpenseSplit;
