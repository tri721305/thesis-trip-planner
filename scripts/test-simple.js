const fs = require("fs");
const path = require("path");

console.log("🚀 Starting simple test...");

try {
  const dataDir = path.join(process.cwd(), "database/data");
  console.log(`📁 Data directory: ${dataDir}`);

  const files = fs
    .readdirSync(dataDir)
    .filter((file) => file.endsWith(".json") && !file.includes("admin"));

  console.log(`📁 Found ${files.length} JSON files:`);
  files.slice(0, 5).forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
  });

  // Test first file
  if (files.length > 0) {
    const firstFile = files[0];
    console.log(`\n📂 Testing first file: ${firstFile}`);

    const filePath = path.join(dataDir, firstFile);
    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));

    console.log(`📊 Items in file: ${jsonData.length}`);

    if (jsonData.length > 0) {
      const provinceInfo = jsonData[0];
      console.log(`🏛️  Province: ${provinceInfo?.tentinh || "N/A"}`);
      console.log(`📍 Province code: ${provinceInfo?.matinh || "N/A"}`);

      const wardsData = jsonData.slice(1);
      console.log(`📊 Wards count: ${wardsData.length}`);

      if (wardsData.length > 0) {
        const firstWard = wardsData[0];
        console.log(`🏘️  First ward: ${firstWard?.tenhc} (${firstWard?.loai})`);
      }
    }
  }

  console.log("\n✅ Simple test completed successfully!");
} catch (error) {
  console.error("❌ Simple test failed:", error);
}
