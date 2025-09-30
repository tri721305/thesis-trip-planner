import { Types } from "mongoose";
import { IBooking } from "./booking";

// Payment method types
export type PaymentMethodType =
  | "credit_card"
  | "bank_transfer"
  | "paypal"
  | "stripe"
  | "cash";

// Payment status
export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded"
  | "partially_refunded";

// Base Payment Interface
export interface IPayment {
  _id?: string | Types.ObjectId;
  paymentId?: string;
  userId: string | Types.ObjectId;
  bookingId: string | Types.ObjectId;
  booking?: IBooking;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethodType;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  stripePaymentIntentId?: string;
  stripeClientSecret?: string;
  stripeCustomerId?: string;
  refundAmount?: number;
  refundReason?: string;
  refundDate?: Date;
  paymentDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  metadata?: Record<string, any>;
}

// Create Payment Input
export interface CreatePaymentParams {
  bookingId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethodType;
  breakdown?: {
    subtotal: number;
    taxes: number;
    fees: number;
    discount?: number;
    total?: number;
  };
  billingDetails: {
    name: string;
    email: string;
    phone?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
  };
  description?: string;
  source?: string;
}

// Create Payment Intent Input
export interface CreatePaymentIntentParams {
  bookingId: string;
  userId: string;
  amount: number;
  currency?: string;
  paymentMethod?: PaymentMethodType;
  metadata?: Record<string, any>;
}

// Process Payment Input
export interface ProcessPaymentParams {
  paymentIntentId: string;
  bookingId: string;
  userId: string;
}

// Issue Refund Input
export interface IssueRefundParams {
  paymentId: string;
  amount?: number;
  reason?: string;
}

// Verify Payment Input
export interface VerifyPaymentParams {
  paymentIntentId: string;
}

// Payment Response
export interface PaymentResponse {
  payment: IPayment;
  success: boolean;
  message: string;
  clientSecret?: string;
}

// Payment Intent Response
export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  success: boolean;
  message: string;
}

// Refund Response
export interface RefundResponse {
  refund: {
    id: string;
    amount: number;
    status: string;
  };
  success: boolean;
  message: string;
}

// Payment Verification Response
export interface PaymentVerificationResponse {
  isVerified: boolean;
  paymentStatus: PaymentStatus;
  message: string;
}

// Stripe Webhook Event Types
export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
}
