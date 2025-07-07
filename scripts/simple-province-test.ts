import { getProvinces } from "@/lib/actions/province.action";

async function simpleTest() {
  try {
    console.log("Testing getProvinces...");
    const result = await getProvinces();

    if (result.success) {
      console.log(`Success! Found ${result.data?.length} provinces`);
      if (result.data?.[0]) {
        console.log("First province:", result.data[0].tentinh);
      }
    } else {
      console.log("Failed:", result.error?.message);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

simpleTest();
