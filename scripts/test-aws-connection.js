// Simple script to test AWS S3 connection
const { S3Client, ListBucketsCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

async function testAwsConnection() {
  console.log("🔍 Testing AWS S3 connection...");

  // Check for required environment variables
  const requiredVars = [
    "AWS_REGION",
    "AWS_S3_BUCKET_NAME",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
  ];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error("❌ Missing environment variables:", missingVars.join(", "));
    console.error("Please add these to your .env file");
    process.exit(1);
  }

  console.log("✅ All required environment variables are present");

  // Create S3 client
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  try {
    // Test by listing buckets (a basic operation that requires valid credentials)
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);

    console.log("✅ Successfully connected to AWS S3!");
    console.log(`Found ${response.Buckets?.length || 0} buckets`);

    // Check if the specified bucket exists
    const bucketExists = response.Buckets?.some(
      (bucket) => bucket.Name === process.env.AWS_S3_BUCKET_NAME
    );

    if (bucketExists) {
      console.log(
        `✅ Bucket "${process.env.AWS_S3_BUCKET_NAME}" exists and is accessible`
      );
    } else {
      console.warn(
        `⚠️ Bucket "${process.env.AWS_S3_BUCKET_NAME}" was not found in your account`
      );
      console.warn("Please check the bucket name in your .env file");
    }
  } catch (error) {
    console.error("❌ Failed to connect to AWS S3:", error.message);
    if (error.name === "CredentialsProviderError") {
      console.error("Please check your AWS credentials in the .env file");
    } else if (error.name === "AccessDenied") {
      console.error("Access denied. Please check your IAM permissions");
    }
    process.exit(1);
  }
}

testAwsConnection().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
