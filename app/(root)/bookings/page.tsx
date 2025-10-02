"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getUserBookings } from "@/lib/actions/booking.action";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, XCircle, Clock, Eye, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

const BookingsPage = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!session?.user) {
        setError("You need to be logged in to view your bookings");
        setLoading(false);
        return;
      }

      try {
        const result = await getUserBookings({
          userId: session.user.id,
        });

        if (!result.success) {
          throw new Error(result.error || "Failed to fetch bookings");
        }

        setBookings(result.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setError("An error occurred while fetching your bookings");
        setLoading(false);
      }
    };

    if (session) {
      fetchUserBookings();
    }
  }, [session]);

  // Format date
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
        <p className="mt-4 text-lg">Loading your bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <XCircle className="h-12 w-12 text-red-500" />
        <p className="mt-4 text-lg text-red-500">{error}</p>

        <div className="flex gap-4 mt-6">
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

          <Button variant="outline" onClick={() => router.push("/")}>
            Return to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Bookings</h1>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="text-center">
              <p className="mb-4 text-lg">You don't have any bookings yet.</p>
              <Button onClick={() => router.push("/hotels")}>
                Start Booking
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all">
          <div className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All Bookings</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all">
            <BookingsList
              bookings={bookings}
              renderBookingStatusBadge={renderBookingStatusBadge}
              renderPaymentStatusBadge={renderPaymentStatusBadge}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
            />
          </TabsContent>

          <TabsContent value="upcoming">
            <BookingsList
              bookings={bookings.filter(
                (b) =>
                  new Date(b.checkInDate) > new Date() &&
                  b.status !== "cancelled"
              )}
              renderBookingStatusBadge={renderBookingStatusBadge}
              renderPaymentStatusBadge={renderPaymentStatusBadge}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
            />
          </TabsContent>

          <TabsContent value="past">
            <BookingsList
              bookings={bookings.filter(
                (b) =>
                  new Date(b.checkOutDate) < new Date() &&
                  b.status !== "cancelled"
              )}
              renderBookingStatusBadge={renderBookingStatusBadge}
              renderPaymentStatusBadge={renderPaymentStatusBadge}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
            />
          </TabsContent>

          <TabsContent value="cancelled">
            <BookingsList
              bookings={bookings.filter((b) => b.status === "cancelled")}
              renderBookingStatusBadge={renderBookingStatusBadge}
              renderPaymentStatusBadge={renderPaymentStatusBadge}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

interface BookingsListProps {
  bookings: any[];
  renderBookingStatusBadge: (status: string) => React.ReactNode;
  renderPaymentStatusBadge: (status: string) => React.ReactNode;
  formatDate: (date: string | Date) => string;
  formatCurrency: (amount: number, currency: string) => string;
}

const BookingsList = ({
  bookings,
  renderBookingStatusBadge,
  renderPaymentStatusBadge,
  formatDate,
  formatCurrency,
}: BookingsListProps) => {
  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <p>No bookings found in this category.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {bookings.map((booking) => (
        <Card key={booking.bookingId} className="overflow-hidden">
          <CardHeader className="bg-gray-50">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <CardTitle className="text-lg">
                  {booking.hotel?.name || "Hotel Booking"}
                </CardTitle>
                <CardDescription>
                  Booking ID: {booking.bookingId}
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                {renderBookingStatusBadge(booking.status)}
                {booking.paymentStatus &&
                  renderPaymentStatusBadge(booking.paymentStatus)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Check-in</p>
                <p className="font-medium">{formatDate(booking.checkInDate)}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500">Check-out</p>
                <p className="font-medium">
                  {formatDate(booking.checkOutDate)}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500">Guests</p>
                <p className="font-medium">
                  {booking.guestCount?.adults || 1} Adults
                  {booking.guestCount?.children > 0 &&
                    `, ${booking.guestCount.children} Children`}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500">Total Price</p>
                <p className="font-medium">
                  {formatCurrency(
                    booking.pricing?.total || 0,
                    booking.pricing?.currency || "USD"
                  )}
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button asChild>
                <Link href={`/bookings/stats?bookingId=${booking.bookingId}`}>
                  <Eye className="w-4 h-4 mr-2" /> View Details
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BookingsPage;
