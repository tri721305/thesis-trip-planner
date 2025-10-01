import { NextRequest, NextResponse } from "next/server";
import { HotelBooking } from "@/database";
import connectToDatabase from "@/lib/mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    await connectToDatabase();

    const { bookingId } = params;

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    const booking = await HotelBooking.findOne({ bookingId });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Convert Mongoose document to plain object
    const bookingData = JSON.parse(JSON.stringify(booking));

    return NextResponse.json(bookingData);
  } catch (error: any) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
