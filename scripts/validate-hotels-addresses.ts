/**
 * MongoDB Hotels Address Validation Script
 * ========================================
 *
 * Validates the address updates in MongoDB hotels collection
 * and provides detailed analytics on address data quality.
 *
 * Usage: npx tsx scripts/validate-hotels-addresses.ts
 */

import dbConnect from "../lib/mongoose";
import Hotel from "../database/hotel.model";

interface CollectionStats {
  totalHotels: number;
  hotelsWithAddresses: number;
  hotelsWithoutAddresses: number;
  addressCoveragePercentage: number;
}

interface AddressQuality {
  totalAnalyzed: number;
  vietnameseAddresses: number;
  addressesWithDistrict: number;
  addressesWithWard: number;
  addressesWithCity: number;
  addressesWithPostal: number;
  completeAddresses: number;
  averageLength: number;
  shortestAddress?: { length: number; hotel: string; address: string };
  longestAddress?: { length: number; hotel: string; address: string };
}

class AddressValidator {
  /**
   * Get basic collection statistics
   */
  private async getCollectionStats(): Promise<CollectionStats> {
    try {
      const totalHotels = await Hotel.countDocuments({});
      const hotelsWithAddresses = await Hotel.countDocuments({
        "lodging.address": { $exists: true, $ne: "" },
      });

      return {
        totalHotels,
        hotelsWithAddresses,
        hotelsWithoutAddresses: totalHotels - hotelsWithAddresses,
        addressCoveragePercentage:
          totalHotels > 0 ? (hotelsWithAddresses / totalHotels) * 100 : 0,
      };
    } catch (error) {
      console.error("❌ Error getting collection stats:", error);
      throw error;
    }
  }

  /**
   * Analyze the quality of address data
   */
  private async analyzeAddressQuality(): Promise<AddressQuality> {
    try {
      console.log("🔍 Analyzing address data quality...");

      const hotelsWithAddresses = await Hotel.find(
        { "lodging.address": { $exists: true, $ne: "" } },
        { offerId: 1, "lodging.name": 1, "lodging.address": 1 }
      );

      const totalWithAddresses = hotelsWithAddresses.length;

      if (totalWithAddresses === 0) {
        throw new Error("No hotels with addresses found");
      }

      const quality: AddressQuality = {
        totalAnalyzed: totalWithAddresses,
        vietnameseAddresses: 0,
        addressesWithDistrict: 0,
        addressesWithWard: 0,
        addressesWithCity: 0,
        addressesWithPostal: 0,
        completeAddresses: 0,
        averageLength: 0,
      };

      const addressLengths: number[] = [];
      let shortestAddress:
        | { length: number; hotel: string; address: string }
        | undefined;
      let longestAddress:
        | { length: number; hotel: string; address: string }
        | undefined;

      for (const hotel of hotelsWithAddresses) {
        const address = hotel.lodging?.address || "";
        const addressLength = address.length;
        addressLengths.push(addressLength);

        // Check for Vietnamese characteristics
        if (/Việt Nam|Vietnam/i.test(address)) {
          quality.vietnameseAddresses++;
        }

        // Check for administrative divisions
        if (/Quận|Huyện|District/i.test(address)) {
          quality.addressesWithDistrict++;
        }

        if (/Phường|Xã|Ward/i.test(address)) {
          quality.addressesWithWard++;
        }

        if (/Thành phố Hồ Chí Minh|Ho Chi Minh|Saigon/i.test(address)) {
          quality.addressesWithCity++;
        }

        // Check for postal codes
        if (/\b\d{5,6}\b/.test(address)) {
          quality.addressesWithPostal++;
        }

        // Check completeness (has ward, district, and city)
        if (
          /Phường|Xã/i.test(address) &&
          /Quận|Huyện/i.test(address) &&
          /Thành phố|Hồ Chí Minh/i.test(address)
        ) {
          quality.completeAddresses++;
        }

        // Track shortest and longest
        const hotelName = hotel.lodging?.name || "Unknown";
        if (!shortestAddress || addressLength < shortestAddress.length) {
          shortestAddress = {
            length: addressLength,
            hotel: hotelName,
            address,
          };
        }
        if (!longestAddress || addressLength > longestAddress.length) {
          longestAddress = { length: addressLength, hotel: hotelName, address };
        }
      }

      // Calculate averages
      quality.averageLength =
        addressLengths.reduce((a, b) => a + b, 0) / addressLengths.length;
      quality.shortestAddress = shortestAddress;
      quality.longestAddress = longestAddress;

      return quality;
    } catch (error) {
      console.error("❌ Error analyzing address quality:", error);
      throw error;
    }
  }

