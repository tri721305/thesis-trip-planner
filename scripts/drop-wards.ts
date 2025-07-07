import mongoose from "mongoose";
import dbConnect from "@/lib/mongoose";

async function dropWardCollection() {
  try {
    await dbConnect();
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;

    // Drop all indexes first
    try {
      await db.collection("wards").dropIndexes();
      console.log("🗑️ Dropped all ward indexes");
    } catch (err: any) {
      if (err.code === 26) {
        console.log("ℹ️  No ward indexes to drop");
      } else {
        console.log("⚠️  Error dropping indexes:", err.message);
      }
    }

    // Drop ward collection if exists
    try {
      await db.collection("wards").drop();
      console.log("🗑️ Dropped wards collection");
    } catch (err: any) {
      if (err.code === 26) {
        console.log("ℹ️  Wards collection does not exist");
      } else {
        throw err;
      }
    }

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

dropWardCollection();
