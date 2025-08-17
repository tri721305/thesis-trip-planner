// Debug script for Map marker issues
// Paste this into browser console to test

console.log("🧪 Map Marker Debug Test - Starting...");

// Test 1: Check if functions exist
console.log("🔍 Test 1: Function existence check");

// Check if we're on the planner page
const currentPath = window.location.pathname;
console.log("Current path:", currentPath);

if (!currentPath.includes("/planners/")) {
  console.warn("⚠️ Navigate to a planner detail page first!");
} else {
  console.log("✅ On planner page");
}

// Test 2: Monitor console for our debug messages
console.log("🔍 Test 2: Setting up console monitoring");
console.log("Watch for these debug messages when you add/remove places:");
console.log("1. 🔍 DEBUG - handlePlaceSelect: (when adding places)");
console.log("2. 🔄 PlannerForm - Notifying parent of handlePlaceSelect change:");
console.log("3. 🔄 PlannerForm - Notifying parent of removeItem change:");
console.log("4. 🔄 CustomScrollLayoutPlanner - Received form data update:");
console.log("5. 🔄 CustomScrollLayoutPlanner - Applied IMMEDIATE form data update");
console.log("6. 🔍 useEffect triggered with dependencies:");
console.log("7. 🗺️ Extracted places for map with coordinates:");

// Test 3: Check if Map component exists
setTimeout(() => {
  const mapElements = document.querySelectorAll('[class*="Map"], [id*="map"]');
  console.log("🔍 Test 3: Map elements found:", mapElements.length);
  
  if (mapElements.length === 0) {
    console.warn("⚠️ No map elements found on page");
  } else {
    console.log("✅ Map elements found");
  }
}, 1000);

// Test 4: Simulate a form change event
console.log("🔍 Test 4: Manual test instructions");
console.log("1. Try adding a place using the search");
console.log("2. Check console for debug messages");
console.log("3. Check if marker appears on map");
console.log("4. Try removing a place using trash button");
console.log("5. Check console for debug messages");
console.log("6. Check if marker disappears from map");

// Test 5: Check React DevTools
console.log("🔍 Test 5: React DevTools check");
if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  console.log("✅ React DevTools available");
} else {
  console.log("⚠️ React DevTools not found - install for better debugging");
}

console.log("🧪 Debug setup complete! Follow the manual test instructions above.");

// Helper function to test data flow
window.testDataFlow = () => {
  console.log("🧪 Testing data flow...");
  const placeSearchInputs = document.querySelectorAll('input[placeholder*="Search for museums"]');
  console.log("PlaceSearch inputs found:", placeSearchInputs.length);
  
  const trashButtons = document.querySelectorAll('button svg[data-lucide="trash"]');
  console.log("Trash buttons found:", trashButtons.length);
  
  return {
    placeSearchInputs: placeSearchInputs.length,
    trashButtons: trashButtons.length
  };
};

console.log("🔧 Helper function 'testDataFlow()' is now available");
