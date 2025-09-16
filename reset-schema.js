// Reset database schema để apply discriminator changes
const mongoose = require("mongoose");

async function resetDatabase() {
  try {
    console.log("🔄 Connecting to database...");
    await mongoose.connect(
      "mongodb+srv://22521407:ThanNhan123@thesis.sps6xgb.mongodb.net/thesis"
    );

    console.log("🗑️ Dropping travel_plans collection to reset schema...");
    await mongoose.connection.db.collection("travel_plans").drop();
    console.log("✅ Collection dropped successfully");

    console.log(
      "🎯 Schema reset completed. Discriminators will be re-initialized on next model usage."
    );
  } catch (error) {
    if (error.message.includes("ns not found")) {
      console.log("✅ Collection was already empty or non-existent");
    } else {
      console.error("❌ Error:", error.message);
    }
  } finally {
    mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
}

resetDatabase();
