/**
 * MongoDB Hotels Address Update Script
 * ===================================
 *
 * Updates the hotels collection in MongoDB with address information
 * from the processed hotels_with_addresses.json file.
 *
 * Usage: npx tsx scripts/update-hotels-addresses.ts
 */

import fs from "fs";
import path from "path";
import dbConnect from "../lib/mongoose";
import Hotel from "../database/hotel.model";

interface UpdateStats {
  totalProcessed: number;
  successfulUpdates: number;
  failedUpdates: number;
  skippedNoAddress: number;
  skippedNotFound: number;
  startTime: number;
  endTime?: number;
}

interface HotelWithAddress {
  offerId: string;
  lodging: {
    address?: string;
    name?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

class HotelAddressUpdater {
  private stats: UpdateStats;

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

  /**
   * Load and validate addresses data from JSON file
   */
  private async loadAddressesData(
    filePath: string
  ): Promise<HotelWithAddress[]> {
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
        (hotel: any) =>
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
      console.error(`❌ Error loading data:`, error);
      throw error;
    }
  }

  /**
   * Create backup of existing collection
   */
  private async createBackup(): Promise<string> {
    try {
      console.log("💾 Creating backup of existing hotels collection...");

      const count = await Hotel.countDocuments({});
      console.log(`📊 Found ${count} hotels in existing collection`);

      if (count === 0) {
        console.log("⚠️  No existing hotels found - skipping backup");
        return "no-backup-needed";
      }

      // For MongoDB, we can use aggregation to copy to a backup collection
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupCollectionName = `hotels_backup_${timestamp}`;

      await Hotel.aggregate([{ $out: backupCollectionName }]);

      console.log(`✅ Backup created successfully: ${backupCollectionName}`);
      return backupCollectionName;
    } catch (error) {
      console.error(`❌ Failed to create backup:`, error);
      throw error;
    }
  }

  /**
   * Update a single hotel's address
   */
  private async updateHotelAddress(
    hotelData: HotelWithAddress
  ): Promise<{ success: boolean; message: string }> {
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
      return { success: false, message: `Update error: ${error}` };
    }
  }

  /**
   * Update hotel addresses in batches
   */
  private async updateAddressesBatch(
    hotels: HotelWithAddress[],
    batchSize: number = 25
  ): Promise<void> {
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

        let status: string;
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

        const hotelName = hotel.lodging?.name?.substring(0, 30) || "Unknown";
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

  /**
   * Verify updates with sample
   */
  private async verifyUpdates(sampleSize: number = 5): Promise<void> {
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
        hotelsWithAddresses.forEach((hotel: any) => {
          const name = hotel.lodging?.name?.substring(0, 30) || "Unknown";
          const address = hotel.lodging?.address?.substring(0, 50) || "";
          console.log(`  🏨 ${name}: ${address}...`);
        });
      } else {
        console.log("⚠️  No hotels found with address field");
      }
    } catch (error) {
      console.error(`❌ Verification failed:`, error);
    }
  }

  /**
   * Print comprehensive final report
   */
  private printFinalReport(backupCollection: string): void {
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
    console.log(`🗃️  Database: tripplanner`);

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

  /**
   * Main execution method
   */
  async execute(): Promise<void> {
    try {
      console.log("🏨 MongoDB Hotels Address Update Script");
      console.log("=".repeat(50));

      // Connect to MongoDB
      console.log("🔌 Connecting to MongoDB...");
      await dbConnect();
      console.log("✅ Connected to MongoDB successfully");

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

      // For automated execution, we can skip the confirmation
      // Uncomment the following lines if you want manual confirmation:
      /*
      const confirm = process.argv.includes('--force') ? 'y' : 
        await this.promptUser("   Continue? (y/N): ");
      
      if (confirm.toLowerCase() !== 'y') {
        console.log("❌ Update cancelled by user");
        return;
      }
      */

      // Perform updates
      await this.updateAddressesBatch(hotelsData);

      // Verify updates
      await this.verifyUpdates();

      // Print final report
      this.printFinalReport(backupCollection);
    } catch (error) {
      console.error(`\n❌ Unexpected error:`, error);
      throw error;
    }
  }
}

// Main execution
async function main() {
  const updater = new HotelAddressUpdater();

  try {
    await updater.execute();
  } catch (error) {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export default HotelAddressUpdater;
