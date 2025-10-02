import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import connectToDatabase from "@/lib/mongoose";
import Payment from "@/database/payment.model";
import HotelBooking from "@/database/hotel-booking.model";
import mongoose from "mongoose";
import { updatePaymentStatus } from "@/lib/actions/payment.action";
import { revalidatePath } from "next/cache";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

// Kiểm tra môi trường để quyết định có kiểm tra webhook signature hay không
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const isLocalDevelopment = process.env.NODE_ENV === "development";

export async function POST(req: NextRequest) {
  // Start a MongoDB session for transaction support
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    let event: Stripe.Event;

    // Xử lý khác nhau tùy theo môi trường
    if (isLocalDevelopment && !endpointSecret) {
      // Trong môi trường development mà không có webhook secret
      console.log(
        "Running in local development mode without signature verification"
      );

      try {
        // Đọc trực tiếp body là một JSON payload
        event = JSON.parse(body) as Stripe.Event;
        console.log("Parsed webhook event:", event.type);
      } catch (err) {
        console.error("Error parsing webhook payload:", err);
        await session.abortTransaction();
        return NextResponse.json(
          { error: "Invalid webhook payload" },
          { status: 400 }
        );
      }
    } else {
      // Trong môi trường production hoặc có webhook secret
      if (!signature) {
        console.error("No Stripe signature found");
        await session.abortTransaction();
        return NextResponse.json(
          { error: "No signature found" },
          { status: 400 }
        );
      }

      if (!endpointSecret) {
        console.error("Missing STRIPE_WEBHOOK_SECRET environment variable");
        await session.abortTransaction();
        return NextResponse.json(
          { error: "Server configuration error" },
          { status: 500 }
        );
      }

      try {
        // Verify webhook signature
        event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
      } catch (err) {
        console.error("Webhook signature verification failed:", err);
        await session.abortTransaction();
        return NextResponse.json(
          { error: "Webhook signature verification failed" },
          { status: 400 }
        );
      }
    }

    // Handle the event directly
    console.log(`Received event: ${event.type}`);

    // Connect to database
    await connectToDatabase();

    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(paymentIntent, session);
        break;

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(failedPayment, session);
        break;

      case "charge.dispute.created":
        const dispute = event.data.object as Stripe.Dispute;
        await handleChargeDispute(dispute, session);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    await session.commitTransaction();
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    await session.abortTransaction();
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}

async function handlePaymentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  session: mongoose.ClientSession
) {
  console.log("💰 Payment succeeded:", paymentIntent.id);

  // Try multiple methods to find the payment
  // 1. First try by paymentIntentId
  let payment = await Payment.findOne(
    { "stripeInfo.paymentIntentId": paymentIntent.id },
    null,
    { session }
  );

  // 2. If not found, try using metadata
  if (!payment && paymentIntent.metadata?.paymentId) {
    console.log(
      `Searching by paymentId from metadata: ${paymentIntent.metadata.paymentId}`
    );
    payment = await Payment.findOne(
      { paymentId: paymentIntent.metadata.paymentId },
      null,
      { session }
    );
  }

  // 3. If still not found, try finding by bookingId
  if (!payment && paymentIntent.metadata?.bookingId) {
    console.log(
      `Searching by bookingId from metadata: ${paymentIntent.metadata.bookingId}`
    );
    const booking = await HotelBooking.findOne(
      { bookingId: paymentIntent.metadata.bookingId },
      null,
      { session }
    );

    if (booking && booking.paymentId) {
      payment = await Payment.findById(booking.paymentId, null, { session });
    }
  }

  if (!payment) {
    console.error(
      `❌ Payment not found for PaymentIntent: ${paymentIntent.id}`
    );
    return;
  }

  // Check if payment is already marked as succeeded to prevent duplicate processing
  if (payment.status === "succeeded") {
    console.log(
      `Payment ${payment.paymentId} already marked as succeeded. Skipping update.`
    );
    return;
  }

  // Update payment status
  payment.status = "succeeded";
  payment.processedAt = new Date();
  payment.transactionId = paymentIntent.id;

  if (!payment.stripeInfo) {
    payment.stripeInfo = {};
  }
  payment.stripeInfo.paymentIntentId = paymentIntent.id;
  payment.stripeInfo.chargeId = paymentIntent.latest_charge as string;

  await payment.save({ session });

  // Update booking payment status
  const booking = await HotelBooking.findById(payment.bookingId, null, {
    session,
  });
  if (booking) {
    booking.paymentStatus = "paid";
    booking.status = "confirmed"; // Auto-confirm booking when payment succeeds
    await booking.save({ session });

    console.log(`✅ Booking ${booking.bookingId} confirmed`);
  }

  console.log(`✅ Payment ${payment.paymentId} marked as succeeded`);

  // Revalidate path to update UI
  revalidatePath("/bookings");
}

