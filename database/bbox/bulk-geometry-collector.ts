import fs from "fs";
import path from "path";

// Interface for data.json item
interface DataItem {
  id: number;
  tenhc: string;
  kinhdo?: number;
  vido?: number;
  "11"?: number; // fallback longitude
  "12"?: number; // fallback latitude
  [key: string]: any;
}

// Interface for BBOX coordinates
interface BBOX {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

// Interface for Web Mercator coordinates
interface WebMercatorCoords {
  x: number;
  y: number;
}

// Interface for result data
interface ResultData {
  com_name: string;
  geometry: any;
  ward_name?: string;
  feature_id?: string;
  coordinates?: any;
}

// Calculate BBOX from center point with buffer in kilometers
function calculateBBOXFromCenter(
  longitude: number,
  latitude: number,
  bufferKm: number = 2
): BBOX {
  const kmToDegree = 1 / 111;
  const buffer = bufferKm * kmToDegree;

  return {
    minLng: longitude - buffer,
    minLat: latitude - buffer,
    maxLng: longitude + buffer,
    maxLat: latitude + buffer,
  };
}

// Convert lat/lng to Web Mercator projection (EPSG:3857)
function latLngToWebMercator(lng: number, lat: number): WebMercatorCoords {
  const x = (lng * 20037508.34) / 180;
  let y = Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180);
  y = (y * 20037508.34) / 180;
  return { x, y };
}

// Create BBOX in Web Mercator coordinates
function createWebMercatorBBOX(bbox: BBOX): string {
  const minCoords = latLngToWebMercator(bbox.minLng, bbox.minLat);
  const maxCoords = latLngToWebMercator(bbox.maxLng, bbox.maxLat);
  return `${minCoords.x},${minCoords.y},${maxCoords.x},${maxCoords.y}`;
}

// Generate WMS URL for GetFeatureInfo request
function generateWMSUrl(
  lng: number,
  lat: number,
  bufferKm: number = 2
): string {
  const bbox = calculateBBOXFromCenter(lng, lat, bufferKm);
  const webMercatorBBOX = createWebMercatorBBOX(bbox);

  const baseUrl = "https://email.bando.com.vn/cgi-bin/qgis_mapserv.fcgi.exe";
  const params = new URLSearchParams({
    SERVICE: "WMS",
    VERSION: "1.3.0",
    REQUEST: "GetFeatureInfo",
    LAYERS:
      "tinhthanh34,diaphanhanhchinhcapxa2025,duongdiagioihanhchinhtinh_sn,biendao,tenthuyhe,tam3321xashp,tam34tinhshp",
    QUERY_LAYERS:
      "tinhthanh34,diaphanhanhchinhcapxa2025,duongdiagioihanhchinhtinh_sn,biendao,tenthuyhe,tam3321xashp,tam34tinhshp",
    INFO_FORMAT: "application/json",
    FORMAT: "image/png; mode=8bit",
    STYLES: "",
    TRANSPARENT: "true",
    TILED: "true",
    MAP: "D:/qgisserver/bando34tinh/bando34tinh17.qgz",
    WIDTH: "101",
    HEIGHT: "101",
    FEATURE_COUNT: "100",
    FI_POINT_TOLERANCE: "5",
    I: "50",
    J: "50",
    CRS: "EPSG:3857",
    BBOX: webMercatorBBOX,
    DPI: "92",
  });

  return `${baseUrl}?${params.toString()}`;
}

// Generate WFS URL for detailed feature information
function generateWFSUrl(featureId: string): string {
  const baseUrl = "https://email.bando.com.vn/cgi-bin/qgis_mapserv.fcgi.exe";
  const params = new URLSearchParams({
    SERVICE: "WFS",
    VERSION: "1.1.0",
    REQUEST: "GetFeature",
    MAP: "D:/qgisserver/bando34tinh/bando34tinh17.qgz",
    FEATUREID: featureId,
    OUTPUTFORMAT: "application/json",
  });

  return `${baseUrl}?${params.toString()}`;
}

