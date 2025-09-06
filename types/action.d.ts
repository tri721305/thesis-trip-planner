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