async function handlePaymentFailed(
  paymentIntent: Stripe.PaymentIntent,
  session: mongoose.ClientSession
) {
  console.log("❌ Payment failed:", paymentIntent.id);

  // Same multi-method search as in handlePaymentSucceeded
  let payment = await Payment.findOne(
    { "stripeInfo.paymentIntentId": paymentIntent.id },
    null,
    { session }
  );

  if (!payment && paymentIntent.metadata?.paymentId) {
    payment = await Payment.findOne(
      { paymentId: paymentIntent.metadata.paymentId },
      null,
      { session }
    );
  }

  if (!payment && paymentIntent.metadata?.bookingId) {
    const booking = await HotelBooking.findOne(
      { bookingId: paymentIntent.metadata.bookingId },
      null,
      { session }
    );

    if (booking && booking.paymentId) {
      payment = await Payment.findById(booking.paymentId, null, { session });
    }
  }

  if (!payment) {
    console.error(
      `❌ Payment not found for PaymentIntent: ${paymentIntent.id}`
    );
    return;
  }

  // Check if payment is already marked as failed to prevent duplicate processing
  if (payment.status === "failed") {
    console.log(
      `Payment ${payment.paymentId} already marked as failed. Skipping update.`
    );
    return;
  }

  // Update payment status
  payment.status = "failed";
  payment.failedAt = new Date();
  payment.retryCount = (payment.retryCount || 0) + 1;

  if (!payment.stripeInfo) {
    payment.stripeInfo = {};
  }
  payment.stripeInfo.paymentIntentId = paymentIntent.id;
  payment.stripeInfo.failureCode = paymentIntent.last_payment_error?.code;
  payment.stripeInfo.failureMessage = paymentIntent.last_payment_error?.message;

  await payment.save({ session });

  // Update booking payment status
  const booking = await HotelBooking.findById(payment.bookingId, null, {
    session,
  });
  if (booking) {
    booking.paymentStatus = "failed";
    await booking.save({ session });
  }

  console.log(`❌ Payment ${payment.paymentId} marked as failed`);

  // Revalidate path to update UI
  revalidatePath("/bookings");
}

async function handleChargeDispute(
  dispute: Stripe.Dispute,
  session: mongoose.ClientSession
) {
  console.log("⚠️ Charge dispute created:", dispute.id);

  // Find the charge that was disputed
  const chargeId = dispute.charge as string;
  if (!chargeId) {
    console.error("No charge ID found in dispute");
    return;
  }

  // Find payment by chargeId
  const payment = await Payment.findOne(
    { "stripeInfo.chargeId": chargeId },
    null,
    { session }
  );

  if (!payment) {
    console.error(`❌ Payment not found for charge: ${chargeId}`);
    return;
  }

  // Update payment with dispute information
  if (!payment.stripeInfo) {
    payment.stripeInfo = {};
  }

  // Create a notes entry about the dispute
  const disputeNote = `Dispute created: ${dispute.id}. Reason: ${dispute.reason}. Status: ${dispute.status}`;

  if (payment.notes) {
    payment.notes += `\n${disputeNote}`;
  } else {
    payment.notes = disputeNote;
  }

  await payment.save({ session });

  // TODO: Implement more comprehensive dispute handling
  // - Flag the booking for admin review
  // - Send notification to admin
  // - Update booking status if necessary

  console.log(`⚠️ Added dispute information to payment ${payment.paymentId}`);
}
