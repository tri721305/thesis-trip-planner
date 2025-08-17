// Complete test script to identify where location data is lost
console.log("=== COMPREHENSIVE LOCATION DATA DEBUGGING ===\n");

// Step 1: Test PlaceSearch data structure
console.log("STEP 1: PlaceSearch API Response Simulation");
const mockAttraction = {
  _id: "675a1234567890abcdef1234",
  attractionId: 12345,
  name: "Temple of Literature",
  address: {
    fullAddress: "58 Quoc Tu Giam, Van Mieu, Dong Da, Hanoi, Vietnam",
    city: "Hanoi",
    country: "Vietnam",
  },
  location: {
    type: "Point",
    coordinates: [105.8354, 21.0267], // [longitude, latitude] for Hanoi
  },
  description: "First university of Vietnam, dedicated to Confucius",
  categories: ["temple", "historical", "cultural"],
  rating: 4.3,
  numRatings: 2847,
  website: "https://vanmieu.gov.vn",
  phone: "+84 24 3845 2917",
};

console.log("✅ Mock attraction has location:", !!mockAttraction.location);
console.log("✅ Coordinates:", mockAttraction.location.coordinates);

// Step 2: PlaceSearch handlePlaceSelect transformation
console.log("\nSTEP 2: PlaceSearch handlePlaceSelect Transformation");
const placeData = {
  id: mockAttraction._id,
  name: mockAttraction.name || "",
  address: mockAttraction.address?.fullAddress || "",
  description: mockAttraction.description || "",
  categories: mockAttraction.categories || [],
  rating: mockAttraction.rating || 0,
  numRatings: mockAttraction.numRatings || 0,
  location: mockAttraction.location, // KEY: This should preserve location
  website: mockAttraction.website || "",
  phone: mockAttraction.phone || "",
  attractionId: mockAttraction.attractionId,
  imageKeys: [],
  openingPeriods: [],
  priceLevel: undefined,
};

console.log("✅ PlaceData has location:", !!placeData.location);
console.log("✅ PlaceData coordinates:", placeData.location?.coordinates);

// Step 3: PlannerForm handlePlaceSelect transformation
console.log("\nSTEP 3: PlannerForm handlePlaceSelect Transformation");
const newPlaceItem = {
  type: "place",
  ...placeData,
  // Explicit location preservation (our fix)
  location: placeData.location
    ? {
        type: placeData.location.type || "Point",
        coordinates: placeData.location.coordinates,
      }
    : undefined,
  timeStart: "",
  timeEnd: "",
};

console.log("✅ NewPlaceItem has location:", !!newPlaceItem.location);
console.log("✅ NewPlaceItem coordinates:", newPlaceItem.location?.coordinates);

// Step 4: Form data structure
console.log("\nSTEP 4: Form Data Structure");
const formData = {
  title: "Hanoi Day Trip",
  details: [
    {
      type: "route",
      name: "Day 1 - Historical Sites",
      index: 1,
      data: [newPlaceItem],
    },
  ],
};

const firstPlace = formData.details[0].data[0];
console.log("✅ Form place has location:", !!firstPlace.location);
console.log("✅ Form place coordinates:", firstPlace.location?.coordinates);

// Step 5: React Hook Form + Zod validation simulation
console.log("\nSTEP 5: Validation Schema Test");
// We know from validation.ts that location is optional but supported:
/*
location: z.object({
  type: z.literal("Point"),
  coordinates: z.array(z.number()).length(2)
}).optional()
*/

console.log(
  "✅ Validation schema supports location field (verified in validation.ts)"
);

// Step 6: UpdatePlanner function simulation
console.log("\nSTEP 6: UpdatePlanner Function Data");
const updateData = {
  ...formData,
  plannerId: "planner123",
};

console.log(
  "✅ UpdateData place has location:",
  !!updateData.details[0].data[0].location
);
console.log(
  "✅ UpdateData coordinates:",
  updateData.details[0].data[0].location?.coordinates
);

// Step 7: Database save simulation
console.log("\nSTEP 7: Database Save Process");
console.log(
  "UpdatePlanner receives details array and replaces existing data entirely"
);
console.log("This should preserve location data if it exists in the input");

// Summary
console.log("\n=== SUMMARY ===");
console.log("✅ API Response: Has location data");
console.log("✅ PlaceSearch: Preserves location data");
console.log(
  "✅ PlannerForm: Explicitly preserves location data (with our fix)"
);
console.log("✅ Form Data: Contains location data");
console.log("✅ Validation: Supports location field");
console.log("✅ UpdatePlanner: Should preserve location data");

console.log("\n🔍 POTENTIAL ISSUES TO CHECK:");
console.log(
  "1. React Hook Form might be filtering location field during form.setValue()"
);
console.log("2. Zod validation might be stripping location field silently");
console.log("3. MongoDB update might be failing to save location field");
console.log(
  "4. CustomScrollLayoutPlanner might not be reading saved location data correctly"
);

console.log("\n💡 NEXT STEPS:");
console.log("1. Add console.logs to form.setValue() and form.getValues()");
console.log("2. Check browser network tab for actual API responses");
console.log(
  "3. Check MongoDB database to see if location data is actually saved"
);
console.log(
  "4. Verify Map component receives correct data from CustomScrollLayoutPlanner"
);

console.log("\n=== END DEBUGGING ===");
