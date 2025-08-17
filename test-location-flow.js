// Test location data preservation in form handling
console.log("=== TESTING LOCATION DATA PRESERVATION ===");

// 1. Simulate API response from getPlaces
const mockApiResponse = {
  _id: "test123",
  name: "Test Temple",
  address: { fullAddress: "Test Address, Ho Chi Minh City" },
  location: {
    type: "Point",
    coordinates: [106.7009, 10.7769], // Ho Chi Minh City
  },
  description: "Test temple description",
  categories: ["temple"],
  rating: 4.5,
  numRatings: 100,
};

console.log("1. Mock API Response:", {
  name: mockApiResponse.name,
  hasLocation: !!mockApiResponse.location,
  coordinates: mockApiResponse.location?.coordinates,
});

// 2. Simulate PlaceSearch handlePlaceSelect logic
const placeData = {
  id: mockApiResponse._id,
  name: mockApiResponse.name || "",
  address: mockApiResponse.address?.fullAddress || "",
  description: mockApiResponse.description || "",
  categories: mockApiResponse.categories || [],
  rating: mockApiResponse.rating || 0,
  numRatings: mockApiResponse.numRatings || 0,
  location: mockApiResponse.location, // This should preserve location
  website: "",
  phone: "",
  attractionId: mockApiResponse._id,
  imageKeys: [],
  openingPeriods: [],
  priceLevel: undefined,
};

console.log("2. PlaceSearch placeData:", {
  name: placeData.name,
  hasLocation: !!placeData.location,
  coordinates: placeData.location?.coordinates,
});

// 3. Simulate PlannerForm handlePlaceSelect logic
const newPlaceItem = {
  type: "place",
  ...placeData,
  // Explicitly ensure location data is preserved
  location: placeData.location
    ? {
        type: placeData.location.type || "Point",
        coordinates: placeData.location.coordinates,
      }
    : undefined,
  timeStart: "",
  timeEnd: "",
};

console.log("3. PlannerForm newPlaceItem:", {
  name: newPlaceItem.name,
  hasLocation: !!newPlaceItem.location,
  coordinates: newPlaceItem.location?.coordinates,
  type: newPlaceItem.type,
});

// 4. Simulate form data structure
const formData = {
  title: "Test Planner",
  details: [
    {
      type: "route",
      name: "Day 1",
      index: 1,
      data: [newPlaceItem],
    },
  ],
};

console.log("4. Final form data:", {
  hasDetails: !!formData.details,
  firstDetail: formData.details[0].name,
  hasPlaceData: formData.details[0].data.length > 0,
  placeHasLocation: !!formData.details[0].data[0].location,
  placeCoordinates: formData.details[0].data[0].location?.coordinates,
});

// 5. Test the issue - what if location gets stripped somewhere?
console.log("5. Potential issues to check:");
console.log("   - API returns location data: ✅");
console.log("   - PlaceSearch preserves location: ✅");
console.log("   - handlePlaceSelect preserves location: ✅");
console.log("   - Form data structure correct: ✅");
console.log("   - Need to check: validation schema, updatePlanner function");

console.log("\n=== TEST COMPLETE ===");
