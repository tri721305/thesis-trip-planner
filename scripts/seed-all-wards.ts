import fs from "fs";
import path from "path";
import dbConnect from "@/lib/mongoose";
import Ward from "@/database/ward.model";

// Hàm xử lý dữ liệu dân số
const parseDanSoNguoi = (dansonguoi: string | number): number => {
  if (typeof dansonguoi === "number") {
    return dansonguoi;
  }
  if (typeof dansonguoi === "string") {
    if (
      dansonguoi === "đang cập nhật" ||
      dansonguoi === "" ||
      dansonguoi === "null"
    ) {
      return 0;
    }
    return parseInt(dansonguoi.replace(/,/g, "")) || 0;
  }
  return 0;
};

// Hàm xử lý diện tích
const parseDienTich = (dientich: string | number): number => {
  if (typeof dientich === "number") {
    return dientich;
  }
  if (typeof dientich === "string") {
    if (
      dientich === "đang cập nhật" ||
      dientich === "" ||
      dientich === "null"
    ) {
      return 0;
    }
    return parseFloat(dientich.replace(/,/g, "")) || 0;
  }
  return 0;
};

async function seedAllWards() {
  try {
    console.log("🚀 Bắt đầu seeding phường/xã tất cả tỉnh thành...");

    // Kết nối MongoDB
    await dbConnect();
    console.log("✅ Đã kết nối MongoDB");

    // Đường dẫn thư mục data
    const dataDir = path.join(process.cwd(), "database/data");

    // Lấy tất cả file JSON trong thư mục data
    const files = fs
      .readdirSync(dataDir)
      .filter((file) => file.endsWith(".json") && !file.includes("admin"));

    console.log(`📁 Tìm thấy ${files.length} file JSON`);

    let totalSuccessCount = 0;
    let totalSkipCount = 0;
    let totalErrorCount = 0;
    let processedProvinces = 0;
    let totalWards = 0;

    for (const file of files) {
      try {
        console.log(`\n📂 ========== Đang xử lý: ${file} ==========`);

        const filePath = path.join(dataDir, file);
        const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));

        // Item đầu tiên là thông tin tỉnh, các item còn lại là phường/xã
        const provinceInfo = jsonData[0];
        const wardsData = jsonData.slice(1);

        if (wardsData.length === 0) {
          console.log(`⚠️  Không có dữ liệu phường/xã trong file: ${file}`);
          continue;
        }

        console.log(`📍 Tỉnh: ${provinceInfo?.tentinh || "N/A"}`);
        console.log(`📊 Số phường/xã: ${wardsData.length}`);

        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;

        for (let i = 0; i < wardsData.length; i++) {
          try {
            const wardItem = wardsData[i];

            if (i % 20 === 0 || i === wardsData.length - 1) {
              process.stdout.write(
                `\r   📄 Đang xử lý: ${i + 1}/${wardsData.length} - ${wardItem.tenhc || "N/A"}`
              );
            }

            // Kiểm tra phường/xã đã tồn tại chưa
            const existingWard = await Ward.findOne({
              $and: [
                { ma: wardItem.ma?.toString() },
                { tenhc: wardItem.tenhc },
                { matinh: wardItem.matinh || provinceInfo?.matinh },
              ],
            });

            if (existingWard) {
              skipCount++;
              continue;
            }

            // Chuẩn bị dữ liệu phường/xã với fallback cho các cấu trúc khác nhau
            const wardData = {
              matinh: wardItem.matinh || provinceInfo?.matinh || 0,
              ma: wardItem.ma?.toString() || "",
              tentinh: wardItem.tentinh || provinceInfo?.tentinh || "",
              loai: wardItem.loai || "",
              tenhc: wardItem.tenhc || "",
              cay: wardItem.cay?.toString() || "",
              con: wardItem.con || null,
              dientichkm2: parseDienTich(wardItem.dientichkm2),
              dansonguoi: parseDanSoNguoi(wardItem.dansonguoi),
              kinhdo: wardItem.kinhdo || 0,
              vido: wardItem.vido || 0,
              truocsapnhap: wardItem.truocsapnhap || "",
              // Thêm geometry nếu có
              geometry: wardItem.geometry || undefined,
              geometry_type: wardItem.geometry_type || undefined,
              geometry_coordinate_count:
                wardItem.geometry_coordinate_count || undefined,
            };

            // Tạo và lưu phường/xã mới
            const newWard = new Ward(wardData);
            await newWard.save();

            successCount++;
          } catch (error) {
            errorCount++;
            if (errorCount <= 3) {
              // Chỉ log 3 lỗi đầu tiên để tránh spam
              console.error(
                `\n❌ Lỗi khi xử lý phường/xã ${i + 1} (${wardItem?.tenhc}):`,
                error instanceof Error ? error.message : error
              );
            }
          }
        }

        console.log(`\n   ✅ Thành công: ${successCount}`);
        console.log(`   ⏭️  Đã tồn tại: ${skipCount}`);
        console.log(`   ❌ Lỗi: ${errorCount}`);

        totalSuccessCount += successCount;
        totalSkipCount += skipCount;
        totalErrorCount += errorCount;
        totalWards += wardsData.length;
        processedProvinces++;
      } catch (error) {
        console.error(`❌ Lỗi khi xử lý file ${file}:`, error);
        totalErrorCount++;
      }
    }

    console.log(
      "\n🎉 ========== HOÀN THÀNH SEEDING TẤT CẢ TỈNH THÀNH =========="
    );
    console.log(`📊 Thống kê tổng:`);
    console.log(
      `   🏛️  Tỉnh thành xử lý: ${processedProvinces}/${files.length}`
    );
    console.log(`   ✅ Phường/xã thành công: ${totalSuccessCount}`);
    console.log(`   ⏭️  Phường/xã đã tồn tại: ${totalSkipCount}`);
    console.log(`   ❌ Lỗi: ${totalErrorCount}`);
    console.log(`   📁 Tổng phường/xã: ${totalWards}`);

    // Hiển thị thống kê chi tiết theo tỉnh
    const wardsByProvince = await Ward.aggregate([
      {
        $group: {
          _id: { matinh: "$matinh", tentinh: "$tentinh" },
          count: { $sum: 1 },
          phuong: { $sum: { $cond: [{ $eq: ["$loai", "phường"] }, 1, 0] } },
          xa: { $sum: { $cond: [{ $eq: ["$loai", "xã"] }, 1, 0] } },
          thitran: { $sum: { $cond: [{ $eq: ["$loai", "thị trấn"] }, 1, 0] } },
        },
      },
      { $sort: { "_id.matinh": 1 } },
    ]);

    console.log("\n📋 Thống kê phường/xã theo tỉnh:");
    wardsByProvince.forEach((province, index) => {
      console.log(
        `   ${index + 1}. ${province._id.tentinh} (Mã: ${province._id.matinh})`
      );
      console.log(
        `      📊 Tổng: ${province.count} | Phường: ${province.phuong} | Xã: ${province.xa} | Thị trấn: ${province.thitran}`
      );
    });

    // Thống kê tổng theo loại
    const totalStats = await Ward.aggregate([
      { $group: { _id: "$loai", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    console.log("\n📋 Thống kê tổng theo loại:");
    totalStats.forEach((stat) => {
      console.log(`   ${stat._id}: ${stat.count}`);
    });

    const totalWardsInDB = await Ward.countDocuments();
    console.log(`\n🏆 Tổng phường/xã trong database: ${totalWardsInDB}`);
  } catch (error) {
    console.error("❌ Lỗi trong quá trình seeding:", error);
    throw error;
  }
}

export default seedAllWards;

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
  seedAllWards()
    .then(() => {
      console.log("\n🏁 Script hoàn thành");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Script thất bại:", error);
      process.exit(1);
    });
}
