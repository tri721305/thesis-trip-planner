import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Enable experimental server actions
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // Increased limit for file uploads
    },
  },

  // Image configuration for optimization
  images: {
    domains: [
      "localhost",
      "s3.amazonaws.com",
      // Add your S3 bucket domain here - for example:
      "s3.us-east-1.amazonaws.com",
      // Add any custom domains you might use
    ],
    // Add specific patterns if needed
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
        pathname: "/**",
      },
    ],
  },

  // Environment variables that should be available to the client
  env: {
    AWS_REGION: process.env.AWS_REGION,
    AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
    // Don't expose access keys to the client
  },
};

export default nextConfig;
