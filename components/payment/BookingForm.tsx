"use client";

import { useState, useRef, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Import components for step display
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

// Import actions
import { createHotelBooking } from "@/lib/actions/booking.action";
import {
  createPayment,
  createStripePaymentIntent,
} from "@/lib/actions/payment.action";
import StripeCheckout from "./StripeCheckout";
import { CounterClockwiseClockIcon } from "@radix-ui/react-icons";

// Define schema for the form
const bookingFormSchema = z.object({
  guestInfo: z.object({
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    phone: z.string().optional(),
    specialRequests: z.string().optional(),
  }),
  checkInDate: z.date(),
  checkOutDate: z.date(),
  guestCount: z.object({
    adults: z.number().int().positive(),
    children: z.number().int().min(0),
  }),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

// Create TypeScript type from the schema
type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface HotelRoom {
  roomName: string;
  roomType: string;
  maxPeople: {
    total?: number;
    adults?: number;
    children?: number;
  };
  amenities: string[];
  pricePerNight: number;
  currency: string;
  quantity: number;
  bedGroups?: string[];
}

interface BookingFormProps {
  hotelId: number;
  hotelName: string;
  hotelLocation: {
    longitude: number;
    latitude: number;
  };
  hotelAddress?: string;
  hotelImages?: Array<{
    url: string;
    thumbnailUrl?: string;
  }>;
  hotelAmenities?: string[];
  hotelRating?: {
    value: number;
    source: string;
  };
  selectedRooms: HotelRoom[];
  onSuccess?: (bookingId: string, clientSecret?: string) => void;
  onCancel?: () => void;
  currency?: string;
}

export default function BookingForm({
  hotelId,
  hotelName,
  hotelLocation,
  hotelAddress,
  hotelImages,
  hotelAmenities,
  hotelRating,
  selectedRooms,
  onSuccess,
  onCancel,
  currency = "VND",
}: BookingFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Calculate totals
  const subtotal = selectedRooms.reduce(
    (total, room) => total + room.pricePerNight * room.quantity,
    0
  );
  const taxRate = 0.08; // 8% tax
  const serviceFee = 50000; // 50k VND service fee
  const taxes = subtotal * taxRate;
  const totalAmount = subtotal + taxes + serviceFee;

  // Create form
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      guestInfo: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        specialRequests: "",
      },
      checkInDate: new Date(),
      checkOutDate: new Date(Date.now() + 86400000), // Tomorrow
      guestCount: {
        adults: 1,
        children: 0,
      },
      agreeToTerms: false,
    },
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const onSubmit = async (data: BookingFormValues) => {
    try {
      setIsLoading(true);

      // Tạo booking ID trước khi gửi request để tránh lỗi validation
      const generatedBookingId = `HB${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      // Step 1: Create booking
      const createBookingResult = await createHotelBooking({
        bookingId: generatedBookingId, // Thêm bookingId được tạo trước
        hotelId,
        hotelName,
        hotelLocation,
        hotelAddress,
        hotelImages,
        hotelAmenities,
        hotelRating,
        rooms: selectedRooms,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        guestInfo: data.guestInfo,
        guestCount: data.guestCount,
        pricing: {
          subtotal,
          taxes,
          fees: serviceFee,
          total: totalAmount,
          currency,
        },
        specialRequests: data.guestInfo.specialRequests,
      });

      console.log("createBookingResult", createBookingResult);
      if (!createBookingResult.success || !createBookingResult.data) {
        throw new Error(
          createBookingResult.error?.message || "Failed to create booking"
        );
      }

      const booking = createBookingResult.data;
      setBookingId(booking.bookingId);

      // Step 2: Create payment
      const createPaymentResult = await createPayment({
        bookingId: booking._id,
        amount: totalAmount,
        currency,
        paymentMethod: "stripe",
        breakdown: {
          subtotal,
          taxes,
          fees: serviceFee,
          total: totalAmount,
          currency,
        },
        billingDetails: {
          name: `${data.guestInfo.firstName} ${data.guestInfo.lastName}`,
          email: data.guestInfo.email,
          phone: data.guestInfo.phone,
        },
        description: `Payment for booking at ${hotelName}`,
      });

      console.log("createPayment", createPayment);

      if (!createPaymentResult.success || !createPaymentResult.data) {
        throw new Error(
          createPaymentResult.error?.message || "Failed to create payment"
        );
      }

      const payment = createPaymentResult.data;

      // Step 3: Create Stripe payment intent
      const createPaymentIntentResult = await createStripePaymentIntent({
        paymentId: payment.paymentId,
        amount: totalAmount,
        currency,
        description: `Payment for booking #${booking.bookingId} at ${hotelName}`,
        metadata: {
          bookingId: booking.bookingId,
          hotelName,
          checkInDate: format(data.checkInDate, "yyyy-MM-dd"),
          checkOutDate: format(data.checkOutDate, "yyyy-MM-dd"),
        },
      });

      if (
        !createPaymentIntentResult.success ||
        !createPaymentIntentResult.data
      ) {
        throw new Error(
          createPaymentIntentResult.error?.message ||
            "Failed to create payment intent"
        );
      }

      // Set the client secret to proceed with Stripe payment
      setClientSecret(createPaymentIntentResult.data.clientSecret);

      // Move to payment step
      setCurrentStep(2);

      toast({
        title: "Booking Created",
        description: `Booking reference: ${booking.bookingId}`,
      });
    } catch (error: any) {
      console.error("Booking error:", error);
      toast({
        title: "Error",
        description:
          error.message || "An error occurred while creating your booking",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Use useRef to track if the success handler has been called
  const successHandlerCalled = useRef(false);

  // Use useCallback to memoize handlers and prevent recreation on each render
  const handlePaymentSuccess = useCallback(() => {
    if (bookingId && onSuccess && !successHandlerCalled.current) {
      successHandlerCalled.current = true;
      onSuccess(bookingId, clientSecret || "");
    }
  }, [bookingId, clientSecret, onSuccess]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  // Render the appropriate step
  if (currentStep === 2 && clientSecret && bookingId) {
    return (
      <StripeCheckout
        clientSecret={clientSecret}
        bookingId={bookingId}
        onSuccess={handlePaymentSuccess}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Complete Your Booking</h2>

        {/* Booking Steps */}
        <div className="flex mb-6">
          <div
            className={`flex-1 text-center py-2 ${currentStep === 1 ? "bg-primary text-white" : "bg-muted"}`}
          >
            1. Guest Details
          </div>
          <div
            className={`flex-1 text-center py-2 ${currentStep === 2 ? "bg-primary text-white" : "bg-muted"}`}
          >
            2. Payment
          </div>
        </div>

        {/* Hotel Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <div>
                <h3 className="font-medium">{hotelName}</h3>
                <p className="text-sm text-muted-foreground">{hotelAddress}</p>
              </div>

              <Separator />

              {/* Room details */}
              <div className="space-y-2">
                {selectedRooms.map((room, index) => (
                  <div key={index} className="flex justify-between">
                    <div>
                      <p className="font-medium">{room.roomName}</p>
                      <p className="text-sm text-muted-foreground">
                        {room.quantity} × {formatCurrency(room.pricePerNight)}
                        /night
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatCurrency(room.pricePerNight * room.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Pricing breakdown */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <p>Subtotal</p>
                  <p>{formatCurrency(subtotal)}</p>
                </div>
                <div className="flex justify-between text-sm">
                  <p>Taxes ({(taxRate * 100).toFixed(0)}%)</p>
                  <p>{formatCurrency(taxes)}</p>
                </div>
                <div className="flex justify-between text-sm">
                  <p>Service Fee</p>
                  <p>{formatCurrency(serviceFee)}</p>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-medium">
                <p>Total</p>
                <p>{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Guest Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Guest Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="guestInfo.firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="guestInfo.lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="guestInfo.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      We'll send your booking confirmation to this email.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guestInfo.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+84 XXX XXX XXX" {...field} />
                    </FormControl>
                    <FormDescription>
                      For booking-related updates (optional).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Stay Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Stay Details</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="checkInDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Check-in Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date() ||
                              date >
                                new Date(
                                  new Date().setMonth(
                                    new Date().getMonth() + 12
                                  )
                                )
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="checkOutDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Check-out Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date <= form.getValues("checkInDate") ||
                              date >
                                new Date(
                                  new Date().setMonth(
                                    new Date().getMonth() + 12
                                  )
                                )
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="guestCount.adults"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adults</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 1)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="guestCount.children"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Children</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="guestInfo.specialRequests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Requests</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any special requests or preferences..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Special requests are subject to availability.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="agreeToTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-4 w-4 mt-1"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    I agree to the Terms and Conditions, Privacy Policy, and
                    Cancellation Policy
                  </FormLabel>
                  <FormDescription>
                    By checking this box, you agree to our terms and policies.
                  </FormDescription>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Processing..." : "Continue to Payment"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
