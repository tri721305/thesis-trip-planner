"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import Stripe from "stripe";
import { z } from "zod";

import { HotelBooking, Payment } from "@/database";
import connectToDatabase from "@/lib/mongoose";
import { handleError } from "@/lib/handler/error";
import action from "@/lib/handler/action";
import { getBookingMongoIdFromBookingId } from "@/lib/utils/booking-helpers";
import {
  CreatePaymentSchema,
  CreateStripePaymentIntentSchema,
  UpdatePaymentStatusSchema,
  ProcessRefundSchema,
  GetPaymentsSchema,
} from "@/lib/validation";

import type {
  CreatePaymentIntentParams,
  ProcessPaymentParams,
  IssueRefundParams,
  VerifyPaymentParams,
  PaymentResponse,
  PaymentIntentResponse,
  RefundResponse,
  PaymentVerificationResponse,
  IPayment,
} from "@/types/payment";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

/**
 * Create a new payment
 */
export async function createPayment(
  params: CreatePaymentParams
): Promise<ActionResponse<any>> {
  const validationResult = await action({
    params,
    schema: CreatePaymentSchema,
    authorize: true,
  });

  console.log("Payment validationResult", validationResult);
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const {
    bookingId: bookingIdParam,
    amount,
    currency,
    paymentMethod,
    breakdown,
    billingDetails,
    description,
    source = "web",
  } = validationResult.params!;

  // bookingIdParam có thể là chuỗi bookingId hoặc MongoDB ObjectId
  const bookingId = bookingIdParam;

  const userId = validationResult.session?.user?.id;

  if (!userId) {
    return handleError(new Error("Unauthorized")) as ErrorResponse;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectToDatabase();

    console.log(`Searching for booking with bookingId: ${bookingId}`);

    // Verify booking exists and belongs to the user
    // Find booking by bookingId field (string)
    const booking = await HotelBooking.findOne({ bookingId }).session(session);

    console.log(`Booking search result`, booking);

    if (!booking) {
      throw new Error(
        `Booking not found with ID: ${bookingId}. Please check the bookingId.`
      );
    }

    console.log(`Found booking: ${booking._id} (${booking.bookingId})`);

    if (booking.userId.toString() !== userId) {
      throw new Error("Unauthorized to make payment for this booking");
    }

    if (booking.paymentStatus === "paid") {
      throw new Error("Booking is already paid");
    }

    // Create payment record with the MongoDB ObjectId from booking
    // Ensure we have the MongoDB ObjectId for bookingId field in Payment model
    const bookingMongoId = booking._id;

    // Generate a payment ID manually to avoid mongoose validation error
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    const generatedPaymentId = `PAY${timestamp}${random}`;

    console.log(
      `Creating payment with ID: ${generatedPaymentId} for booking MongoDB ID: ${bookingMongoId}`
    );

    // Tạo đối tượng payment không có stripeInfo
    const payment = await Payment.create(
      [
        {
          paymentId: generatedPaymentId,
          userId,
          bookingId: bookingMongoId,
          amount,
          currency,
          paymentMethod,
          breakdown,
          billingDetails,
          description,
          status: "pending",
          retryCount: 0,
          source,
        },
      ],
      { session }
    );

    console.log("payment nè", payment);
    // Update booking with payment reference
    booking.paymentId = payment[0]._id;
    await booking.save({ session });

    await session.commitTransaction();

    // Chuyển đổi toàn bộ đối tượng MongoDB thành plain JavaScript object
    // bằng cách serialization và deserialization qua JSON
    const serializedPayment = JSON.parse(JSON.stringify(payment[0]));

    console.log(
      "Success rồi nè, dữ liệu trả về (serialized):",
      serializedPayment
    );
    return {
      success: true,
      data: serializedPayment,
    };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    session.endSession();
  }
}

/**
 * Create a Stripe payment intent
 */
