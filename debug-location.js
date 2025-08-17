// Debug script to test location data flow
const { connectToDB } = require("./lib/mongoose");
const Attraction = require("./database/attraction.model").default;

async function testLocationData() {
  try {
    await connectToDB();
    console.log("Connected to database");

    // Find a few attractions to test location data
    const attractions = await Attraction.find({}).limit(3).lean();

    console.log("Sample attractions from database:");
    attractions.forEach((attraction, index) => {
      console.log(`${index + 1}. ${attraction.name}`);
      console.log(`   Has location: ${!!attraction.location}`);
      console.log(`   Location: ${JSON.stringify(attraction.location)}`);
      console.log(`   Coordinates: ${attraction.location?.coordinates}`);
      console.log("---");
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

testLocationData();
