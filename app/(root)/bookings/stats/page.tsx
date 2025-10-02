"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { getPayments } from "@/lib/actions/payment.action";
// Import trực tiếp cả hai phương thức để đảm bảo chúng được export đúng cách
import {
  getHotelBookingById,
  getBookingById,
} from "@/lib/actions/booking.action";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const BookingStats = () => {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const paymentSuccess = searchParams.get("success") === "true";
  const { data: session } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      console.log("Starting to fetch booking details with ID:", bookingId);
      console.log("Session status:", session ? "Logged in" : "Not logged in");

      if (!bookingId) {
        setError("Booking information not found - Invalid ID");
        setLoading(false);
        return;
      }

      if (!session?.user) {
        setError("You need to be logged in to view booking details");
        setLoading(false);
        return;
      }

      try {
        console.log("Calling getHotelBookingById with ID:", bookingId);

        // Thử sử dụng getBookingById thay vì getHotelBookingById nếu gặp vấn đề
        let bookingResult;
        try {
          // Lấy thông tin booking
          bookingResult = await getHotelBookingById(bookingId);
          console.log("Response from getHotelBookingById:", bookingResult);
        } catch (innerError) {
          console.error(
            "Error with getHotelBookingById, trying getBookingById instead:",
            innerError
          );

          try {
            // Thử import động getBookingById nếu cần
            const { getBookingById } = await import(
              "@/lib/actions/booking.action"
            );
            bookingResult = await getBookingById(bookingId);
            console.log(
              "Response from fallback getBookingById:",
              bookingResult
            );
          } catch (fallbackError) {
            console.error(
              "Both server actions failed, trying API route:",
              fallbackError
            );

            // Thử dùng API route nếu cả hai server action đều thất bại
            const response = await fetch(`/api/bookings/${bookingId}`);
            if (!response.ok) {
              throw new Error(
                `API route failed with status: ${response.status}`
              );
            }

            const data = await response.json();
            console.log("Response from API route:", data);

            // Định dạng kết quả để giống với server action response
            bookingResult = {
              success: true,
              data: data,
            };
          }
        }

        if (!bookingResult) {
          console.error("No response received from booking API");
          setError("No response received from API");
          setLoading(false);
          return;
        }

        if (!bookingResult.success || !bookingResult.data) {
          console.error(
            "Booking API returned error:",
            bookingResult.error || "No data found"
          );
          setError("Booking information not found");
          setLoading(false);
          return;
        }

        console.log("Successfully retrieved booking data:", bookingResult.data);
        setBooking(bookingResult.data);

        // Lấy thông tin payment từ booking
        if (bookingResult.data.paymentId) {
          console.log(
            "Fetching payment info for paymentId:",
            bookingResult.data.paymentId
          );
          const paymentsResult = await getPayments({
            bookingId: bookingId,
          });

          console.log("Payment API response:", paymentsResult);

          if (
            paymentsResult?.success &&
            paymentsResult.data?.payments?.length > 0
          ) {
            console.log("Payment data found:", paymentsResult.data.payments[0]);
            setPayment(paymentsResult.data.payments[0]);
          } else {
            console.log("No payment data found or unsuccessful response");
          }
        } else {
          console.log("No paymentId found in booking data");
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching booking details:", error);
        let errorMessage =
          "An error occurred while retrieving booking information";

        // Add error details if available
        if (error instanceof Error) {
          errorMessage += `: ${error.message}`;
        }

        setError(errorMessage);
        setLoading(false);
      }
    };

    if (session) {
      fetchBookingDetails();
    }
  }, [bookingId, session]);

  // Format date
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  };

  // Render payment status badge
  const renderPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "succeeded":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-4 h-4 mr-1" /> Paid
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-500">
            <Clock className="w-4 h-4 mr-1" /> Processing
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-500">
            <XCircle className="w-4 h-4 mr-1" /> Failed
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500">
            <Clock className="w-4 h-4 mr-1" /> Pending
          </Badge>
        );
    }
  };

  // Render booking status badge
  const renderBookingStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-4 h-4 mr-1" /> Confirmed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500">
            <Clock className="w-4 h-4 mr-1" /> Pending
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-500">
            <XCircle className="w-4 h-4 mr-1" /> Cancelled
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-blue-500">
            <CheckCircle className="w-4 h-4 mr-1" /> Completed
          </Badge>
        );
      case "no-show":
        return (
          <Badge className="bg-gray-500">
            <XCircle className="w-4 h-4 mr-1" /> No Show
          </Badge>
        );
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
        <p className="mt-4 text-lg">Loading booking information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <XCircle className="h-12 w-12 text-red-500" />
        <p className="mt-4 text-lg text-red-500">{error}</p>

        <div className="flex gap-4 mt-6">
          <Button variant="outline" onClick={() => router.push("/bookings")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> View All Bookings
          </Button>

          <Button
            onClick={() => {
              setLoading(true);
              setError(null);
              // Force reload the current page
              window.location.reload();
            }}
          >
            Try Again
          </Button>
        </div>

        {/* Display debug information if bookingId exists */}
        {bookingId && (
          <div className="mt-8 p-4 bg-gray-100 rounded-md text-sm max-w-lg w-full">
            <h3 className="font-bold mb-2">Support Information:</h3>
            <p>Booking ID: {bookingId}</p>
            <p>User ID: {session?.user?.id || "Not logged in"}</p>
            <p>Session valid: {session ? "Yes" : "No"}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      {paymentSuccess && (
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
          <div className="flex justify-center mb-2">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-green-800">
            Payment Successful!
          </h2>
          <p className="text-green-700">
            Thank you for your booking. Booking details are displayed below.
          </p>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Booking Details</h1>
        <Button variant="outline" onClick={() => router.push("/bookings")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>

      {booking && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>
                    Booking Information{" "}
                    {renderBookingStatusBadge(booking.status)}
                  </span>
                  <span className="text-sm font-normal">
                    ID: {booking.bookingId}
                  </span>
                </CardTitle>
                <CardDescription>
                  Booked on: {formatDate(booking.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="booking-info">
                  <TabsList className="mb-4">
                    <TabsTrigger value="booking-info">Booking Info</TabsTrigger>
                    <TabsTrigger value="hotel-info">Hotel Info</TabsTrigger>
                    <TabsTrigger value="guest-info">Guest Info</TabsTrigger>
                  </TabsList>

                  <TabsContent value="booking-info">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Room Details</h3>
                        {booking.rooms.map((room: any, index: number) => (
                          <div
                            key={index}
                            className="p-4 border rounded-md mb-3"
                          >
                            <div className="flex justify-between">
                              <span className="font-medium">
                                {room.roomName}
                              </span>
                              <span>{room.quantity} room(s)</span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              <p>
                                {room.bedGroups?.join(", ") || "King Size Bed"}
                              </p>
                              <p>
                                Maximum capacity: {room.maxPeople?.adults || 2}{" "}
                                adults, {room.maxPeople?.children || 0} children
                              </p>
                              <p className="mt-1 font-medium">
                                {formatCurrency(
                                  room.pricePerNight,
                                  room.currency
                                )}{" "}
                                / night
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center p-4 border rounded-md bg-gray-50">
                        <div>
                          <p className="text-sm">Check-in</p>
                          <p className="font-medium">
                            {formatDate(booking.checkInDate)}
                          </p>
                          <p className="text-sm text-gray-500">After 2:00 PM</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">
                            {booking.nights} night(s)
                          </p>
                        </div>
                        <div>
                          <p className="text-sm">Check-out</p>
                          <p className="font-medium">
                            {formatDate(booking.checkOutDate)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Before 12:00 PM
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="hotel-info">
                    <div className="space-y-3">
                      <div className="flex gap-4 items-start">
                        {booking.hotel.images &&
                          booking.hotel.images.length > 0 && (
                            <div className="flex-shrink-0">
                              <img
                                src={booking.hotel.images[0].url}
                                alt={booking.hotel.name}
                                className="w-32 h-32 object-cover rounded-md"
                              />
                            </div>
                          )}
                        <div>
                          <h3 className="font-medium text-lg">
                            {booking.hotel.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {booking.hotel.address || "Không có địa chỉ"}
                          </p>

                          {booking.hotel.rating && (
                            <div className="flex items-center mb-2">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {booking.hotel.rating.value} ★
                              </span>
                              <span className="ml-2 text-xs text-gray-600">
                                {booking.hotel.rating.source || "Rating"}
                              </span>
                            </div>
                          )}

                          {booking.hotel.amenities &&
                            booking.hotel.amenities.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {booking.hotel.amenities
                                  .slice(0, 5)
                                  .map((amenity: string, i: number) => (
                                    <span
                                      key={i}
                                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                                    >
                                      {amenity}
                                    </span>
                                  ))}
                                {booking.hotel.amenities.length > 5 && (
                                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                                    +{booking.hotel.amenities.length - 5}
                                  </span>
                                )}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="guest-info">
                    <div className="space-y-4">
                      <div className="p-4 border rounded-md">
                        <h3 className="font-medium mb-3">Guest Information</h3>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p>
                              {booking.guestInfo.firstName}{" "}
                              {booking.guestInfo.lastName}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p>{booking.guestInfo.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p>{booking.guestInfo.phone || "Not provided"}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 border rounded-md">
                        <h3 className="font-medium mb-3">Guest Count</h3>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm text-gray-500">Adults</p>
                            <p>{booking.guestCount.adults} person(s)</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Children</p>
                            <p>{booking.guestCount.children} person(s)</p>
                          </div>
                        </div>
                      </div>
                      {booking.specialRequests && (
                        <div className="p-4 border rounded-md">
                          <h3 className="font-medium mb-2">Special Requests</h3>
                          <p>{booking.specialRequests}</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                {payment && (
                  <CardDescription className="flex justify-between items-center">
                    <span>Payment ID: {payment.paymentId}</span>
                    {renderPaymentStatusBadge(payment.status)}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {payment ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method</span>
                      <span className="font-medium">
                        {payment.paymentMethod || "Stripe"}
                      </span>
                    </div>
                    {payment.processedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Date</span>
                        <span>{formatDate(payment.processedAt)}</span>
                      </div>
                    )}
                    <Separator />
                  </>
                ) : (
                  <div className="flex justify-center items-center py-4">
                    <Badge className="bg-yellow-500">
                      <Clock className="w-4 h-4 mr-1" /> Payment Pending
                    </Badge>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Room Price</span>
                  <span>
                    {formatCurrency(
                      booking.pricing.subtotal,
                      booking.pricing.currency
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes</span>
                  <span>
                    {formatCurrency(
                      booking.pricing.taxes,
                      booking.pricing.currency
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Fees</span>
                  <span>
                    {formatCurrency(
                      booking.pricing.fees,
                      booking.pricing.currency
                    )}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>
                    {formatCurrency(
                      booking.pricing.total,
                      booking.pricing.currency
                    )}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                {booking.paymentStatus === "pending" ? (
                  <Button className="w-full bg-primary-500 hover:bg-primary-600">
                    Pay Now
                  </Button>
                ) : booking.status === "confirmed" ? (
                  <div className="w-full text-center p-3 bg-green-50 text-green-700 rounded-md">
                    <CheckCircle className="inline-block mr-2 h-5 w-5" />
                    Confirmed
                  </div>
                ) : booking.status === "cancelled" ? (
                  <div className="w-full text-center p-3 bg-red-50 text-red-700 rounded-md">
                    <XCircle className="inline-block mr-2 h-5 w-5" />
                    Cancelled
                  </div>
                ) : null}

                <Button variant="outline" className="w-full" asChild>
                  <Link href="/bookings">View All Bookings</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm">
                  If you have any questions about this booking, please contact
                  us via:
                </p>
                <div className="space-y-2">
                  <p className="flex items-center text-sm">
                    <span className="font-medium mr-2">Email:</span>
                    <a
                      href="mailto:support@tripplanner.com"
                      className="text-blue-600"
                    >
                      support@tripplanner.com
                    </a>
                  </p>
                  <p className="flex items-center text-sm">
                    <span className="font-medium mr-2">Phone:</span>
                    <a href="tel:+84123456789" className="text-blue-600">
                      +84 123 456 789
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingStats;
