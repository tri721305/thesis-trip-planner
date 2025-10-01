"use server";

import connectToDatabase from "@/lib/mongoose";
import { Payment } from "@/database";
import { handleError } from "@/lib/handler/error";
import type { ActionResponse, ErrorResponse } from "@/types/action";

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

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}