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
 * Create a new payment or update existing one
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
    const booking = await HotelBooking.findOne({ bookingId }, null, {
      session,
    });

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

    // Ensure we have the MongoDB ObjectId for bookingId field in Payment model
    const bookingMongoId = booking._id;

    // Kiểm tra xem đã có payment cho booking này chưa - search by several methods
    let existingPayment = null;
    
    // Method 1: Search by bookingId reference
    existingPayment = await Payment.findOne({ bookingId: bookingMongoId }, null, { session });
    
    // Method 2: If booking has a payment reference, use that
    if (!existingPayment && booking.paymentId) {
      existingPayment = await Payment.findById(booking.paymentId, null, { session });
      console.log(`Found payment by booking.paymentId reference: ${existingPayment?.paymentId || 'not found'}`);
    }
    
    let payment;
    
    if (existingPayment) {
      console.log(`Payment already exists for this booking: ${existingPayment.paymentId}. Updating instead of creating new.`);
      
      // Only update certain fields if payment isn't already succeeded
      if (existingPayment.status === 'succeeded') {
        console.log(`Payment ${existingPayment.paymentId} is already in succeeded state. Not updating.`);
      } else {
        // Cập nhật payment hiện có thay vì tạo mới
        existingPayment.amount = amount;
        existingPayment.currency = currency;
        existingPayment.paymentMethod = paymentMethod;
        existingPayment.breakdown = breakdown;
        existingPayment.billingDetails = billingDetails;
        existingPayment.description = description;
        existingPayment.updatedAt = new Date();
        
        // If payment was in failed state, reset it to pending
        if (existingPayment.status === 'failed') {
          existingPayment.status = 'pending';
        }
        
        await existingPayment.save({ session });
        console.log("Updated existing payment:", existingPayment.paymentId);
      }
      
      // Sử dụng payment hiện có
      payment = [existingPayment];
    } else {
      // Generate a payment ID manually to avoid mongoose validation error
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substr(2, 4).toUpperCase();
      const generatedPaymentId = `PAY${timestamp}${random}`;

      console.log(
        `Creating new payment with ID: ${generatedPaymentId} for booking MongoDB ID: ${bookingMongoId}`
      );

      // Tạo đối tượng payment mới
      payment = await Payment.create(
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
    }

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
 * Reset a payment that is stuck in the "processing" state
 * This allows for retry of failed payment attempts
 */
export async function resetProcessingPayment(
  paymentId: string
): Promise<ActionResponse> {
  try {
    await connectToDatabase();

    const payment = await Payment.findOne({ paymentId });

    if (!payment) {
      throw new Error("Payment not found");
    }

    // Only allow resetting payments that are in processing state
    if (payment.status !== "processing") {
      throw new Error(`Payment is not in processing state, current state: ${payment.status}`);
    }

    // Reset payment to pending state
    payment.status = "pending";
    payment.updatedAt = new Date();
    
    // Add a note about the reset
    if (payment.notes) {
      payment.notes += `\nPayment reset from processing to pending state on ${new Date().toISOString()}`;
    } else {
      payment.notes = `Payment reset from processing to pending state on ${new Date().toISOString()}`;
    }

    // If we have retryCount, increment it
    if (typeof payment.retryCount === 'number') {
      payment.retryCount += 1;
    } else {
      payment.retryCount = 1;
    }

    await payment.save();

    console.log(`Reset payment ${paymentId} from processing to pending state`);
    
    // Revalidate booking pages
    revalidatePath("/bookings");

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
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

    // Check payment status but allow retry for processing state
    if (payment.status !== "pending" && payment.status !== "processing") {
      // Only block if payment is in other states like succeeded, failed, etc.
      if (payment.status === "succeeded") {
        throw new Error("Payment has already been completed successfully");
      } else {
        throw new Error(`Payment is in ${payment.status} state and cannot be processed`);
      }
    }
    
    // If payment is in processing state, log it but allow to continue
    if (payment.status === "processing") {
      console.log(`Notice: Creating new payment intent for payment ${payment.paymentId} that is already in processing state. This may be a retry attempt.`);
    }

    // Create payment intent
    // Tìm booking để lấy bookingId chuỗi cho metadata
    const bookingData = await HotelBooking.findById(payment.bookingId);

    // Đảm bảo số tiền là một số hợp lệ, không phải chuỗi định dạng
    let numericAmount: number;

    // Nếu amount là chuỗi có dấu chấm/phẩy ngăn cách, chuyển đổi sang số
    if (typeof amount === "string") {
      numericAmount = Number(String(amount).replace(/[.,]/g, ""));
    } else {
      numericAmount = amount;
    }

    // VND không có đơn vị nhỏ hơn, USD cần nhân 100 để chuyển từ đô sang xu
    let stripeAmount: number;
    if (currency.toLowerCase() === "vnd") {
      stripeAmount = Math.round(numericAmount); // VND không cần nhân với 100
    } else {
      stripeAmount = Math.round(numericAmount * 100); // Các loại tiền khác cần nhân với 100
    }

    console.log(
      `Creating Stripe Payment Intent: Original amount=${amount}, Numeric=${numericAmount}, Stripe amount=${stripeAmount} ${currency}`
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: stripeAmount,
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
        bookingId: payment.bookingId.toString(),
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
      throw new Error(`Payment not successful. Status: ${paymentIntent.status}`);
    }
    
    console.log(`Processing payment with intent ID: ${paymentIntentId}, booking ID: ${bookingId}`);
    
    // Kiểm tra xem đã có payment với trạng thái succeeded cho payment intent này chưa
    const existingSuccessfulPayment = await Payment.findOne(
      { 
        "stripeInfo.paymentIntentId": paymentIntentId,
        status: "succeeded"
      },
      null,
      { session }
    );
    
    if (existingSuccessfulPayment) {
      console.log(`Payment ${existingSuccessfulPayment.paymentId} has already been processed successfully for this intent.`);
      await session.commitTransaction();
      return {
        success: true,
        message: "Payment was already processed",
        payment: existingSuccessfulPayment.toObject() as unknown as IPayment
      };
    }

    // Find the payment in our database by paymentIntentId
    let payment = await Payment.findOne(
      { "stripeInfo.paymentIntentId": paymentIntentId },
      null,
      { session }
    );
    
    // Nếu không tìm thấy payment bằng paymentIntentId, thử tìm bằng bookingId từ metadata
    if (!payment && paymentIntent.metadata?.bookingId) {
      const bookingIdFromMetadata = paymentIntent.metadata.bookingId;
      console.log(`Payment not found by intent ID. Trying with bookingId from metadata: ${bookingIdFromMetadata}`);
      
      // First try to get the booking itself since it might be a string bookingId
      const booking = await HotelBooking.findOne({ bookingId: bookingIdFromMetadata }, null, { session });
      
      if (booking) {
        console.log(`Found booking with bookingId ${bookingIdFromMetadata}`);
        // Try to find payment using booking._id
        payment = await Payment.findOne({ bookingId: booking._id }, null, { session });
        
        // If booking has paymentId reference, use that too
        if (!payment && booking.paymentId) {
          payment = await Payment.findById(booking.paymentId, null, { session });
        }
      } else {
        // Try to use it as a MongoDB ObjectId directly (if possible)
        try {
          const bookingObjectId = new mongoose.Types.ObjectId(bookingIdFromMetadata);
          payment = await Payment.findOne({ bookingId: bookingObjectId }, null, { session });
        } catch (err) {
          console.log(`Could not convert ${bookingIdFromMetadata} to MongoDB ObjectId: ${err.message}`);
        }
      }
      
      // Nếu tìm thấy payment bằng bookingId, cập nhật stripeInfo của nó
      if (payment) {
        console.log(`Found payment ${payment.paymentId} using bookingId ${bookingIdFromMetadata}`);
        if (!payment.stripeInfo) {
          payment.stripeInfo = {};
        }
        payment.stripeInfo.paymentIntentId = paymentIntent.id;
      }
    }

    // Nếu vẫn không tìm thấy payment, thử tìm booking
    if (!payment && bookingId) {
      console.log(`No payment found for this intent. Checking for booking with ID: ${bookingId}`);
      
      const booking = await HotelBooking.findOne({ bookingId }, null, { session });
      
      if (booking) {
        // Nếu booking đã có payment reference
        if (booking.paymentId) {
          payment = await Payment.findById(booking.paymentId, null, { session });
          console.log(`Found payment ${payment?.paymentId || 'unknown'} using booking.paymentId reference`);
        }
        
        if (!payment) {
          // Log lỗi nhưng không tạo payment mới
          console.error(`Cannot find payment for booking ${bookingId}. Booking exists but no payment record found.`);
          throw new Error(`Payment record not found for booking ${bookingId}`);
        }
      }
    }

    if (!payment) {
      throw new Error(`Payment record not found for payment intent: ${paymentIntentId}`);
    }

    // Update payment status
    payment.status = "succeeded";
    payment.processedAt = new Date();
    payment.updatedAt = new Date();
    payment.transactionId = paymentIntent.id;

    if (!payment.stripeInfo || !payment.stripeInfo.paymentIntentId) {
      payment.stripeInfo = {
        paymentIntentId: paymentIntent.id,
        chargeId: paymentIntent.latest_charge as string,
      };
    } else {
      payment.stripeInfo.chargeId = paymentIntent.latest_charge as string;
    }

    await payment.save({ session });
    console.log(`Updated payment ${payment.paymentId} status to succeeded`);

    // Update booking status
    const booking = await HotelBooking.findOne({ bookingId }, null, { session });

    if (booking) {
      booking.paymentStatus = "paid";
      booking.status = "confirmed";
      booking.updatedAt = new Date();
      await booking.save({ session });
      console.log(`Updated booking ${booking.bookingId} status to confirmed`);
    } else {
      console.error(`Booking not found with ID: ${bookingId}`);
    }

    await session.commitTransaction();
    console.log(`Payment processing completed successfully for ${paymentIntentId}`);

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
