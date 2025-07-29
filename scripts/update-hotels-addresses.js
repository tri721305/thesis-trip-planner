/**
 * MongoDB Hotels Address Update Script (JavaScript)
 * =================================================
 *
 * Updates the hotels collection in MongoDB with address information
 * from the processed hotels_with_addresses.json file.
 */

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

// Load environment variables
require("dotenv").config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = "tripplanner";

// Hotel Schema (simplified)
const hotelSchema = new mongoose.Schema(
  {
    offerId: { type: String, required: true, unique: true },
    lodging: {
      name: String,
      address: String, // This is what we're adding
      location: {
        latitude: Number,
        longitude: Number,
      },
    },
  },
  {
    timestamps: true,
    strict: false, // Allow other fields
  }
);

const Hotel = mongoose.model("Hotel", hotelSchema);

class HotelAddressUpdater {
  constructor() {
    this.stats = {
      totalProcessed: 0,
      successfulUpdates: 0,
      failedUpdates: 0,
      skippedNoAddress: 0,
      skippedNotFound: 0,
      startTime: Date.now(),
    };
  }

  async connect() {
    try {
      console.log("🔌 Connecting to MongoDB...");
      await mongoose.connect(MONGODB_URI, {
        dbName: DB_NAME,
      });
      console.log("✅ Connected to MongoDB successfully");
      return true;
    } catch (error) {
      console.error("❌ Failed to connect to MongoDB:", error.message);
      return false;
    }
  }

  async loadAddressesData(filePath) {
    try {
      console.log(`📖 Loading addresses data from ${filePath}...`);

      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const rawData = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(rawData);

      if (!Array.isArray(data)) {
        throw new Error("Expected JSON array format");
      }

      // Filter hotels that have address information
      const hotelsWithAddresses = data.filter(
        (hotel) =>
          hotel &&
          hotel.offerId &&
          hotel.lodging &&
          hotel.lodging.address &&
          hotel.lodging.address.trim().length > 0
      );

      console.log(`✅ Loaded ${data.length} total hotels`);
      console.log(
        `🏨 Found ${hotelsWithAddresses.length} hotels with addresses`
      );

      return hotelsWithAddresses;
    } catch (error) {
      console.error(`❌ Error loading data:`, error.message);
      throw error;
    }
  }

  async createBackup() {
    try {
      console.log("💾 Creating backup of existing hotels collection...");

      const count = await Hotel.countDocuments({});
      console.log(`📊 Found ${count} hotels in existing collection`);

      if (count === 0) {
        console.log("⚠️  No existing hotels found - skipping backup");
        return "no-backup-needed";
      }

      // Create timestamp for backup
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupCollectionName = `hotels_backup_${timestamp}`;

      // Use aggregation to copy collection
      await Hotel.aggregate([{ $out: backupCollectionName }]);

      console.log(`✅ Backup created successfully: ${backupCollectionName}`);
      return backupCollectionName;
    } catch (error) {
      console.error(`❌ Failed to create backup:`, error.message);
      throw error;
    }
  }

  async updateHotelAddress(hotelData) {
    try {
      const { offerId, lodging } = hotelData;
      const address = lodging.address;

      if (!offerId) {
        return { success: false, message: "Missing offerId" };
      }

      if (!address) {
        return { success: false, message: "Missing address" };
      }

      // Update the hotel document
      const result = await Hotel.updateOne(
        { offerId: offerId },
        {
          $set: {
            "lodging.address": address,
            updatedAt: new Date(),
          },
        }
      );

      if (result.matchedCount === 0) {
        return { success: false, message: `Hotel not found: ${offerId}` };
      }

      if (result.modifiedCount === 1) {
        return { success: true, message: "Updated successfully" };
      } else {
        return { success: true, message: "Address already up to date" };
      }
    } catch (error) {
      return { success: false, message: `Update error: ${error.message}` };
    }
  }

  async updateAddressesBatch(hotels, batchSize = 25) {
    const totalHotels = hotels.length;

    if (totalHotels === 0) {
      console.log("⚠️  No hotels with addresses to update");
      return;
    }

    console.log(`\n🚀 Starting batch update process...`);
    console.log(`📊 Total hotels to update: ${totalHotels}`);
    console.log(`📦 Batch size: ${batchSize}`);

    for (let i = 0; i < totalHotels; i += batchSize) {
      const batch = hotels.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(totalHotels / batchSize);

      console.log(
        `\n📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} hotels)...`
      );

      const batchStart = Date.now();

      for (let j = 0; j < batch.length; j++) {
        const hotel = batch[j];
        this.stats.totalProcessed++;

        const { success, message } = await this.updateHotelAddress(hotel);

        let status;
        if (success) {
          this.stats.successfulUpdates++;
          status = "✅";
        } else {
          if (message.toLowerCase().includes("not found")) {
            this.stats.skippedNotFound++;
            status = "⚠️ ";
          } else if (message.toLowerCase().includes("missing address")) {
            this.stats.skippedNoAddress++;
            status = "⚠️ ";
          } else {
            this.stats.failedUpdates++;
            status = "❌";
          }
        }

        const hotelName = (hotel.lodging?.name || "Unknown").substring(0, 30);
        console.log(
          `  ${status} [${this.stats.totalProcessed}/${totalHotels}] ${hotelName}: ${message}`
        );
      }

      const batchTime = Date.now() - batchStart;

      // Calculate progress and ETA
      const progress = (this.stats.totalProcessed / totalHotels) * 100;
      const elapsed = Date.now() - this.stats.startTime;

      if (this.stats.totalProcessed > 0) {
        const avgTime = elapsed / this.stats.totalProcessed;
        const remaining = totalHotels - this.stats.totalProcessed;
        const etaSeconds = (remaining * avgTime) / 1000;
        const etaMins = etaSeconds / 60;

        console.log(
          `⏱️  Batch completed in ${batchTime}ms | Progress: ${progress.toFixed(1)}% | ETA: ${etaMins.toFixed(1)} mins`
        );
      }
    }

    this.stats.endTime = Date.now();
  }

