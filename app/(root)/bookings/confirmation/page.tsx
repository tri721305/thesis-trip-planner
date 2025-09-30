"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Trong một ứng dụng thực tế, bạn sẽ fetch booking từ server
  useEffect(() => {
    // Mô phỏng API call
    const simulateApiCall = async () => {
      try {
        setLoading(true);
        // Trong thực tế, đây sẽ là lệnh gọi API thực sự
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setBooking({
          bookingId: bookingId || "BOOK-12345",
          status: "confirmed",
          hotel: {
            name: "Ocean Paradise Resort",
            location: "Phuket, Thailand",
          },
          checkInDate: new Date().toLocaleDateString(),
          checkOutDate: new Date(
            Date.now() + 86400000 * 3
          ).toLocaleDateString(),
          price: {
            total: 450,
          },
        });
      } catch (err) {
        setError("Unable to load booking details");
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      simulateApiCall();
    } else {
      setError("No booking ID provided");
      setLoading(false);
    }
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-2xl">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-center text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>{error}</p>
            <Button asChild className="mt-6">
              <Link href="/">Return Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl">
      <Card className="w-full">
        <CardHeader className="text-center border-b pb-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-700">
            Booking Confirmed!
          </CardTitle>
          <p className="text-gray-500 mt-2">Thank you for your booking</p>
          <p className="font-semibold mt-2">
            Booking Reference: {booking.bookingId}
          </p>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">{booking.hotel.name}</h3>
              <p className="text-gray-500">{booking.hotel.location}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-b py-4">
              <div>
                <p className="text-sm text-gray-500">Check-in</p>
                <p className="font-medium">{booking.checkInDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Check-out</p>
                <p className="font-medium">{booking.checkOutDate}</p>
              </div>
            </div>

            <div className="border-b pb-4">
              <div className="flex justify-between mb-2">
                <span>Total Price</span>
                <span className="font-bold">
                  ${booking.price.total.toFixed(2)}
                </span>
              </div>
              <div className="text-sm text-green-600">
                <span>✓ Payment completed</span>
              </div>
            </div>

            <div className="text-center space-y-4">
              <p className="text-sm text-gray-500">
                A confirmation email has been sent to your email address.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild variant="outline">
                  <Link href="/hotel-booking-test">Book Another Room</Link>
                </Button>
                <Button asChild>
                  <Link href="/">Return to Home</Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