  /**
   * Get sample addresses for manual inspection
   */
  private async getSampleAddresses(limit: number = 10): Promise<any[]> {
    try {
      return await Hotel.find(
        { "lodging.address": { $exists: true, $ne: "" } },
        {
          offerId: 1,
          "lodging.name": 1,
          "lodging.address": 1,
          "lodging.location": 1,
        }
      ).limit(limit);
    } catch (error) {
      console.error("❌ Error getting sample addresses:", error);
      return [];
    }
  }

  /**
   * Find potentially problematic addresses
   */
  private async findProblematicAddresses(): Promise<any> {
    try {
      console.log("🚨 Identifying potentially problematic addresses...");

      const problems = {
        tooShort: [] as any[],
        tooLong: [] as any[],
        noCityInfo: [] as any[],
        suspiciousFormat: [] as any[],
      };

      const hotels = await Hotel.find(
        { "lodging.address": { $exists: true, $ne: "" } },
        { offerId: 1, "lodging.name": 1, "lodging.address": 1 }
      );

      for (const hotel of hotels) {
        const address = hotel.lodging?.address || "";
        const hotelName = hotel.lodging?.name || "Unknown";

        // Too short (likely incomplete)
        if (address.length < 20) {
          problems.tooShort.push({
            hotel: hotelName,
            address: address,
            length: address.length,
          });
        }

        // Too long (might have encoding issues)
        if (address.length > 200) {
          problems.tooLong.push({
            hotel: hotelName,
            address: address.substring(0, 100) + "...",
            length: address.length,
          });
        }

        // No city information
        if (
          !/Thành phố|Hồ Chí Minh|Ho Chi Minh|Vietnam|Việt Nam/i.test(address)
        ) {
          problems.noCityInfo.push({
            hotel: hotelName,
            address: address,
          });
        }

        // Suspicious format (too many numbers, weird punctuation)
        const commaCount = (address.match(/,/g) || []).length;
        const numberCount = (address.match(/\d+/g) || []).length;
        const dashCount = (address.match(/-/g) || []).length;

        if (commaCount > 8 || numberCount > 5 || dashCount > 5) {
          problems.suspiciousFormat.push({
            hotel: hotelName,
            address: address,
          });
        }
      }

      return problems;
    } catch (error) {
      console.error("❌ Error finding problematic addresses:", error);
      return {};
    }
  }

