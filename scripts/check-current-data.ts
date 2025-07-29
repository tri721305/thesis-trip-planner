/**
 * Check Current Data Script
 * ========================
 *
 * Checks current state of hotels data and addresses file
 * to diagnose what data is available for update.
 *
 * Usage: npx tsx scripts/check-current-data.ts
 */

import fs from "fs";
import path from "path";
import dbConnect from "../lib/mongoose";
import Hotel from "../database/hotel.model";

class DataChecker {
  /**
   * Check MongoDB hotels collection
   */
  private async checkMongoDBData(): Promise<void> {
    try {
      console.log("\n🔍 Checking MongoDB Hotels Collection...");
      console.log("-".repeat(40));

      await dbConnect();

      const totalCount = await Hotel.countDocuments({});
      const withAddressCount = await Hotel.countDocuments({
        "lodging.address": { $exists: true, $ne: "" },
      });

      console.log(`📊 Total hotels in MongoDB: ${totalCount}`);
      console.log(`📍 Hotels with addresses: ${withAddressCount}`);
      console.log(
        `📍 Hotels without addresses: ${totalCount - withAddressCount}`
      );

      if (totalCount > 0) {
        // Get sample hotels
        const sampleHotels = await Hotel.find(
          {},
          {
            offerId: 1,
            "lodging.name": 1,
            "lodging.address": 1,
            "lodging.location": 1,
          }
        ).limit(3);

        console.log("\n📝 Sample hotels from MongoDB:");
        sampleHotels.forEach((hotel, i) => {
          console.log(`${i + 1}. ${hotel.lodging?.name || "Unknown"}`);
          console.log(`   OfferId: ${hotel.offerId}`);
          console.log(`   Address: ${hotel.lodging?.address || "NOT SET"}`);
          console.log(
            `   Location: ${hotel.lodging?.location?.latitude}, ${hotel.lodging?.location?.longitude}`
          );
        });
      }
    } catch (error) {
      console.error("❌ Error checking MongoDB:", error);
    }
  }

  /**
   * Check hotels_with_addresses.json file
   */
  private async checkAddressFile(): Promise<void> {
    try {
      console.log("\n🔍 Checking hotels_with_addresses.json File...");
      console.log("-".repeat(40));

      const addressesFile = path.join(
        process.cwd(),
        "database",
        "data",
        "admin",
        "hotels_with_addresses.json"
      );
      console.log(`📁 File path: ${addressesFile}`);

      if (!fs.existsSync(addressesFile)) {
        console.log("❌ File does not exist");
        return;
      }

      const stats = fs.statSync(addressesFile);
      console.log(`📏 File size: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`📅 Last modified: ${stats.mtime.toISOString()}`);

      const rawData = fs.readFileSync(addressesFile, "utf-8");
      const data = JSON.parse(rawData);

      console.log(`📊 Total entries: ${data.length}`);

      // Analyze data structure
      let validHotels = 0;
      let hotelsWithAddresses = 0;
      let emptyObjects = 0;
      let onlyIncludesDue = 0;

      for (const hotel of data) {
        if (!hotel || Object.keys(hotel).length === 0) {
          emptyObjects++;
        } else if (
          Object.keys(hotel).length === 1 &&
          "includesDueAtPropertyFees" in hotel
        ) {
          onlyIncludesDue++;
        } else {
          validHotels++;
          if (hotel.lodging && hotel.lodging.address) {
            hotelsWithAddresses++;
          }
        }
      }

      console.log(`📋 Data analysis:`);
      console.log(`   • Empty objects: ${emptyObjects}`);
      console.log(`   • Only includesDueAtPropertyFees: ${onlyIncludesDue}`);
      console.log(`   • Valid hotel objects: ${validHotels}`);
      console.log(`   • Hotels with addresses: ${hotelsWithAddresses}`);

      if (hotelsWithAddresses > 0) {
        // Show sample hotels with addresses
        console.log("\n📝 Sample hotels with addresses from file:");
        let count = 0;
        for (const hotel of data) {
          if (hotel.lodging && hotel.lodging.address && count < 3) {
            console.log(`${count + 1}. ${hotel.lodging.name || "Unknown"}`);
            console.log(`   OfferId: ${hotel.offerId}`);
            console.log(
              `   Address: ${hotel.lodging.address.substring(0, 80)}...`
            );
            count++;
          }
        }
      } else {
        console.log("⚠️  No hotels with addresses found in the file");
      }
    } catch (error) {
      console.error("❌ Error checking address file:", error);
    }
  }

  /**
   * Check original hotels.json file
   */
  private async checkOriginalFile(): Promise<void> {
    try {
      console.log("\n🔍 Checking Original hotels.json File...");
      console.log("-".repeat(40));

      const originalFile = path.join(
        process.cwd(),
        "database",
        "data",
        "admin",
        "hotels.json"
      );
      console.log(`📁 File path: ${originalFile}`);

      if (!fs.existsSync(originalFile)) {
        console.log("❌ Original file does not exist");
        return;
      }

      const stats = fs.statSync(originalFile);
      console.log(`📏 File size: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`📅 Last modified: ${stats.mtime.toISOString()}`);

      const rawData = fs.readFileSync(originalFile, "utf-8");
      const data = JSON.parse(rawData);

      console.log(`📊 Total hotels in original: ${data.length}`);

      // Check if any have addresses already
      let withAddresses = 0;
      for (const hotel of data) {
        if (hotel.lodging && hotel.lodging.address) {
          withAddresses++;
        }
      }

      console.log(`📍 Hotels with addresses in original: ${withAddresses}`);

      // Show sample structure
      if (data.length > 0) {
        console.log("\n📝 Sample hotel structure from original:");
        const sample = data[0];
        console.log(`   OfferId: ${sample.offerId}`);
        console.log(`   Name: ${sample.lodging?.name}`);
        console.log(`   Has address: ${!!sample.lodging?.address}`);
        console.log(
          `   Location: ${sample.lodging?.location?.latitude}, ${sample.lodging?.location?.longitude}`
        );
      }
    } catch (error) {
      console.error("❌ Error checking original file:", error);
    }
  }

  /**
   * Generate recommendation
   */
  private generateRecommendation(): void {
    console.log("\n💡 RECOMMENDATIONS");
    console.log("-".repeat(40));
    console.log("Based on the analysis above:");
    console.log("");
    console.log("1. If hotels_with_addresses.json has no addresses:");
    console.log("   → Need to run geocoding script first");
    console.log("   → Script: npx tsx scripts/geocode-hotels.ts");
    console.log("");
    console.log("2. If hotels_with_addresses.json has addresses:");
    console.log("   → Ready to update MongoDB");
    console.log("   → Script: npx tsx scripts/update-hotels-addresses.ts");
    console.log("");
    console.log("3. After updating MongoDB:");
    console.log("   → Validate the updates");
    console.log("   → Script: npx tsx scripts/validate-hotels-addresses.ts");
  }

  /**
   * Main execution
   */
  async execute(): Promise<void> {
    try {
      console.log("🔍 Data Checker - Current State Analysis");
      console.log("=".repeat(50));

      await this.checkMongoDBData();
      await this.checkAddressFile();
      await this.checkOriginalFile();
      this.generateRecommendation();

      console.log("\n✅ Data check complete!");
    } catch (error) {
      console.error("❌ Data check failed:", error);
      throw error;
    }
  }
}

// Main execution
async function main() {
  const checker = new DataChecker();
  await checker.execute();
}

// Run if called directly
if (require.main === module) {
  main();
}

export default DataChecker;
