import { connect } from "mongoose";
import Province from "../database/province.model";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đọc dữ liệu từ file JSON
const jsonFilePath = path.join(
  __dirname,
  "../database/data/thành_phố_Hồ_Chí_Minh.json"
);
const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));

// Lấy item đầu tiên từ mảng
const firstItem = jsonData[0];

console.log("First item data:", JSON.stringify(firstItem, null, 2));

// Helper function để parse dansonguoi
function parseDanSoNguoi(dansonguoi: string | number): number {
  if (typeof dansonguoi === "number") {
    return dansonguoi;
  }
  if (typeof dansonguoi === "string") {
    // Handle special cases
    if (dansonguoi === "đang cập nhật" || dansonguoi === "") {
      return 0;
    }
    // Remove commas and convert to number
    return parseInt(dansonguoi.replace(/,/g, ""));
  }
  return 0;
}

// Mapping dữ liệu từ JSON sang Province model
const provinceData = {
  matinh: firstItem.matinh.toString(),
  tentinh: firstItem.tentinh,
  ma: firstItem.ma,
  loai: firstItem.loai,
  tenhc: firstItem.tenhc,
  cay: parseInt(firstItem.cay) || 0,
  con: firstItem.con || "",
  dientichkm2: firstItem.dientichkm2 || 0,
  dansonguoi: parseDanSoNguoi(firstItem.dansonguoi),
  trungtamhc: firstItem.trungtamhc || "",
  kinhdo: firstItem.kinhdo || 0,
  vido: firstItem.vido || 0,
  truocsapnhap: firstItem.truocsapnhap || "",
  geometry: firstItem.geometry,
  geometry_type: firstItem.geometry_type,
  geometry_coordinate_count: firstItem.geometry_coordinate_count || 0,
};

// Function để seed dữ liệu (không handle connection)
async function seedProvince() {
  try {
    console.log("📊 Processing first item from JSON...");

    // Kiểm tra xem đã có dữ liệu chưa
    const existingProvince = await Province.findOne({
      matinh: provinceData.matinh,
    });

    if (existingProvince) {
      console.log("⚠️ Province đã tồn tại:", existingProvince.tentinh);
      return existingProvince;
    }

    // Tạo và lưu province mới
    const newProvince = new Province(provinceData);
    const savedProvince = await newProvince.save();

    console.log("✅ Province đã được thêm thành công:");
    console.log({
      id: savedProvince._id,
      matinh: savedProvince.matinh,
      tentinh: savedProvince.tentinh,
      loai: savedProvince.loai,
      dientichkm2: savedProvince.dientichkm2,
      dansonguoi: savedProvince.dansonguoi,
      geometry_type: savedProvince.geometry_type,
      geometry_coordinate_count: savedProvince.geometry_coordinate_count,
    });

    return savedProvince;
  } catch (error) {
    console.error("❌ Lỗi khi seed dữ liệu:", error);
    throw error;
  }
}

export default seedProvince;
