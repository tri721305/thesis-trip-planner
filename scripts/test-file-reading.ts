import fs from "fs";
import path from "path";

async function testFileReading() {
  try {
    console.log("🚀 Testing file reading...");

    const dataDir = path.join(process.cwd(), "database/data");
    console.log(`📁 Data directory: ${dataDir}`);

    const files = fs
      .readdirSync(dataDir)
      .filter((file) => file.endsWith(".json") && !file.includes("admin"));

    console.log(`📁 Found ${files.length} JSON files`);

    // Test first 3 files
    for (let i = 0; i < Math.min(3, files.length); i++) {
      const file = files[i];
      console.log(`\n📂 Testing file: ${file}`);

      const filePath = path.join(dataDir, file);
      const fileStats = fs.statSync(filePath);
      console.log(
        `   📊 File size: ${(fileStats.size / 1024 / 1024).toFixed(2)} MB`
      );

      const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      console.log(`   📊 Items count: ${jsonData.length}`);

      if (jsonData.length > 0) {
        const provinceInfo = jsonData[0];
        const wardsData = jsonData.slice(1);

        console.log(`   🏛️  Province: ${provinceInfo?.tentinh || "N/A"}`);
        console.log(`   📍 Wards count: ${wardsData.length}`);

        if (wardsData.length > 0) {
          const firstWard = wardsData[0];
          console.log(
            `   🏘️  First ward: ${firstWard?.tenhc} (${firstWard?.loai})`
          );
        }
      }
    }

    console.log("\n✅ File reading test completed!");
  } catch (error) {
    console.error("❌ File reading test failed:", error);
  }
}

if (require.main === module) {
  testFileReading()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
