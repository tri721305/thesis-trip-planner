import fs from "fs";
import path from "path";
import dbConnect from "@/lib/mongoose";
import Ward from "@/database/ward.model";

// Function to validate geometry coordinates
function validateGeometry(geometry: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!geometry || !geometry.type || !geometry.coordinates) {
    errors.push("Missing geometry type or coordinates");
    return { isValid: false, errors };
  }

  const { type, coordinates } = geometry;

  switch (type) {
    case "Point":
      if (!Array.isArray(coordinates) || coordinates.length !== 2) {
        errors.push("Point must have exactly 2 coordinates");
      }
      break;

    case "Polygon":
      if (!Array.isArray(coordinates) || coordinates.length === 0) {
        errors.push("Polygon must have at least one ring");
      } else {
        coordinates.forEach((ring: any, ringIndex: number) => {
          if (!Array.isArray(ring) || ring.length < 4) {
            errors.push(`Ring ${ringIndex} must have at least 4 coordinates`);
          } else {
            // Check if ring is closed (first and last point must be the same)
            const first = ring[0];
            const last = ring[ring.length - 1];
            if (first[0] !== last[0] || first[1] !== last[1]) {
              errors.push(`Ring ${ringIndex} is not closed`);
            }

            // Check for duplicate consecutive vertices
            for (let i = 1; i < ring.length; i++) {
              if (
                ring[i][0] === ring[i - 1][0] &&
                ring[i][1] === ring[i - 1][1]
              ) {
                errors.push(
                  `Ring ${ringIndex} has duplicate consecutive vertices at index ${i}`
                );
              }
            }
          }
        });
      }
      break;

    case "MultiPolygon":
      if (!Array.isArray(coordinates) || coordinates.length === 0) {
        errors.push("MultiPolygon must have at least one polygon");
      } else {
        coordinates.forEach((polygon: any, polygonIndex: number) => {
          if (!Array.isArray(polygon) || polygon.length === 0) {
            errors.push(`Polygon ${polygonIndex} must have at least one ring`);
          } else {
            polygon.forEach((ring: any, ringIndex: number) => {
              if (!Array.isArray(ring) || ring.length < 4) {
                errors.push(
                  `Polygon ${polygonIndex}, Ring ${ringIndex} must have at least 4 coordinates`
                );
              } else {
                // Check if ring is closed
                const first = ring[0];
                const last = ring[ring.length - 1];
                if (first[0] !== last[0] || first[1] !== last[1]) {
                  errors.push(
                    `Polygon ${polygonIndex}, Ring ${ringIndex} is not closed`
                  );
                }

                // Check for duplicate consecutive vertices
                for (let i = 1; i < ring.length; i++) {
                  if (
                    ring[i][0] === ring[i - 1][0] &&
                    ring[i][1] === ring[i - 1][1]
                  ) {
                    errors.push(
                      `Polygon ${polygonIndex}, Ring ${ringIndex} has duplicate consecutive vertices at index ${i}`
                    );
                  }
                }
              }
            });
          }
        });
      }
      break;

    default:
      errors.push(`Unsupported geometry type: ${type}`);
  }

  return { isValid: errors.length === 0, errors };
}

