"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ResetPaymentButtonProps {
  paymentId: string;
  className?: string;
}

export default function ResetPaymentButton({
  paymentId,
  className,
}: ResetPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPayment = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/payments/reset/${paymentId}`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset payment");
      }

      toast.success("Payment has been reset to pending state. You can now retry payment.");
      
      // Reload the page after a short delay to show the updated state
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error: any) {
      toast.error(error.message || "Failed to reset payment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleResetPayment}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? "Resetting..." : "Reset Payment Status"}
    </Button>
  );
}