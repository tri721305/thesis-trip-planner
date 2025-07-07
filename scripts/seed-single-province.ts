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

async function seedSingleProvince(fileName: string) {
  try {
    console.log(`🚀 Bắt đầu seeding ${fileName}...`);

    // Kết nối MongoDB với timeout
    console.log("📡 Đang kết nối MongoDB...");
    await Promise.race([
      dbConnect(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout kết nối MongoDB")), 10000)
      ),
    ]);
    console.log("✅ Đã kết nối MongoDB");

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

    for (let i = 0; i < wardsData.length; i++) {
      try {
        const wardItem = wardsData[i];

        if (i % 10 === 0 || i === wardsData.length - 1) {
          console.log(
            `📄 Đang xử lý: ${i + 1}/${wardsData.length} - ${wardItem.tenhc || "N/A"}`
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
            `❌ Lỗi ward ${i + 1}:`,
            error instanceof Error ? error.message : error
          );
        }
      }
    }

    console.log(`\n🎉 Hoàn thành ${fileName}:`);
    console.log(`   ✅ Thành công: ${successCount}`);
    console.log(`   ⏭️  Đã tồn tại: ${skipCount}`);
    console.log(`   ❌ Lỗi: ${errorCount}`);

    // Kiểm tra tổng số wards
    const totalWards = await Ward.countDocuments();
    console.log(`\n📊 Tổng wards trong DB: ${totalWards}`);
  } catch (error) {
    console.error("❌ Lỗi trong quá trình seeding:", error);
    throw error;
  }
}

// Lấy tên file từ command line args
const fileName = process.argv[2];

if (!fileName) {
  console.error(
    '❌ Vui lòng cung cấp tên file. Ví dụ: tsx scripts/seed-single-province.ts "Thủ_đô_Hà_Nội.json"'
  );
  process.exit(1);
}

if (require.main === module) {
  seedSingleProvince(fileName)
    .then(() => {
      console.log("\n🏁 Script hoàn thành");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Script thất bại:", error);
      process.exit(1);
    });
}