  async verifyUpdates(sampleSize = 5) {
    try {
      console.log(`\n🔍 Verifying updates (sample of ${sampleSize})...`);

      const hotelsWithAddresses = await Hotel.find(
        { "lodging.address": { $exists: true } },
        { offerId: 1, "lodging.name": 1, "lodging.address": 1 }
      ).limit(sampleSize);

      if (hotelsWithAddresses.length > 0) {
        console.log(
          `✅ Found ${hotelsWithAddresses.length} hotels with addresses:`
        );
        hotelsWithAddresses.forEach((hotel) => {
          const name = (hotel.lodging?.name || "Unknown").substring(0, 30);
          const address = (hotel.lodging?.address || "").substring(0, 50);
          console.log(`  🏨 ${name}: ${address}...`);
        });
      } else {
        console.log("⚠️  No hotels found with address field");
      }
    } catch (error) {
      console.error(`❌ Verification failed:`, error.message);
    }
  }

  printFinalReport(backupCollection) {
    console.log("\n" + "=".repeat(60));
    console.log("📊 HOTEL ADDRESS UPDATE FINAL REPORT");
    console.log("=".repeat(60));

    if (this.stats.endTime) {
      const totalTime = this.stats.endTime - this.stats.startTime;
      console.log(
        `⏱️  Total processing time: ${(totalTime / 60000).toFixed(2)} minutes`
      );
      console.log(
        `📈 Processing rate: ${(this.stats.totalProcessed / (totalTime / 1000)).toFixed(1)} hotels/second`
      );
    }

    console.log(`\n📊 Update Statistics:`);
    console.log(`   • Total processed: ${this.stats.totalProcessed}`);
    console.log(`   • Successful updates: ${this.stats.successfulUpdates}`);
    console.log(`   • Failed updates: ${this.stats.failedUpdates}`);
    console.log(`   • Skipped (not found): ${this.stats.skippedNotFound}`);
    console.log(`   • Skipped (no address): ${this.stats.skippedNoAddress}`);

    const successRate =
      this.stats.totalProcessed > 0
        ? (this.stats.successfulUpdates / this.stats.totalProcessed) * 100
        : 0;
    console.log(`   • Success rate: ${successRate.toFixed(1)}%`);

    console.log(`\n💾 Backup collection: ${backupCollection}`);
    console.log(`🗃️  Database: ${DB_NAME}`);

    if (this.stats.successfulUpdates > 0) {
      console.log(
        `\n✅ Successfully updated ${this.stats.successfulUpdates} hotels with address information!`
      );
    } else {
      console.log(
        `\n⚠️  No hotels were updated. Please check the data and try again.`
      );
    }
  }

  async execute() {
    try {
      console.log("🏨 MongoDB Hotels Address Update Script");
      console.log("=".repeat(50));

      // Connect to MongoDB
      if (!(await this.connect())) {
        return;
      }

      // File paths
      const addressesFile = path.join(
        process.cwd(),
        "database",
        "data",
        "admin",
        "hotels_with_addresses.json"
      );
      console.log(`📁 Addresses file: ${addressesFile}`);

      // Validate file exists
      if (!fs.existsSync(addressesFile)) {
        console.log(`❌ Addresses file not found: ${addressesFile}`);
        console.log(
          "❓ Please run the geocoding script first to generate addresses"
        );
        return;
      }

      // Create backup
      const backupCollection = await this.createBackup();

      // Load addresses data
      const hotelsData = await this.loadAddressesData(addressesFile);
      if (hotelsData.length === 0) {
        console.log("❌ No valid hotel data with addresses found");
        console.log("❓ The file might not contain geocoded addresses yet");
        return;
      }

      // Confirm before proceeding
      console.log(
        `\n❓ Ready to update ${hotelsData.length} hotels with addresses.`
      );
      console.log(
        "   This will add 'address' field to lodging objects in MongoDB"
      );
      console.log("   Starting update process...\n");

      // Perform updates
      await this.updateAddressesBatch(hotelsData);

      // Verify updates
      await this.verifyUpdates();

      // Print final report
      this.printFinalReport(backupCollection);
    } catch (error) {
      console.error(`\n❌ Unexpected error:`, error.message);
      throw error;
    } finally {
      // Close connection
      await mongoose.connection.close();
      console.log("🔌 Database connection closed");
    }
  }
}

// Main execution
async function main() {
  const updater = new HotelAddressUpdater();

  try {
    await updater.execute();
  } catch (error) {
    console.error("❌ Script failed:", error.message);
    process.exit(1);
  }
}

// Run the script
main();
