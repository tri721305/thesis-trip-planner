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
