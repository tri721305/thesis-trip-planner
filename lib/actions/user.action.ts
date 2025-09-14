"use server";

import User from "@/database/user.model";
import action from "../handler/action";
import { handleError } from "../handler/error";
import { GetUserByEmailSchema } from "../validation";
import dbConnect from "../mongoose";

export async function getUserByEmail(
  params: GetUserByEmailParams
): Promise<ActionResponse<{}>> {
  console.log("🔍 getUserByEmail called with params:", params);

  const validationResult = await action({
    params,
    schema: GetUserByEmailSchema,
    authorize: false,
  });

  console.log("✅ Validation result:", validationResult);

  if (validationResult instanceof Error) {
    console.log("❌ Validation failed:", validationResult);
    return handleError(validationResult) as ErrorResponse;
  }

  const { email } = validationResult.params!;
  console.log("📧 Searching for email:", email);

  try {
    // Ensure database connection
    await dbConnect();
    console.log("🔌 Database connected");

    // Try multiple search methods
    console.log("🔍 Method 1: Exact match...");
    let user = await User.findOne({ email: email }).lean();
    console.log("📧 Method 1 result:", user);

    if (!user) {
      console.log("🔍 Method 2: Case-insensitive regex...");
      user = await User.findOne({
        email: { $regex: new RegExp(`^${email}$`, "i") },
      }).lean();
      console.log("📧 Method 2 result:", user);
    }

    if (!user) {
      console.log("🔍 Method 3: Searching all users...");
      const allUsers = await User.find({}).select("email name username").lean();
      console.log("👥 All users in database:", allUsers);

      // Try to find user manually
      const foundUser = allUsers.find(
        (u) => u.email?.toLowerCase() === email.toLowerCase()
      );
      user = foundUser || null; // Convert undefined to null to match the expected type
      console.log("📧 Method 3 result:", user);
    }

    if (!user) {
      console.log("❌ No user found with any method");
      return {
        success: false,
        error: {
          message: "Không tìm thấy người dùng với email này",
        },
      };
    }

    console.log("✅ User found successfully:", user);
    return {
      success: true,
      data: JSON.parse(JSON.stringify(user)),
    };
  } catch (error) {
    console.error("💥 Error in getUserByEmail:", error);
    return handleError(error) as ErrorResponse;
  }
}
