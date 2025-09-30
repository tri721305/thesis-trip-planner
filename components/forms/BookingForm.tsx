"use client";

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createHotelBooking } from "@/lib/actions/booking.action";
import { cn } from "@/lib/utils";
import { Room } from "@/types/booking";
import { CalendarIcon } from "@radix-ui/react-icons";
import { createStripePaymentIntent } from "@/lib/actions/payment.action";
import { adaptFormToModel } from "@/lib/adapters/booking.adapter";

// Form schema
const bookingFormSchema = z.object({
  guestInfo: z.object({
    fullName: z
      .string()
      .min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    phone: z.string().min(5, { message: "Please enter a valid phone number" }),
    specialRequests: z.string().optional(),
  }),
  dates: z
    .object({
      checkIn: z.date({ required_error: "Please select a check-in date" }),
      checkOut: z.date({ required_error: "Please select a check-out date" }),
    })
    .refine((data) => data.checkOut > data.checkIn, {
      message: "Check-out date must be after check-in date",
      path: ["checkOut"],
    }),
  guests: z.object({
    adults: z.coerce
      .number()
      .int()
      .positive({ message: "At least 1 adult is required" }),
    children: z.coerce.number().int().nonnegative().optional(),
  }),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  hotelId: string;
  hotelName: string;
  hotelLocation: string;
  hotelAddress: string;
  hotelImages?: string[];
  hotelRating?: number;
  availableRooms: Room[];
  userId: string;
  onSuccess?: (
    bookingId: string,
    clientSecret: string,
    paymentIntentId: string
  ) => void;
}

const BookingForm = ({
  hotelId,
  hotelName,
  hotelLocation,
  hotelAddress,
  hotelImages = [],
  hotelRating = 0,
  availableRooms,
  userId,
  onSuccess,
}: BookingFormProps) => {
  const [selectedRooms, setSelectedRooms] = useState<Room[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the form
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      guestInfo: {
        fullName: "",
        email: "",
        phone: "",
        specialRequests: "",
      },
      dates: {
        checkIn: new Date(),
        checkOut: new Date(Date.now() + 86400000), // Next day
      },
      guests: {
        adults: 1,
        children: 0,
      },
      termsAccepted: false,
    },
  });

  // Toggle room selection - memoized with useCallback
  const toggleRoomSelection = React.useCallback((room: Room) => {
    setSelectedRooms((prev) => {
      const isSelected = prev.some((r) => r.roomId === room.roomId);
      if (isSelected) {
        return prev.filter((r) => r.roomId !== room.roomId);
      } else {
        return [...prev, room];
      }
    });
  }, []);

  // Calculate price breakdown
  const calculatePriceBreakdown = (
    checkIn: Date,
    checkOut: Date,
    rooms: Room[]
  ) => {
    const nights = Math.max(
      1,
      Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      )
    );

    const basePrice =
      rooms.reduce((total, room) => {
        return total + (room.discountedPrice || room.price);
      }, 0) * nights;

    const taxes = basePrice * 0.12; // 12% tax
    const fees = basePrice * 0.05; // 5% service fee
    const discounts =
      rooms.reduce((total, room) => {
        return total + (room.price - (room.discountedPrice || room.price));
      }, 0) * nights;

    const total = basePrice + taxes + fees;

    return {
      basePrice,
      taxes,
      fees,
      discounts,
      total,
      nights,
    };
  };

  // Use ref to track if the success handler has already been called
  const successHandlerCalled = React.useRef(false);

  // Submit handler - cực kỳ đơn giản, không xử lý state phức tạp
  const onSubmit = async (values: BookingFormValues) => {
    if (selectedRooms.length === 0) {
      setError("Please select at least one room");
      return;
    }

    // Tránh xử lý lặp
    if (isSubmitting || successHandlerCalled.current) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Tạo ID cho booking
      const generatedBookingId = `HB${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      // Dữ liệu cho server
      const serverData = {
        bookingId: generatedBookingId,
        hotelId: parseInt(hotelId, 10) || 1,
        hotelName,
        hotelLocation:
          typeof hotelLocation === "string"
            ? { longitude: 98.2945, latitude: 7.8804 }
            : hotelLocation,
        hotelAddress,
        hotelImages: Array.isArray(hotelImages)
          ? hotelImages.map((url) => ({ url }))
          : [],
        hotelRating:
          typeof hotelRating === "number"
            ? { value: hotelRating, source: "guests" }
            : hotelRating,
        rooms: selectedRooms.map((room) => ({
          roomName: room.roomType,
          roomType: room.roomType,
          maxPeople: {
            total: room.capacity,
            adults: room.capacity,
            children: 0,
          },
          amenities: room.amenities,
          pricePerNight: room.price,
          currency: "usd",
          quantity: 1,
          bedGroups: ["1 King Bed"],
        })),
        checkInDate: values.dates.checkIn,
        checkOutDate: values.dates.checkOut,
        guestInfo: {
          firstName: values.guestInfo.fullName.split(" ")[0],
          lastName:
            values.guestInfo.fullName.split(" ").slice(1).join(" ") || "",
          email: values.guestInfo.email,
          phone: values.guestInfo.phone,
          specialRequests: values.guestInfo.specialRequests,
        },
        guestCount: {
          adults: values.guests.adults,
          children: values.guests.children || 0,
        },
        pricing: {
          subtotal: calculatePriceBreakdown(
            values.dates.checkIn,
            values.dates.checkOut,
            selectedRooms
          ).basePrice,
          taxes: calculatePriceBreakdown(
            values.dates.checkIn,
            values.dates.checkOut,
            selectedRooms
          ).taxes,
          fees: calculatePriceBreakdown(
            values.dates.checkIn,
            values.dates.checkOut,
            selectedRooms
          ).fees,
          total: calculatePriceBreakdown(
            values.dates.checkIn,
            values.dates.checkOut,
            selectedRooms
          ).total,
          currency: "usd",
        },
        specialRequests: values.guestInfo.specialRequests,
        userId,
        source: "web",
      };

      // Gọi API để tạo booking
      console.log("Sending booking data to server:", serverData);
      const bookingResult = await createHotelBooking(serverData);
      console.log("Booking result from server:", bookingResult);

      if (!bookingResult.success || !bookingResult.data) {
        console.error("Failed booking result:", bookingResult);
        throw new Error(
          bookingResult.error?.message || "Failed to create booking"
        );
      }

      // Validate that we received a proper booking object
      if (!bookingResult.data.bookingId) {
        console.error("Missing bookingId in response:", bookingResult.data);
        throw new Error("Server returned incomplete booking data");
      }

      // Tạo payment intent
      const paymentResult = await createStripePaymentIntent({
        paymentId: bookingResult.data._id.toString(),
        amount: calculatePriceBreakdown(
          values.dates.checkIn,
          values.dates.checkOut,
          selectedRooms
        ).total,
        currency: "usd",
        description: `Booking at ${hotelName} for ${values.guestInfo.fullName}`,
      });

      if (!paymentResult.success || !paymentResult.data)
        throw new Error("Failed to create payment intent");

      // Đánh dấu là đã xử lý thành công
      successHandlerCalled.current = true;

      // Gọi callback thành công
      if (onSuccess) {
        const bookingIdToPass =
          bookingResult.data.bookingId || generatedBookingId;
        const clientSecretToPass = paymentResult.data.clientSecret;

        // Sử dụng callback đơn giản nhất có thể
        onSuccess(bookingIdToPass, clientSecretToPass, "");
      }
    } catch (err: any) {
      console.error("Error in booking submission:", err);
      setError(err.message || "An error occurred while creating your booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Book Your Stay</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dates.checkIn"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Check-in Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
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
                            date < new Date(new Date().setHours(0, 0, 0, 0))
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
                name="dates.checkOut"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Check-out Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
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
                          disabled={(date) => {
                            const checkIn = form.getValues("dates.checkIn");
                            return (
                              date <= checkIn ||
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            );
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Guests */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="guests.adults"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adults</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="guests.children"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Children</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Available Rooms */}
            <div className="space-y-3">
              <h3 className="font-medium text-lg">Select Room</h3>
              <div className="space-y-2">
                {availableRooms.map((room) => (
                  <div
                    key={room.roomId}
                    className={`border rounded-md p-4 cursor-pointer transition-colors ${
                      selectedRooms.some((r) => r.roomId === room.roomId)
                        ? "border-primary bg-primary/10"
                        : "hover:border-gray-400"
                    }`}
                    onClick={() => toggleRoomSelection(room)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{room.roomType}</h4>
                        <p className="text-sm text-gray-500">
                          Capacity: {room.capacity}{" "}
                          {room.capacity === 1 ? "person" : "people"}
                        </p>
                        <div className="text-xs mt-1">
                          {room.amenities?.slice(0, 3).map((amenity, i) => (
                            <span
                              key={i}
                              className="inline-block mr-2 bg-gray-100 px-2 py-1 rounded"
                            >
                              {amenity}
                            </span>
                          ))}
                          {room.amenities && room.amenities.length > 3 && (
                            <span className="text-gray-500">
                              +{room.amenities.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {room.discountedPrice &&
                        room.discountedPrice < room.price ? (
                          <>
                            <p className="text-gray-500 line-through">
                              ${room.price}
                            </p>
                            <p className="font-medium">
                              ${room.discountedPrice}
                            </p>
                          </>
                        ) : (
                          <p className="font-medium">${room.price}</p>
                        )}
                        <p className="text-xs text-gray-500">per night</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {form.formState.errors.root?.message && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.root.message}
                </p>
              )}
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            {/* Guest Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Guest Information</h3>

              <FormField
                control={form.control}
                name="guestInfo.fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="guestInfo.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="guestInfo.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
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
                        placeholder="Any special requests or requirements"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Terms & Conditions */}
            <FormField
              control={form.control}
              name="termsAccepted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="mt-1"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I accept the terms and conditions for this booking
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Price Summary */}
            {selectedRooms.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-medium text-lg mb-2">Price Summary</h3>
                {(() => {
                  const { checkIn, checkOut } = form.getValues().dates;
                  if (!checkIn || !checkOut) return null;

                  const { basePrice, taxes, fees, discounts, total, nights } =
                    calculatePriceBreakdown(checkIn, checkOut, selectedRooms);

                  return (
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>
                          Room rate ({nights} night{nights !== 1 ? "s" : ""})
                        </span>
                        <span>${basePrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>Taxes</span>
                        <span>${taxes.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>Fees</span>
                        <span>${fees.toFixed(2)}</span>
                      </div>
                      {discounts > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discounts</span>
                          <span>-${discounts.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold border-t pt-2 mt-2">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting || selectedRooms.length === 0}
          className="w-full"
        >
          {isSubmitting ? "Processing..." : "Continue to Payment"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BookingForm;
