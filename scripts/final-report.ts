import fs from "fs";
import path from "path";
import dbConnect from "@/lib/mongoose";
import Ward from "@/database/ward.model";

async function generateFinalReport() {
  try {
    console.log("📊 GENERATING FINAL IMPORT REPORT");
    console.log("=".repeat(50));

    await dbConnect();
    console.log("✅ Connected to MongoDB");

    // 1. Overall Statistics
    const totalWards = await Ward.countDocuments();
    const wardsWithGeometry = await Ward.countDocuments({
      geometry: { $exists: true, $ne: null },
    });
    const wardsWithoutGeometry = totalWards - wardsWithGeometry;

    console.log("\n📈 OVERALL STATISTICS:");
    console.log(`   📍 Total wards imported: ${totalWards}`);
    console.log(`   🗺️  Wards with geometry: ${wardsWithGeometry}`);
    console.log(`   ❌ Wards without geometry: ${wardsWithoutGeometry}`);
    console.log(
      `   📊 Geometry coverage: ${((wardsWithGeometry / totalWards) * 100).toFixed(2)}%`
    );

    // 2. Province breakdown
    const provinceStats = await Ward.aggregate([
      {
        $group: {
          _id: "$tentinh",
          totalWards: { $sum: 1 },
          wardsWithGeometry: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$geometry", null] },
                    { $exists: "$geometry" },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { totalWards: -1 } },
    ]);

    console.log("\n🏙️  PROVINCE BREAKDOWN:");
    provinceStats.forEach((province, index) => {
      const coverage = (
        (province.wardsWithGeometry / province.totalWards) *
        100
      ).toFixed(1);
      console.log(
        `   ${index + 1}. ${province._id}: ${province.totalWards} wards (${coverage}% with geometry)`
      );
    });

    // 3. Geometry type distribution
    const geometryTypes = await Ward.aggregate([
      { $match: { geometry: { $exists: true, $ne: null } } },
      { $group: { _id: "$geometry.type", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    console.log("\n📐 GEOMETRY TYPES:");
    geometryTypes.forEach((type) => {
      console.log(`   ${type._id}: ${type.count} wards`);
    });

    // 4. Data quality check
    const dataQualityChecks = {
      missingNames: await Ward.countDocuments({
        $or: [{ tenhc: "" }, { tenhc: null }],
      }),
      missingCodes: await Ward.countDocuments({
        $or: [{ ma: "" }, { ma: null }],
      }),
      missingProvinceInfo: await Ward.countDocuments({
        $or: [{ tentinh: "" }, { tentinh: null }],
      }),
      duplicateNames: await Ward.aggregate([
        {
          $group: {
            _id: { tenhc: "$tenhc", matinh: "$matinh" },
            count: { $sum: 1 },
          },
        },
        { $match: { count: { $gt: 1 } } },
        { $count: "duplicates" },
      ]),
    };

    console.log("\n🔍 DATA QUALITY CHECKS:");
    console.log(
      `   ❌ Wards with missing names: ${dataQualityChecks.missingNames}`
    );
    console.log(
      `   ❌ Wards with missing codes: ${dataQualityChecks.missingCodes}`
    );
    console.log(
      `   ❌ Wards with missing province info: ${dataQualityChecks.missingProvinceInfo}`
    );
    const duplicateCount = dataQualityChecks.duplicateNames[0]?.duplicates || 0;
    console.log(`   ⚠️  Potential duplicate ward names: ${duplicateCount}`);

    // 5. File analysis
    const dataPath = path.join(process.cwd(), "database/data");
    const allFiles = fs
      .readdirSync(dataPath)
      .filter((file) => file.endsWith(".json") && !file.includes("admin"));

    console.log(`\n📂 FILE ANALYSIS:`);
    console.log(`   📄 Total JSON files processed: ${allFiles.length}`);

    // Calculate expected vs actual wards
    let expectedWards = 0;
    for (const file of allFiles) {
      try {
        const filePath = path.join(dataPath, file);
        const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
        expectedWards += jsonData.length - 1; // -1 for province info
      } catch (error) {
        console.log(`   ⚠️  Could not read ${file}`);
      }
    }

    console.log(`   📊 Expected wards from files: ${expectedWards}`);
    console.log(`   📊 Actual wards in database: ${totalWards}`);
    console.log(
      `   📊 Import success rate: ${((totalWards / expectedWards) * 100).toFixed(2)}%`
    );

    // 6. Top wards by area and population
    const largestWards = await Ward.find({ dientichkm2: { $gt: 0 } })
      .sort({ dientichkm2: -1 })
      .limit(5)
      .select("tenhc tentinh dientichkm2")
      .lean();

    const mostPopulatedWards = await Ward.find({ dansonguoi: { $gt: 0 } })
      .sort({ dansonguoi: -1 })
      .limit(5)
      .select("tenhc tentinh dansonguoi")
      .lean();

    console.log("\n🏆 TOP WARDS BY AREA:");
    largestWards.forEach((ward, index) => {
      console.log(
        `   ${index + 1}. ${ward.tenhc}, ${ward.tentinh}: ${ward.dientichkm2} km²`
      );
    });

    console.log("\n👥 TOP WARDS BY POPULATION:");
    mostPopulatedWards.forEach((ward, index) => {
      console.log(
        `   ${index + 1}. ${ward.tenhc}, ${ward.tentinh}: ${ward.dansonguoi.toLocaleString()} people`
      );
    });

    // 7. Generate recommendations
    console.log("\n💡 RECOMMENDATIONS:");

    if (wardsWithoutGeometry > 0) {
      console.log(
        `   🔧 Consider adding geometry data for ${wardsWithoutGeometry} wards without geographic boundaries`
      );
    }

    if (duplicateCount > 0) {
      console.log(
        `   🔧 Review ${duplicateCount} potential duplicate ward names for data consistency`
      );
    }

    if (
      dataQualityChecks.missingNames > 0 ||
      dataQualityChecks.missingCodes > 0
    ) {
      console.log(`   🔧 Clean up missing data fields for better data quality`);
    }

    console.log(
      `   ✅ Consider implementing ward search functionality with current ${totalWards} wards`
    );
    console.log(
      `   ✅ Geographic features can be implemented using ${wardsWithGeometry} wards with geometry`
    );
    console.log(
      `   ✅ Administrative boundaries are ready for location-based services`
    );

    // 8. Next steps for development
    console.log("\n🚀 NEXT DEVELOPMENT STEPS:");
    console.log("   1. 🗺️  Implement ward-based location services");
    console.log("   2. 🔍 Create ward search and autocomplete functionality");
    console.log("   3. 📍 Add ward-level place categorization");
    console.log("   4. 🎯 Implement location-based recommendations");
    console.log("   5. 📊 Add ward-level analytics and statistics");
    console.log("   6. 🗾 Create interactive maps with ward boundaries");

    // 9. Create summary file
    const summaryReport = {
      generatedAt: new Date().toISOString(),
      totalWards,
      wardsWithGeometry,
      wardsWithoutGeometry,
      geometryCoverage:
        ((wardsWithGeometry / totalWards) * 100).toFixed(2) + "%",
      provinces: provinceStats.length,
      dataQuality: dataQualityChecks,
      geometryTypes: geometryTypes,
      topProvinces: provinceStats.slice(0, 5),
      importSuccessRate: ((totalWards / expectedWards) * 100).toFixed(2) + "%",
      recommendations: [
        "Implement ward-based location services",
        "Create ward search functionality",
        "Add geographic boundary visualization",
        "Implement location-based recommendations",
      ],
    };

    const reportPath = path.join(
      process.cwd(),
      "scripts/ward-import-final-report.json"
    );
    fs.writeFileSync(reportPath, JSON.stringify(summaryReport, null, 2));

    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    console.log("\n🎉 WARD IMPORT PROJECT COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(50));
  } catch (error) {
    console.error("❌ Error generating final report:", error);
    throw error;
  }
}

if (require.main === module) {
  generateFinalReport()
    .then(() => {
      console.log("\n✨ Final report generation completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Report generation failed:", error);
      process.exit(1);
    });
}

export { generateFinalReport };
