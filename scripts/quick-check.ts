import dbConnect from "@/lib/mongoose";
import Ward from "@/database/ward.model";

async function quickCheck() {
  try {
    await dbConnect();
    const count = await Ward.countDocuments();
    console.log(`Total wards: ${count}`);

    const withGeometry = await Ward.countDocuments({
      geometry: { $exists: true },
    });
    console.log(`With geometry: ${withGeometry}`);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

quickCheck();
