"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function AuthDebug() {
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log("🔐 Auth Status:", {
      status,
      sessionExists: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userName: session?.user?.name,
      fullSession: session,
    });
  }, [session, status]);

  if (status === "loading") {
    return <div className="text-xs text-blue-500">Checking auth...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
        ❌ Not logged in - Please login to vote
      </div>
    );
  }

  return (
    <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
      ✅ Logged in as {session?.user?.email || session?.user?.name || "User"}
      {session?.user?.id && (
        <div>
          User ID: <code>{session.user.id}</code>
        </div>
      )}
    </div>
  );
}
