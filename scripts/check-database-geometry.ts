import dbConnect from "@/lib/mongoose";
import Ward from "@/database/ward.model";

async function checkDatabaseGeometry() {
  try {
    console.log("🔍 Checking geometry in database...");

    await dbConnect();
    console.log("✅ Connected to MongoDB");

    // Count total wards
    const totalWards = await Ward.countDocuments();
    console.log(`📊 Total wards in database: ${totalWards}`);

    // Count wards with geometry
    const wardsWithGeometry = await Ward.countDocuments({
      geometry: { $exists: true, $ne: null },
    });
    console.log(`🗺️ Wards with geometry: ${wardsWithGeometry}`);

    // Count wards without geometry
    const wardsWithoutGeometry = totalWards - wardsWithGeometry;
    console.log(`❌ Wards without geometry: ${wardsWithoutGeometry}`);

    // Check different geometry types
    const geometryTypes = await Ward.aggregate([
      { $match: { geometry: { $exists: true, $ne: null } } },
      { $group: { _id: "$geometry.type", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    console.log("\n📐 Geometry types distribution:");
    geometryTypes.forEach((type) => {
      console.log(`   ${type._id}: ${type.count} wards`);
    });

    // Sample some wards with potential geometry issues
    console.log("\n🔍 Checking for potential issues...");

    // Find wards with empty coordinates
    const emptyCoordinates = await Ward.countDocuments({
      "geometry.coordinates": { $in: [[], null, undefined] },
    });
    console.log(`❌ Wards with empty coordinates: ${emptyCoordinates}`);

    // Sample a few wards to see the geometry structure
    const sampleWards = await Ward.find({
      geometry: { $exists: true, $ne: null },
    })
      .limit(3)
      .select("tenhc ma geometry")
      .lean();

    console.log("\n📋 Sample ward geometries:");
    sampleWards.forEach((ward, index) => {
      console.log(`   ${index + 1}. ${ward.tenhc} (${ward.ma})`);
      console.log(`      Type: ${ward.geometry?.type}`);
      if (ward.geometry?.coordinates) {
        const coords = ward.geometry.coordinates;
        if (Array.isArray(coords)) {
          console.log(`      Coordinates length: ${coords.length}`);
          if (coords.length > 0 && Array.isArray(coords[0])) {
            console.log(`      First ring length: ${coords[0].length}`);
          }
        }
      }
    });

    // Check provinces with most wards
    const provinceStats = await Ward.aggregate([
      { $group: { _id: "$tentinh", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    console.log("\n🏙️ Top provinces by ward count:");
    provinceStats.forEach((stat) => {
      console.log(`   ${stat._id}: ${stat.count} wards`);
    });

    console.log("\n✅ Database geometry check completed!");
  } catch (error) {
    console.error("❌ Error checking database geometry:", error);
    throw error;
  }
}

if (require.main === module) {
  checkDatabaseGeometry()
    .then(() => {
      console.log("\n🎉 Check completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Check failed:", error);
      process.exit(1);
    });
}

export { checkDatabaseGeometry };
