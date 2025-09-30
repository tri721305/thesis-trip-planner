"use client";

import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: "success" | "error" | "pending";
  bookingId?: string;
  errorMessage?: string;
}

export default function BookingConfirmationModal({
  isOpen,
  onClose,
  status,
  bookingId,
  errorMessage,
}: BookingConfirmationModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(isOpen);

  // Sync with parent state
  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const viewBooking = () => {
    router.push(`/bookings/confirmation?booking_id=${bookingId}`);
    handleClose();
  };

  const returnHome = () => {
    router.push("/");
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto">
            {status === "success" && (
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            )}
            {status === "error" && (
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            )}
            {status === "pending" && (
              <div className="mx-auto w-12 h-12 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
          <DialogTitle className="text-center pt-4">
            {status === "success" && "Booking Confirmed!"}
            {status === "error" && "Booking Error"}
            {status === "pending" && "Processing Your Booking"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {status === "success" && (
              <>Your booking has been confirmed. Booking ID: {bookingId}</>
            )}
            {status === "error" && (
              <>{errorMessage || "An error occurred with your booking"}</>
            )}
            {status === "pending" && (
              <>Please wait while we process your booking.</>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-center gap-3 flex-col sm:flex-row">
          {status === "success" && (
            <>
              <Button onClick={viewBooking} className="sm:min-w-32">
                View Details
              </Button>
              <Button
                variant="outline"
                onClick={returnHome}
                className="sm:min-w-32"
              >
                Return Home
              </Button>
            </>
          )}
          {status === "error" && (
            <Button
              variant="outline"
              onClick={handleClose}
              className="sm:min-w-32"
            >
              Close
            </Button>
          )}
          {status === "pending" && (
            <Button disabled className="sm:min-w-32">
              Processing...
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
