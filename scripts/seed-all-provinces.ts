import fs from "fs";
import path from "path";
import dbConnect from "@/lib/mongoose";
import Province from "@/database/province.model";

// Hàm xử lý dữ liệu dân số
const parseDanSoNguoi = (dansonguoi: string | number): number => {
  if (typeof dansonguoi === "number") {
    return dansonguoi;
  }
  if (typeof dansonguoi === "string") {
    if (dansonguoi === "đang cập nhật" || dansonguoi === "") {
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
    if (dientich === "đang cập nhật" || dientich === "") {
      return 0;
    }
    return parseFloat(dientich.replace(/,/g, "")) || 0;
  }
  return 0;
};

async function seedAllProvinces() {
  try {
    console.log("🚀 Bắt đầu seeding tất cả tỉnh thành...");

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

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const file of files) {
      try {
        console.log(`\n📄 Đang xử lý: ${file}`);

        const filePath = path.join(dataDir, file);
        const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));

        // Lấy item đầu tiên (tỉnh/thành phố)
        const firstItem = jsonData[0];

        if (!firstItem) {
          console.log(`⚠️  Không có dữ liệu trong file: ${file}`);
          errorCount++;
          continue;
        }

        // Kiểm tra tỉnh đã tồn tại chưa (kiểm tra nhiều field để đảm bảo)
        const maTinhCheck = (
          firstItem.matinh ||
          firstItem.mahc ||
          firstItem.id
        )?.toString();
        const existingProvince = await Province.findOne({
          $or: [{ matinh: maTinhCheck }, { tentinh: firstItem.tentinh }],
        });

        if (existingProvince) {
          console.log(
            `⏭️  Tỉnh ${firstItem.tentinh} đã tồn tại (mã: ${firstItem.matinh})`
          );
          skipCount++;
          continue;
        }

        // Chuẩn bị dữ liệu tỉnh với fallback cho các cấu trúc khác nhau
        const provinceData = {
          matinh:
            (firstItem.matinh || firstItem.mahc || firstItem.id)?.toString() ||
            "",
          tentinh: firstItem.tentinh || "",
          ma:
            (firstItem.ma || firstItem.mahc || firstItem.id)?.toString() || "",
          loai:
            firstItem.loai ||
            (firstItem.tentinh?.includes("thành phố") ? "thành phố" : "tỉnh") ||
            "",
          tenhc:
            firstItem.tenhc ||
            firstItem.tentinh?.replace("thành phố ", "").replace("tỉnh ", "") ||
            "",
          cay: parseInt(firstItem.cay) || parseInt(firstItem.id) || 0,
          con: firstItem.con || "",
          dientichkm2: parseDienTich(firstItem.dientichkm2),
          dansonguoi: parseDanSoNguoi(firstItem.dansonguoi),
          trungtamhc: firstItem.trungtamhc || "",
          kinhdo: firstItem.kinhdo || 0,
          vido: firstItem.vido || 0,
          truocsapnhap: firstItem.truocsapnhap || "",
          // Không thêm geometry fields
        };

        // Tạo và lưu tỉnh mới
        const newProvince = new Province(provinceData);
        const savedProvince = await newProvince.save();

        console.log(
          `✅ Đã thêm thành công: ${savedProvince.tentinh} (mã: ${savedProvince.matinh})`
        );
        successCount++;
      } catch (error) {
        console.error(`❌ Lỗi khi xử lý file ${file}:`, error);
        errorCount++;
      }
    }

    console.log("\n🎉 Hoàn thành seeding!");
    console.log(`📊 Thống kê:`);
    console.log(`   ✅ Thành công: ${successCount}`);
    console.log(`   ⏭️  Đã tồn tại: ${skipCount}`);
    console.log(`   ❌ Lỗi: ${errorCount}`);
    console.log(`   📁 Tổng file: ${files.length}`);

    // Hiển thị danh sách tỉnh đã thêm
    const allProvinces = await Province.find({})
      .select("tentinh matinh loai")
      .sort({ matinh: 1 });
    console.log("\n📋 Danh sách tỉnh thành trong database:");
    allProvinces.forEach((province, index) => {
      console.log(
        `   ${index + 1}. ${province.tentinh} (${province.loai}) - Mã: ${province.matinh}`
      );
    });
  } catch (error) {
    console.error("❌ Lỗi trong quá trình seeding:", error);
  }
}

export default seedAllProvinces;

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
  seedAllProvinces()
    .then(() => {
      console.log("🏁 Script hoàn thành");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Script thất bại:", error);
      process.exit(1);
    });
}
