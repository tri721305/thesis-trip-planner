import React from "react";
import ProfileContent from "@/components/profile/ProfileContent";
import {
  getUserById,
  getUserPlans,
  getUserGuides,
} from "@/lib/actions/user.action";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const ProfilePage = async ({ params }: { params: { id: string } }) => {
  const session = await auth();

  if (!session) {
    redirect("/sign-in");
  }

  // Get user data
  const { id } = params;
  console.log("ProfilePage - userId:", id);
  const userData = await getUserById({ userId: id });

  if (!userData.success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold">User not found</h1>
        <p className="text-gray-500 mt-2">
          The user you are looking for does not exist.
        </p>
      </div>
    );
  }

  // Get user's plans
  const userPlans = await getUserPlans({
    userId: id,
    page: 1,
    pageSize: 10,
  });

  // Get user's guides
  const userGuides = await getUserGuides({
    userId: id,
    page: 1,
    pageSize: 10,
  });

  // Check if this is the current user's profile
  const isCurrentUser = session?.user?.id === id;
  const currentUserId = session?.user?.id || "";

  return (
    <ProfileContent
      user={userData.data}
      plans={userPlans.success ? userPlans.data : []}
      guides={userGuides.success ? userGuides.data : []}
      isCurrentUser={isCurrentUser}
      currentUserId={currentUserId}
    />
  );
};

export default ProfilePage;
