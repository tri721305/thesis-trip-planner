// Test script for getUserByEmail function
const { getUserByEmail } = require("./lib/actions/user.action.ts");

async function testUserSearch() {
  console.log("🧪 Testing getUserByEmail function...");

  try {
    const result = await getUserByEmail({
      email: "admin@gmail.com",
    });

    console.log("📧 Test Result:", JSON.stringify(result, null, 2));

    if (result.success) {
      console.log("✅ User found successfully!");
      console.log("👤 User data:", result.data);
    } else {
      console.log("❌ User not found or error occurred");
      console.log("🚨 Error:", result.error);
    }
  } catch (error) {
    console.error("💥 Test failed with error:", error);
  }
}

testUserSearch();
