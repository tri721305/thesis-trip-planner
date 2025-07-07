"use server";
import { promises as fs } from "fs";

import dbConnect from "../mongoose";
import AdministrativeRegion from "@/database/administractive-region.model";

export async function importData() {
  //   await dbConnect();
  try {
    console.log("import");
    const data = await fs.readFile(
      process.cwd() + "/database/data/administrative_regions.json",
      "utf-8"
    );

    const regionsData = JSON.parse(data);
    //   await AdministrativeRegion.deleteMany({});
    await AdministrativeRegion.insertMany(
      regionsData.map((region: any) => {
        console.log("region", region);
        return {
          id: region.Id,
          name: region.Name,
          nameEn: region.NameEn,
          codeName: region.CodeName,
          codeNameEn: region.CodeNameEn,
        };
      })
    );
    console.log("regionsData", regionsData);
  } catch (error) {
    console.log("Error importing data:", error);
  }
}