export async function createStripePaymentIntent(
  params: CreateStripePaymentIntentParams
): Promise<ActionResponse<{ clientSecret: string }>> {
  console.log(
    "Starting createStripePaymentIntent with params:",
    JSON.stringify(params)
  );

  const validationResult = await action({
    params,
    schema: CreateStripePaymentIntentSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    console.log("Validation error:", validationResult);
    return handleError(validationResult) as ErrorResponse;
  }

  const {
    paymentId,
    amount,
    currency,
    description,
    metadata = {},
  } = validationResult.params!;

  console.log("Processing payment intent for paymentId:", paymentId);

  const userId = validationResult.session?.user?.id;

  if (!userId) {
    return handleError(new Error("Unauthorized")) as ErrorResponse;
  }

  try {
    await connectToDatabase();

    // Find payment
    const payment = await Payment.findOne({ paymentId });

    if (!payment) {
      throw new Error("Payment not found");
    }

    if (payment.userId.toString() !== userId) {
      throw new Error("Unauthorized to process this payment");
    }

    if (payment.status !== "pending") {
      throw new Error(`Payment already in ${payment.status} state`);
    }

    // Create payment intent
    // Tìm booking để lấy bookingId chuỗi cho metadata
    const bookingData = await HotelBooking.findById(payment.bookingId);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to smallest currency unit
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      description,
      metadata: {
        paymentId: payment.paymentId,
        bookingId: bookingData?.bookingId || payment.bookingId.toString(),
        userId,
        ...metadata,
      },
    });

    // Update payment with Stripe info
    payment.status = "processing";

    // Khởi tạo stripeInfo nếu chưa tồn tại
    if (!payment.stripeInfo) {
      payment.stripeInfo = {};
    }

    // Cập nhật thông tin Stripe
    payment.stripeInfo.paymentIntentId = paymentIntent.id;
    payment.stripeInfo.clientSecret = paymentIntent.client_secret || undefined;

    console.log("Saving payment with Stripe info:", {
      paymentId: payment.paymentId,
      status: payment.status,
      stripeInfo: {
        paymentIntentId: payment.stripeInfo.paymentIntentId,
        hasClientSecret: !!payment.stripeInfo.clientSecret,
      },
    });

    await payment.save();

    return {
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret || "",
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  params: UpdatePaymentStatusParams
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: UpdatePaymentStatusSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { paymentId, status, stripeInfo, transactionId, notes } =
    validationResult.params!;

  try {
    await connectToDatabase();

    const payment = await Payment.findOne({ paymentId });

    if (!payment) {
      throw new Error("Payment not found");
    }

    // Update payment
    payment.status = status;

    // If we have Stripe info to update
    if (stripeInfo && Object.keys(stripeInfo).length > 0) {
      // Khởi tạo stripeInfo nếu chưa tồn tại
      if (!payment.stripeInfo) {
        payment.stripeInfo = {};
      }

      // Cập nhật thông tin Stripe, đảm bảo không ghi đè paymentIntentId bằng null hoặc undefined
      Object.entries(stripeInfo).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          payment.stripeInfo[key] = value;
        }
      });
    }

    if (transactionId) {
      payment.transactionId = transactionId;
    }

    if (notes) {
      payment.notes = notes;
    }

    // Update timestamps based on status
    const now = new Date();
    switch (status) {
      case "succeeded":
        payment.processedAt = now;
        break;
      case "failed":
        payment.failedAt = now;
        break;
      case "refunded":
      case "partially_refunded":
        payment.refundedAt = now;
        break;
    }

    await payment.save();

    // Update booking status
    if (status === "succeeded" || status === "failed") {
      // payment.bookingId là MongoDB ObjectId, sử dụng findById
      const booking = await HotelBooking.findById(payment.bookingId);

      if (booking) {
        if (status === "succeeded") {
          booking.paymentStatus = "paid";
          booking.status = "confirmed";
        } else if (status === "failed") {
          booking.paymentStatus = "failed";
        }

        await booking.save();
      }
    }

    revalidatePath("/bookings");

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

/**
 * Process a refund
 */
