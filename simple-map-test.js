// Simplified test for Map marker issue
// Copy-paste this into browser console on planner page

console.log("🧪 Simple Map Marker Test");

// Test 1: Check if key functions exist
const testFunctions = () => {
  console.log("🔍 Testing function availability...");
  
  // Look for React components in DOM
  const reactRoot = document.querySelector('#__next, [data-reactroot]');
  console.log("React root found:", !!reactRoot);
  
  // Check for PlaceSearch inputs
  const placeSearches = document.querySelectorAll('input[placeholder*="Search for museums"]');
  console.log("PlaceSearch components found:", placeSearches.length);
  
  // Check for remove buttons
  const removeButtons = document.querySelectorAll('button[class*="hover-btn"]');
  console.log("Remove buttons found:", removeButtons.length);
  
  return {
    reactRoot: !!reactRoot,
    placeSearches: placeSearches.length,
    removeButtons: removeButtons.length
  };
};

// Test 2: Monitor form changes
const monitorFormChanges = () => {
  console.log("🔍 Setting up form change monitoring...");
  
  // Store original console.log to avoid interference
  const originalLog = console.log;
  
  // Flag to track if our debug messages appear
  let debugMessagesFound = {
    handlePlaceSelect: false,
    removeItem: false,
    formDataChange: false,
    useEffectTriggered: false
  };
  
  // Override console.log temporarily to catch our debug messages
  console.log = (...args) => {
    const message = args.join(' ');
    
    if (message.includes('🔍 DEBUG - handlePlaceSelect:')) {
      debugMessagesFound.handlePlaceSelect = true;
      originalLog('✅ handlePlaceSelect debug message detected!');
    }
    if (message.includes('🗑️ removeItem called:')) {
      debugMessagesFound.removeItem = true;
      originalLog('✅ removeItem debug message detected!');
    }
    if (message.includes('🔄 PlannerForm - Notifying parent')) {
      debugMessagesFound.formDataChange = true;
      originalLog('✅ Form data change notification detected!');
    }
    if (message.includes('🔍 useEffect triggered with dependencies:')) {
      debugMessagesFound.useEffectTriggered = true;
      originalLog('✅ useEffect triggered detected!');
    }
    
    // Call original console.log
    originalLog(...args);
  };
  
  // Restore original console.log after 30 seconds
  setTimeout(() => {
    console.log = originalLog;
    originalLog('🔍 Debug monitoring results:', debugMessagesFound);
    
    // Analysis
    if (!debugMessagesFound.handlePlaceSelect && !debugMessagesFound.removeItem) {
      originalLog('❌ Neither add nor remove functions are being called');
      originalLog('💡 Check if PlaceSearch and remove buttons are wired correctly');
    } else if (!debugMessagesFound.formDataChange) {
      originalLog('❌ Form data change notifications not working');
      originalLog('💡 Check onFormDataChange callback passing');
    } else if (!debugMessagesFound.useEffectTriggered) {
      originalLog('❌ useEffect not triggered');
      originalLog('💡 Check useEffect dependencies or data flow');
    } else {
      originalLog('✅ Data flow appears to be working');
      originalLog('💡 Check Map component rendering logic');
    }
  }, 30000);
  
  originalLog('🔍 Monitoring started for 30 seconds. Try adding/removing places now...');
};

// Test 3: Manual trigger test
const manualTriggerTest = () => {
  console.log("🔍 Manual trigger test...");
  
  // Try to find and click a PlaceSearch input
  const placeInput = document.querySelector('input[placeholder*="Search for museums"]');
  if (placeInput) {
    console.log("✅ Found PlaceSearch input, focusing...");
    placeInput.focus();
    placeInput.value = "test place";
    
    // Trigger input event
    const inputEvent = new Event('input', { bubbles: true });
    placeInput.dispatchEvent(inputEvent);
    
    console.log("💡 Type in the search box and select a place to test");
  } else {
    console.log("❌ PlaceSearch input not found");
    console.log("💡 Make sure you're on a planner detail page with itinerary sections");
  }
  
  // Try to find remove buttons
  const removeButtons = document.querySelectorAll('button svg[class*="lucide-trash"]');
  if (removeButtons.length > 0) {
    console.log(`✅ Found ${removeButtons.length} remove buttons`);
    console.log("💡 Click a trash button to test removal");
  } else {
    console.log("❌ Remove buttons not found");
    console.log("💡 Add some places first, then try removal");
  }
};

// Run tests
const runTests = () => {
  console.log("🚀 Starting Map Marker Debug Tests...");
  console.log("=" * 50);
  
  const functionTest = testFunctions();
  console.log("Function test results:", functionTest);
  
  if (functionTest.placeSearches === 0) {
    console.log("❌ No PlaceSearch components found!");
    console.log("💡 Navigate to a planner detail page with day sections");
    return;
  }
  
  monitorFormChanges();
  
  setTimeout(() => {
    manualTriggerTest();
  }, 1000);
};

// Export for manual use
window.runMapTests = runTests;
window.testFunctions = testFunctions;
window.monitorFormChanges = monitorFormChanges;

// Auto-run
runTests();
