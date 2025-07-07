// import dotenv from "dotenv";
// import mongoose from "mongoose";
// import seedAllProvinces from "./seed-all-provinces";
// import dbConnect from "../lib/mongoose";

// // Load environment variables
// dotenv.config();

// async function main() {
//   try {
//     console.log("🚀 Starting All Provinces seeding...");

//     // Connect to MongoDB
//     await dbConnect();
//     console.log("✅ Connected to MongoDB");

//     // Run seed
//     await seedAllProvinces();
//     console.log("🎉 Seeding completed successfully!");
//   } catch (error) {
//     console.error("💥 Error during seeding:", error);
//     process.exit(1);
//   } finally {
//     await mongoose.disconnect();
//     console.log("🔌 Disconnected from MongoDB");
//     process.exit(0);
//   }
// }

// main();
