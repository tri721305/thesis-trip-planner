"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createHotelBooking } from "@/lib/actions/booking.action";

export default function StripeSimpleTestV2() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    fullName: "Test User",
    email: "test@example.com",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Bước 1: Tạo booking đơn giản
  const handleCreateBooking = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Tạo dữ liệu booking đơn giản theo cấu trúc tham số createHotelBooking
      const bookingData = {
        bookingId: `HB${Date.now().toString(36).toUpperCase()}`,
        // Các trường riêng lẻ cho hotel như hàm createHotelBooking mong đợi
        hotelId: 12345, // ID giả
        hotelName: "Test Hotel",
        hotelLocation: {
          longitude: 105.8342,
          latitude: 21.0278,
        },
        hotelAddress: "123 Test Street",
        hotelImages: [{ url: "https://example.com/test-image.jpg" }],
        hotelAmenities: ["Wi-Fi", "Pool", "Breakfast"],
        hotelRating: {
          value: 4.5,
          source: "test",
        },
        rooms: [
          {
            roomName: "Deluxe Room",
            roomType: "Deluxe",
            maxPeople: {
              total: 2,
              adults: 2,
              children: 0,
            },
            amenities: ["Wi-Fi", "TV", "Air Conditioning"],
            pricePerNight: 100,
            currency: "usd",
            quantity: 1,
            bedGroups: ["1 King Bed"],
          },
        ],
        checkInDate: new Date(),
        checkOutDate: new Date(Date.now() + 86400000 * 3), // 3 ngày sau
        guestInfo: {
          firstName: formData.fullName.split(" ")[0],
          lastName: formData.fullName.split(" ").slice(1).join(" ") || "User",
          email: formData.email,
          phone: "1234567890",
        },
        guestCount: {
          adults: 2,
          children: 0,
        },
        pricing: {
          subtotal: 300,
          taxes: 30,
          fees: 15,
          total: 345,
          currency: "usd",
        },
        // userId phải được chuyển đổi ở server - hãy sửa đổi cách xử lý trong action
        // mặc dù vậy chúng ta vẫn truyền vào để server xử lý
        userId: "65eab7c43e5df5f0556b4e57",
        source: "web",
      };

      console.log("bookingData", bookingData);
      console.log("Sending booking data to server:", bookingData);
      const response = await createHotelBooking(bookingData);
      console.log("createBookingResult:", response);

      if (response.success && response.data) {
        // Log the full response data for debugging
        console.log("Response data type:", typeof response.data);
        console.log("Response data properties:", Object.keys(response.data));

        // Check if bookingId exists in the response
        if (!response.data.bookingId) {
          console.error("Missing bookingId in response:", response.data);
          throw new Error("Response data is missing bookingId");
        }

        setResult(
          `Booking created successfully: ${JSON.stringify(response.data.bookingId)}`
        );
        setBookingId(response.data.bookingId);
        setPaymentStep(2); // Chuyển sang bước thanh toán
      } else {
        console.error("Error response:", response);
        throw new Error(response.error?.message || "Failed to create booking");
      }
    } catch (err: any) {
      console.error("Booking creation error:", err);
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-md">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Super Simple Stripe Test</CardTitle>
        </CardHeader>

        <CardContent>
          {paymentStep === 1 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <Button
                onClick={handleCreateBooking}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Creating booking..." : "Create Test Booking"}
              </Button>
            </div>
          ) : paymentStep === 2 && bookingId ? (
            <div className="space-y-4">
              <div className="p-3 bg-green-50 text-green-700 rounded-md">
                {result}
              </div>

              <p>Bước tiếp theo: Sử dụng booking ID để tạo payment</p>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => {
                    // Since we already have the bookingId string, we don't need anything else
                    // The server has been modified to work with bookingId string instead of MongoDB _id
                    const redirectUrl = `/stripe-simple-test?booking=${bookingId}`;
                    window.location.href = redirectUrl;
                  }}
                >
                  Tiếp tục với Payment
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setPaymentStep(1);
                    setBookingId(null);
                    setResult(null);
                  }}
                >
                  Tạo booking mới
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
