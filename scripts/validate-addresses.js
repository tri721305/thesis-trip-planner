require("dotenv").config();
const mongoose = require("mongoose");
const { Lodging } = require("../database/hotel.model");

async function validateAddresses() {
  try {
    console.log("🔍 Validating hotel addresses...");
    console.log("🔌 Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Count total hotels
    const totalHotels = await Lodging.countDocuments();
    console.log(`📊 Total hotels in database: ${totalHotels}`);

    // Count hotels with addresses
    const hotelsWithAddresses = await Lodging.countDocuments({
      address: { $exists: true, $ne: null, $ne: "" },
    });
    console.log(`🏨 Hotels with addresses: ${hotelsWithAddresses}`);

    // Calculate percentage
    const percentage = ((hotelsWithAddresses / totalHotels) * 100).toFixed(1);
    console.log(`📈 Address coverage: ${percentage}%`);

    // Sample some hotels with addresses
    console.log("\n📋 Sample hotels with addresses:");
    const sampleHotels = await Lodging.find({
      address: { $exists: true, $ne: null, $ne: "" },
    }).limit(5);

    sampleHotels.forEach((hotel, index) => {
      console.log(`  ${index + 1}. ${hotel.title}`);
      console.log(`     Address: ${hotel.address}`);
      console.log(`     Offer ID: ${hotel.offerId}`);
      console.log("");
    });

    // Check for hotels without addresses
    const hotelsWithoutAddresses = await Lodging.countDocuments({
      $or: [
        { address: { $exists: false } },
        { address: null },
        { address: "" },
      ],
    });

    if (hotelsWithoutAddresses > 0) {
      console.log(`⚠️  Hotels without addresses: ${hotelsWithoutAddresses}`);

      // Sample hotels without addresses
      const sampleWithoutAddress = await Lodging.find({
        $or: [
          { address: { $exists: false } },
          { address: null },
          { address: "" },
        ],
      }).limit(3);

      console.log("   Sample hotels without addresses:");
      sampleWithoutAddress.forEach((hotel, index) => {
        console.log(`   ${index + 1}. ${hotel.title} (ID: ${hotel.offerId})`);
      });
    }

    console.log("\n✅ Address validation completed");
  } catch (error) {
    console.error("❌ Error validating addresses:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Database connection closed");
  }
}

validateAddresses();
