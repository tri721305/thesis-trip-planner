import { ILodging } from "@/database/blog.model";
import { NextResponse } from "next/server";

declare global {
  interface Tag {
    _id: string;
    name: string;
  }

  interface Author {
    _id: string;
    name: string;
    image: string;
  }

  interface Blog {
    _id: string;
    title: string;
    description: string;
    note: string;
    tags: Types.ObjectId[];
    views: number;
    upvotes: number;
    downvotes: number;
    comments: number;
    author: Types.ObjectId;
    lodging: ILodging[];
  }

  // Hotel Booking Types
  interface BookingGuestInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    specialRequests?: string;
  }

  interface BookedRoom {
    roomName: string;
    roomType: string;
    maxPeople: {
      total?: number;
      adults?: number;
      children?: number;
    };
    areaSquareMeters?: number;
    amenities: string[];
    bedGroups?: string[];
    pricePerNight: number;
    currency: string;
    quantity: number;
  }

  interface BookedHotel {
    hotelId: number;
    name: string;
    location: {
      longitude: number;
      latitude: number;
    };
    address?: string;
    images?: Array<{
      url: string;
      thumbnailUrl?: string;
    }>;
    amenities?: string[];
    rating?: {
      value: number;
      source: string;
    };
  }

  interface HotelBooking {
    _id: string;
    bookingId: string;
    userId: string;
    paymentId?: string;
    hotel: BookedHotel;
    rooms: BookedRoom[];
    checkInDate: Date;
    checkOutDate: Date;
    nights: number;
    guestInfo: BookingGuestInfo;
    guestCount: {
      adults: number;
      children: number;
      childrenAges?: number[];
    };
    pricing: {
      subtotal: number;
      taxes: number;
      fees: number;
      total: number;
      currency: string;
    };
    status: "pending" | "confirmed" | "cancelled" | "completed" | "no-show";
    paymentStatus: "pending" | "paid" | "failed" | "refunded";
    paymentMethod?: string;
    source: string;
    confirmationEmailSent: boolean;
    specialRequests?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
  }

  // Payment Types
  interface PaymentBillingDetails {
    name: string;
    email: string;
    phone?: string;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      state?: string;
      postalCode?: string;
      country: string;
    };
  }

  interface PaymentBreakdown {
    subtotal: number;
    taxes: number;
    fees: number;
    discount?: number;
    total: number;
    currency: string;
  }

  interface StripeInfo {
    paymentIntentId: string;
    clientSecret?: string;
    chargeId?: string;
    receiptUrl?: string;
    refundId?: string;
    failureCode?: string;
    failureMessage?: string;
  }

  interface PaymentRefund {
    refundId: string;
    amount: number;
    reason: string;
    status: "pending" | "succeeded" | "failed";
    createdAt: Date;
    processedAt?: Date;
    stripeRefundId?: string;
  }

  interface Payment {
    _id: string;
    paymentId: string;
    userId: string;
    bookingId: string;
    amount: number;
    currency: string;
    paymentMethod: "stripe" | "paypal" | "bank_transfer" | "cash";
    status:
      | "pending"
      | "processing"
      | "succeeded"
      | "failed"
      | "cancelled"
      | "refunded"
      | "partially_refunded";
    breakdown: PaymentBreakdown;
    billingDetails: PaymentBillingDetails;
    stripeInfo?: StripeInfo;
    transactionId?: string;
    referenceNumber?: string;
    refunds?: PaymentRefund[];
    retryCount: number;
    description?: string;
    notes?: string;
    source: string;
    processedAt?: Date;
    failedAt?: Date;
    refundedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }

  interface Question {
    _id: string;
    title: string;
    tags: Tag[];
    author: Author;
    createdAt: Date;
    upvotes: number;
    answers: number;
    views: number;
    createdAt: Date;
  }

  interface Guide {
    _id: string;
    title: string;
    content: string;
    tags: Tag[];
    author: Author;
    createdAt: Date;
    upvotes: number;
    downvotes: number;
    answers: number;
    views: number;
    createdAt: Date;
  }

  interface CreateGuideParams {
    title: string;
    content: string;
    tags: string[];
    images1?: File[];
  }

  interface AuthCredentials {
    name: string;
    username: string;
    email: string;
    password: string;
  }

  type ActionResponse<T = null> = {
    success: boolean;
    data?: T;
    error?: {
      message: string;
      details?: Record<string, string[]>;
    };
    status?: number;
  };

  type SuccessResponse<T = null> = ActionResponse<T> & {
    success: true;
  };

  type ErrorResponse = ActionResponse<undefined> & {
    success: false;
  };

  type APIErrorResponse = NextResponse<ErrorResponse>;
  type APIResponse<T = null> = NextResponse<SuccessResponse<T>> | ErrorResponse;

  interface RouteParams {
    params: Promise<Record<string, string>>;
    searchParams: Promise<Record<string, string>>;
  }

  interface DialogAction {
    label: string;
    onClick: () => void;
    variant?:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link";
    disabled?: boolean;
    loading?: boolean;
  }
  interface DialogActions {
    primary?: DialogAction;
    secondary?: DialogAction;
    cancel?: {
      label: string;
      onClick?: () => void;
    };
  }
  interface DialogData {
    title?: string;
    description?: string;
    content: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl" | "full";
    showCloseButton?: boolean;
    className?: string;
    headerClassName?: string;
    contentClassName?: string;
    actions?: DialogActions;
  }
  interface ReusableDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    data: DialogData;
  }

  // Test form GUIDE
  interface PlaceInfo {
    name: string;
    address: string;
    coordinates: [number, number];
    note: string;
    imgUrls: string[];
    duration?: string;
    cost?: {
      type: string;
      number: string;
    };
  }
  interface ItineraryItem {
    id: string;
    type: "place" | "note" | "checklist";
    position: number;
    data: {
      info: PlaceInfo | string | string[];
    };
  }

  interface DayRoute {
    id: string;
    type: "route";
    title: string;
    subheading: string;
    items: ItineraryItem[];
    autoFillDay?: boolean;
    optimizeRoute?: boolean;
    duration?: string;
    distance?: string;
  }

  interface ItineraryFormData {
    routes: DayRoute[];
  }

  interface PaginatedSearchParams {
    page?: number;
    pageSize?: number;
    query?: string;
    filter?: string;
    // filter?: {
    //   source?: string;
    //   sortBy?: string;
    // };
  }

  interface PaginatedSearchHotelParams {
    page?: number;
    pageSize?: number;
    query?: string;
    // filter?: string;
    filter?: {
      source?: string;
      sortBy?: string;
    };
  }

  interface Hotel {
    _id: string;
    offerId: string;
    name: string;
    images: object[];
    location: object;
    priceRates: object[];
    priceRate: object;
  }
  interface TravelPlan {
    _id: string;
    title: string;
    author: string;
    destination: {
      name: string;
      coordinates: [number, number];
      type: "province" | "ward";
      provinceId?: string;
      wardId?: string;
    };
    startDate: Date;
    endDate: Date;
    type: "public" | "private" | "friend";
    state: "planning" | "ongoing" | "completed" | "cancelled";
    tripmates: Array<{
      name: string;
      email?: string;
      image?: string;
      userId?: string;
    }>;
    lodging: Array<any>;
    details: Array<any>;
    createdAt: Date;
    updatedAt: Date;
  }
}

export {};
