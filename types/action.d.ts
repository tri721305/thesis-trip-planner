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
}

interface UpdatePlannerParams {
  plannerId: string;
  title?: string;
  image?: string;
  note?: string;
  generalTips?: string;
  destination?: {
    name: string;
    coordinates: [number, number];
    type: "province" | "ward";
    provinceId?: string;
    wardId?: string;
  };
  startDate?: string | Date;
  endDate?: string | Date;
  type?: "public" | "private" | "friend";
  state?: "planning" | "confirmed" | "ongoing" | "completed" | "cancelled";
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
      content?: string;
      items?: string[];
      completed?: boolean[];
      name?: string;
      address?: string;
      description?: string;
      tags?: string[];
      phone?: string;
      images?: string[];
      website?: string;
      imageKeys?: string[];
      location?: {
        type: "Point";
        coordinates: [number, number];
      };
      note?: string;
    }>;
  }>;
}
