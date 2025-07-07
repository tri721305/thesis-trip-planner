import fs from "fs";
import path from "path";
import dbConnect from "@/lib/mongoose";
import Ward from "@/database/ward.model";

async function checkImportStatus() {
  try {
    console.log("📡 Đang kết nối MongoDB...");
    await dbConnect();
    console.log("✅ Đã kết nối MongoDB");

    // Lấy danh sách tất cả files JSON
    const dataPath = path.join(process.cwd(), "database/data");
    const allFiles = fs
      .readdirSync(dataPath)
      .filter((file) => file.endsWith(".json") && !file.includes("admin"))
      .sort();

    console.log(`\n📂 Tổng số file cần import: ${allFiles.length}`);

    // Lấy thống kê từ database
    const totalWards = await Ward.countDocuments();
    console.log(`📊 Tổng wards trong database: ${totalWards}`);

    // Lấy danh sách các tỉnh đã import
    const importedProvinces = await Ward.distinct("tentinh");
    console.log(
      `\n🏙️ Các tỉnh/thành phố đã import (${importedProvinces.length}):`
    );

    // Đếm số wards theo từng tỉnh
    const provinceStats = await Ward.aggregate([
      {
        $group: {
          _id: "$tentinh",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    provinceStats.forEach((province) => {
      console.log(`   ${province._id}: ${province.count} wards`);
    });

    // Tìm files chưa import
    console.log(`\n📋 Files cần import:`);
    const notImportedFiles = [];

    for (const file of allFiles) {
      try {
        const filePath = path.join(dataPath, file);
        const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
        const provinceInfo = jsonData[0];
        const provinceName = provinceInfo?.tentinh || "Unknown";

        const isImported = importedProvinces.includes(provinceName);
        if (!isImported) {
          notImportedFiles.push({
            file,
            provinceName,
            wardCount: jsonData.length - 1,
          });
          console.log(
            `   ❌ ${file} (${provinceName}) - ${jsonData.length - 1} wards`
          );
        } else {
          console.log(`   ✅ ${file} (${provinceName}) - đã import`);
        }
      } catch (error) {
        console.log(`   ⚠️  ${file} - Lỗi đọc file`);
      }
    }

    console.log(`\n📈 Tóm tắt:`);
    console.log(`   - Tổng files: ${allFiles.length}`);
    console.log(`   - Đã import: ${importedProvinces.length} tỉnh/thành phố`);
    console.log(`   - Chưa import: ${notImportedFiles.length} files`);
    console.log(`   - Tổng wards hiện tại: ${totalWards}`);

    if (notImportedFiles.length > 0) {
      const totalPendingWards = notImportedFiles.reduce(
        (sum, item) => sum + item.wardCount,
        0
      );
      console.log(`   - Wards chưa import: ~${totalPendingWards}`);

      console.log(`\n🚀 Files cần import tiếp theo:`);
      notImportedFiles.slice(0, 5).forEach((item) => {
        console.log(`   tsx scripts/seed-single-province.ts "${item.file}"`);
      });
    }
  } catch (error) {
    console.error("❌ Lỗi:", error);
  }
}

if (require.main === module) {
  checkImportStatus()
    .then(() => {
      console.log("\n🏁 Kiểm tra hoàn thành");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Lỗi:", error);
      process.exit(1);
    });
}
