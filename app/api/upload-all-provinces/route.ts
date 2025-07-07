import { NextRequest, NextResponse } from "next/server";
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

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Bắt đầu upload tất cả tỉnh thành...");

    // Kết nối MongoDB
    await dbConnect();
    console.log("✅ Đã kết nối MongoDB");

    // Đường dẫn thư mục data
    const dataDir = path.join(process.cwd(), "database/data");

    if (!fs.existsSync(dataDir)) {
      return NextResponse.json(
        { success: false, message: "Thư mục data không tồn tại" },
        { status: 404 }
      );
    }

    // Lấy tất cả file JSON trong thư mục data
    const files = fs
      .readdirSync(dataDir)
      .filter((file) => file.endsWith(".json") && !file.includes("admin"));

    console.log(`📁 Tìm thấy ${files.length} file JSON`);

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy file JSON nào" },
        { status: 404 }
      );
    }

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    const results = [];
    const errors = [];

    for (const file of files) {
      try {
        console.log(`📄 Đang xử lý: ${file}`);

        const filePath = path.join(dataDir, file);
        const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));

        // Lấy item đầu tiên (tỉnh/thành phố)
        const firstItem = jsonData[0];

        if (!firstItem) {
          console.log(`⚠️  Không có dữ liệu trong file: ${file}`);
          errors.push(`Không có dữ liệu trong file: ${file}`);
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
          results.push({
            file,
            status: "skipped",
            message: `${firstItem.tentinh} đã tồn tại`,
            data: {
              matinh: existingProvince.matinh,
              tentinh: existingProvince.tentinh,
              loai: existingProvince.loai,
            },
          });
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

        results.push({
          file,
          status: "success",
          message: `Đã thêm thành công ${savedProvince.tentinh}`,
          data: {
            id: savedProvince._id,
            matinh: savedProvince.matinh,
            tentinh: savedProvince.tentinh,
            loai: savedProvince.loai,
            dientichkm2: savedProvince.dientichkm2,
            dansonguoi: savedProvince.dansonguoi,
            kinhdo: savedProvince.kinhdo,
            vido: savedProvince.vido,
          },
        });
        successCount++;
      } catch (error) {
        console.error(`❌ Lỗi khi xử lý file ${file}:`, error);
        errors.push(
          `Lỗi file ${file}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
        errorCount++;
      }
    }

    console.log("🎉 Hoàn thành upload!");
    console.log(
      `📊 Thống kê: Thành công: ${successCount}, Đã tồn tại: ${skipCount}, Lỗi: ${errorCount}`
    );

    // Lấy danh sách tất cả tỉnh thành để trả về
    const allProvinces = await Province.find({})
      .select("tentinh matinh loai dientichkm2 dansonguoi")
      .sort({ matinh: 1 });

    return NextResponse.json({
      success: true,
      message: `Upload hoàn thành! Thành công: ${successCount}, Đã tồn tại: ${skipCount}, Lỗi: ${errorCount}`,
      summary: {
        totalFiles: files.length,
        successCount,
        skipCount,
        errorCount,
        totalProvinces: allProvinces.length,
      },
      results,
      errors: errors.length > 0 ? errors : undefined,
      allProvinces,
    });
  } catch (error) {
    console.error("❌ Lỗi upload tỉnh thành:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Lỗi upload tỉnh thành",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
