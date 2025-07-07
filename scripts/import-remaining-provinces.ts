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

async function importSingleProvince(
  fileName: string
): Promise<{ success: number; skipped: number; errors: number }> {
  console.log(`\n🚀 Bắt đầu import ${fileName}...`);

  // Đường dẫn file
  const filePath = path.join(process.cwd(), "database/data", fileName);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File không tồn tại: ${fileName}`);
  }

  console.log(`📂 Đang đọc file: ${fileName}`);
  const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));

  // Item đầu tiên là thông tin tỉnh, các item còn lại là phường/xã
  const provinceInfo = jsonData[0];
  const wardsData = jsonData.slice(1);

  console.log(`📍 Tỉnh: ${provinceInfo?.tentinh || "N/A"}`);
  console.log(`📊 Số phường/xã: ${wardsData.length}`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  // Xử lý theo batch để tránh timeout
  const batchSize = 50;
  for (
    let batchStart = 0;
    batchStart < wardsData.length;
    batchStart += batchSize
  ) {
    const batch = wardsData.slice(
      batchStart,
      Math.min(batchStart + batchSize, wardsData.length)
    );

    console.log(
      `📦 Batch ${Math.floor(batchStart / batchSize) + 1}: Processing ${batchStart + 1}-${batchStart + batch.length}/${wardsData.length}`
    );

    for (let i = 0; i < batch.length; i++) {
      try {
        const wardItem = batch[i];

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

        // Chuẩn bị dữ liệu phường/xã
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
          console.error(
            `❌ Lỗi ward ${batchStart + i + 1}:`,
            error instanceof Error ? error.message : error
          );
        }
      }
    }
  }

  console.log(
    `✅ Hoàn thành ${fileName}: Success: ${successCount}, Skipped: ${skipCount}, Errors: ${errorCount}`
  );

  return { success: successCount, skipped: skipCount, errors: errorCount };
}

async function importRemainingProvinces() {
  try {
    console.log("🚀 Bắt đầu import các tỉnh còn lại...");

    // Kết nối MongoDB
    console.log("📡 Đang kết nối MongoDB...");
    await dbConnect();
    console.log("✅ Đã kết nối MongoDB");

    // Lấy danh sách tất cả files JSON
    const dataPath = path.join(process.cwd(), "database/data");
    const allFiles = fs
      .readdirSync(dataPath)
      .filter((file) => file.endsWith(".json") && !file.includes("admin"))
      .sort();

    console.log(`📂 Tổng số file: ${allFiles.length}`);

    // Lấy danh sách các tỉnh đã import
    const importedProvinces = await Ward.distinct("tentinh");
    console.log(`🏙️ Đã import: ${importedProvinces.length} tỉnh/thành phố`);

    // Tìm files chưa import
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
        }
      } catch (error) {
        console.log(`⚠️ Không thể đọc file ${file}`);
      }
    }

    console.log(`\n📋 Cần import ${notImportedFiles.length} tỉnh:`);
    notImportedFiles.forEach((item, index) => {
      console.log(
        `   ${index + 1}. ${item.file} (${item.provinceName}) - ${item.wardCount} wards`
      );
    });

    if (notImportedFiles.length === 0) {
      console.log("🎉 Tất cả tỉnh đã được import!");
      return;
    }

    let totalSuccess = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    // Import từng tỉnh
    for (let i = 0; i < notImportedFiles.length; i++) {
      const item = notImportedFiles[i];
      console.log(
        `\n📍 [${i + 1}/${notImportedFiles.length}] Import ${item.provinceName}...`
      );

      try {
        const result = await importSingleProvince(item.file);
        totalSuccess += result.success;
        totalSkipped += result.skipped;
        totalErrors += result.errors;

        // Pause để tránh quá tải database
        if (i < notImportedFiles.length - 1) {
          console.log("⏸️ Chờ 2 giây...");
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(
          `❌ Lỗi import ${item.file}:`,
          error instanceof Error ? error.message : error
        );
        totalErrors++;
      }
    }

    // Thống kê cuối cùng
    const finalTotal = await Ward.countDocuments();
    console.log(`\n🏁 HOÀN THÀNH IMPORT TẤT CẢ CÁC TỈNH:`);
    console.log(`   ✅ Tổng thành công: ${totalSuccess}`);
    console.log(`   ⏭️ Tổng đã tồn tại: ${totalSkipped}`);
    console.log(`   ❌ Tổng lỗi: ${totalErrors}`);
    console.log(`   📊 Tổng wards trong DB: ${finalTotal}`);
  } catch (error) {
    console.error("❌ Lỗi trong quá trình import:", error);
    throw error;
  }
}

if (require.main === module) {
  importRemainingProvinces()
    .then(() => {
      console.log("\n🎉 Script hoàn thành thành công!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Script thất bại:", error);
      process.exit(1);
    });
}

export { importRemainingProvinces };
