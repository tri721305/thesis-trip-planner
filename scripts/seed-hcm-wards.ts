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

async function seedHCMWards() {
  try {
    console.log("🚀 Bắt đầu seeding phường/xã thành phố Hồ Chí Minh...");

    // Kết nối MongoDB
    await dbConnect();
    console.log("✅ Đã kết nối MongoDB");

    // Đường dẫn file JSON TP.HCM
    const jsonPath = path.join(
      process.cwd(),
      "database/data/thành_phố_Hồ_Chí_Minh.json"
    );

    if (!fs.existsSync(jsonPath)) {
      throw new Error("File thành_phố_Hồ_Chí_Minh.json không tồn tại");
    }

    const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

    // Lấy dữ liệu từ item thứ 2 đến hết (bỏ qua item đầu tiên là thông tin tỉnh)
    const wardsData = jsonData.slice(1);

    console.log(`📁 Tìm thấy ${wardsData.length} phường/xã trong TP.HCM`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (let i = 0; i < wardsData.length; i++) {
      try {
        const wardItem = wardsData[i];

        console.log(
          `\n📄 Đang xử lý ${i + 1}/${wardsData.length}: ${wardItem.tenhc || "N/A"} (${wardItem.loai || "N/A"})`
        );

        // Kiểm tra phường/xã đã tồn tại chưa
        const existingWard = await Ward.findOne({
          $and: [{ ma: wardItem.ma?.toString() }, { tenhc: wardItem.tenhc }],
        });

        if (existingWard) {
          console.log(
            `⏭️  Phường/xã ${wardItem.tenhc} đã tồn tại (mã: ${wardItem.ma})`
          );
          skipCount++;
          continue;
        }

        // Chuẩn bị dữ liệu phường/xã
        const wardData = {
          matinh: wardItem.matinh || 29,
          ma: wardItem.ma?.toString() || "",
          tentinh: wardItem.tentinh || "thành phố Hồ Chí Minh",
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
        const savedWard = await newWard.save();

        console.log(
          `✅ Đã thêm thành công: ${savedWard.tenhc} (${savedWard.loai}) - Mã: ${savedWard.ma}`
        );
        successCount++;
      } catch (error) {
        console.error(`❌ Lỗi khi xử lý phường/xã ${i + 1}:`, error);
        errorCount++;
      }
    }

    console.log("\n🎉 Hoàn thành seeding phường/xã TP.HCM!");
    console.log(`📊 Thống kê:`);
    console.log(`   ✅ Thành công: ${successCount}`);
    console.log(`   ⏭️  Đã tồn tại: ${skipCount}`);
    console.log(`   ❌ Lỗi: ${errorCount}`);
    console.log(`   📁 Tổng phường/xã: ${wardsData.length}`);

    // Hiển thị thống kê theo loại
    const wardStats = await Ward.aggregate([
      { $match: { matinh: 29 } },
      { $group: { _id: "$loai", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    console.log("\n📋 Thống kê theo loại:");
    wardStats.forEach((stat) => {
      console.log(`   ${stat._id}: ${stat.count}`);
    });

    // Hiển thị một số phường/xã mẫu
    const sampleWards = await Ward.find({ matinh: 29 })
      .limit(5)
      .select("tenhc loai ma dientichkm2 dansonguoi");
    console.log("\n📋 Một số phường/xã mẫu:");
    sampleWards.forEach((ward, index) => {
      console.log(
        `   ${index + 1}. ${ward.tenhc} (${ward.loai}) - Mã: ${ward.ma} - DT: ${ward.dientichkm2}km² - DS: ${ward.dansonguoi?.toLocaleString()}`
      );
    });
  } catch (error) {
    console.error("❌ Lỗi trong quá trình seeding:", error);
    throw error;
  }
}

export default seedHCMWards;

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
  seedHCMWards()
    .then(() => {
      console.log("🏁 Script hoàn thành");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Script thất bại:", error);
      process.exit(1);
    });
}
