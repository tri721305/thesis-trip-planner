"use client";
import React, { useEffect, useState } from "react";
import { CalendarDatePicker } from "./calendar-date-picker";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { MdHotel } from "react-icons/md";
import { BsPeople, BsPeopleFill } from "react-icons/bs";
import { getHotelOfferById } from "@/lib/actions/hotel.action";
import { createHotelBooking } from "@/lib/actions/booking.action";
import {
  createPayment,
  createStripePaymentIntent,
} from "@/lib/actions/payment.action";
import ImageGallery from "./images/ImageGallery";
import { CheckCircle } from "lucide-react";
import { IoMdCloseCircle } from "react-icons/io";
import { FaUser } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import PriceBreakdown from "./PriceBreakdown";
import BookingConfirmation from "./BookingConfirmation";

const Availability = ({ data }: { data: any }) => {
  const [offers, setOffers] = useState<any>(null);
  const [selectedDates, setSelectedDates] = useState({
    from: new Date(),
    to: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Default: 3 days from now
  });
  const [travelerInfo, setTravelerInfo] = useState({
    rooms: 1,
    adults: 2,
    children: 0,
  });
  const [isBooking, setIsBooking] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const { data: session } = useSession();
  const router = useRouter();

  const handleGetHotelOffer = async () => {
    try {
      console.log("Getting hotel offer data for ID:", data?.hotel?.hotel_id);
      const hotel = await getHotelOfferById({ hotelId: data?.hotel?.hotel_id });
      if (hotel.success) {
        console.log("Hotel offer data received:", hotel.data?.hotel);
        setOffers(hotel.data?.hotel || null);
      } else {
        console.error("Failed to get hotel offers:", hotel.error);
      }
    } catch (error) {
      console.error("Error fetching hotel offers:", error);
    }
  };

  useEffect(() => {
    handleGetHotelOffer();
  }, []);

  const handleDateChange = (value: any) => {
    setSelectedDates(value);
  };

  const handleTravelerChange = (field: string, value: number) => {
    setTravelerInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBookRoom = (offer: any) => {
    // Check if user is logged in
    if (!session?.user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book a room",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    // Validation
    if (!selectedDates.from || !selectedDates.to) {
      toast({
        title: "Error",
        description: "Please select check-in and check-out dates",
        variant: "destructive",
      });
      return;
    }

    const checkInDate = selectedDates.from;
    const checkOutDate = selectedDates.to;

    // Calculate nights
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (nights < 1) {
      toast({
        title: "Error",
        description: "Check-out date must be after check-in date",
        variant: "destructive",
      });
      return;
    }

    // Calculate total price
    let pricePerNight =
      offer.priceRate?.amount || offer.priceRate?.total?.amount || 100;
    const currency = offer.priceRate?.currencyCode || "USD";

    // Kiểm tra giá quá cao và điều chỉnh nếu cần
    if (currency.toLowerCase() === "vnd" && pricePerNight > 10_000_000) {
      // Giới hạn giá phòng tối đa là 10 triệu VND cho môi trường test
      console.log(
        `Adjusting high room price: ${pricePerNight} → 10,000,000 VND`
      );
      pricePerNight = 10_000_000;
    } else if (currency.toLowerCase() === "usd" && pricePerNight > 500) {
      // Giới hạn giá phòng tối đa là $500 USD
      console.log(`Adjusting high room price: ${pricePerNight} → $500 USD`);
      pricePerNight = 500;
    }

    // Chuyển đổi pricePerNight từ chuỗi sang số nếu cần
    if (typeof pricePerNight === "string") {
      pricePerNight = Number(pricePerNight.replace(/[.,]/g, ""));
    }

    // Ensure all price calculations use integers to avoid floating point issues
    const subtotal = Math.round(pricePerNight * nights * travelerInfo.rooms);
    const taxes = Math.round(subtotal * 0.1); // Assume 10% tax
    const fees = Math.round(subtotal * 0.05); // Assume 5% service fee
    const total = subtotal + taxes + fees;

    // Thêm kiểm tra tổng tiền có vượt quá 99 triệu VND không
    const isHighAmount =
      (currency.toLowerCase() === "vnd" && total > 99_000_000) ||
      (currency.toLowerCase() === "usd" && total > 4_000);

    console.log(
      `Price calculation: ${pricePerNight} per night * ${nights} nights * ${travelerInfo.rooms} rooms = ${subtotal} subtotal`
    );
    console.log(
      `Taxes: ${taxes}, Fees: ${fees}, Total: ${total} ${currency}${isHighAmount ? " (Warning: High amount)" : ""}`
    );

    // Log chi tiết để debug vấn đề định dạng số
    console.log(
      `Price details (types) - pricePerNight: ${typeof pricePerNight}, subtotal: ${typeof subtotal}, total: ${typeof total}`
    );

    // Store the selected offer and show confirmation dialog
    setSelectedOffer({
      ...offer,
      checkInDate,
      checkOutDate,
      nights,
      pricePerNight,
      subtotal,
      taxes,
      fees,
      total,
      currency,
    });
    setShowConfirmation(true);
  };

  const processBooking = async () => {
    if (!selectedOffer || !session?.user) return;

    try {
      setIsBooking(true);

      const {
        checkInDate,
        checkOutDate,
        subtotal,
        taxes,
        fees,
        total,
        currency,
      } = selectedOffer;

      // Generate a unique booking ID
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substr(2, 4).toUpperCase();
      const generatedBookingId = `HB${timestamp}${random}`;

      console.log("Generated booking ID:", generatedBookingId);

      // Parse hotel_id to ensure it's a number
      const hotelIdValue =
        parseInt(data.hotel.hotel_id, 10) ||
        parseInt(data.hotel._id, 10) ||
        data.hotel.hotel_id ||
        342033; // Fallback to sample value

      console.log("Using hotel ID:", hotelIdValue);

      // 1. Create booking
      const bookingResult = await createHotelBooking({
        bookingId: generatedBookingId, // Add bookingId field
        hotelId: hotelIdValue, // Use hotel_id not MongoDB _id
        hotelName: data.hotel.original_hotel.name,
        hotelLocation: data.hotel.original_hotel.location,
        hotelAddress: data.hotel?.details?.data?.address || "",
        hotelImages: [
          {
            url:
              data.hotel?.details?.data?.lodging?.images?.[0]?.url ||
              selectedOffer.images?.[0]?.url ||
              "https://placeholder.com/hotel",
          },
        ],
        hotelAmenities:
          data.hotel?.details?.data?.lodging?.amenities?.map(
            (a: any) => a.name
          ) || [],
        hotelRating: data.hotel?.details?.data?.lodging?.rating || {
          value: 4.5,
          source: "default",
        },
        rooms: [
          {
            roomName: selectedOffer.name || "Standard Room",
            roomType: selectedOffer.name || "Standard Room",
            maxPeople: selectedOffer.maxPeople || {
              total: 2,
              adults: 2,
              children: 0,
            },
            pricePerNight: selectedOffer.pricePerNight,
            currency: currency,
            quantity: travelerInfo.rooms,
            amenities:
              selectedOffer.amenitiesAndAttributes?.map(
                (item: any) => item.name
              ) ||
              selectedOffer.priceRate?.amenities ||
              [],
            bedGroups: selectedOffer.priceRate?.bedGroups?.map(
              (bg: any) => bg.description
            ) || ["King Size Bed"],
          },
        ],
        checkInDate,
        checkOutDate,
        guestInfo: {
          firstName: session.user.name?.split(" ")[0] || "Guest",
          lastName: session.user.name?.split(" ").slice(1).join(" ") || "User",
          email: session.user.email || "guest@example.com",
          phone: "0123456789", // In production, get this from a form
        },
        guestCount: {
          adults: travelerInfo.adults,
          children: travelerInfo.children,
        },
        pricing: {
          subtotal,
          taxes,
          fees,
          total,
          currency: currency,
        },
        source: "web",
      });

      console.log("Booking creation result:", bookingResult);

      if (!bookingResult.success) {
        console.error("Booking creation failed:", bookingResult.error);
        throw new Error(
          typeof bookingResult.error === "string"
            ? bookingResult.error
            : bookingResult.error?.message || "Failed to create booking"
        );
      }

      console.log("Booking created successfully:", bookingResult.data);
      const bookingId = bookingResult.data?.bookingId;

      if (!bookingId) {
        throw new Error("No booking ID returned");
      }

      // 2. Create payment
      const paymentResult = await createPayment({
        bookingId,
        amount: total,
        currency: currency,
        paymentMethod: "stripe",
        breakdown: {
          subtotal,
          taxes,
          fees,
          total,
          currency: currency,
        },
        billingDetails: {
          name: session.user.name || "Guest User",
          email: session.user.email || "guest@example.com",
          phone: "0123456789",
        },
        description: `Payment for ${selectedOffer.name} at ${data.hotel.original_hotel.name}`,
      });

      if (!paymentResult.success) {
        throw new Error(
          typeof paymentResult.error === "string"
            ? paymentResult.error
            : paymentResult.error?.message || "Failed to create payment"
        );
      }

      const paymentId = paymentResult.data?.paymentId;

      // 3. Create Stripe payment intent
      // Convert amount to integer (cents/đồng) for Stripe
      // For USD, multiply by 100 to convert dollars to cents
      // For VND, ensure it doesn't exceed Stripe's test mode limit (đổi sang USD nếu vượt quá)

      // Đối với môi trường test của Stripe, số tiền có giới hạn
      let stripeAmount: number;
      let stripeCurrency = currency.toLowerCase();

      // Chuyển đổi total thành số nguyên, đảm bảo loại bỏ bất kỳ dấu ngăn cách nào
      // Nếu total là string (ví dụ: "2.754.660" hoặc "2,754,660"), chuyển đổi sang số
      let numericTotal = total;
      if (typeof numericTotal === "string") {
        // Loại bỏ tất cả dấu chấm và phẩy, sau đó chuyển đổi sang số
        numericTotal = Number(numericTotal.replace(/[.,]/g, ""));
      }

      console.log(
        `Processing payment amount: ${total} (Original) → ${numericTotal} (Numeric) ${currency}`
      );

      if (stripeCurrency === "vnd" && numericTotal > 99_000_000) {
        // Nếu giá trị VND vượt quá giới hạn, chuyển đổi sang USD
        console.log(
          `VND amount ${numericTotal} exceeds Stripe test mode limit, converting to USD`
        );
        stripeCurrency = "usd";
        // Giả lập tỷ giá 24,000 VND = 1 USD
        stripeAmount = Math.round((numericTotal / 24000) * 100);
        console.log(`Converted to USD: $${stripeAmount / 100}`);
      } else if (stripeCurrency === "usd") {
        stripeAmount = Math.round(numericTotal * 100); // USD: dollars to cents
      } else {
        // VND or other currencies
        stripeAmount = Math.round(Math.min(numericTotal, 99_000_000)); // Giới hạn tối đa
      }

      console.log(
        `Payment amount: ${total} ${currency} → ${stripeAmount} ${stripeCurrency} for Stripe`
      );

      // Thêm kiểm tra bổ sung để đảm bảo số tiền hợp lệ
      if (isNaN(stripeAmount) || stripeAmount <= 0) {
        console.error(`Invalid amount after conversion: ${stripeAmount}`);
        throw new Error(
          `Không thể xử lý số tiền thanh toán. Vui lòng liên hệ hỗ trợ.`
        );
      }

      console.log(
        `Final Stripe params - Amount: ${stripeAmount}, Currency: ${stripeCurrency}`
      );

      const intentResult = await createStripePaymentIntent({
        paymentId,
        amount: stripeAmount,
        currency: stripeCurrency,
        description: `Payment for ${selectedOffer.name || "Room"} at ${data.hotel.original_hotel.name}`,
      });

      if (!intentResult.success) {
        throw new Error(
          typeof intentResult.error === "string"
            ? intentResult.error
            : intentResult.error?.message || "Failed to create payment intent"
        );
      }

      const clientSecret = intentResult.data?.clientSecret;

      // 4. Redirect to payment page
      if (stripeCurrency !== currency.toLowerCase()) {
        // Nếu có chuyển đổi tiền tệ, thông báo cho người dùng
        toast({
          title: "Booking Created!",
          description: `Payment will be processed in ${stripeCurrency.toUpperCase()} due to technical limitations. Redirecting to payment page...`,
          duration: 5000, // Hiển thị lâu hơn để người dùng đọc
        });
      } else {
        toast({
          title: "Booking Created!",
          description: "Redirecting to payment page...",
        });
      }

      // Delay slightly to show toast
      setTimeout(() => {
        router.push(`/stripe-simple-test?booking=${bookingId}`);
      }, 1500);
    } catch (error: any) {
      console.error("Booking error:", error);

      // Extract more detailed error message if possible
      let errorMessage = "Something went wrong";

      if (error.message) {
        errorMessage = error.message;
      }

      // Check for validation errors from mongoose
      if (error.message && error.message.includes("validation failed")) {
        const fieldMatch = error.message.match(/Path `([^`]+)`/);
        if (fieldMatch) {
          const field = fieldMatch[1];
          errorMessage = `Missing required field: ${field}. Please try again.`;
        }
      }

      toast({
        title: "Booking Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
      setShowConfirmation(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <div>
          <Label className="font-bold">Checkin - Checkout</Label>
          <CalendarDatePicker
            date={selectedDates}
            onDateSelect={(dates) => handleDateChange(dates)}
            className="h-[56px]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Travelers</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-[56px]  background-form-input text-black border-none dark:text-white"
              >
                <div className="flex items-center gap-2">
                  <MdHotel /> {travelerInfo.rooms}
                  <BsPeopleFill /> {travelerInfo.adults + travelerInfo.children}
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="leading-none font-medium">Rooms and Guests</h4>
                </div>
                <div className="grid gap-2">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="rooms">Rooms</Label>
                    <Input
                      id="rooms"
                      type="number"
                      min={1}
                      value={travelerInfo.rooms}
                      onChange={(e) =>
                        handleTravelerChange(
                          "rooms",
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="col-span-2 h-8"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="adults">Adults</Label>
                    <Input
                      id="adults"
                      type="number"
                      min={1}
                      value={travelerInfo.adults}
                      onChange={(e) =>
                        handleTravelerChange(
                          "adults",
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="col-span-2 h-8"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="children">Children</Label>
                    <Input
                      id="children"
                      type="number"
                      min={0}
                      value={travelerInfo.children}
                      onChange={(e) =>
                        handleTravelerChange(
                          "children",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="col-span-2 h-8"
                    />
                  </div>
                </div>
                <Separator className="mt-1" />
                <div className="flex gap-2 w-full justify-end">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setTravelerInfo({ rooms: 1, adults: 2, children: 0 })
                    }
                  >
                    Reset
                  </Button>
                  <Button className="bg-primary-500 hover:bg-orange-500">
                    Save
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {/* <Button onClick={handleGetHotelOffer}>Check Service</Button> */}
        {offers?.offers?.data?.offers?.map((offer: any, index: number) => {
          console.log("Rendering offer:", offer);
          const listImgs = offer?.images?.map((img: any) => img?.url) || [];

          // Fallback to hotel images if offer doesn't have images
          if (!listImgs.length && data?.hotel?.details?.data?.lodging?.images) {
            data.hotel.details.data.lodging.images.forEach((img: any) => {
              if (img.url) listImgs.push(img.url);
            });
          }

          return (
            <div key={offer?.name + index}>
              <div className="flex justify-between items-start gap-2">
                <div className="flex gap-2">
                  <ImageGallery
                    images={listImgs}
                    mainImageIndex={0}
                    alt={`Room ${offer?.name || "Option"} ${index + 1}`}
                    className="w-fit"
                  />
                  <div>
                    <h1 className="text-[24px] font-bold">{offer?.name}</h1>
                    <div className="text-[12px]">
                      <p>
                        {offer?.priceRate?.bedGroups?.[0]?.description ||
                          "1 King Bed"}
                      </p>
                      <p>{offer?.areaSquareMeters || "30"} meters</p>
                      <p>
                        {offer?.amenitiesAndAttributes?.[0]?.name ||
                          "Air conditioning"}
                      </p>
                      <h1 className="font-bold text-gray-700 cursor-pointer">
                        See all details
                      </h1>
                    </div>
                    {offer?.priceRate?.cancellationPolicy?.type ===
                    "fullRefund" ? (
                      <div className="flex gap-2 items-center text-green-400 text-[14px] font-bold">
                        <CheckCircle size={14} />
                        <p>Free cancellation</p>
                      </div>
                    ) : (
                      <div className="flex gap-2 items-center text-red-500 text-[14px] font-bold">
                        <IoMdCloseCircle size={14} />
                        <p>Non-refundable</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-[12px] mr-8">
                    <p>Sleeps</p>
                    <div className="flex gap-2 items-center">
                      {(offer?.maxPeople?.total || 2) > 0 &&
                        Array.from({
                          length: Math.min(offer?.maxPeople?.total || 2, 6),
                        }).map((_, index) => (
                          <FaUser size={14} key={"user" + index} />
                        ))}
                    </div>
                  </div>
                  <div className="flex min-w-[200px] flex-col gap-1 items-end">
                    {offer?.priceRate?.hasMemberDeal && (
                      <h1 className="p-1 w-fit font-extrabold text-[10px] rounded-md bg-[#ec9b3b] text-white">
                        MEMBER DEAL
                      </h1>
                    )}
                    <h1 className="font-bold text-[14px]">
                      {(
                        offer?.priceRate?.total?.amount ||
                        offer?.priceRate?.amount ||
                        100
                      ).toLocaleString("vi", {
                        style: "currency",
                        currency: offer?.priceRate?.currencyCode || "VND",
                      })}
                      <span className="text-[12px] font-normal text-gray-600">
                        {" "}
                        /night{" "}
                        {offer?.priceRate?.nightlyStrikethrough?.amount && (
                          <span className="line-through">
                            {offer?.priceRate?.nightlyStrikethrough?.amount.toLocaleString(
                              "vi",
                              {
                                style: "currency",
                                currency:
                                  offer?.priceRate?.currencyCode || "VND",
                              }
                            )}
                          </span>
                        )}
                      </span>
                    </h1>
                    <p className="text-gray-500 text-[10px]">
                      {Math.round(
                        (offer?.priceRate?.total?.amount ||
                          offer?.priceRate?.amount ||
                          100) *
                          (selectedDates.from && selectedDates.to
                            ? Math.max(
                                1,
                                Math.ceil(
                                  (selectedDates.to.getTime() -
                                    selectedDates.from.getTime()) /
                                    (1000 * 60 * 60 * 24)
                                )
                              )
                            : 1) *
                          travelerInfo.rooms
                      ).toLocaleString("vi", {
                        style: "currency",
                        currency: offer?.priceRate?.currencyCode || "VND",
                      })}{" "}
                      subtotal for {travelerInfo.rooms}{" "}
                      {travelerInfo.rooms > 1 ? "rooms" : "room"}
                    </p>
                  </div>
                  <div>
                    <Button
                      className="bg-primary-500 h-[40px] text-white rounded-[30px]"
                      onClick={() => handleBookRoom(offer)}
                      disabled={isBooking || !session?.user}
                    >
                      {isBooking
                        ? "Processing..."
                        : session?.user
                          ? "Booking"
                          : "Login to Book"}
                    </Button>
                  </div>
                </div>
              </div>
              <Separator className="my-2" />
            </div>
          );
        })}
      </div>

      {/* Booking Confirmation Dialog */}
      {selectedOffer && (
        <BookingConfirmation
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={processBooking}
          hotelName={data.hotel.original_hotel.name}
          roomName={selectedOffer.name || "Standard Room"}
          checkInDate={selectedOffer.checkInDate}
          checkOutDate={selectedOffer.checkOutDate}
          nights={selectedOffer.nights}
          rooms={travelerInfo.rooms}
          adults={travelerInfo.adults}
          children={travelerInfo.children}
          subtotal={selectedOffer.subtotal}
          taxes={selectedOffer.taxes}
          fees={selectedOffer.fees}
          total={selectedOffer.total}
          currency={selectedOffer.currency}
          cancellationPolicy={
            selectedOffer.priceRate?.cancellationPolicy?.type === "fullRefund"
              ? "Free cancellation before check-in"
              : "Non-refundable"
          }
          isProcessing={isBooking}
          // Thêm cảnh báo khi giá cao
          warningMessage={
            selectedOffer.currency.toLowerCase() === "vnd" &&
            selectedOffer.total > 99_000_000
              ? "Lưu ý: Do giới hạn kỹ thuật, thanh toán có thể được xử lý bằng USD thay vì VND"
              : undefined
          }
        />
      )}
    </div>
  );
};

export default Availability;
