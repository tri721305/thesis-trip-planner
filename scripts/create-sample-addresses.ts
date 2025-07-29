/**
 * Create Sample Address Data
 * ==========================
 *
 * Creates sample hotel address data for testing the update script
 * when the geocoding process hasn't completed yet.
 */

import fs from "fs";
import path from "path";

// Sample hotel data with Vietnamese addresses
const sampleHotelsWithAddresses = [
  {
    offerId: "sample_001",
    lodging: {
      id: {
        type: "kayak",
        kayakKey: "khotel:sample_001",
      },
      name: "Sample Hotel Ho Chi Minh City",
      hotelClass: 4,
      images: [],
      amenities: ["wifi", "pool", "gym"],
      attributes: [],
      rating: {
        source: "Kayak",
        value: 8.5,
      },
      ratingCount: 120,
      location: {
        longitude: 106.70773,
        latitude: 10.731601,
      },
      address:
        "123 Nguyen Hue Street, Ben Nghe Ward, District 1, Ho Chi Minh City, Vietnam",
    },
    source: "kayak",
    priceRates: [],
    priceRate: {
      source: "kayak",
      currencyCode: "VND",
      amount: 1500000,
      frequency: "nightly",
      site: "Booking.com",
      bookingUrl: "https://example.com",
      hasMemberDeal: false,
      cancellationPolicy: {
        type: "free",
        policyEndDateTime: "2024-12-01T00:00:00Z",
      },
      total: {
        amount: 1500000,
        currencyCode: "VND",
      },
      amenities: [],
      bedGroups: [],
      isTotalBeforeTaxes: false,
      hasFreeCancellation: true,
    },
    includesDueAtPropertyFees: false,
  },
  {
    offerId: "sample_002",
    lodging: {
      id: {
        type: "kayak",
        kayakKey: "khotel:sample_002",
      },
      name: "Sample Boutique Hotel Saigon",
      hotelClass: 3,
      images: [],
      amenities: ["wifi", "restaurant"],
      attributes: [],
      rating: {
        source: "Kayak",
        value: 9.0,
      },
      ratingCount: 85,
      location: {
        longitude: 106.69722,
        latitude: 10.77741,
      },
      address:
        "456 Dong Khoi Street, Ben Nghe Ward, District 1, Ho Chi Minh City, 700000, Vietnam",
    },
    source: "kayak",
    priceRates: [],
    priceRate: {
      source: "kayak",
      currencyCode: "VND",
      amount: 1200000,
      frequency: "nightly",
      site: "Agoda.com",
      bookingUrl: "https://example.com",
      hasMemberDeal: false,
      cancellationPolicy: {
        type: "free",
        policyEndDateTime: "2024-12-01T00:00:00Z",
      },
      total: {
        amount: 1200000,
        currencyCode: "VND",
      },
      amenities: [],
      bedGroups: [],
      isTotalBeforeTaxes: false,
      hasFreeCancellation: true,
    },
    includesDueAtPropertyFees: false,
  },
  {
    offerId: "sample_003",
    lodging: {
      id: {
        type: "kayak",
        kayakKey: "khotel:sample_003",
      },
      name: "Sample Luxury Resort",
      hotelClass: 5,
      images: [],
      amenities: ["wifi", "pool", "spa", "gym", "restaurant"],
      attributes: [],
      rating: {
        source: "Kayak",
        value: 9.5,
      },
      ratingCount: 200,
      location: {
        longitude: 106.71234,
        latitude: 10.76543,
      },
      address:
        "789 Ly Tu Trong Street, Ben Nghe Ward, District 1, Thanh pho Ho Chi Minh, 700000, Viet Nam",
    },
    source: "kayak",
    priceRates: [],
    priceRate: {
      source: "kayak",
      currencyCode: "VND",
      amount: 3000000,
      frequency: "nightly",
      site: "Hotels.com",
      bookingUrl: "https://example.com",
      hasMemberDeal: true,
      cancellationPolicy: {
        type: "flexible",
        policyEndDateTime: "2024-12-01T00:00:00Z",
      },
      total: {
        amount: 3000000,
        currencyCode: "VND",
      },
      amenities: [],
      bedGroups: [],
      isTotalBeforeTaxes: false,
      hasFreeCancellation: true,
    },
    includesDueAtPropertyFees: true,
  },
];

async function createSampleData() {
  try {
    console.log("🏗️  Creating Sample Address Data for Testing");
    console.log("=".repeat(50));

    // Paths
    const originalFile = path.join(
      process.cwd(),
      "database",
      "data",
      "admin",
      "hotels_with_addresses.json"
    );
    const sampleFile = path.join(
      process.cwd(),
      "database",
      "data",
      "admin",
      "hotels_sample_addresses.json"
    );

    // Check if original file exists and has addresses
    let hasAddresses = false;
    if (fs.existsSync(originalFile)) {
      const data = JSON.parse(fs.readFileSync(originalFile, "utf-8"));
      hasAddresses = data.some((hotel: any) => hotel.lodging?.address);
    }

    if (hasAddresses) {
      console.log(
        "✅ Original file already has addresses - no need for sample data"
      );
      return;
    }

    // Create sample file
    fs.writeFileSync(
      sampleFile,
      JSON.stringify(sampleHotelsWithAddresses, null, 2)
    );
    console.log(`✅ Created sample file: ${sampleFile}`);
    console.log(`📊 Sample hotels: ${sampleHotelsWithAddresses.length}`);

    // Show sample addresses
    console.log("\n📝 Sample addresses created:");
    sampleHotelsWithAddresses.forEach((hotel, i) => {
      console.log(`${i + 1}. ${hotel.lodging.name}`);
      console.log(`   Address: ${hotel.lodging.address}`);
    });

    console.log("\n💡 To test the update script with sample data:");
    console.log("   1. Copy sample file to hotels_with_addresses.json");
    console.log("   2. Run: npx tsx scripts/update-hotels-addresses.ts");
  } catch (error) {
    console.error("❌ Error creating sample data:", error);
  }
}

// Run if called directly
if (require.main === module) {
  createSampleData();
}

export default createSampleData;
