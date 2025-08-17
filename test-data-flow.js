// Test the data flow from PlaceSearch to form submission
// This function will simulate the exact flow

function simulateDataFlow() {
  // 1. Simulate PlaceSearch response (what should come from API)
  const mockApiResponse = {
    _id: "test123",
    name: "Test Temple",
    address: { fullAddress: "Test Address" },
    location: {
      type: "Point",
      coordinates: [106.7009, 10.7769], // Ho Chi Minh City
    },
    description: "Test description",
    categories: ["temple"],
    rating: 4.5,
  };

  console.log("1. Mock API Response:", mockApiResponse);

  // 2. Simulate PlaceSearch handlePlaceSelect (components/search/PlaceSearch.tsx)
  const placeData = {
    id: mockApiResponse._id,
    name: mockApiResponse.name || "",
    address: mockApiResponse.address?.fullAddress || "",
    description: mockApiResponse.description || "",
    categories: mockApiResponse.categories || [],
    rating: mockApiResponse.rating || 0,
    location: mockApiResponse.location, // This should preserve location
    // ... other fields
  };

  console.log("2. PlaceSearch placeData:", placeData);
  console.log("   Has location:", !!placeData.location);

  // 3. Simulate PlannerForm handlePlaceSelect
  const newPlaceItem = {
    type: "place",
    ...placeData,
    timeStart: "",
    timeEnd: "",
  };

  console.log("3. PlannerForm newPlaceItem:", newPlaceItem);
  console.log("   Has location:", !!newPlaceItem.location);

  // 4. Simulate form data structure
  const formData = {
    details: [
      {
        type: "route",
        name: "Day 1",
        data: [newPlaceItem],
      },
    ],
  };

  console.log("4. Form data structure:", formData);
  console.log("   Place has location:", !!formData.details[0].data[0].location);

  return formData;
}

// Run the simulation
console.log("=== TESTING DATA FLOW ===");
simulateDataFlow();
