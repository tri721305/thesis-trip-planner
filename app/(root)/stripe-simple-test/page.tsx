"use client";

import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import BookingSummary from "@/components/BookingSummary";
import {
  createStripePaymentIntent,
  createPayment,
  updatePaymentStatus,
} from "@/lib/actions/payment.action";

// Khởi tạo Stripe promise bên ngoài component để tránh tạo lại mỗi khi render
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Props type for SimpleCheckoutForm
interface SimpleCheckoutFormProps {
  clientSecret: string;
  paymentId: string;
}

// Component thanh toán đơn giản
function SimpleCheckoutForm({
  clientSecret,
  paymentId,
}: SimpleCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js chưa load xong
      return;
    }

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // URL trở về sau khi thanh toán (có thể là trang hiện tại)
        return_url: window.location.origin + "/stripe-simple-test",
      },
      redirect: "if_required",
    });

    // Kiểm tra kết quả
    if (paymentIntent) {
      setMessage(`Payment ${paymentIntent.status}: ${paymentIntent.id}`);

      // Nếu thanh toán thành công, cập nhật trạng thái trong database
      if (paymentIntent.status === "succeeded") {
        try {
          setUpdateStatus("Updating payment status in database...");
          const updateResult = await updatePaymentStatus({
            paymentId: paymentId,
            status: "succeeded",
            stripeInfo: {
              paymentIntentId: paymentIntent.id,
              // Đối với Stripe, Charge ID có thể lấy từ API riêng nếu cần
            },
          });

          if (!updateResult) {
            setUpdateStatus(
              "Failed to update payment status: No response from server"
            );
          } else if (updateResult.success) {
            setUpdateStatus("Payment status updated successfully in database!");
          } else {
            const errorMsg =
              typeof updateResult.error === "object"
                ? updateResult.error?.message
                : updateResult.error || "Unknown error";
            setUpdateStatus(`Failed to update payment status: ${errorMsg}`);
          }
        } catch (updateError: any) {
          console.error("Error updating payment status:", updateError);
          setUpdateStatus(
            `Error updating payment status: ${updateError.message}`
          );
        }
      }
    } else if (error) {
      setMessage(`Error: ${error.message}`);
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />

      {message && (
        <div
          className={`p-3 rounded-md ${message.includes("succeeded") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
        >
          {message}
        </div>
      )}

      {updateStatus && (
        <div
          className={`p-3 rounded-md ${updateStatus.includes("successfully") ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}
        >
          {updateStatus}
        </div>
      )}

      <Button type="submit" disabled={!stripe || isLoading} className="w-full">
        {isLoading ? "Đang xử lý..." : "Thanh toán"}
      </Button>
    </form>
  );
}

