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
    id: string;
    url: string;
    filename: string;
  };
  error?: string;
}

const S3ClientConfig = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
