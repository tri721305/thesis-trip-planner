import { NextResponse } from "next/server";
import { fixGuidesWithoutAuthor } from "@/lib/test-helpers/fix-guides-author";

export async function POST() {
  try {
    const result = await fixGuidesWithoutAuthor();

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error("Error in fix-guides-author API:", error);
    return NextResponse.json(
      {
        success: false,
        message: `API Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST method to fix guides without author",
    endpoint: "/api/test/fix-guides-author",
  });
}
