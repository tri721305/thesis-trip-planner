import { Document, model, models, Schema, Types } from "mongoose";

// Interface cho thông tin thanh toán Stripe
export interface IStripeInfo {
  paymentIntentId?: string; // paymentIntentId có thể không cần khi bắt đầu tạo thanh toán
  clientSecret?: string;
  chargeId?: string;
  receiptUrl?: string;
  refundId?: string;
  failureCode?: string;
  failureMessage?: string;
}

// Interface cho thông tin billing
export interface IBillingDetails {
  name: string;
  email: string;
  phone?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
  };
}

// Interface cho breakdown của payment
export interface IPaymentBreakdown {
  subtotal: number;
  taxes: number;
  fees: number;
  discount?: number;
  total: number;
  currency: string;
}

// Interface chính cho Payment
export interface IPayment {
  paymentId: string; // Unique payment reference
  userId: Types.ObjectId; // Reference to User
  bookingId: Types.ObjectId; // Reference to HotelBooking

  // Thông tin thanh toán
  amount: number;
  currency: string;
  paymentMethod: "stripe" | "paypal" | "bank_transfer" | "cash";

  // Trạng thái thanh toán
  status:
    | "pending"
    | "processing"
    | "succeeded"
    | "failed"
    | "cancelled"
    | "refunded"
    | "partially_refunded";

  // Chi tiết thanh toán
  breakdown: IPaymentBreakdown;

  // Thông tin billing
  billingDetails: IBillingDetails;

  // Thông tin Stripe
  stripeInfo?: IStripeInfo;

  // Thông tin giao dịch
  transactionId?: string;
  referenceNumber?: string;

  // Thông tin refund
  refunds?: Array<{
    refundId: string;
    amount: number;
    reason: string;
    status: "pending" | "succeeded" | "failed";
    createdAt: Date;
    processedAt?: Date;
    stripeRefundId?: string;
  }>;

  // Thông tin retry (cho failed payments)
  retryCount: number;
  lastRetryAt?: Date;
  nextRetryAt?: Date;

  // Metadata
  description?: string;
  notes?: string;
  source: string; // web, mobile, admin

  // Timestamps cho các trạng thái
  processedAt?: Date;
  failedAt?: Date;
  refundedAt?: Date;
}

export interface IPaymentDoc extends IPayment, Document {}

// Schema cho thông tin địa chỉ
const AddressSchema = new Schema(
  {
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, required: true, trim: true },
  },
  { _id: false }
);

// Schema cho billing details
const BillingDetailsSchema = new Schema<IBillingDetails>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    phone: { type: String, trim: true },
    address: { type: AddressSchema },
  },
  { _id: false }
);

// Schema cho payment breakdown
const PaymentBreakdownSchema = new Schema<IPaymentBreakdown>(
  {
    subtotal: { type: Number, required: true, min: 0 },
    taxes: { type: Number, default: 0, min: 0 },
    fees: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "VND" },
  },
  { _id: false }
);

// Schema cho Stripe info
const StripeInfoSchema = new Schema<IStripeInfo>(
  {
    paymentIntentId: { type: String }, // Không required và không unique để tránh lỗi
    clientSecret: { type: String },
    chargeId: { type: String },
    receiptUrl: { type: String },
    refundId: { type: String },
    failureCode: { type: String },
    failureMessage: { type: String },
  },
  { _id: false }
);

// Schema cho refund info
const RefundSchema = new Schema(
  {
    refundId: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    reason: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "succeeded", "failed"],
      default: "pending",
    },
    createdAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
    stripeRefundId: { type: String },
  },
  { _id: false }
);