// Trang test đơn giản
export default function StripeSimpleTestPage() {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isInitiating, setIsInitiating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [isLoadingBooking, setIsLoadingBooking] = useState(false);

  // Check for booking ID in URL when component mounts and fetch booking data
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookingParam = urlParams.get("booking");
    if (bookingParam) {
      setBookingId(bookingParam);

      // Fetch booking data
      const fetchBookingData = async () => {
        setIsLoadingBooking(true);
        try {
          const response = await fetch(`/api/bookings/${bookingParam}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch booking: ${response.statusText}`);
          }
          const data = await response.json();
          setBookingData(data);
        } catch (err: any) {
          console.error("Error fetching booking:", err);
          setError(err.message || "Failed to load booking information");
        } finally {
          setIsLoadingBooking(false);
        }
      };

      fetchBookingData();
    }
  }, []);

  // Hàm tạo payment intent đơn giản
  const handleInitiatePayment = async () => {
    setIsInitiating(true);
    setError(null);

    try {
      if (!bookingId) {
        // Nếu không có bookingId, tạo payment với ID mặc định
        throw new Error("No booking ID found. Please create a booking first.");
      }

      console.log("Creating payment with bookingId:", bookingId);

      // Đầu tiên, lấy thông tin booking để có giá chính xác
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch booking information: ${response.statusText}`
        );
      }

      const bookingData = await response.json();
      console.log("Retrieved booking data:", bookingData);

      // Sử dụng giá và loại tiền tệ từ booking
      const bookingAmount = bookingData.pricing.total;
      const bookingCurrency = bookingData.pricing.currency.toLowerCase();

      // Bước 1: Tạo payment document
      console.log(
        `Calling createPayment with amount: ${bookingAmount} ${bookingCurrency}...`
      );
      const paymentResult = await createPayment({
        bookingId: bookingId, // Sử dụng booking ID từ URL (sẽ được chuyển đổi đúng trong server action)
        amount: bookingAmount,
        currency: bookingCurrency,
        paymentMethod: "stripe",
        breakdown: bookingData.pricing, // Sử dụng breakdown từ dữ liệu booking
        billingDetails: {
          name:
            bookingData.guestInfo?.firstName +
              " " +
              bookingData.guestInfo?.lastName || "Test User",
          email: bookingData.guestInfo?.email || "test@example.com",
          phone: bookingData.guestInfo?.phone || "1234567890",
        },
        description: "Payment for booking " + bookingId,
      });

      console.log("createPayment completed, result:", paymentResult);
      console.log("paymentResult type:", typeof paymentResult);
      console.log(
        "paymentResult keys:",
        paymentResult ? Object.keys(paymentResult) : "null"
      );

      if (!paymentResult) {
        console.error("Payment result is undefined or null");
        throw new Error("Failed to create payment: No response from server");
      }

      if (!paymentResult.success) {
        console.error(
          "Payment creation failed with error:",
          paymentResult.error
        );
        const errorMsg =
          typeof paymentResult.error === "object"
            ? paymentResult.error?.message
            : paymentResult.error || "Failed to create payment";
        throw new Error(errorMsg);
      }

      if (!paymentResult.data) {
        console.error(
          "Payment creation succeeded but no data returned:",
          paymentResult
        );
        throw new Error("No payment data returned from server");
      }

      // Lấy paymentId từ document đã tạo
      console.log("Payment data:", paymentResult.data);
      const paymentId = paymentResult.data.paymentId;

      if (!paymentId) {
        console.error("No paymentId in response data:", paymentResult.data);
        throw new Error("Missing payment ID in server response");
      }

      // Lưu paymentId vào state để sử dụng sau khi thanh toán thành công
      setPaymentId(paymentId);
      console.log("Payment created with ID:", paymentId);

      // Bước 2: Tạo Stripe Payment Intent
      const intentResult = await createStripePaymentIntent({
        amount: bookingAmount,
        currency: bookingCurrency,
        description: `Payment for booking ${bookingId}`,
        paymentId: paymentId,
      });

      if (intentResult.success && intentResult.data?.clientSecret) {
        setClientSecret(intentResult.data.clientSecret);
      } else {
        // Xử lý lỗi từ server
        const errorMessage =
          typeof intentResult.error === "object" && intentResult.error?.message
            ? intentResult.error.message
            : "Failed to create payment intent";
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      console.error("Payment initiation error:", err);
      setError(err.message || "An error occurred");
    } finally {
      setIsInitiating(false);
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-md">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Stripe Simple Test</CardTitle>
        </CardHeader>

        <CardContent>
          {!clientSecret ? (
            <>
              {bookingId ? (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 text-blue-700 rounded-md">
                    Using booking ID: {bookingId}
                  </div>

                  {isLoadingBooking ? (
                    <div className="text-center py-4">
                      Loading booking details...
                    </div>
                  ) : bookingData ? (
                    <BookingSummary booking={bookingData} />
                  ) : null}

                  <p>
                    Click the button below to initiate a test payment for this
                    booking.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p>
                    You need to create a booking first. Please go to the{" "}
                    <a
                      href="/stripe-simple-test-v2"
                      className="text-blue-500 underline"
                    >
                      booking creation page
                    </a>
                    .
                  </p>
                </div>
              )}

              {error && (
                <div className="p-3 mb-4 bg-red-50 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <Button
                onClick={handleInitiatePayment}
                disabled={
                  isInitiating || !bookingId || isLoadingBooking || !bookingData
                }
                className="w-full mt-4"
              >
                {isInitiating
                  ? "Creating payment..."
                  : `Pay ${bookingData?.pricing?.total || ""} ${bookingData?.pricing?.currency || ""}`}
              </Button>
            </>
          ) : (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              {paymentId ? (
                <SimpleCheckoutForm
                  clientSecret={clientSecret}
                  paymentId={paymentId}
                />
              ) : (
                <div className="p-3 bg-red-50 text-red-700 rounded-md">
                  Payment ID is missing. Please restart the payment process.
                </div>
              )}
            </Elements>
          )}
        </CardContent>

        <CardFooter className="text-xs text-gray-500">
          {/* <p>This is a simple test for Stripe integration.</p> */}
        </CardFooter>
      </Card>
    </div>
  );
}
