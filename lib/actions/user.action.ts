"use server";

import User from "@/database/user.model";
import action from "../handler/action";
import { handleError } from "../handler/error";
import { GetUserByEmailSchema } from "../validation";
import dbConnect from "../mongoose";
import { NotFoundError } from "../http-errors";
import { uploadMultipleImagesAction } from "./upload.action";

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

// Get user by ID
export async function getUserById({
  userId,
}: {
  userId: string;
}): Promise<ActionResponse> {
  try {
    // Ensure database connection
    await dbConnect();

    const user = await User.findById(userId).select("-password");

    if (!user) {
      throw new NotFoundError("User");
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(user)),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

// Update user profile image
export async function updateUserProfileImage({
  userId,
  imageFile,
}: {
  userId: string;
  imageFile: File;
}): Promise<ActionResponse> {
  try {
    // Ensure database connection
    await dbConnect();

    // Upload image to S3 using the shared upload function
    const uploadResult = await uploadMultipleImagesAction([imageFile]);

    if (
      !uploadResult.success ||
      !uploadResult.data ||
      uploadResult.data.length === 0
    ) {
      throw new Error(uploadResult.error || "Failed to upload image");
    }

    // Get the image URL from the upload result
    const imageUrl = uploadResult.data[0].url;

    // Import Account model dynamically to avoid circular dependencies
    const Account = (await import("@/database/account.model")).default;

    // Update user in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          image: imageUrl,
        },
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      throw new NotFoundError("User");
    }

    // Update all accounts associated with this user
    const accounts = await Account.find({ userId: userId });
    
    if (accounts && accounts.length > 0) {
      console.log(`Found ${accounts.length} accounts to update with new image`);
      
      // Update image for all accounts belonging to this user
      await Account.updateMany(
        { userId: userId },
        {
          $set: {
            image: imageUrl,
          },
        }
      );
      
      console.log("All associated accounts updated with new profile image");
    } else {
      console.log("No accounts found for this user");
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedUser)),
    };
  } catch (error) {
    console.error("Error updating profile image:", error);
    return handleError(error) as ErrorResponse;
  }
}

// Get all user plans
export async function getUserPlans({
  userId,
  page = 1,
  pageSize = 10,
  filter = {},
}: {
  userId: string;
  page?: number;
  pageSize?: number;
  filter?: Record<string, any>;
}): Promise<ActionResponse> {
  try {
    // Ensure database connection
    await dbConnect();

    // First check if user exists
    const userExists = await User.exists({ _id: userId });

    if (!userExists) {
      throw new NotFoundError("User");
    }

    // Import dynamically to avoid circular dependencies
    const TravelPlan = (await import("@/database/plan.model")).default;

    // Combine filter with user ID
    const combinedFilter = {
      ...filter,
      author: userId,
    };

    // Calculate pagination
    const skip = (page - 1) * pageSize;

    // Get plans
    const plans = await TravelPlan.find(combinedFilter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    // Get total count
    const totalCount = await TravelPlan.countDocuments(combinedFilter);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(plans)),
      metadata: {
        totalCount,
        currentPage: page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

// Get all user guides
export async function getUserGuides({
  userId,
  page = 1,
  pageSize = 10,
  filter = {},
}: {
  userId: string;
  page?: number;
  pageSize?: number;
  filter?: Record<string, any>;
}): Promise<ActionResponse> {
  try {
    // Ensure database connection
    await dbConnect();

    // First check if user exists
    const userExists = await User.exists({ _id: userId });

    if (!userExists) {
      throw new NotFoundError("User");
    }

    // Import dynamically to avoid circular dependencies
    const Guide = (await import("@/database/guide.model")).default;

    // Combine filter with user ID
    const combinedFilter = {
      ...filter,
      author: userId,
    };

    // Calculate pagination
    const skip = (page - 1) * pageSize;

    // Get guides
    const guides = await Guide.find(combinedFilter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    // Get total count
    const totalCount = await Guide.countDocuments(combinedFilter);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(guides)),
      metadata: {
        totalCount,
        currentPage: page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
