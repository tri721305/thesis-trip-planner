"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";

interface ImageRecord {
  _id?: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  contentType: string;
  uploadedAt: Date;
  userId?: string;
}

interface UploadResult {
  success: boolean;
  data?: {
    // id: string;
    url: string;
    filename: string;
  };
  error?: string;
}

// Create S3 client with more explicit error handling
const S3ClientConfig = new S3Client({
  region: process.env.AWS_REGION || "us-east-1", // Provide a fallback region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
  // Add this option to use path-style URLs which can be more compatible
  forcePathStyle: true,
});

// Upload Image
export async function uploadImageAction(
  formData: FormData
): Promise<UploadResult> {
  console.log("Environment", process.env.AWS_S3_BUCKET_NAME);
  try {
    const file = formData.get("image") as File;
    console.log("file Server actions", file);

    if (!file || file.size === 0) {
      return { success: false, error: "No file provided" };
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.",
      };
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { success: false, error: "File size exceeds 5MB limit" };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const filename = `images/${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("buffer", buffer);

    // Log AWS environment variables (without secret key)
    console.log("AWS Config:", {
      region: process.env.AWS_REGION,
      bucketName: process.env.AWS_S3_BUCKET_NAME,
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
    });

    // Validate environment variables
    if (!process.env.AWS_S3_BUCKET_NAME) {
      throw new Error("AWS_S3_BUCKET_NAME environment variable is not set");
    }

    // Upload to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
      ContentDisposition: "inline",
      Metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });

    console.log("upload Command params:", {
      bucket: process.env.AWS_S3_BUCKET_NAME,
      key: filename,
      contentType: file.type,
    });

    try {
      await S3ClientConfig.send(uploadCommand);
    } catch (error) {
      console.error("S3 Upload Error Details:", error);
      throw error;
    }

    // Construct S3 URL - handle different URL formats based on region
    let s3Url;
    if (process.env.AWS_REGION === "us-east-1") {
      s3Url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${filename}`;
    } else {
      s3Url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${filename}`;
    }

    // Alternative: if you've configured a custom domain or CDN for your bucket
    if (process.env.NEXT_PUBLIC_S3_URL_PREFIX) {
      s3Url = `${process.env.NEXT_PUBLIC_S3_URL_PREFIX}/${filename}`;
    }

    console.log("s3Url", s3Url);

    return {
      success: true,
      data: {
        url: s3Url,
        filename: file.name,
      },
    };
    // Store metadata in MongoDB
  } catch (error) {
    console.error("Upload error:", error);

    // Provide more specific error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes("credentials")) {
        return {
          success: false,
          error:
            "AWS credential error: Please check your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env file",
        };
      } else if (
        error.message.includes("bucket") ||
        error.message.includes("Bucket")
      ) {
        return {
          success: false,
          error:
            "S3 bucket error: Please verify your AWS_S3_BUCKET_NAME and permissions",
        };
      } else if (error.message.includes("signature")) {
        return {
          success: false,
          error: "AWS signature error: Credentials may be incorrect or expired",
        };
      }
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Upload failed: Unknown error",
    };
  } finally {
    console.log("Upload process completed");
  }
}
