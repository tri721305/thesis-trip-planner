"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useStripe,
  useElements,
  PaymentElement,
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { processPayment } from "@/lib/actions/payment.action";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Payment form component
interface PaymentFormProps {
  clientSecret: string;
  paymentIntentId: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
}

const PaymentForm = ({
  clientSecret,
  paymentIntentId,
  bookingId,
  userId,
  amount,
  currency,
}: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    // Confirm payment with Stripe
    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/bookings/confirmation?booking_id=${bookingId}`,
      },
      redirect: "if_required",
    });

    if (submitError) {
      setErrorMessage(submitError.message ?? "Something went wrong");
      setIsLoading(false);
      return;
    }

    // If no redirect happened, process payment on our server
    try {
      const result = await processPayment({
        paymentIntentId,
        bookingId,
        userId,
      });

      if (result.success) {
        router.push(`/bookings/confirmation?booking_id=${bookingId}`);
      } else {
        setErrorMessage(result.message);
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to process payment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <PaymentElement />

        {errorMessage && (
          <div className="text-sm text-red-500 p-2 bg-red-50 rounded">
            {errorMessage}
          </div>
        )}
      </div>

      <div className="mt-6">
        <Button
          type="submit"
          disabled={!stripe || isLoading}
          className="w-full"
        >
          {isLoading
            ? "Processing..."
            : `Pay ${new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount)}`}
        </Button>
      </div>
    </form>
  );
};

// Stripe checkout wrapper component
interface StripeCheckoutProps {
  clientSecret: string;
  paymentIntentId: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
}

const StripeCheckout = ({
  clientSecret,
  paymentIntentId,
  bookingId,
  userId,
  amount,
  currency = "usd",
}: StripeCheckoutProps) => {
  const options = {
    clientSecret,
    appearance: {
      theme: "stripe" as const,
    },
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete your payment</CardTitle>
        <CardDescription>Secure payment via Stripe</CardDescription>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise} options={options}>
          <PaymentForm
            clientSecret={clientSecret}
            paymentIntentId={paymentIntentId}
            bookingId={bookingId}
            userId={userId}
            amount={amount}
            currency={currency}
          />
        </Elements>
      </CardContent>
      <CardFooter className="text-xs text-gray-500 flex justify-between">
        <span>All payments are secure and encrypted</span>
        <span>Powered by Stripe</span>
      </CardFooter>
    </Card>
  );
};

export default StripeCheckout;
