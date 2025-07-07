const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Load environment variables
dotenv.config();

// Import models - need to use dynamic import for ES modules
async function runSeed() {
  try {
    console.log("🚀 Starting Province seeding...");

    // Connect to MongoDB
    const MONGODB_URI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/travel_planner";
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Dynamic import for ES modules
    const { default: seedProvince } = await import("./seed-province.js");

    // Run seed
    const result = await seedProvince();
    console.log("🎉 Seeding completed successfully!");
  } catch (error) {
    console.error("💥 Error during seeding:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

runSeed();
