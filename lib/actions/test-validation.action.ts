"use server";

import { z } from "zod";

// Test schema đơn giản
const TestSchema = z.object({
  title: z.string().min(5),
  note: z.string().min(1),
});

export async function testValidation(params: any) {
  console.log("🧪 Testing validation with:", params);

  try {
    // Direct validation without action handler
    const result = TestSchema.parse(params);
    console.log("✅ Validation passed:", result);

    return {
      success: true,
      message: "Validation passed!",
      data: result,
    };
  } catch (error) {
    console.error("❌ Validation failed:", error);

    if (error instanceof z.ZodError) {
      console.log("Zod errors:", error.errors);
      return {
        success: false,
        message: "Validation failed",
        errors: error.errors,
      };
    }

    return {
      success: false,
      message: "Unknown error",
      error: error,
    };
  }
}