  /**
   * Print comprehensive validation report
   */
  async generateReport(): Promise<void> {
    try {
      console.log("\n" + "=".repeat(70));
      console.log("📊 MONGODB HOTELS ADDRESS VALIDATION REPORT");
      console.log("=".repeat(70));

      // Collection Statistics
      console.log("\n📈 COLLECTION STATISTICS");
      console.log("-".repeat(30));
      const stats = await this.getCollectionStats();
      console.log(
        `Total hotels in collection: ${stats.totalHotels.toLocaleString()}`
      );
      console.log(
        `Hotels with addresses: ${stats.hotelsWithAddresses.toLocaleString()}`
      );
      console.log(
        `Hotels without addresses: ${stats.hotelsWithoutAddresses.toLocaleString()}`
      );
      console.log(
        `Address coverage: ${stats.addressCoveragePercentage.toFixed(1)}%`
      );

      // Address Quality Analysis
      console.log("\n🔍 ADDRESS QUALITY ANALYSIS");
      console.log("-".repeat(30));

      if (stats.hotelsWithAddresses > 0) {
        const quality = await this.analyzeAddressQuality();
        console.log(
          `Total addresses analyzed: ${quality.totalAnalyzed.toLocaleString()}`
        );
        console.log(
          `Vietnamese addresses: ${quality.vietnameseAddresses.toLocaleString()} (${((quality.vietnameseAddresses / quality.totalAnalyzed) * 100).toFixed(1)}%)`
        );
        console.log(
          `Addresses with districts: ${quality.addressesWithDistrict.toLocaleString()} (${((quality.addressesWithDistrict / quality.totalAnalyzed) * 100).toFixed(1)}%)`
        );
        console.log(
          `Addresses with wards: ${quality.addressesWithWard.toLocaleString()} (${((quality.addressesWithWard / quality.totalAnalyzed) * 100).toFixed(1)}%)`
        );
        console.log(
          `Addresses with city info: ${quality.addressesWithCity.toLocaleString()} (${((quality.addressesWithCity / quality.totalAnalyzed) * 100).toFixed(1)}%)`
        );
        console.log(
          `Addresses with postal codes: ${quality.addressesWithPostal.toLocaleString()} (${((quality.addressesWithPostal / quality.totalAnalyzed) * 100).toFixed(1)}%)`
        );
        console.log(
          `Complete addresses: ${quality.completeAddresses.toLocaleString()} (${((quality.completeAddresses / quality.totalAnalyzed) * 100).toFixed(1)}%)`
        );
        console.log(
          `Average address length: ${quality.averageLength.toFixed(1)} characters`
        );

        console.log("\n📏 Address Length Extremes:");
        if (quality.shortestAddress) {
          console.log(
            `Shortest (${quality.shortestAddress.length} chars): ${quality.shortestAddress.hotel}`
          );
          console.log(`   Address: ${quality.shortestAddress.address}`);
        }
        if (quality.longestAddress) {
          console.log(
            `Longest (${quality.longestAddress.length} chars): ${quality.longestAddress.hotel}`
          );
          console.log(
            `   Address: ${quality.longestAddress.address.substring(0, 100)}...`
          );
        }
      } else {
        console.log("No addresses found to analyze");
      }

      // Sample Addresses
      console.log("\n📝 SAMPLE ADDRESSES");
      console.log("-".repeat(30));
      const samples = await this.getSampleAddresses(5);
      samples.forEach((hotel, i) => {
        const name = hotel.lodging?.name?.substring(0, 30) || "Unknown";
        const address = hotel.lodging?.address?.substring(0, 80) || "";
        console.log(`${i + 1}. ${name}`);
        console.log(
          `   ${address}${hotel.lodging?.address?.length > 80 ? "..." : ""}`
        );
      });

      // Problematic Addresses
      if (stats.hotelsWithAddresses > 0) {
        console.log("\n🚨 PROBLEMATIC ADDRESSES");
        console.log("-".repeat(30));
        const problems = await this.findProblematicAddresses();

        for (const [category, issues] of Object.entries(problems)) {
          if (Array.isArray(issues) && issues.length > 0) {
            const categoryName = category
              .replace(/([A-Z])/g, " $1")
              .toLowerCase();
            console.log(`\n${categoryName} (${issues.length} found):`);
            issues.slice(0, 3).forEach((issue: any) => {
              const hotelName = issue.hotel.substring(0, 25);
              const address = issue.address?.substring(0, 50) || "";
              console.log(`  • ${hotelName}: ${address}...`);
            });
            if (issues.length > 3) {
              console.log(`  ... and ${issues.length - 3} more`);
            }
          }
        }
      }

      console.log("\n" + "=".repeat(70));
      console.log("✅ Validation Report Complete");
      console.log("=".repeat(70));
    } catch (error) {
      console.error("❌ Error generating report:", error);
      throw error;
    }
  }
}

// Main execution
async function main() {
  try {
    console.log("🔍 MongoDB Hotels Address Validation Script");
    console.log("=".repeat(50));

    // Connect to MongoDB
    console.log("🔌 Connecting to MongoDB...");
    await dbConnect();
    console.log("✅ Connected to MongoDB successfully");

    // Generate comprehensive report
    const validator = new AddressValidator();
    await validator.generateReport();
  } catch (error) {
    console.error("❌ Validation error:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export default AddressValidator;
