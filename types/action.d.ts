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
