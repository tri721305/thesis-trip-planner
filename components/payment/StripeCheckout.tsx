"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  LinkAuthenticationElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface CheckoutFormProps {
  clientSecret: string;
  bookingId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function CheckoutForm({
  clientSecret,
  bookingId,
  onSuccess,
  onCancel,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Use ref to track if onSuccess has been called to prevent multiple invocations
  const successCalled = React.useRef(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    // Check for payment intent status on mount
    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (!paymentIntent) return;

      switch (paymentIntent.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          // Make sure to call onSuccess only once
          if (onSuccess && !successCalled.current) {
            successCalled.current = true;
            // Use setTimeout with 0 delay to ensure this runs after the current execution context
            setTimeout(() => onSuccess(), 0);
          }
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });

    // Cleanup function to reset the ref when component unmounts
    return () => {
      successCalled.current = false;
    };
  }, [stripe, onSuccess]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Return URL where the customer should be redirected after payment
        return_url: `${window.location.origin}/bookings/confirmation?booking_id=${bookingId}`,
        receipt_email: email,
      },
      redirect: "if_required",
    });

    // If we got a payment intent back, check its status
    if (paymentIntent) {
      if (paymentIntent.status === "succeeded") {
        setMessage("Payment successful!");
        toast({
          title: "Payment Successful",
          description: "Your booking has been confirmed!",
        });
        // Only call onSuccess if it hasn't been called before
        if (onSuccess && !successCalled.current) {
          successCalled.current = true;
          setTimeout(() => onSuccess(), 0);
        }
      } else if (paymentIntent.status === "processing") {
        setMessage("Your payment is processing.");
        toast({
          title: "Payment Processing",
          description: "Your payment is being processed...",
        });
      }
    }

    // Otherwise, there was an error
    if (error?.type === "card_error" || error?.type === "validation_error") {
      setMessage(error.message || "An error occurred");
      toast({
        title: "Payment Failed",
        description: error.message || "An error occurred during payment",
        variant: "destructive",
      });
    } else {
      setMessage("An unexpected error occurred.");
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleCancel = () => {
    onCancel?.();
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <LinkAuthenticationElement
          id="link-authentication-element"
          onChange={(e) => setEmail(e.value.email)}
        />
        <PaymentElement id="payment-element" />
      </div>

      {/* Show any error or success messages */}
      {message && (
        <div
          className={`text-sm p-2 rounded ${
            message.includes("succeeded") || message.includes("successful")
              ? "bg-green-50 text-green-700 border border-green-200"
              : message.includes("processing")
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={!stripe || !elements || isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Pay Now"
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

interface StripeCheckoutProps {
  clientSecret: string;
  bookingId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function StripeCheckout({
  clientSecret,
  bookingId,
  onSuccess,
  onCancel,
}: StripeCheckoutProps) {
  // Options for Stripe Elements
  const options = {
    clientSecret,
    appearance: {
      theme: "stripe",
    } as const,
  };

  // Đơn giản hóa hoàn toàn, không dùng ref, không dùng memoization phức tạp
  function handlePaymentSuccess() {
    console.log("Payment success");
    if (onSuccess) onSuccess();
  }

  function handlePaymentCancel() {
    console.log("Payment cancel");
    if (onCancel) onCancel();
  }

  // Chỉ render Elements khi có clientSecret
  if (!clientSecret) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Loading payment form...</h2>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Complete Payment</h2>
      <Elements options={options} stripe={stripePromise}>
        <CheckoutForm
          clientSecret={clientSecret}
          bookingId={bookingId}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      </Elements>
    </div>
  );
}
