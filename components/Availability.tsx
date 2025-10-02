"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
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
import { getAvailableRooms } from "@/lib/actions/availability.action";
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
  console.log("Rendering Availability component with data:", data);
  const router = useRouter();

  // Lấy tham số từ URL nếu có
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

  // Sử dụng useMemo để tránh tính toán lại danh sách phòng mỗi lần render
  const availableRooms = React.useMemo(() => {
    if (!offers?.offers?.data?.offers) return [];

    return offers.offers.data.offers.filter(Boolean).filter((offer: any) => {
      // Nếu chế độ hiển thị theo trạng thái khả dụng được bật
      if (offer.hasOwnProperty("isAvailable")) {
        return true; // Hiển thị tất cả, nhưng sẽ làm mờ những phòng không khả dụng
      }
      return true;
    });
  }, [offers?.offers?.data?.offers]);
  const [isBooking, setIsBooking] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const { data: session } = useSession();

  // State để hiển thị trạng thái khi đang tìm phòng
  const [isLoading, setIsLoading] = useState(false);
  // State để hiển thị thông báo khi không có phòng phù hợp
  const [noAvailableRooms, setNoAvailableRooms] = useState(false);

  // Sử dụng useRef để theo dõi các trạng thái mà không gây re-render
  const toastShown = useRef(false);
  const autoCheckExecuted = useRef(false);
  const prevDatesRef = useRef({
    from: selectedDates.from,
    to: selectedDates.to,
  });
  const prevTravelerInfoRef = useRef({ ...travelerInfo });

  // Tách biệt hàm lấy thông tin khách sạn để tránh re-render không cần thiết
  // Sử dụng useCallback để tránh tạo lại hàm này mỗi khi component re-render
  const handleGetHotelOffer = useCallback(async () => {
    try {
      // Giảm lượng log để tránh re-render không cần thiết
      // console.log("Getting hotel offer data for ID:", data?.hotel?.hotel_id);
      const hotel = await getHotelOfferById({ hotelId: data?.hotel?.hotel_id });

      console.log("Hotel offer fetch result:", hotel);
      if (hotel.success) {
        // console.log("Hotel offer data received:", hotel.data?.hotel);
        setOffers(hotel.data?.hotel || null);
      } else {
        console.error("Failed to get hotel offers:", hotel.error);
      }
    } catch (error) {
      console.error("Error fetching hotel offers:", error);
    }
  }, [data?.hotel?.hotel_id]);

  // Hàm kiểm tra phòng khả dụng với tối ưu để tránh re-render
  const checkAvailableRooms = async () => {
    // Đặt trạng thái loading và reset thông báo không có phòng
    setIsLoading(true);
    setNoAvailableRooms(false);

    try {
      // Kiểm tra ngày có hợp lệ không
      if (!selectedDates.from || !selectedDates.to) {
        toast({
          title: "Error",
          description: "Please select check-in and check-out dates",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Tạo bản sao các tham số cần thiết để tránh closure issues
      const checkParams = {
        hotelId: data?.hotel?.hotel_id,
        checkInDate: selectedDates.from.toISOString(),
        checkOutDate: selectedDates.to.toISOString(),
        adults: travelerInfo.adults,
        children: travelerInfo.children,
        rooms: travelerInfo.rooms,
      };
      console.log("checkParams:", checkParams);

      // Gọi API kiểm tra phòng khả dụng
      const result = await getAvailableRooms(checkParams);

      console.log("result", result);
      // Kiểm tra kết quả trả về
      if (result.success && result.data) {
        try {
          // Sử dụng cách đảm bảo an toàn hơn khi cập nhật state
          if (offers?.offers?.data) {
            // Lọc và xử lý danh sách phòng một cách an toàn
            const processedRooms = result.data.availableRooms
              .filter((room) => room && typeof room === "object")
              .map((room) => {
                // Chỉ lấy các thuộc tính cần thiết, không bao gồm các tham chiếu phức tạp
                return {
                  id:
                    room.id ||
                    `room-${Math.random().toString(36).substring(2, 9)}`,
                  name: room.name || "Unknown Room",
                  images: Array.isArray(room.images) ? [...room.images] : [],
                  maxPeople: room.maxPeople
                    ? { ...room.maxPeople }
                    : { total: 2, adults: 2, children: 0 },
                  areaSquareMeters: room.areaSquareMeters || 30,
                  amenitiesAndAttributes: Array.isArray(
                    room.amenitiesAndAttributes
                  )
                    ? [...room.amenitiesAndAttributes]
                    : [],
                  priceRate: room.priceRate ? { ...room.priceRate } : {},
                  availableCount:
                    typeof room.availableCount === "number"
                      ? room.availableCount
                      : 0,
                  isAvailable: Boolean(room.isAvailable),
                };
              });

            // Tạo một object offers mới hoàn toàn để tránh tham chiếu đến object cũ
            const newOffers = {
              ...offers,
              offers: {
                ...offers.offers,
                data: {
                  ...offers.offers.data,
                  offers: processedRooms,
                },
              },
            };

            // Cập nhật trạng thái có phòng khả dụng hay không trước khi cập nhật offers
            const hasAvailableRooms = processedRooms.some(
              (room) => room.isAvailable
            );
            setNoAvailableRooms(!hasAvailableRooms);

            // Cập nhật refs để theo dõi thay đổi
            prevDatesRef.current = {
              from: selectedDates.from,
              to: selectedDates.to,
            };
            prevTravelerInfoRef.current = { ...travelerInfo };

            // Đánh dấu đã kiểm tra và đảm bảo autoCheckExecuted cũng được đánh dấu
            // để tránh kiểm tra lại tự động
            initialCheckDone.current = true;
            if (typeof autoCheckExecuted !== "undefined") {
              autoCheckExecuted.current = true;
            }

            // Cập nhật state một lần duy nhất sau khi các tham chiếu đã được cập nhật
            setOffers(newOffers);
          }
        } catch (jsonError) {
          console.error("Error processing room data:", jsonError);
          toast({
            title: "Error",
            description: "Could not process room availability data",
            variant: "destructive",
          });
        }
      } else {
        // Xử lý khi API trả về lỗi
        toast({
          title: "Error",
          description:
            typeof result.error === "string"
              ? result.error
              : result.error?.message || "Failed to check room availability",
          variant: "destructive",
        });
      }
    } catch (error) {
      // Xử lý lỗi khi gọi API thất bại
      toast({
        title: "Error",
        description: "Failed to check room availability. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Đảm bảo luôn tắt trạng thái loading
      setIsLoading(false);
    }
  };

  // Sử dụng useRef để theo dõi việc đã kiểm tra hay chưa
  const initialCheckDone = useRef(false);
  const isFirstRender = useRef(true);

  // Đọc tham số URL và thiết lập ngày đặt phòng và thông tin khách
  useEffect(() => {
    // Lấy tham số từ URL khi component được mount
    const url = new URL(window.location.href);
    const checkIn = url.searchParams.get("checkIn");
    const checkOut = url.searchParams.get("checkOut");
    const rooms = url.searchParams.get("rooms");
    const adults = url.searchParams.get("adults");
    const children = url.searchParams.get("children");

    console.log("URL parameters detected:", {
      checkIn,
      checkOut,
      rooms,
      adults,
      children,
    });
    let hasUrlParams = false;

    // Cập nhật ngày đặt phòng nếu có trong URL
    if (checkIn && checkOut) {
      try {
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        // Kiểm tra xem ngày có hợp lệ không
        if (!isNaN(checkInDate.getTime()) && !isNaN(checkOutDate.getTime())) {
          console.log("Setting dates from URL parameters:", {
            checkInDate,
            checkOutDate,
          });
          setSelectedDates({
            from: checkInDate,
            to: checkOutDate,
          });
          hasUrlParams = true;
        }
      } catch (error) {
        console.error("Error parsing date from URL parameters:", error);
      }
    }

    // Cập nhật thông tin khách nếu có trong URL
    const travelerUpdates: any = {};
    if (rooms && !isNaN(Number(rooms))) {
      travelerUpdates.rooms = Number(rooms);
      hasUrlParams = true;
    }
    if (adults && !isNaN(Number(adults))) {
      travelerUpdates.adults = Number(adults);
      hasUrlParams = true;
    }
    if (children && !isNaN(Number(children))) {
      travelerUpdates.children = Number(children);
      hasUrlParams = true;
    }

    // Chỉ cập nhật nếu có ít nhất một thông tin
    if (Object.keys(travelerUpdates).length > 0) {
      console.log(
        "Setting traveler info from URL parameters:",
        travelerUpdates
      );
      setTravelerInfo((prevState) => ({
        ...prevState,
        ...travelerUpdates,
      }));
    }

    // Đánh dấu nếu có tham số URL để biết cần tự động kiểm tra phòng
    if (hasUrlParams) {
      console.log(
        "URL parameters found, will trigger auto-check for room availability"
      );
    }
  }, []); // Chỉ chạy một lần khi component mount

  // Gọi API lấy thông tin khách sạn chỉ một lần khi component mount
  useEffect(() => {
    handleGetHotelOffer();
  }, [handleGetHotelOffer]); // Đã dùng useCallback nên không cần lo lắng về re-render

  // Auto-check room availability only once after initial data load or when URL parameters change
  useEffect(() => {
    // Đảm bảo có dữ liệu cần thiết trước khi kiểm tra và chưa thực hiện kiểm tra tự động
    if (
      offers?.offers?.data &&
      selectedDates.from &&
      selectedDates.to &&
      data?.hotel?.hotel_id &&
      !autoCheckExecuted.current
    ) {
      console.log("Data available for auto-checking rooms:", {
        hotelId: data?.hotel?.hotel_id,
        checkIn: selectedDates.from.toISOString(),
        checkOut: selectedDates.to.toISOString(),
        rooms: travelerInfo.rooms,
        adults: travelerInfo.adults,
        children: travelerInfo.children,
      });

      // Đánh dấu đã thực hiện kiểm tra tự động
      autoCheckExecuted.current = true;

      // Sử dụng setTimeout để đảm bảo React đã render UI hoàn chỉnh trước
      const timer = setTimeout(() => {
        console.log("Auto-executing room availability check");
        checkAvailableRooms();
      }, 500);

      return () => clearTimeout(timer);
    } else {
      console.log(
        "Cannot auto-check rooms, missing required data or already executed:",
        {
          hasOffers: !!offers?.offers?.data,
          hasHotelId: !!data?.hotel?.hotel_id,
          hasSelectedDates: !!(selectedDates.from && selectedDates.to),
          alreadyExecuted: autoCheckExecuted.current,
        }
      );
    }
  }, [
    offers,
    data?.hotel?.hotel_id,
    selectedDates.from,
    selectedDates.to,
    travelerInfo.rooms,
    travelerInfo.adults,
    travelerInfo.children,
  ]);

  // Theo dõi thay đổi ngày và số người để hiển thị thông báo
  // Sử dụng useCallback để tối ưu hóa callback
  const handleUserSelectionChanges = useCallback(() => {
    // Bỏ qua lần render đầu tiên
    if (isFirstRender.current) {
      return;
    }

    // Kiểm tra xem có thay đổi thực sự hay không
    const datesChanged =
      (prevDatesRef.current.from &&
        selectedDates.from &&
        prevDatesRef.current.from.getTime() !== selectedDates.from.getTime()) ||
      (prevDatesRef.current.to &&
        selectedDates.to &&
        prevDatesRef.current.to.getTime() !== selectedDates.to.getTime());

    const travelersChanged =
      prevTravelerInfoRef.current.adults !== travelerInfo.adults ||
      prevTravelerInfoRef.current.children !== travelerInfo.children ||
      prevTravelerInfoRef.current.rooms !== travelerInfo.rooms;

    // Chỉ hiển thị thông báo khi thực sự có thay đổi
    if ((datesChanged || travelersChanged) && initialCheckDone.current) {
      // Cập nhật refs để tránh hiển thị thông báo lặp lại
      prevDatesRef.current = { from: selectedDates.from, to: selectedDates.to };
      prevTravelerInfoRef.current = { ...travelerInfo };

      // Hiển thị toast thông báo
      toast({
        title: "Dates or guests changed",
        description:
          "Click 'Check Available Rooms' to see updated availability",
        variant: "default",
      });
    }
  }, [
    selectedDates.from,
    selectedDates.to,
    travelerInfo.adults,
    travelerInfo.children,
    travelerInfo.rooms,
  ]);

  // Sử dụng useEffect với debounce để tránh quá nhiều toasts
  useEffect(() => {
    const notificationTimer = setTimeout(handleUserSelectionChanges, 300);
    return () => clearTimeout(notificationTimer);
  }, [handleUserSelectionChanges]);

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
        hotelName:
          data?.hotel?.original_hotel?.name ||
          data?.hotel?.details?.data?.name ||
          "Hotel",
        hotelLocation: data?.hotel?.original_hotel?.location ||
          data?.hotel?.details?.data?.location || {
            latitude: 10.8231,
            longitude: 106.6297,
          },
        hotelAddress: data?.hotel?.details?.data?.address || "",
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
        description: `Payment for ${selectedOffer.name} at ${data?.hotel?.original_hotel?.name || data?.hotel?.details?.data?.name || "Hotel"}`,
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
        description: `Payment for ${selectedOffer.name || "Room"} at ${data?.hotel?.original_hotel?.name || data?.hotel?.details?.data?.name || "Hotel"}`,
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
        router.push(
          `/stripe-simple-test?booking=${bookingId}&redirectUrl=${encodeURIComponent(`/bookings/stats?bookingId=${bookingId}&success=true`)}`
        );
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
      <div className="flex items-end gap-2">
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
        <Button
          className="bg-primary-500 h-[56px] hover:bg-orange-500 text-white"
          onClick={checkAvailableRooms}
          disabled={isLoading || !selectedDates.from || !selectedDates.to}
        >
          {isLoading ? "Checking Availability..." : "Check Available Rooms"}
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {/* Button để kiểm tra phòng khả dụng */}
        <div className="flex justify-between items-center mb-2">
          {/* <Button
            className="bg-primary-500 hover:bg-orange-500 text-white"
            onClick={checkAvailableRooms}
            disabled={isLoading || !selectedDates.from || !selectedDates.to}
          >
            {isLoading ? "Checking Availability..." : "Check Available Rooms"}
          </Button> */}

          {/* Hiển thị số lượng phòng khả dụng */}
          {!isLoading && availableRooms.length > 0 && (
            <div className="text-sm">
              <span className="font-medium">
                {
                  availableRooms.filter(
                    (room: any) => room.isAvailable !== false
                  ).length
                }{" "}
                rooms available
              </span>{" "}
              for your dates
            </div>
          )}
        </div>

        {/* Hiển thị trạng thái đang tải */}
        {isLoading && (
          <div className="flex justify-center items-center p-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
            <span className="ml-3 text-gray-600">
              Checking room availability...
            </span>
          </div>
        )}

        {/* Hiển thị thông báo khi không có phòng phù hợp */}
        {noAvailableRooms && !isLoading && (
          <div className="flex justify-center items-center p-10 bg-gray-100 rounded-lg">
            <IoMdCloseCircle size={24} className="text-red-500 mr-2" />
            <span className="text-gray-700">
              Sorry, no rooms available for your selected dates and guests.
              Please try different dates or guest count.
            </span>
          </div>
        )}

        {/* Danh sách các phòng */}
        {availableRooms.map((offer: any, index: number) => {
          // Kiểm tra xem offer có hợp lệ không
          if (!offer || typeof offer !== "object") {
            console.error("Invalid offer data:", offer);
            return null;
          }

          // Bỏ qua logging quá nhiều để tránh re-render liên tục
          // Chỉ log khi cần debug
          // console.log(`Rendering offer ${index}:`, {
          //   name: offer?.name,
          //   isAvailable: offer?.isAvailable,
          //   availableCount: offer?.availableCount
          // });

          const listImgs = Array.isArray(offer?.images)
            ? offer.images
                .filter((img: any) => img && img.url)
                .map((img: any) => img.url)
            : [];

          // Fallback to hotel images if offer doesn't have images
          if (!listImgs.length && data?.hotel?.details?.data?.lodging?.images) {
            data.hotel.details.data.lodging.images.forEach((img: any) => {
              if (img && img.url) listImgs.push(img.url);
            });
          }

          // Bỏ qua các phòng không còn trống nếu có thuộc tính isAvailable
          if (
            offer.hasOwnProperty("isAvailable") &&
            offer.isAvailable === false
          ) {
            return null;
          }

          // Đảm bảo mỗi key là duy nhất và không phải NaN
          // Tạo key an toàn từ tên phòng và index
          const safeRoomName =
            (offer?.name || "").replace(/[^a-z0-9]/gi, "") || `room-${index}`;
          const uniqueKey = `room-${safeRoomName}-${index}`;

          return (
            <div
              key={uniqueKey}
              className={offer.isAvailable === false ? "opacity-50" : ""}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex gap-2">
                  <ImageGallery
                    images={listImgs}
                    mainImageIndex={0}
                    alt={`Room ${offer?.name || "Option"} ${index + 1}`}
                    className="w-fit"
                  />
                  <div>
                    <div className="flex items-center">
                      <h1 className="text-[24px] font-bold mr-2">
                        {offer?.name}
                      </h1>
                      {offer.hasOwnProperty("availableCount") && (
                        <span
                          className={`text-xs px-2 py-1 rounded ${offer.availableCount > 3 ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}`}
                        >
                          {offer.availableCount} left
                        </span>
                      )}
                    </div>
                    <div className="text-[12px]">
                      <p>
                        {offer?.priceRate?.bedGroups?.[0]?.description ||
                          "1 King Bed"}
                      </p>
                      <p>{offer?.areaSquareMeters || "30"} meters</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="font-semibold text-gray-700">
                          Capacity:
                        </span>
                        <span className="flex">
                          {(offer?.maxPeople?.adults || 2) > 0 &&
                            Array.from({
                              length: Math.min(
                                offer?.maxPeople?.adults || 2,
                                4
                              ),
                            }).map((_, index) => (
                              <FaUser
                                size={12}
                                key={"adult" + index}
                                className="text-blue-500"
                              />
                            ))}
                          {(offer?.maxPeople?.children || 0) > 0 &&
                            Array.from({
                              length: Math.min(
                                offer?.maxPeople?.children || 0,
                                4
                              ),
                            }).map((_, index) => (
                              <FaUser
                                size={10}
                                key={"child" + index}
                                className="text-blue-300"
                              />
                            ))}
                        </span>
                      </div>
                      <p>
                        {offer?.amenitiesAndAttributes?.[0]?.name ||
                          "Air conditioning"}
                      </p>
                      <h1 className="font-bold text-gray-700 cursor-pointer mt-1">
                        See all details
                      </h1>
                    </div>
                    {offer?.priceRate?.cancellationPolicy?.type ===
                    "fullRefund" ? (
                      <div className="flex gap-2 items-center text-green-400 text-[14px] font-bold mt-1">
                        <CheckCircle size={14} />
                        <p>Free cancellation</p>
                      </div>
                    ) : (
                      <div className="flex gap-2 items-center text-red-500 text-[14px] font-bold mt-1">
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
                      disabled={
                        isBooking ||
                        !session?.user ||
                        (offer.hasOwnProperty("isAvailable") &&
                          !offer.isAvailable)
                      }
                    >
                      {isBooking
                        ? "Processing..."
                        : !session?.user
                          ? "Login to Book"
                          : offer.hasOwnProperty("isAvailable") &&
                              !offer.isAvailable
                            ? "Unavailable"
                            : "Book Now"}
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
          hotelName={
            data?.hotel?.original_hotel?.name ||
            data?.hotel?.details?.data?.name ||
            "Hotel"
          }
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