// Fetch ward information from WMS API
async function getWardInfo(
  lng: number,
  lat: number,
  itemName: string
): Promise<any> {
  try {
    console.log(`\n🔍 Processing: ${itemName} (${lng}, ${lat})`);

    const url = generateWMSUrl(lng, lat, 2);
    const response = await fetch(url);
    const responseText = await response.text();

    if (responseText.startsWith("{") || responseText.startsWith("[")) {
      const data = JSON.parse(responseText);

      if (data.features && Array.isArray(data.features)) {
        // Find ward feature
        const wardFeature = data.features.find((f: any) =>
          f.id.includes("diaphanhanhchinhcapxa2025")
        );

        // Find district/tam feature for com_name
        const districtFeature = data.features.find((f: any) =>
          f.id.includes("tam3321xashp")
        );

        if (wardFeature) {
          // Get detailed geometry from WFS
          const geometry = await getDetailedGeometry(wardFeature.id);

          return {
            com_name:
              districtFeature?.properties?.com_name ||
              wardFeature?.properties?.["Tên (mới)"] ||
              itemName,
            ward_name: wardFeature?.properties?.["Tên (mới)"] || "N/A",
            feature_id: wardFeature.id,
            geometry: geometry,
          };
        }
      }
    }

    return {
      com_name: itemName,
      ward_name: "Not Found",
      feature_id: "N/A",
      geometry: null,
    };
  } catch (error) {
    console.error(`❌ Error processing ${itemName}:`, error);
    return {
      com_name: itemName,
      ward_name: "Error",
      feature_id: "Error",
      geometry: null,
    };
  }
}

// Fetch detailed geometry using WFS API
async function getDetailedGeometry(featureId: string): Promise<any> {
  try {
    const wfsUrl = generateWFSUrl(featureId);

    const headers = {
      Accept: "*/*",
      "Accept-Language":
        "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
      Connection: "keep-alive",
      Origin: "https://sapnhap.bando.com.vn",
      Referer: "https://sapnhap.bando.com.vn/",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-site",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
      "sec-ch-ua":
        '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
    };

    const response = await fetch(wfsUrl, { headers });
    const responseText = await response.text();

    if (responseText.startsWith("{") || responseText.startsWith("[")) {
      const wfsData = JSON.parse(responseText);

      if (
        wfsData.features &&
        Array.isArray(wfsData.features) &&
        wfsData.features.length > 0
      ) {
        const feature = wfsData.features[0];
        return feature.geometry;
      }
    }

    return null;
  } catch (error) {
    console.error(`Error fetching geometry for ${featureId}:`, error);
    return null;
  }
}

// Convert results to CSV format
function convertToCSV(results: ResultData[]): string {
  const headers = ["com_name", "ward_name", "feature_id", "geometry"];
  const csvContent = [
    headers.join(","),
    ...results.map((row) =>
      [
        `"${row.com_name || ""}"`,
        `"${row.ward_name || ""}"`,
        `"${row.feature_id || ""}"`,
        `"${row.geometry ? JSON.stringify(row.geometry).replace(/"/g, '""') : ""}"`,
      ].join(",")
    ),
  ].join("\n");

  return csvContent;
}

// Main processing function
async function processDataFile(): Promise<void> {
  try {
    console.log("🚀 Starting bulk geometry collection...\n");

    // Read data.json
    const dataFilePath = path.join(__dirname, "data.json");
    const rawData = fs.readFileSync(dataFilePath, "utf-8");
    const data: DataItem[] = JSON.parse(rawData);

    console.log(`📊 Found ${data.length} items in data.json`);

    // Take only first 10 items for testing
    const testData = data.slice(0, 10);
    console.log(`🧪 Processing first ${testData.length} items for testing...`);

    const results: ResultData[] = [];

    for (let i = 0; i < testData.length; i++) {
      const item = testData[i];
      console.log(
        `\n📦 Processing item ${i + 1}/${testData.length}: ${item.tenhc || item.id}`
      );

      // Get coordinates with fallback
      const lng = item.kinhdo || item["11"] || 106.673; // Default to HCM center
      const lat = item.vido || item["12"] || 10.853; // Default to HCM center

      console.log(`   Coordinates: (${lng}, ${lat})`);

      const result = await getWardInfo(
        lng,
        lat,
        item.tenhc || `Item ${item.id}`
      );
      results.push(result);

      // Add delay between requests
      if (i < testData.length - 1) {
        console.log("⏳ Waiting 1 second...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log(`\n✅ Completed processing ${results.length} items`);

    // Save to CSV file (Excel-compatible)
    const csvContent = convertToCSV(results);
    const outputPath = path.join(__dirname, "geometry_results.csv");
    fs.writeFileSync(outputPath, csvContent, "utf-8");

    console.log(`📁 Results saved to: ${outputPath}`);

    // Summary
    const successCount = results.filter((r) => r.geometry !== null).length;
    const errorCount = results.filter((r) => r.ward_name === "Error").length;
    const notFoundCount = results.filter(
      (r) => r.ward_name === "Not Found"
    ).length;

    console.log("\n📈 SUMMARY:");
    console.log(`   Total processed: ${results.length}`);
    console.log(`   ✅ Success (with geometry): ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   🔍 Not found: ${notFoundCount}`);
  } catch (error) {
    console.error("❌ Error in main processing:", error);
  }
}

// Run the processing
processDataFile();
