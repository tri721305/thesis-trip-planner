import dbConnect from "@/lib/mongoose";
import Guide from "@/database/guide.model";

export async function getFirstGuideForTesting() {
  try {
    await dbConnect();

    // Get the first guide from database
    const guide = await Guide.findOne().lean();

    if (guide) {
      return {
        _id: (guide as any)._id.toString(),
        title: (guide as any).title,
        upvotes: (guide as any).upvotes || 0,
        downvotes: (guide as any).downvotes || 0,
        views: (guide as any).views || 0,
        comments: (guide as any).comments || 0,
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching guide for testing:", error);
    return null;
  }
}

// Helper function to create a test guide if none exists
export async function createTestGuideIfNeeded() {
  try {
    await dbConnect();

    // Check if any guide exists
    const existingGuide = await Guide.findOne();

    if (!existingGuide) {
      // Create a test guide
      const testGuide = await Guide.create({
        title: "Test Guide for Voting System",
        note: "This is a test guide created for testing the voting system.",
        author: "test-author-id", // Replace with actual user ID if needed
        destination: {
          name: "Test Destination",
          coordinates: [106.6297, 10.8231], // Ho Chi Minh City coordinates
          type: "province",
          provinceId: "test-province-id",
        },
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        state: "planning",
        type: "public",
        details: [],
        upvotes: 5,
        downvotes: 2,
        views: 123,
        comments: 8,
      });

      return {
        _id: testGuide._id.toString(),
        title: testGuide.title,
        upvotes: testGuide.upvotes,
        downvotes: testGuide.downvotes,
        views: testGuide.views,
        comments: testGuide.comments,
      };
    }

    return {
      _id: existingGuide._id.toString(),
      title: existingGuide.title,
      upvotes: existingGuide.upvotes || 0,
      downvotes: existingGuide.downvotes || 0,
      views: existingGuide.views || 0,
      comments: existingGuide.comments || 0,
    };
  } catch (error) {
    console.error("Error creating test guide:", error);
    return null;
  }
}
