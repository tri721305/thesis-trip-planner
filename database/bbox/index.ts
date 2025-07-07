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

// Interface for WMS Feature response
interface WMSFeature {
  type: string;
  id: string;
  geometry: any;
  properties: {
    [key: string]: any;
  };
}

// Interface for WMS FeatureCollection response
interface WMSFeatureCollection {
  type: string;
  features: WMSFeature[];
}

// Calculate BBOX from center point with buffer in kilometers
function calculateBBOXFromCenter(
  longitude: number,
  latitude: number,
  bufferKm: number = 2
): BBOX {
  // Convert km to degrees (approximate)
  const kmToDegree = 1 / 111; // 1 degree ≈ 111 km
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

// Fetch detailed ward information using WFS API
async function getDetailedWardInfo(
  featureId: string,
  locationName: string
): Promise<void> {
  try {
    console.log(
      `\n🔍 Getting detailed info for ${locationName} (Feature ID: ${featureId})`
    );

    const wfsUrl = generateWFSUrl(featureId);
    console.log("WFS URL:", wfsUrl);

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

    console.log("WFS Response status:", response.status);

    if (responseText.startsWith("{") || responseText.startsWith("[")) {
      try {
        const wfsData = JSON.parse(responseText);
        console.log("\n📋 WFS DETAILED RESPONSE:");

        if (
          wfsData.features &&
          Array.isArray(wfsData.features) &&
          wfsData.features.length > 0
        ) {
          const feature = wfsData.features[0];
          console.log("Feature ID:", feature.id);
          console.log("Feature Type:", feature.type);
          console.log("Geometry Type:", feature.geometry?.type);

          if (feature.properties) {
            console.log("\n📊 Detailed Properties:");
            Object.entries(feature.properties).forEach(([key, value]) => {
              console.log(`  ${key}: ${value}`);
            });
          }

          if (feature.geometry && feature.geometry.coordinates) {
            console.log("\n🗺️  Geometry Info:");
            console.log("  Type:", feature.geometry.type);
            console.log(
              "  Coordinates length:",
              feature.geometry.coordinates.length
            );
            console.log("  First coordinate:", feature.geometry.coordinates[0]);
          }
        } else {
          console.log("No features found in WFS response");
        }
      } catch (parseError) {
        console.error("WFS JSON parse error:", parseError);
        console.log("WFS Response preview:", responseText.substring(0, 500));
      }
    } else {
      console.log("WFS Response is not JSON");
      console.log("WFS Response preview:", responseText.substring(0, 500));
    }
  } catch (error) {
    console.error(
      `Error fetching detailed ward info for ${locationName}:`,
      error
    );
  }
}

// Fetch ward information from WMS API
async function getWardInfo(
  lng: number,
  lat: number,
  locationName: string
): Promise<void> {
  try {
    console.log(`\n=== ${locationName} ===`);
    console.log(`Coordinates: (${lng}, ${lat})`);

    const bbox = calculateBBOXFromCenter(lng, lat, 2);
    console.log("BBOX:", bbox);

    const url = generateWMSUrl(lng, lat, 2);
    console.log("WMS URL:", url);

    const response = await fetch(url);
    const responseText = await response.text();

    console.log("Response status:", response.status);

    // Check if response is JSON
    if (responseText.startsWith("{") || responseText.startsWith("[")) {
      try {
        const data = JSON.parse(responseText);

        if (data.features && Array.isArray(data.features)) {
          console.log(`✅ Found ${data.features.length} features`);

          // Analyze all features
          data.features.forEach((feature: any, index: number) => {
            console.log(`\n📍 Feature ${index + 1}:`);
            console.log(`  ID: ${feature.id}`);
            console.log(`  Properties:`, feature.properties);

            // Check for ward information
            if (feature.id.includes("diaphanhanhchinhcapxa2025")) {
              console.log(`  🏘️  Ward Information Found!`);
              if (feature.properties["Tên (mới)"]) {
                console.log(
                  `     Ward Name: ${feature.properties["Tên (mới)"]}`
                );
              }
            }

            // Check for district information
            if (feature.id.includes("tam3321xashp")) {
              console.log(`  🌆 District/Province Information Found!`);
              if (feature.properties["ten_huyen"]) {
                console.log(
                  `     District: ${feature.properties["ten_huyen"]}`
                );
              }
              if (feature.properties["ten_tinh"]) {
                console.log(`     Province: ${feature.properties["ten_tinh"]}`);
              }
            }

            // Check for general administrative information
            if (feature.properties["Tên hành chính"]) {
              console.log(
                `  📌 Administrative Name: ${feature.properties["Tên hành chính"]}`
              );
            }
          });

          // Summary for this location
          const wardFeature = data.features.find((f: any) =>
            f.id.includes("diaphanhanhchinhcapxa2025")
          );
          const districtFeature = data.features.find((f: any) =>
            f.id.includes("tam3321xashp")
          );
          const adminFeature = data.features.find(
            (f: any) => f.properties["Tên hành chính"]
          );

          console.log(`\n🎯 SUMMARY for ${locationName}:`);
          if (wardFeature && wardFeature.properties["Tên (mới)"]) {
            console.log(`   Ward: ${wardFeature.properties["Tên (mới)"]}`);
          } else if (
            adminFeature &&
            adminFeature.properties["Tên hành chính"]
          ) {
            console.log(
              `   Administrative Area: ${adminFeature.properties["Tên hành chính"]}`
            );
          }

          if (districtFeature) {
            if (districtFeature.properties["ten_huyen"]) {
              console.log(
                `   District: ${districtFeature.properties["ten_huyen"]}`
              );
            }
            if (districtFeature.properties["ten_tinh"]) {
              console.log(
                `   Province: ${districtFeature.properties["ten_tinh"]}`
              );
            }
          }

          // Call WFS API if we have ward feature
          if (wardFeature) {
            await getDetailedWardInfo(wardFeature.id, locationName);
          }
        } else {
          console.log("No features found in response");
        }
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
      }
    } else {
      console.log("Response is not JSON (probably XML error)");
      if (responseText.includes("ServiceException")) {
        console.log("WMS Service Exception detected");
      }
    }
  } catch (error) {
    console.error(`Error fetching ward info for ${locationName}:`, error);
  }
}

// Test multiple coordinates
async function testCoordinates(): Promise<void> {
  console.log("🚀 Testing BBOX and WMS API for Ho Chi Minh City wards...\n");

  const testLocations = [
    { lng: 106.732, lat: 10.7882, name: "An Khánh" },
    {
      lng: 106.69479,
      lat: 10.769999,
      name: "Unknown Location",
    },
  ];

  for (const location of testLocations) {
    await getWardInfo(location.lng, location.lat, location.name);
  }
}

// Run the test
testCoordinates();
