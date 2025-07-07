import fs from "fs";
import path from "path";
import dbConnect from "@/lib/mongoose";
import Ward from "@/database/ward.model";

async function debugSeedAll() {
  try {
    console.log("🚀 Bắt đầu debug script...");

    // Kết nối MongoDB
    await dbConnect();
    console.log("✅ Đã kết nối MongoDB");

    // Kiểm tra số wards hiện tại
    const currentCount = await Ward.countDocuments();
    console.log(`📊 Số wards hiện tại: ${currentCount}`);

    // Đường dẫn thư mục data
    const dataDir = path.join(process.cwd(), "database/data");
    console.log(`📁 Data directory: ${dataDir}`);

    // Lấy tất cả file JSON trong thư mục data
    const files = fs
      .readdirSync(dataDir)
      .filter((file) => file.endsWith(".json") && !file.includes("admin"));

    console.log(`📁 Tìm thấy ${files.length} file JSON:`);
    files.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file}`);
    });

    // Kiểm tra 3 file đầu tiên
    for (let i = 0; i < Math.min(3, files.length); i++) {
      const file = files[i];
      console.log(`\n📂 Kiểm tra file: ${file}`);

      try {
        const filePath = path.join(dataDir, file);
        const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));

        console.log(`   📊 Số items trong file: ${jsonData.length}`);

        if (jsonData.length > 0) {
          const provinceInfo = jsonData[0];
          const wardsData = jsonData.slice(1);

          console.log(
            `   🏛️  Tỉnh: ${provinceInfo?.tentinh || "N/A"} (Mã: ${provinceInfo?.matinh})`
          );
          console.log(`   📍 Số phường/xã: ${wardsData.length}`);

          if (wardsData.length > 0) {
            const firstWard = wardsData[0];
            console.log(
              `   🏘️  Phường/xã đầu tiên: ${firstWard?.tenhc} (${firstWard?.loai})`
            );
          }
        }
      } catch (error) {
        console.error(
          `   ❌ Lỗi đọc file ${file}:`,
          error instanceof Error ? error.message : error
        );
      }
    }
  } catch (error) {
    console.error("❌ Lỗi trong quá trình debug:", error);
  }
}

if (require.main === module) {
  debugSeedAll()
    .then(() => {
      console.log("\n🏁 Debug hoàn thành");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Debug thất bại:", error);
      process.exit(1);
    });
}
