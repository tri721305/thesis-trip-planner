/**
 * Helper script to fix guides that don't have an author field
 * This can be run as a server action or in the API route
 */

import Guide from "@/database/guide.model";
import User from "@/database/user.model";
import dbConnect from "../mongoose";
import mongoose from "mongoose";

export async function fixGuidesWithoutAuthor() {
  try {
    await dbConnect();

    // Find guides without author
    const guidesWithoutAuthor = await Guide.find({
      $or: [
        { author: { $exists: false } },
        { author: null },
        { author: undefined },
      ],
    });

    console.log(`Found ${guidesWithoutAuthor.length} guides without author`);

    if (guidesWithoutAuthor.length === 0) {
      return { success: true, message: "No guides need author update" };
    }

    // Get the first user in the database to use as default author
    const defaultUser = await User.findOne().lean();

    if (!defaultUser) {
      return {
        success: false,
        message: "No users found in database to set as author",
      };
    }

    console.log(`Using user ${(defaultUser as any).email} as default author`);

    // Update all guides without author
    const updateResult = await Guide.updateMany(
      {
        $or: [
          { author: { $exists: false } },
          { author: null },
          { author: undefined },
        ],
      },
      { author: new mongoose.Types.ObjectId((defaultUser as any)._id) }
    );

    console.log(`Updated ${updateResult.modifiedCount} guides`);

    return {
      success: true,
      message: `Updated ${updateResult.modifiedCount} guides with author ${(defaultUser as any).email}`,
      updatedCount: updateResult.modifiedCount,
    };
  } catch (error) {
    console.error("Error fixing guides author:", error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
