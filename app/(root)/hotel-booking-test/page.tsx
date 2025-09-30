"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BookingForm from "@/components/forms/BookingForm";
import StripeCheckout from "@/components/payment/StripeCheckout";
import BookingConfirmationModal from "@/components/modal/BookingConfirmationModal";
import { useRouter } from "next/navigation";

// Mẫu phòng khách sạn theo interface Room
const AVAILABLE_ROOMS = [
  {
    roomId: "room-1",
    roomNumber: "101",
    roomType: "Deluxe King",
    capacity: 2,
    amenities: ["King Bed", "Sea View", "Free WiFi", "Minibar"],
    price: 150,
    discountedPrice: 120,
  },
  {
    roomId: "room-2",
    roomNumber: "201",
    roomType: "Executive Suite",
    capacity: 3,
    amenities: [
      "King Bed",
      "Living Room",
      "Ocean View",
      "Free WiFi",
      "Bathtub",
    ],
    price: 250,
    discountedPrice: undefined,
  },
];

export default function HotelBookingTestPage() {
  // Cách tiếp cận cực kỳ đơn giản, tránh bất kỳ logic phức tạp nào

  // Dùng 1 state duy nhất để theo dõi trạng thái hiện tại
  const [currentState, setCurrentState] = useState<{
    view: "booking" | "payment" | "confirmation";
    bookingId?: string;
    clientSecret?: string;
  }>({
    view: "booking",
  });

  // Các hàm xử lý chuyển đổi state đơn giản
  function handleBookingCompleted(bookingId: string, clientSecret: string) {
    console.log(`Booking completed - ID: ${bookingId}`);

    // Chỉ cần cập nhật state một lần
    setCurrentState({
      view: "payment",
      bookingId,
      clientSecret,
    });
  }

  function handlePaymentCompleted() {
    console.log("Payment completed");

    setCurrentState((prev) => ({
      view: "confirmation",
      bookingId: prev.bookingId,
    }));
  }

  function handleConfirmationClosed() {
    console.log("Confirmation closed");
    // Không làm gì với navigation, chỉ hiện thông báo
    window.alert(`Booking confirmed! ID: ${currentState.bookingId}`);
  }

  function handleCancelPayment() {
    console.log("Payment cancelled");
    setCurrentState({ view: "booking" });
  }

  // Render UI cực kỳ đơn giản dựa vào trạng thái
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Hotel Booking Demo (Simple)
      </h1>

      {/* BOOKING VIEW */}
      {currentState.view === "booking" && (
        <Card>
          <CardHeader>
            <CardTitle>Ocean Paradise Resort</CardTitle>
            <CardDescription>123 Beach Road, Patong, Phuket</CardDescription>
          </CardHeader>
          <CardContent>
            <BookingForm
              hotelId="hotel-1"
              hotelName="Ocean Paradise Resort"
              hotelLocation="Patong, Phuket"
              hotelAddress="123 Beach Road, Patong, Phuket"
              hotelImages={[
                "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4",
              ]}
              hotelRating={4.7}
              availableRooms={AVAILABLE_ROOMS}
              userId="user-1"
              onSuccess={(bookingId, clientSecret) => {
                // Dùng cách tiếp cận đơn giản, không callback phức tạp
                if (bookingId && clientSecret) {
                  handleBookingCompleted(bookingId, clientSecret);
                }
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* PAYMENT VIEW */}
      {currentState.view === "payment" &&
        currentState.clientSecret &&
        currentState.bookingId && (
          <Card>
            <CardHeader>
              <CardTitle>Complete Payment</CardTitle>
              <CardDescription>
                Payment for your stay at Ocean Paradise Resort
              </CardDescription>
              <Button
                variant="outline"
                onClick={handleCancelPayment}
                className="mt-2"
              >
                Back to Booking
              </Button>
            </CardHeader>
            <CardContent>
              <StripeCheckout
                clientSecret={currentState.clientSecret}
                bookingId={currentState.bookingId}
                onSuccess={() => handlePaymentCompleted()}
                onCancel={() => handleCancelPayment()}
              />
            </CardContent>
          </Card>
        )}

      {/* CONFIRMATION VIEW */}
      {currentState.view === "confirmation" && (
        <Card className="p-6 text-center">
          <CardHeader>
            <CardTitle>Booking Confirmed!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Thank you for your booking.</p>
            <p className="font-semibold">
              Booking ID: {currentState.bookingId}
            </p>
            <Button onClick={() => handleConfirmationClosed()} className="mt-6">
              Close
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
