"use server";
import { promises as fs } from "fs";

import dbConnect from "../mongoose";
import AdministrativeRegion from "@/database/administractive-region.model";
import AdministrativeUnit from "@/database/administractive-unit.model";
import Province from "@/database/province.model";
import District from "@/database/district.model";
import Ward from "@/database/ward.model";

export async function importData() {
  try {
    // First, ensure database connection is established
    console.log("Connecting to MongoDB...");
    await dbConnect();

    console.log("Reading data file...");
    const data = await fs.readFile(
      process.cwd() + "/database/data/mongo_data_vn_unit.json",
      "utf-8"
    );

    const vietNamUnitsData = JSON.parse(data);
    console.log(`Found ${vietNamUnitsData.length} regions to import`);
    const batchSize = 100;

    let wardsData: any[] = [];
    vietNamUnitsData.forEach((province: any) => {
      if (province.District && Array.isArray(province.District)) {
        province.District.forEach((district: any) => {
          if (district.Ward && Array.isArray(district.Ward)) {
            district.Ward.forEach((ward: any) => {
              if (ward.Code && ward.Name) {
                // Verify required fields exist
                wardsData.push({
                  code: ward.Code,
                  name: ward.Name,
                  nameEn: ward.NameEn || "",
                  fullName: ward.FullName || "",
                  fullNameEn: ward.FullNameEn || "",
                  codeName: ward.CodeName || "",
                  districtCode: district.Code,
                  administrativeUnitId: ward.AdministrativeUnitId || 0,
                  type: ward.Type || "ward",
                });
              }
            });
          }
        });
      }
    });

    console.log("warddata");
    // Insert wards in batches to avoid any potential size issues
    for (let i = 0; i < wardsData.length; i += batchSize) {
      const batch = wardsData.slice(i, i + batchSize);
      console.log("batch,", batch);
      await Ward.insertMany(batch);
      console.log(
        `Imported wards batch ${Math.ceil((i + 1) / batchSize)} of ${Math.ceil(wardsData.length / batchSize)}`
      );
    }

    console.log("Wards imported successfully");
  } catch (error) {
    console.log("Error importing data:", error);
  }
}
