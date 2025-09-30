interface SignInWithOAuthParams {
  provider: "github" | "google" | "facebook";
  providerAccountId: string;
  user: {
    email: string;
    name: string;
    image: string;
    username: string;
  };
}

interface AuthCredentials {
  name: string;
  username: string;
  email: string;
  password: string;
}

// Hotel Booking Action Types
interface CreateHotelBookingParams {
  bookingId?: string; // Thêm bookingId là optional để có thể truyền từ client
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
  rooms: Array<{
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
  }>;
  checkInDate: string | Date;
  checkOutDate: string | Date;
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    specialRequests?: string;
  };
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
  specialRequests?: string;
  source?: string;
}

interface GetHotelBookingsParams {
  userId?: string;
  status?: "pending" | "confirmed" | "cancelled" | "completed" | "no-show";
  page?: number;
  pageSize?: number;
  sortBy?: "createdAt" | "checkInDate" | "total";
  sortOrder?: "asc" | "desc";
}

interface UpdateBookingStatusParams {
  bookingId: string;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no-show";
  notes?: string;
}

interface CancelBookingParams {
  bookingId: string;
  reason: string;
  refundAmount?: number;
}

// Payment Action Types
interface CreatePaymentParams {
  bookingId: string;
  amount: number;
  currency: string;
  paymentMethod: "stripe" | "paypal" | "bank_transfer" | "cash";
  breakdown: {
    subtotal: number;
    taxes: number;
    fees: number;
    discount?: number;
    total: number;
    currency: string;
  };
  billingDetails: {
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
  };
  description?: string;
  source?: string;
}

interface CreateStripePaymentIntentParams {
  paymentId: string;
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, string>;
}

interface UpdatePaymentStatusParams {
  paymentId: string;
  status:
    | "pending"
    | "processing"
    | "succeeded"
    | "failed"
    | "cancelled"
    | "refunded"
    | "partially_refunded";
  stripeInfo?: {
    paymentIntentId?: string;
    clientSecret?: string;
    chargeId?: string;
    receiptUrl?: string;
    failureCode?: string;
    failureMessage?: string;
  };
  transactionId?: string;
  notes?: string;
}

interface ProcessRefundParams {
  paymentId: string;
  amount: number;
  reason: string;
  stripeRefundId?: string;
}

interface GetPaymentsParams {
  userId?: string;
  bookingId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  sortBy?: "createdAt" | "amount" | "status";
  sortOrder?: "asc" | "desc";
}

interface ConfirmStripePaymentParams {
  paymentIntentId: string;
  paymentMethodId?: string;
}

interface CreateGuideParams {
  title: string;
  content: string;
  tags: string[];
  images1?: File[];
}

interface GetWardByProvinceIdParams {
  provinceId: string;
}

interface GetWardAndPolygonByIdParams {
  wardId: string;
}

interface GetWardByName {
  wardName: string;
}

interface GetUserByEmailParams {
  email: string;
}

interface CreatePlannerParams {
  title: string;
  destination: {
    name: string;
    coordinates: [number, number];
    type: "province" | "ward";
    provinceId?: string;
    wardId?: string;
  };
  startDate: string | Date;
  endDate: string | Date;
  type: "public" | "private" | "friend";
  details: [];
}

interface UpdatePlannerParams {
  plannerId: string;
  title?: string;
  image?: string;
  note?: string;
  generalTips?: string;
  destination?: {
    name: string;
    coordinates: number[];
    type: "province" | "ward";
    provinceId?: string;
    wardId?: string;
  };
  startDate?: string | Date;
  endDate?: string | Date;
  type?: "public" | "private" | "friend";
  state?: "planning" | "ongoing" | "completed" | "cancelled";
  tripmates?: Array<{
    name: string;
    email?: string;
    image?: string;
    userId?: string;
  }>;
  lodging?: Array<{
    name: string;
    address?: string;
    checkIn?: Date | string;
    checkOut?: Date | string;
    confirmation?: string;
    notes?: string;
    cost?: {
      type: string;
      value: number;
    };
  }>;
  details?: Array<{
    type: "route" | "list";
    name: string;
    index: number;
    data: Array<{
      type: "place" | "note" | "checklist";
      // Note fields
      content?: string;
      // Checklist fields
      items?: string[];
      completed?: boolean[];
      // Place fields - Basic info
      id?: string;
      name?: string;
      address?: string;
      description?: string;
      // Place fields - Categories and tags
      categories?: string[];
      tags?: string[];
      // Place fields - Contact info
      phone?: string;
      website?: string;
      // Place fields - Images
      images?: string[];
      imageKeys?: string[];
      // Place fields - Ratings
      rating?: number;
      numRatings?: number;
      // Place fields - External references
      attractionId?: number;
      priceLevel?: any;
      // Place fields - Opening hours
      openingPeriods?: Array<{
        open: {
          day: number;
          time: string;
        };
        close: {
          day: number;
          time: string;
        };
      }>;
      // Place fields - Location
      location?: {
        type: "Point";
        coordinates: number[];
      };
      // Place fields - Time and cost
      timeStart?: string;
      timeEnd?: string;
      cost?: {
        type?: string;
        value?: number;
        paidBy?: string;
        description?: string;
        splitBetween?: any[];
      };
      // Place fields - Notes
      note?: string;
    }>;
  }>;
}

interface GetHotelDetailByIdParams {
  hotelId: string;
}

interface GetHotelOfferByIdParams {
  hotelId: number;
}

// Vote types
interface CreateVoteParams {
  targetId: string;
  targetType: "guide" | "comment";
  voteType: "upvote" | "downvote";
}

interface UpdateVoteCountParams extends CreateVoteParams {
  change: 1 | -1;
}

type HasVotedParams = Pick<CreateVoteParams, "targetId" | "targetType">;

interface HasVotedResponse {
  hasUpvoted: boolean;
  hasDownvoted: boolean;
}

// Comment types
interface CreateCommentParams {
  content: string;
  guideId: string;
  parentComment?: string; // For replies
}

interface GetCommentsParams {
  guideId: string;
  page?: number;
  pageSize?: number;
  filter?: "latest" | "oldest" | "popular";
}

interface DeleteCommentParams {
  commentId: string;
}

interface UpdateCommentParams {
  commentId: string;
  content: string;
}

interface GetRepliesParams {
  parentCommentId: string;
  page?: number;
  pageSize?: number;
}
