import mongoose from "mongoose";
import dbConnect from "@/lib/mongoose";

async function checkWards() {
  try {
    await dbConnect();
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    const wardsCount = await db.collection("wards").countDocuments();
    console.log("📊 Total wards in database:", wardsCount);

    // Count by type
    const wardsByType = await db
      .collection("wards")
      .aggregate([
        { $group: { _id: "$loai", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    console.log("\n📋 Wards by type:");
    wardsByType.forEach((type) => {
      console.log(`   ${type._id}: ${type.count}`);
    });

    // Sample wards
    const sampleWards = await db
      .collection("wards")
      .find({})
      .limit(5)
      .toArray();
    console.log("\n📋 Sample wards:");
    sampleWards.forEach((ward, index) => {
      console.log(
        `   ${index + 1}. ${ward.tenhc} (${ward.loai}) - Mã: ${ward.ma} - DT: ${ward.dientichkm2}km² - DS: ${ward.dansonguoi?.toLocaleString()}`
      );
    });

    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkWards();
