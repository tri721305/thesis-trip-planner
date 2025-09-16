const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://22521407:ThanNhan123@thesis.sps6xgb.mongodb.net/thesis"
);

async function testCostUpdateIssue() {
  try {
    // Import the TravelPlan model
    const { TravelPlan } = require("./database/plan.model.ts");

    console.log("🧪 Testing cost update issue...");

    // Find an existing planner or create test data
    const testPlan = {
      title: "Cost Update Test Plan",
      author: new mongoose.Types.ObjectId(),
      destination: {
        name: "Ho Chi Minh City",
        coordinates: [106.6297, 10.8231],
        type: "province",
        provinceId: "79",
      },
      startDate: new Date("2024-12-20"),
      endDate: new Date("2024-12-22"),
      details: [
        {
          type: "route",
          name: "Day 1 - Test Route",
          index: 1,
          data: [
            {
              type: "place",
              name: "Test Restaurant",
              address: "123 Test Street, District 1",
              description: "A test restaurant for cost verification",
              cost: {
                type: "VND",
                value: 500000,
                paidBy: "John Doe",
                description: "Lunch for team",
                splitBetween: [
                  {
                    userId: "test-user-id",
                    name: "John Doe",
                    amount: 250000,
                    settled: false,
                    selected: true,
                  },
                ],
              },
              timeStart: "12:00",
              timeEnd: "13:30",
            },
          ],
        },
      ],
    };

    console.log("📝 Creating initial travel plan...");
    const createdPlan = await TravelPlan.create(testPlan);
    console.log("✅ Plan created with ID:", createdPlan._id);

    // Now try to update with new cost data
    console.log("🔄 Testing update with modified cost data...");
    const updateData = {
      details: [
        {
          type: "route",
          name: "Day 1 - Test Route",
          index: 1,
          data: [
            {
              type: "place",
              name: "Test Restaurant",
              address: "123 Test Street, District 1",
              description: "A test restaurant for cost verification",
              cost: {
                type: "VND",
                value: 750000, // Changed from 500000 to 750000
                paidBy: "Jane Smith", // Changed payer
                description: "Dinner for team", // Changed description
                splitBetween: [
                  {
                    userId: "test-user-id",
                    name: "John Doe",
                    amount: 375000, // Updated amount
                    settled: false,
                    selected: true,
                  },
                  {
                    userId: "test-user-id-2",
                    name: "Jane Smith",
                    amount: 375000, // Added new person
                    settled: false,
                    selected: true,
                  },
                ],
              },
              timeStart: "18:00", // Changed time
              timeEnd: "19:30",
            },
          ],
        },
      ],
    };

    // Test the update
    const updateResult = await TravelPlan.updateOne(
      { _id: createdPlan._id },
      { $set: updateData }
    );

    console.log("📊 Update result:", updateResult);

    // Fetch updated document
    const updatedPlan = await TravelPlan.findById(createdPlan._id);
    const placeItem = updatedPlan.details[0].data[0];

    console.log("🔍 Verification:");
    console.log("- Original cost value: 500000");
    console.log("- Updated cost value:", placeItem.cost?.value);
    console.log("- Original paidBy: John Doe");
    console.log("- Updated paidBy:", placeItem.cost?.paidBy);
    console.log("- Original split count: 1");
    console.log("- Updated split count:", placeItem.cost?.splitBetween?.length);

    if (placeItem.cost?.value === 750000) {
      console.log("🎉 SUCCESS: Cost update worked!");
    } else {
      console.log("❌ FAILURE: Cost update failed");
      console.log(
        "💰 Full cost object:",
        JSON.stringify(placeItem.cost, null, 2)
      );
    }

    // Clean up
    await TravelPlan.findByIdAndDelete(createdPlan._id);
    console.log("🧹 Test plan cleaned up");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.errors) {
      console.error("📋 Validation errors:");
      Object.keys(error.errors).forEach((key) => {
        console.error(`  - ${key}: ${error.errors[key].message}`);
      });
    }
  } finally {
    mongoose.connection.close();
  }
}

testCostUpdateIssue();
