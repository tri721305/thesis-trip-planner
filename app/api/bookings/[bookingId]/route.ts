import { NextRequest, NextResponse } from "next/server";
import { HotelBooking } from "@/database";
import dbConnect from "@/lib/mongoose";
import { auth } from "@/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const session = await auth();

    // Optional authentication check - we'll make this more flexible
    // to support public access for specific booking statuses
    const isAuthenticated = !!session?.user;

    await dbConnect();

    const { bookingId } = params;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: "Booking ID is required" },
        { status: 400 }
      );
    }

    console.log("API route: Fetching booking with ID:", bookingId);

    // First try with bookingId field
    let booking = await HotelBooking.findOne({ bookingId })
      .populate("userId", "name email image")
      .populate("paymentId");

    // If not found, try with _id if it looks like an ObjectId
    if (!booking && bookingId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log("API route: Trying to find by ObjectId instead");
      booking = await HotelBooking.findById(bookingId)
        .populate("userId", "name email image")
        .populate("paymentId");
    }

    if (!booking) {
      console.log("API route: Booking not found");
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    // If authenticated, check if user is authorized to view this booking
    if (isAuthenticated) {
      const bookingUserId =
        booking.userId?._id?.toString() || booking.userId?.toString();
      const sessionUserId = session?.user?.id;

      if (bookingUserId !== sessionUserId) {
        console.log("API route: User not authorized to view this booking");
        return NextResponse.json(
          { success: false, error: "Not authorized to view this booking" },
          { status: 403 }
        );
      }
    }

    // Convert Mongoose document to plain object
    const bookingData = JSON.parse(JSON.stringify(booking));

    console.log("API route: Successfully returning booking data");
    console.log("Pricing data available:", !!bookingData.pricing);

    // Return the booking data directly, not nested in a data property
    // This is what the BookingSummary component expects
    return NextResponse.json(bookingData);
  } catch (error: any) {
    console.error("API route: Error fetching booking:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
