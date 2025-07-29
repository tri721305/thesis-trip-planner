"use server";

import { auth } from "@/auth";

export async function checkSession() {
  try {
    const session = await auth();

    console.log("Session check result:", session);

    return {
      success: true,
      data: {
        hasSession: !!session,
        user: session?.user || null,
        sessionId: session?.user?.id || null,
      },
    };
  } catch (error) {
    console.error("Session check error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