// Schema chính
const PaymentSchema = new Schema<IPayment>(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "HotelBooking",
      required: true,
      index: true,
    },

    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "VND" },
    paymentMethod: {
      type: String,
      enum: ["stripe", "paypal", "bank_transfer", "cash"],
      required: true,
      default: "stripe",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "succeeded",
        "failed",
        "cancelled",
        "refunded",
        "partially_refunded",
      ],
      default: "pending",
      index: true,
    },

    breakdown: { type: PaymentBreakdownSchema, required: true },
    billingDetails: { type: BillingDetailsSchema, required: true },
    stripeInfo: { type: StripeInfoSchema },

    transactionId: { type: String, index: true },
    referenceNumber: { type: String, index: true },

    refunds: [RefundSchema],

    retryCount: { type: Number, default: 0, min: 0 },
    lastRetryAt: { type: Date },
    nextRetryAt: { type: Date },

    description: { type: String, trim: true },
    notes: { type: String, trim: true },
    source: { type: String, default: "web" },

    processedAt: { type: Date },
    failedAt: { type: Date },
    refundedAt: { type: Date },
  },
  {
    timestamps: true,
    collection: "payments",
  }
);

// Indexes for performance
PaymentSchema.index({ paymentId: 1 });
PaymentSchema.index({ userId: 1, status: 1 });
PaymentSchema.index({ bookingId: 1 });
// Xóa chỉ mục stripeInfo.paymentIntentId để tránh lỗi duplicate key với giá trị null
// PaymentSchema.index({ "stripeInfo.paymentIntentId": 1 }, { sparse: true });
PaymentSchema.index({ status: 1, createdAt: -1 });
PaymentSchema.index({ amount: 1, currency: 1 });
PaymentSchema.index({ transactionId: 1 });
PaymentSchema.index({ referenceNumber: 1 });
PaymentSchema.index({ createdAt: -1 });

// Virtual for total refunded amount
PaymentSchema.virtual("totalRefunded").get(function () {
  if (!this.refunds || this.refunds.length === 0) return 0;
  return this.refunds
    .filter((refund) => refund.status === "succeeded")
    .reduce((total, refund) => total + refund.amount, 0);
});

// Virtual for remaining amount after refunds
PaymentSchema.virtual("remainingAmount").get(function () {
  const totalRefunded =
    this.refunds && this.refunds.length > 0
      ? this.refunds
          .filter((refund) => refund.status === "succeeded")
          .reduce((total, refund) => total + refund.amount, 0)
      : 0;
  return this.amount - totalRefunded;
});

// Pre-save middleware to generate payment ID
PaymentSchema.pre("save", function (next) {
  if (this.isNew && !this.paymentId) {
    // Generate payment ID: PAY + timestamp + random
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.paymentId = `PAY${timestamp}${random}`;
  }
  next();
});

// Pre-save middleware to generate reference number
PaymentSchema.pre("save", function (next) {
  if (this.isNew && !this.referenceNumber) {
    // Generate reference number: REF + YYYYMMDD + random
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.random().toString().slice(2, 8);
    this.referenceNumber = `REF${date}${random}`;
  }
  next();
});

// Pre-save middleware to update timestamps based on status
PaymentSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    const now = new Date();
    switch (this.status) {
      case "succeeded":
        if (!this.processedAt) this.processedAt = now;
        break;
      case "failed":
        if (!this.failedAt) this.failedAt = now;
        break;
      case "refunded":
      case "partially_refunded":
        if (!this.refundedAt) this.refundedAt = now;
        break;
    }
  }
  next();
});

// Static methods
PaymentSchema.statics.findByPaymentId = function (paymentId: string) {
  return this.findOne({ paymentId }).populate("userId bookingId");
};

PaymentSchema.statics.findByBookingId = function (bookingId: string) {
  return this.find({ bookingId }).sort({ createdAt: -1 });
};

PaymentSchema.statics.findByUser = function (userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 }).populate("bookingId");
};

PaymentSchema.statics.findByStatus = function (status: string) {
  return this.find({ status }).sort({ createdAt: -1 });
};

PaymentSchema.statics.findByStripePaymentIntent = function (
  paymentIntentId: string
) {
  return this.findOne({ "stripeInfo.paymentIntentId": paymentIntentId });
};

PaymentSchema.statics.getTotalRevenue = function (
  startDate?: Date,
  endDate?: Date
) {
  const match: any = { status: "succeeded" };
  if (startDate && endDate) {
    match.processedAt = { $gte: startDate, $lte: endDate };
  }

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$currency",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);
};

const Payment = models?.Payment || model<IPayment>("Payment", PaymentSchema);

export default Payment;
