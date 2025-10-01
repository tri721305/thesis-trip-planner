import { NextRequest, NextResponse } from "next/server";
import { resetProcessingPayment } from "@/lib/actions/payment.action";
import { auth } from "@/auth";

/**
 * API route to reset a payment that is stuck in processing state
 * POST /api/payments/reset/{paymentId}
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paymentId } = params;

    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    // Reset the payment
    const result = await resetProcessingPayment(paymentId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to reset payment" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error resetting payment:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}