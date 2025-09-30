import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import connectToDatabase from "@/lib/mongoose";
import Payment from "@/database/payment.model";
import HotelBooking from "@/database/hotel-booking.model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

// Kiểm tra môi trường để quyết định có kiểm tra webhook signature hay không
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const isLocalDevelopment = process.env.NODE_ENV === "development";

export async function POST(req: NextRequest) {
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
        return NextResponse.json(
          { error: "Invalid webhook payload" },
          { status: 400 }
        );
      }
    } else {
      // Trong môi trường production hoặc có webhook secret
      if (!signature) {
        console.error("No Stripe signature found");
        return NextResponse.json(
          { error: "No signature found" },
          { status: 400 }
        );
      }

      if (!endpointSecret) {
        console.error("Missing STRIPE_WEBHOOK_SECRET environment variable");
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
        return NextResponse.json(
          { error: "Webhook signature verification failed" },
          { status: 400 }
        );
      }
    }

    // Handle the event directly
    console.log(`Received event: ${event.type}`);

    // Không cần import handler function ngoài, xử lý trực tiếp tại đây
    let result = { success: true, message: "Processed successfully" };

    // Nếu muốn thêm handler function sau này, có thể uncomment code dưới đây
    // const { handleStripeWebhook } = await import(
    //   "@/lib/actions/payment.action"
    // );
    // const result = await handleStripeWebhook(event);
    //
    // if (!result.success) {
    //   console.error("Error handling webhook:", result.message);
    //   return NextResponse.json({ error: result.message }, { status: 400 });
    // }

    // Keep the legacy handlers as backup
    // Connect to database
    await connectToDatabase();

    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(paymentIntent);
        break;

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(failedPayment);
        break;

      case "charge.dispute.created":
        const dispute = event.data.object as Stripe.Dispute;
        await handleChargeDispute(dispute);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log("💰 Payment succeeded:", paymentIntent.id);

  // Find payment by Stripe PaymentIntent ID
  const payment = await Payment.findOne({
    "stripeInfo.paymentIntentId": paymentIntent.id,
  });

  if (!payment) {
    console.error(
      `❌ Payment not found for PaymentIntent: ${paymentIntent.id}`
    );
    return;
  }

  // Update payment status
  payment.status = "succeeded";
  payment.processedAt = new Date();

  if (payment.stripeInfo) {
    payment.stripeInfo.chargeId = paymentIntent.latest_charge as string;
  }

  await payment.save();

  // Update booking payment status
  const booking = await HotelBooking.findById(payment.bookingId);
  if (booking) {
    booking.paymentStatus = "paid";
    booking.status = "confirmed"; // Auto-confirm booking when payment succeeds
    await booking.save();

    console.log(`✅ Booking ${booking.bookingId} confirmed`);
  }

  console.log(`✅ Payment ${payment.paymentId} marked as succeeded`);
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log("❌ Payment failed:", paymentIntent.id);

  const payment = await Payment.findOne({
    "stripeInfo.paymentIntentId": paymentIntent.id,
  });

  if (!payment) {
    console.error(
      `❌ Payment not found for PaymentIntent: ${paymentIntent.id}`
    );
    return;
  }

  // Update payment status
  payment.status = "failed";
  payment.failedAt = new Date();
  payment.retryCount += 1;

  if (payment.stripeInfo) {
    payment.stripeInfo.failureCode = paymentIntent.last_payment_error?.code;
    payment.stripeInfo.failureMessage =
      paymentIntent.last_payment_error?.message;
  }

  await payment.save();

  // Update booking payment status
  const booking = await HotelBooking.findById(payment.bookingId);
  if (booking) {
    booking.paymentStatus = "failed";
    await booking.save();
  }

  console.log(`❌ Payment ${payment.paymentId} marked as failed`);
}

async function handleChargeDispute(dispute: Stripe.Dispute) {
  console.log("Charge dispute created:", dispute.id);

  // TODO: Handle dispute logic
  // Send notification to admin, etc.
}
