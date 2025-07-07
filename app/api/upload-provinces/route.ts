import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Province from "@/database/province.model";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Starting Province data upload...");

    // Connect to MongoDB
    await dbConnect();
    console.log("✅ Connected to MongoDB");

    // Read data from JSON file
    const jsonPath = path.join(
      process.cwd(),
      "database/data/thành_phố_Hồ_Chí_Minh.json"
    );

    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json(
        { success: false, message: "JSON file not found" },
        { status: 404 }
      );
    }

    const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

    // Get first item
    const firstItem = jsonData[0];

    if (!firstItem) {
      return NextResponse.json(
        { success: false, message: "No data found in JSON file" },
        { status: 400 }
      );
    }

    // Check if province already exists
    const existingProvince = await Province.findOne({
      matinh: firstItem.matinh?.toString(),
    });

    if (existingProvince) {
      return NextResponse.json({
        success: true,
        message: "Province already exists",
        data: {
          id: existingProvince._id,
          tentinh: existingProvince.tentinh,
          matinh: existingProvince.matinh,
          loai: existingProvince.loai,
          dientichkm2: existingProvince.dientichkm2,
          dansonguoi: existingProvince.dansonguoi,
        },
      });
    }

    // Helper function to parse population
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

    // Prepare province data
    const provinceData = {
      matinh: firstItem.matinh?.toString() || "29",
      tentinh: firstItem.tentinh || "thành phố Hồ Chí Minh",
      ma: firstItem.ma?.toString() || "2687",
      loai: firstItem.loai || "thành phố",
      tenhc: firstItem.tenhc || "Hồ Chí Minh",
      cay: parseInt(firstItem.cay) || 2687,
      con: firstItem.con || "168 ĐVHC cấp xã (01 đặc khu, 113 phường, 54 xã)",
      dientichkm2: firstItem.dientichkm2 || 0,
      dansonguoi: parseDanSoNguoi(firstItem.dansonguoi),
      trungtamhc: firstItem.trungtamhc || "Tp. HCM (cũ)",
      kinhdo: firstItem.kinhdo || 106.673,
      vido: firstItem.vido || 10.853,
      truocsapnhap: firstItem.truocsapnhap,
      geometry: firstItem.geometry || {
        type: "Point",
        coordinates: [firstItem.kinhdo || 106.673, firstItem.vido || 10.853],
      },
      geometry_type: firstItem.geometry_type || "Point",
      geometry_coordinate_count: firstItem.geometry_coordinate_count || 1,
    };

    // Create and save new province
    const newProvince = new Province(provinceData);
    const savedProvince = await newProvince.save();

    console.log("✅ Province uploaded successfully:", savedProvince.tentinh);

    return NextResponse.json({
      success: true,
      message: "Province uploaded successfully",
      data: {
        id: savedProvince._id,
        matinh: savedProvince.matinh,
        tentinh: savedProvince.tentinh,
        loai: savedProvince.loai,
        dientichkm2: savedProvince.dientichkm2,
        dansonguoi: savedProvince.dansonguoi,
        kinhdo: savedProvince.kinhdo,
        vido: savedProvince.vido,
        geometry_type: savedProvince.geometry_type,
        geometry_coordinate_count: savedProvince.geometry_coordinate_count,
      },
    });
  } catch (error) {
    console.error("❌ Error uploading province data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload province data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
