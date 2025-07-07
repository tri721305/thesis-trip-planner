import {
  getProvinces,
  getProvinceByCode,
  searchProvinces,
  getProvincesStats,
} from "@/lib/actions/province.action";

async function testProvinceActions() {
  console.log("🧪 Testing Province Actions...\n");

  try {
    // Test 1: Lấy tất cả provinces
    console.log("1. Testing getProvinces()...");
    const allProvincesResult = await getProvinces();

    if (allProvincesResult.success) {
      console.log(
        `✅ Success: Found ${allProvincesResult.data?.length} provinces`
      );

      // Hiển thị 3 provinces đầu tiên
      if (allProvincesResult.data && allProvincesResult.data.length > 0) {
        console.log("📋 First 3 provinces:");
        allProvincesResult.data.slice(0, 3).forEach((province, index) => {
          console.log(
            `   ${index + 1}. ${province.tentinh} (${province.matinh})`
          );
        });
      }
    } else {
      console.log("❌ Failed:", allProvincesResult.error?.message);
    }

    console.log("\n" + "-".repeat(50) + "\n");

    // Test 2: Lấy province theo mã
    console.log('2. Testing getProvinceByCode() with code "01"...');
    const provinceByCodeResult = await getProvinceByCode("01");

    if (provinceByCodeResult.success) {
      console.log(
        `✅ Success: ${provinceByCodeResult.data?.tentinh} - ${provinceByCodeResult.data?.tenhc}`
      );
      console.log(
        `   Diện tích: ${provinceByCodeResult.data?.dientichkm2} km²`
      );
      console.log(
        `   Dân số: ${provinceByCodeResult.data?.dansonguoi?.toLocaleString()} người`
      );
    } else {
      console.log("❌ Failed:", provinceByCodeResult.error?.message);
    }

    console.log("\n" + "-".repeat(50) + "\n");

    // Test 3: Tìm kiếm provinces
    console.log('3. Testing searchProvinces() with query "Hà"...');
    const searchResult = await searchProvinces("Hà");

    if (searchResult.success) {
      console.log(
        `✅ Success: Found ${searchResult.data?.length} provinces containing "Hà"`
      );
      searchResult.data?.forEach((province, index) => {
        console.log(`   ${index + 1}. ${province.tentinh}`);
      });
    } else {
      console.log("❌ Failed:", searchResult.error?.message);
    }

    console.log("\n" + "-".repeat(50) + "\n");

    // Test 4: Lấy thống kê
    console.log("4. Testing getProvincesStats()...");
    const statsResult = await getProvincesStats();

    if (statsResult.success) {
      console.log("✅ Success: Province Statistics");
      console.log(`   📊 Total provinces: ${statsResult.data?.totalProvinces}`);
      console.log(
        `   🗺️  Provinces with geometry: ${statsResult.data?.provincesWithGeometry}`
      );
      console.log(
        `   📏 Total area: ${statsResult.data?.totalArea?.toLocaleString()} km²`
      );
      console.log(
        `   👥 Total population: ${statsResult.data?.totalPopulation?.toLocaleString()} people`
      );
    } else {
      console.log("❌ Failed:", statsResult.error?.message);
    }

    console.log("\n🎉 Province Actions testing completed!");
  } catch (error) {
    console.error("💥 Test failed with error:", error);
  }
}

if (require.main === module) {
  testProvinceActions()
    .then(() => {
      console.log("\n✨ Test completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Test failed:", error);
      process.exit(1);
    });
}

export { testProvinceActions };
