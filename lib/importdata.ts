import fs from "fs";
import path from "path";
import mongoose from "mongoose";

import dbConnect from "../lib/mongoose";
import AdministrativeRegion from "@/database/administractive-region.model";
import AdministrativeUnit from "@/database/administractive-unit.model";
import Province from "../database/province.model";
import District from "../database/district.model";
import Ward from "../database/ward.model";
export async function importData() {
  try {
    // Kết nối đến database
    await dbConnect();

    // Import Administrative Regions
    const regionsPath = path.join(
      "@/database/data/administrative_regions.json"
    );

    const regionsData = JSON.parse(
      fs.readFileSync("../database/data/administrative_regions.json", "utf-8")
    );

    console.log("Importing administrative regions...");
    await AdministrativeRegion.deleteMany({});
    await AdministrativeRegion.insertMany(
      regionsData.map((region: any) => ({
        id: region.Id,
        name: region.Name,
        nameEn: region.NameEn,
        codeName: region.CodeName,
        codeNameEn: region.CodeNameEn,
      }))
    );
    console.log("Administrative regions imported successfully");

    // Import Administrative Units
    const unitsPath = path.join(
      __dirname,
      "../database/data/administrative_units.json"
    );
    const unitsData = JSON.parse(fs.readFileSync(unitsPath, "utf-8"));

    console.log("Importing administrative units...");
    await AdministrativeUnit.deleteMany({});
    await AdministrativeUnit.insertMany(
      unitsData.map((unit: any) => ({
        id: unit.Id,
        fullName: unit.FullName,
        fullNameEn: unit.FullNameEn,
        shortName: unit.ShortName,
        shortNameEn: unit.ShortNameEn,
        codeName: unit.CodeName,
        codeNameEn: unit.CodeNameEn,
      }))
    );
    console.log("Administrative units imported successfully");

    // Import Provinces, Districts, and Wards
    const vietNamUnitsPath = path.join(
      __dirname,
      "../database/data/mongo_data_vn_unit.json"
    );
    const vietNamUnitsData = JSON.parse(
      fs.readFileSync(vietNamUnitsPath, "utf-8")
    );

    console.log("Importing provinces...");
    await Province.deleteMany({});
    const provinces = vietNamUnitsData.map((province: any) => ({
      code: province.Code,
      name: province.Name,
      nameEn: province.NameEn,
      fullName: province.FullName,
      fullNameEn: province.FullNameEn,
      codeName: province.CodeName,
      type: province.Type,
      administrativeUnitId: province.AdministrativeUnitId,
      administrativeRegionId: province.AdministrativeRegionId,
    }));
    await Province.insertMany(provinces);
    console.log("Provinces imported successfully");

    console.log("Importing districts...");
    await District.deleteMany({});

    // Prepare districts data
    let districtsData: any[] = [];
    vietNamUnitsData.forEach((province: any) => {
      if (province.District && Array.isArray(province.District)) {
        province.District.forEach((district: any) => {
          if (district.Code && district.Name) {
            // Verify required fields exist
            districtsData.push({
              code: district.Code,
              name: district.Name,
              nameEn: district.NameEn || "",
              fullName: district.FullName || "",
              fullNameEn: district.FullNameEn || "",
              codeName: district.CodeName || "",
              provinceCode: province.Code,
              administrativeUnitId: district.AdministrativeUnitId || 0,
              type: district.Type || "district",
            });
          }
        });
      }
    });

    // Insert districts in batches to avoid any potential size issues
    const batchSize = 100;
    for (let i = 0; i < districtsData.length; i += batchSize) {
      const batch = districtsData.slice(i, i + batchSize);
      await District.insertMany(batch);
      console.log(
        `Imported districts batch ${Math.ceil((i + 1) / batchSize)} of ${Math.ceil(districtsData.length / batchSize)}`
      );
    }

    console.log("Districts imported successfully");

    console.log("Importing wards...");
    await Ward.deleteMany({});

    // Prepare wards data
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

    // Insert wards in batches to avoid any potential size issues
    for (let i = 0; i < wardsData.length; i += batchSize) {
      const batch = wardsData.slice(i, i + batchSize);
      await Ward.insertMany(batch);
      console.log(
        `Imported wards batch ${Math.ceil((i + 1) / batchSize)} of ${Math.ceil(wardsData.length / batchSize)}`
      );
    }

    console.log("Wards imported successfully");
    console.log("All administrative data imported successfully");
  } catch (error) {
    console.error("Error importing data:", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

// Run the import

importData();
