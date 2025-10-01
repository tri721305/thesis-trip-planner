"use client";

import React from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import PriceBreakdown from "./PriceBreakdown";
import { ScrollArea } from "./ui/scroll-area";

interface BookingConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  hotelName: string;
  roomName: string;
  checkInDate: Date;
  checkOutDate: Date;
  nights: number;
  rooms: number;
  adults: number;
  children: number;
  subtotal: number;
  taxes: number;
  fees: number;
  total: number;
  currency: string;
  cancellationPolicy?: string;
  isProcessing: boolean;
  warningMessage?: string; // Thêm trường cảnh báo tùy chọn
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  hotelName,
  roomName,
  checkInDate,
  checkOutDate,
  nights,
  rooms,
  adults,
  children,
  subtotal,
  taxes,
  fees,
  total,
  currency,
  cancellationPolicy = "Non-refundable",
  isProcessing,
  warningMessage,
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const priceItems = [
    {
      label: `Room rate (${nights} ${nights === 1 ? "night" : "nights"}, ${rooms} ${rooms === 1 ? "room" : "rooms"})`,
      amount: subtotal,
      tooltip: `${rooms} ${rooms === 1 ? "room" : "rooms"} × ${nights} ${nights === 1 ? "night" : "nights"}`,
    },
    {
      label: "Taxes (10%)",
      amount: taxes,
      tooltip: "10% of the room rate subtotal",
    },
    {
      label: "Service fees (5%)",
      amount: fees,
      tooltip: "5% platform service fee",
    },
    {
      label: "Total",
      amount: total,
      isTotal: true,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Confirm Your Booking</DialogTitle>
          <DialogDescription>
            Please review the details of your booking
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 p-1">
            <div>
              <h3 className="font-bold text-lg">{hotelName}</h3>
              <p className="text-sm text-muted-foreground">{roomName}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">Check-in</p>
                <p className="text-sm">{formatDate(checkInDate)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Check-out</p>
                <p className="text-sm">{formatDate(checkOutDate)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Guests</p>
                <p className="text-sm">
                  {adults} adults{children > 0 ? `, ${children} children` : ""}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Rooms</p>
                <p className="text-sm">
                  {rooms} {rooms === 1 ? "room" : "rooms"}
                </p>
              </div>
            </div>

            <div className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-900">
              <p className="text-sm font-medium mb-2">Price Details</p>
              <PriceBreakdown items={priceItems} currency={currency} />
            </div>

            <div className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-900">
              <p className="text-sm font-medium mb-2">Cancellation Policy</p>
              <p className="text-sm text-muted-foreground">
                {cancellationPolicy}
              </p>
            </div>

            {warningMessage && (
              <div className="border rounded-lg p-3 bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800">
                <p className="text-sm font-medium mb-1 text-amber-700 dark:text-amber-500">
                  Lưu ý quan trọng
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  {warningMessage}
                </p>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              By proceeding, you agree to our terms of service and acknowledge
              our privacy policy.
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-primary-500 hover:bg-orange-500 text-white"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Confirm & Proceed to Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingConfirmation;
