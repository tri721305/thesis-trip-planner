import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Guide from "@/database/guide.model";

export async function GET() {
  try {
    await dbConnect();

    // Get first 5 guides for testing
    const guides = await Guide.find()
      .select("_id title upvotes downvotes views comments")
      .limit(5)
      .lean();

    return NextResponse.json({
      success: true,
      guides: guides.map((guide) => ({
        _id: (guide as any)._id.toString(),
        title: (guide as any).title || "Untitled Guide",
        upvotes: (guide as any).upvotes || 0,
        downvotes: (guide as any).downvotes || 0,
        views: (guide as any).views || 0,
        comments: (guide as any).comments || 0,
      })),
    });
  } catch (error) {
    console.error("Error fetching guides for testing:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch guides",
      },
      { status: 500 }
    );
  }
}
