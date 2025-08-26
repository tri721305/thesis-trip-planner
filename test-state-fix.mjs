// Test script to validate the createPlanner fix and update existing plan
const { default: TravelPlan } = await import("./database/plan.model.ts");
const { connect } = await import("./lib/mongoose.ts");

async function testCreatePlannerAndUpdateExisting() {
  try {
    await connect();
    console.log("✅ Connected to MongoDB");

    // Test 1: Update the existing plan that should be "ongoing"
    console.log("\n🔍 Testing existing plan update...");
    const existingPlanId = "68a95110117ad7b47ea943fa";

    // Check current state
    const existingPlan = await TravelPlan.findById(existingPlanId);
    if (!existingPlan) {
      console.log("❌ Plan not found with ID:", existingPlanId);

      // Let's find some plans to see what's available
      const samplePlans = await TravelPlan.find({}).limit(3);
      console.log(
        "Found plans:",
        samplePlans.map((p) => ({
          id: p._id.toString(),
          title: p.title,
          state: p.state,
          startDate: p.startDate,
        }))
      );
    } else {
      console.log("📋 Current plan details:");
      console.log("- ID:", existingPlan._id.toString());
      console.log("- Title:", existingPlan.title);
      console.log("- State:", existingPlan.state);
      console.log("- Start Date:", existingPlan.startDate);

      // Check if it should be ongoing
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const planStartDate = new Date(existingPlan.startDate);
      const startOfStartDate = new Date(
        planStartDate.getFullYear(),
        planStartDate.getMonth(),
        planStartDate.getDate()
      );

      console.log("- Today:", today.toISOString().split("T")[0]);
      console.log(
        "- Plan Start (date only):",
        startOfStartDate.toISOString().split("T")[0]
      );
      console.log("- Should be ongoing?", startOfStartDate <= today);

      if (existingPlan.state === "planning" && startOfStartDate <= today) {
        console.log("🔄 Updating plan to 'ongoing' state...");
        const updatedPlan = await TravelPlan.findByIdAndUpdate(
          existingPlanId,
          { state: "ongoing" },
          { new: true, runValidators: false }
        );
        console.log("✅ Plan updated! New state:", updatedPlan.state);
      } else {
        console.log("ℹ️ No update needed. Current state:", existingPlan.state);
      }
    }

    // Test 2: Test createPlanner logic with future and past dates
    console.log("\n🧪 Testing createPlanner state logic...");

    // Test future date (should be "planning")
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    console.log("- Future date test:", futureDate.toISOString().split("T")[0]);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const futureStartDate = new Date(
      futureDate.getFullYear(),
      futureDate.getMonth(),
      futureDate.getDate()
    );
    const futureState = futureStartDate <= today ? "ongoing" : "planning";
    console.log("  Expected state for future date:", futureState);

    // Test past date (should be "ongoing")
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 2);
    console.log("- Past date test:", pastDate.toISOString().split("T")[0]);

    const pastStartDate = new Date(
      pastDate.getFullYear(),
      pastDate.getMonth(),
      pastDate.getDate()
    );
    const pastState = pastStartDate <= today ? "ongoing" : "planning";
    console.log("  Expected state for past date:", pastState);

    // Test today's date (should be "ongoing")
    const todayStartDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const todayState = todayStartDate <= today ? "ongoing" : "planning";
    console.log("- Today's date test:", today.toISOString().split("T")[0]);
    console.log("  Expected state for today:", todayState);

    console.log("\n✅ All tests completed!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    process.exit(0);
  }
}

testCreatePlannerAndUpdateExisting();