export async function processRefund(
  params: ProcessRefundParams
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: ProcessRefundSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { paymentId, amount, reason, stripeRefundId } =
    validationResult.params!;

  try {
    await connectToDatabase();

    const payment = await Payment.findOne({ paymentId });

    if (!payment) {
      throw new Error("Payment not found");
    }

    if (payment.status !== "succeeded") {
      throw new Error("Can only refund successful payments");
    }

    // Create refund record
    const refundId = `REF${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // If no refunds array exists, create it
    if (!payment.refunds) {
      payment.refunds = [];
    }

    payment.refunds.push({
      refundId,
      amount,
      reason,
      status: "pending",
      createdAt: new Date(),
      stripeRefundId,
    });

    // If stripeRefundId is provided, mark as succeeded
    if (stripeRefundId) {
      const refundIndex = payment.refunds.length - 1;
      payment.refunds[refundIndex].status = "succeeded";
      payment.refunds[refundIndex].processedAt = new Date();
    }

    // Calculate total refunded amount
    const totalRefunded = payment.refunds
      .filter((refund: any) => refund.status === "succeeded")
      .reduce((sum: number, refund: any) => sum + refund.amount, 0);

    // Update payment status based on refund amount
    if (totalRefunded >= payment.amount) {
      payment.status = "refunded";
      payment.refundedAt = new Date();
    } else if (totalRefunded > 0) {
      payment.status = "partially_refunded";
      payment.refundedAt = new Date();
    }

    await payment.save();

    // If payment is fully refunded, update booking status
    if (payment.status === "refunded") {
      // Use findOne with the bookingId string instead of findById with MongoDB _id
      const booking = await HotelBooking.findOne({
        bookingId: payment.bookingId,
      });

      if (booking && booking.status !== "cancelled") {
        booking.status = "cancelled";
        booking.paymentStatus = "refunded";
        booking.cancellation = {
          reason: reason,
          cancelledAt: new Date(),
          refundAmount: amount,
          refundStatus: "processed",
        };

        await booking.save();
      }
    }

    revalidatePath("/bookings");

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

/**
 * Get payments
 */
export async function getPayments(params: GetPaymentsParams): Promise<
  ActionResponse<{
    payments: Payment[];
    isNext: boolean;
    totalCount: number;
  }>
> {
  const validationResult = await action({
    params,
    schema: GetPaymentsSchema,
    authorize: params.userId ? true : false,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const {
    userId,
    bookingId,
    status,
    page = 1,
    pageSize = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = validationResult.params!;

  try {
    await connectToDatabase();

    // Build query
    const query: Record<string, any> = {};

    // If specific user, filter by userId
    if (userId) {
      // Ensure user can only access their own payments
      if (
        validationResult.session &&
        validationResult.session.user?.id !== userId
      ) {
        throw new Error("Unauthorized to access other users' payments");
      }

      query.userId = userId;
    }

    // Filter by bookingId if provided
    if (bookingId) {
      query.bookingId = bookingId;
    }

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Get total count
    const totalCount = await Payment.countDocuments(query);

    // Calculate pagination
    const skipAmount = (page - 1) * pageSize;

    // Sort order
    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Get payments
    const payments = await Payment.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize)
      .populate("userId", "name email image")
      .populate("bookingId");

    // Check if there are more payments
    const isNext = totalCount > skipAmount + payments.length;

    return {
      success: true,
      data: {
        payments: payments,
        isNext,
        totalCount,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

/**
 * Get payment by ID
 */
export async function getPaymentById(
  paymentId: string
): Promise<ActionResponse<Payment>> {
  try {
    await connectToDatabase();

    const payment = await Payment.findOne({ paymentId })
      .populate("userId", "name email image")
      .populate("bookingId");

    if (!payment) {
      throw new Error("Payment not found");
    }

    return {
      success: true,
      data: payment,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

/**
 * Process payment after client-side confirmation
 */
export async function processPayment(
  params: ProcessPaymentParams
): Promise<PaymentResponse> {
  const { paymentIntentId, bookingId, userId } = params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectToDatabase();

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      throw new Error(
        `Payment not successful. Status: ${paymentIntent.status}`
      );
    }

    // Find the payment in our database
    const payment = await Payment.findOne({
      "stripeInfo.paymentIntentId": paymentIntentId,
    }).session(session);

    if (!payment) {
      throw new Error("Payment record not found");
    }

    // Update payment status
    payment.status = "succeeded";
    payment.processedAt = new Date();
    payment.transactionId = paymentIntent.id;

    if (!payment.stripeInfo || !payment.stripeInfo.paymentIntentId) {
      payment.stripeInfo = {
        paymentIntentId: paymentIntent.id, // Đảm bảo luôn có paymentIntentId
        chargeId: paymentIntent.latest_charge as string,
      };
    } else {
      payment.stripeInfo.chargeId = paymentIntent.latest_charge as string;
    }

    await payment.save({ session });

    // Update booking status
    // Use findOne with the bookingId string instead of findById with MongoDB _id
    const booking = await HotelBooking.findOne({ bookingId }).session(session);

    if (booking) {
      booking.paymentStatus = "paid";
      booking.status = "confirmed";
      await booking.save({ session });
    } else {
      console.error("Booking not found with ID:", bookingId);
    }

    await session.commitTransaction();

    // Revalidate booking pages
    revalidatePath("/bookings");

    return {
      success: true,
      message: "Payment processed successfully",
      payment: payment.toObject() as unknown as IPayment,
    };
  } catch (error: any) {
    await session.abortTransaction();
    console.error("Error processing payment:", error);

    return {
      success: false,
      message: error.message || "Error processing payment",
      payment: {} as IPayment,
    };
  } finally {
    session.endSession();
  }
}
