import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect("/sign-in");
  }

  // Redirect to the current user's profile
  if (session.user?.id) {
    redirect(`/profile/${session.user.id}`);
  } else {
    // If user ID is somehow not available, redirect to home
    redirect("/");
  }
}
