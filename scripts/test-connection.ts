import dbConnect from "@/lib/mongoose";
import Ward from "@/database/ward.model";

async function testConnection() {
  try {
    console.log("🚀 Testing MongoDB connection...");

    const startTime = Date.now();
    await dbConnect();
    const connectionTime = Date.now() - startTime;

    console.log(`✅ Connected to MongoDB in ${connectionTime}ms`);

    // Test query
    const count = await Ward.countDocuments();
    console.log(`📊 Current wards count: ${count}`);

    console.log("🎉 Connection test successful!");
  } catch (error) {
    console.error("❌ Connection test failed:", error);
  }
}

if (require.main === module) {
  testConnection()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
