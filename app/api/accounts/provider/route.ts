import Account from "@/database/account.model";
import { handleError } from "@/lib/handler/error";
import { NotFoundError, ValidationError } from "@/lib/http-errors";
import dbConnect from "@/lib/mongoose";
import { AccountSchema, UserSchema } from "@/lib/validation";
import { APIErrorResponse } from "@/types/global";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { providerAccountId } = await request.json();

  try {
    await dbConnect();

    const validatedData = AccountSchema.partial().safeParse({
      providerAccountId,
    });

    if (!validatedData.success) {
      throw new ValidationError(validatedData.error.flatten().fieldErrors);
    }

    const account = await Account.findOne({ providerAccountId });

    if (!account) throw new NotFoundError("Account");

    return NextResponse.json(
      {
        success: true,
        data: account,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
