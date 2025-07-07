import fs from "fs";
import path from "path";

console.log("🚀 Starting minimal script...");

try {
  // Check current directory
  console.log("📁 Current directory:", process.cwd());

  // Check if data directory exists
  const dataDir = path.join(process.cwd(), "database/data");
  console.log("📁 Data directory:", dataDir);

  if (!fs.existsSync(dataDir)) {
    console.log("❌ Data directory does not exist");
    process.exit(1);
  }

  console.log("✅ Data directory exists");

  // List files
  const files = fs.readdirSync(dataDir);
  console.log(`📊 Found ${files.length} total files`);

  const jsonFiles = files.filter(
    (file) => file.endsWith(".json") && !file.includes("admin")
  );
  console.log(`📊 Found ${jsonFiles.length} JSON files`);

  jsonFiles.slice(0, 3).forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
  });

  console.log("✅ Script completed successfully");
} catch (error) {
  console.error("❌ Error:", error);
}
