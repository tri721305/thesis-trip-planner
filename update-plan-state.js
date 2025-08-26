require("dotenv").config();
const mongoose = require("mongoose");

// Update the existing plan from "planning" to "ongoing"
async function updatePlanState() {
  try {
    console.log("Connecting to MongoDB...");
    // Connect to MongoDB with a timeout
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
    });

    console.log("Connected to MongoDB");

    // Get the plan schema - use the collection name from your database
    const planSchema = new mongoose.Schema({}, { strict: false });
    const TravelPlan = mongoose.model("TravelPlan", planSchema, "travelplans"); // try different collection name

    const planId = "68a95110117ad7b47ea943fa";

    console.log("Looking for plan with ID:", planId);

    // First, let's check the current state
    const currentPlan = await TravelPlan.findById(planId);
    if (!currentPlan) {
      console.log("Plan not found with ID:", planId);

      // Let's try to find any plans to see what's in the database
      const allPlans = await TravelPlan.find({}).limit(5);
      console.log("Found", allPlans.length, "plans in database");
      if (allPlans.length > 0) {
        console.log(
          "Sample plan IDs:",
          allPlans.map((p) => p._id.toString())
        );
      }
      return;
    }

    console.log("Current plan state:", currentPlan.state);
    console.log("Start date:", currentPlan.startDate);

    // Check if the plan should be "ongoing" based on date logic
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const planStartDate = new Date(currentPlan.startDate);
    const startOfStartDate = new Date(
      planStartDate.getFullYear(),
      planStartDate.getMonth(),
      planStartDate.getDate()
    );

    console.log("Today:", today);
    console.log("Plan start date (date only):", startOfStartDate);
    console.log("Should be ongoing?", startOfStartDate <= today);

    if (currentPlan.state === "planning" && startOfStartDate <= today) {
      const result = await TravelPlan.findByIdAndUpdate(
        planId,
        { state: "ongoing" },
        { new: true, runValidators: false }
      );
      console.log('Plan updated to "ongoing" state');
      console.log("New state:", result.state);
    } else {
      console.log("No update needed. Plan state:", currentPlan.state);
    }
  } catch (error) {
    console.error("Error updating plan state:", error.message);
  } finally {
    try {
      await mongoose.disconnect();
      console.log("Disconnected from MongoDB");
    } catch (e) {
      console.log("Disconnect error:", e.message);
    }
    process.exit(0);
  }
}

updatePlanState();
