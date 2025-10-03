import React from "react";

// Format currency helper
const formatCurrency = (amount: number, currency: string) => {
  try {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return formatter.format(amount);
  } catch (e) {
    // Fallback if formatting fails
    return `${amount} ${currency.toUpperCase()}`;
  }
};

interface BookingSummaryProps {
  booking: {
    bookingId: string;
    hotelName: string;
    checkInDate: string | Date;
    checkOutDate: string | Date;
    rooms?: { roomName: string; quantity: number }[];
    guestCount?: { adults: number; children: number };
    pricing: {
      subtotal: number;
      taxes: number;
      fees: number;
      total: number;
      currency: string;
    };
  };
}

export default function BookingSummary({ booking }: BookingSummaryProps) {
  // Format dates
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString();
  };

  // Get night count
  const getNights = () => {
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="bg-muted/40 p-4 rounded-lg mb-4">
      <h3 className="font-semibold text-lg mb-3">Booking Summary</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Booking ID</span>
          <span>{booking.bookingId}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Hotel</span>
          <span className="font-medium">{booking.hotelName}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Check-in</span>
          <span>{formatDate(booking.checkInDate)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Check-out</span>
          <span>{formatDate(booking.checkOutDate)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Length of stay</span>
          <span>
            {getNights()} night{getNights() > 1 ? "s" : ""}
          </span>
        </div>

        {booking.guestCount && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Guests</span>
            <span>
              {booking.guestCount.adults} adult
              {booking.guestCount.adults > 1 ? "s" : ""}
              {booking.guestCount.children > 0 &&
                `, ${booking.guestCount.children} child${booking.guestCount.children > 1 ? "ren" : ""}`}
            </span>
          </div>
        )}

        <hr className="my-2" />

        {booking.pricing && (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>
                {formatCurrency(
                  booking.pricing.subtotal,
                  booking.pricing.currency
                )}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Taxes</span>
              <span>
                {formatCurrency(
                  booking.pricing.taxes,
                  booking.pricing.currency
                )}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Fees</span>
              <span>
                {formatCurrency(booking.pricing.fees, booking.pricing.currency)}
              </span>
            </div>

            <hr className="my-2" />

            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>
                {formatCurrency(
                  booking.pricing.total,
                  booking.pricing.currency
                )}
              </span>
            </div>
          </>
        )}

        {!booking.pricing && (
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>Pricing information unavailable</span>
          </div>
        )}
      </div>
    </div>
  );
}
