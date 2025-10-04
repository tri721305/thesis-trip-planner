"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/database/user.model";

/**
 * Lấy thông tin người dùng hiện tại từ session
 * @returns Thông tin người dùng hoặc null nếu chưa đăng nhập
 */
export async function getCurrentUser() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return null;
    }

    await dbConnect();

    // Lấy thông tin đầy đủ của user từ database
    const user = await User.findById(session.user.id).select("-password");

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}