async function analyzeGeometryErrors() {
  try {
    console.log("🔍 Bắt đầu phân tích geometry errors...");

    // Connect to MongoDB
    await dbConnect();
    console.log("✅ Đã kết nối MongoDB");

    // Get all data files
    const dataPath = path.join(process.cwd(), "database/data");
    const allFiles = fs
      .readdirSync(dataPath)
      .filter((file) => file.endsWith(".json") && !file.includes("admin"))
      .sort();

    console.log(`📂 Tổng số file: ${allFiles.length}`);

    let totalProcessed = 0;
    let totalGeometryErrors = 0;
    const errorDetails: any[] = [];

    // Analyze each file
    for (const file of allFiles) {
      console.log(`\n📄 Đang phân tích ${file}...`);

      try {
        const filePath = path.join(dataPath, file);
        const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));

        // Skip province info (first item)
        const wardsData = jsonData.slice(1);
        console.log(`   📊 ${wardsData.length} wards`);

        for (let i = 0; i < wardsData.length; i++) {
          const ward = wardsData[i];
          totalProcessed++;

          if (ward.geometry) {
            const validation = validateGeometry(ward.geometry);

            if (!validation.isValid) {
              totalGeometryErrors++;
              errorDetails.push({
                file,
                wardIndex: i,
                wardName: ward.tenhc || "Unknown",
                wardCode: ward.ma || "Unknown",
                geometryType: ward.geometry.type,
                errors: validation.errors,
              });

              // Log first few errors in detail
              if (errorDetails.length <= 5) {
                console.log(`   ❌ Error in ward: ${ward.tenhc} (${ward.ma})`);
                console.log(`      Geometry type: ${ward.geometry.type}`);
                console.log(`      Errors: ${validation.errors.join(", ")}`);
              }
            }
          }
        }
      } catch (error) {
        console.error(
          `❌ Lỗi đọc file ${file}:`,
          error instanceof Error ? error.message : error
        );
      }
    }

    // Summary
    console.log(`\n📊 KẾT QUẢ PHÂN TÍCH:`);
    console.log(`   📈 Tổng wards đã xử lý: ${totalProcessed}`);
    console.log(`   ❌ Tổng geometry errors: ${totalGeometryErrors}`);
    console.log(
      `   📊 Tỉ lệ lỗi: ${((totalGeometryErrors / totalProcessed) * 100).toFixed(2)}%`
    );

    // Group errors by type
    const errorByType: { [key: string]: number } = {};
    errorDetails.forEach((detail) => {
      detail.errors.forEach((error: string) => {
        const errorType = error.split(" ")[0]; // Get first word as error type
        errorByType[errorType] = (errorByType[errorType] || 0) + 1;
      });
    });

    console.log(`\n🏷️ PHÂN LOẠI LỖI:`);
    Object.entries(errorByType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} lỗi`);
    });

    // Save detailed error report
    const reportPath = path.join(
      process.cwd(),
      "scripts/geometry-errors-report.json"
    );
    fs.writeFileSync(
      reportPath,
      JSON.stringify(
        {
          summary: {
            totalProcessed,
            totalGeometryErrors,
            errorRate: (totalGeometryErrors / totalProcessed) * 100,
          },
          errorsByType: errorByType,
          detailedErrors: errorDetails,
        },
        null,
        2
      )
    );

    console.log(`📝 Chi tiết lỗi đã được lưu vào: ${reportPath}`);

    // Try to fix some common errors
    console.log(`\n🔧 Đang thử sửa một số lỗi thường gặp...`);
    await attemptGeometryFixes(errorDetails);
  } catch (error) {
    console.error("❌ Lỗi trong quá trình phân tích:", error);
    throw error;
  }
}

async function attemptGeometryFixes(errorDetails: any[]) {
  let fixedCount = 0;

  for (const errorDetail of errorDetails.slice(0, 10)) {
    // Try to fix first 10 errors
    try {
      const filePath = path.join(
        process.cwd(),
        "database/data",
        errorDetail.file
      );
      const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const ward = jsonData[errorDetail.wardIndex + 1]; // +1 because we skip province info

      if (ward && ward.geometry) {
        let fixed = false;
        const geometry = ward.geometry;

        // Fix duplicate consecutive vertices
        if (
          errorDetail.errors.some((e: string) =>
            e.includes("duplicate consecutive vertices")
          )
        ) {
          if (geometry.type === "Polygon") {
            geometry.coordinates = geometry.coordinates.map((ring: any) =>
              removeDuplicateConsecutiveVertices(ring)
            );
            fixed = true;
          } else if (geometry.type === "MultiPolygon") {
            geometry.coordinates = geometry.coordinates.map((polygon: any) =>
              polygon.map((ring: any) =>
                removeDuplicateConsecutiveVertices(ring)
              )
            );
            fixed = true;
          }
        }

        if (fixed) {
          // Validate the fixed geometry
          const validation = validateGeometry(geometry);
          if (validation.isValid) {
            console.log(
              `✅ Fixed geometry for ward: ${errorDetail.wardName} (${errorDetail.wardCode})`
            );
            fixedCount++;

            // Try to save to database
            try {
              const newWard = new Ward({
                matinh: ward.matinh || 0,
                ma: ward.ma?.toString() || "",
                tentinh: ward.tentinh || "",
                loai: ward.loai || "",
                tenhc: ward.tenhc || "",
                cay: ward.cay?.toString() || "",
                con: ward.con || null,
                dientichkm2: parseFloat(ward.dientichkm2) || 0,
                dansonguoi: parseInt(ward.dansonguoi) || 0,
                kinhdo: ward.kinhdo || 0,
                vido: ward.vido || 0,
                truocsapnhap: ward.truocsapnhap || "",
                geometry: geometry,
                geometry_type: ward.geometry_type || undefined,
                geometry_coordinate_count:
                  ward.geometry_coordinate_count || undefined,
              });

              await newWard.save();
              console.log(
                `💾 Saved fixed ward to database: ${errorDetail.wardName}`
              );
            } catch (saveError) {
              console.log(
                `❌ Could not save fixed ward: ${saveError instanceof Error ? saveError.message : saveError}`
              );
            }
          } else {
            console.log(
              `❌ Fix attempt failed for ward: ${errorDetail.wardName}, still has errors: ${validation.errors.join(", ")}`
            );
          }
        }
      }
    } catch (error) {
      console.log(
        `❌ Error fixing ward ${errorDetail.wardName}:`,
        error instanceof Error ? error.message : error
      );
    }
  }

  console.log(`🔧 Fixed ${fixedCount} geometry errors`);
}

function removeDuplicateConsecutiveVertices(ring: number[][]): number[][] {
  if (!Array.isArray(ring) || ring.length === 0) return ring;

  const result = [ring[0]]; // Always keep first vertex

  for (let i = 1; i < ring.length; i++) {
    const current = ring[i];
    const previous = result[result.length - 1];

    // Only add if different from previous vertex
    if (current[0] !== previous[0] || current[1] !== previous[1]) {
      result.push(current);
    }
  }

  // Ensure ring is closed
  if (result.length >= 2) {
    const first = result[0];
    const last = result[result.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      result.push([first[0], first[1]]);
    }
  }

  return result;
}

if (require.main === module) {
  analyzeGeometryErrors()
    .then(() => {
      console.log("\n🎉 Phân tích hoàn thành!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Phân tích thất bại:", error);
      process.exit(1);
    });
}

export { analyzeGeometryErrors };
