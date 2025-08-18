// Comprehensive debugging script for browser console
// Copy and paste this entire script into the browser console when on a planner page

console.clear();
console.log("🔧 COMPREHENSIVE MAP MARKER DEBUG SCRIPT LOADED");
console.log("=================================================");

// Global debug state
window.mapDebug = {
  formCallbacks: 0,
  mapUpdates: 0,
  placeAdditions: 0,
  placeRemovals: 0,
  useEffectTriggers: 0,
  lastFormData: null,
  lastMapData: null,
  timeline: [],
};

// Function to add event to timeline
const addEvent = (event, data) => {
  window.mapDebug.timeline.push({
    timestamp: new Date().toLocaleTimeString(),
    event,
    data,
  });

  // Keep only last 20 events
  if (window.mapDebug.timeline.length > 20) {
    window.mapDebug.timeline = window.mapDebug.timeline.slice(-20);
  }
};

// Intercept console.log to track our debug messages
const originalLog = console.log;
console.log = function (...args) {
  const message = args[0];

  if (typeof message === "string") {
    // Track form data callbacks
    if (
      message.includes(
        "🔄 CustomScrollLayoutPlanner - Received form data update"
      )
    ) {
      window.mapDebug.formCallbacks++;
      window.mapDebug.lastFormData = args[1];
      addEvent("Form Data Callback", args[1]);
      console.warn(`📊 FORM CALLBACKS: ${window.mapDebug.formCallbacks}`);
    }

    // Track map updates
    if (message.includes("🗺️ Map component - Places data")) {
      window.mapDebug.mapUpdates++;
      addEvent("Map Update", args[1]);
      console.warn(`📊 MAP UPDATES: ${window.mapDebug.mapUpdates}`);
    }

    // Track useEffect triggers
    if (message.includes("🔍 useEffect triggered with dependencies")) {
      window.mapDebug.useEffectTriggers++;
      addEvent("useEffect Trigger", args[1]);
      console.warn(
        `📊 USEEFFECT TRIGGERS: ${window.mapDebug.useEffectTriggers}`
      );
    }

    // Track place additions
    if (
      message.includes(
        "🔄 PlannerForm - Notifying parent of handlePlaceSelect change"
      )
    ) {
      window.mapDebug.placeAdditions++;
      addEvent("Place Addition", args[1]);
      console.warn(`📊 PLACE ADDITIONS: ${window.mapDebug.placeAdditions}`);
    }

    // Track place removals
    if (
      message.includes("🔄 PlannerForm - Notifying parent of removeItem change")
    ) {
      window.mapDebug.placeRemovals++;
      addEvent("Place Removal", args[1]);
      console.warn(`📊 PLACE REMOVALS: ${window.mapDebug.placeRemovals}`);
    }

    // Track data source comparison
    if (message.includes("📊 DATA SOURCE COMPARISON")) {
      addEvent("Data Source Comparison", args[1]);
    }

    // Track map places updates
    if (message.includes("🎯 MAP PLACES UPDATED")) {
      addEvent("Map Places Updated", args[1]);
    }
  }

  // Call original console.log
  originalLog.apply(console, arguments);
};

// Function to check current state
window.checkMapDebug = function () {
  console.log("\n🔍 COMPREHENSIVE DEBUG STATE:");
  console.log("==============================");

  const stats = window.mapDebug;
  console.log("📊 STATISTICS:");
  console.log(`- Form callbacks: ${stats.formCallbacks}`);
  console.log(`- Map updates: ${stats.mapUpdates}`);
  console.log(`- useEffect triggers: ${stats.useEffectTriggers}`);
  console.log(`- Place additions: ${stats.placeAdditions}`);
  console.log(`- Place removals: ${stats.placeRemovals}`);

  console.log("\n📋 LAST FORM DATA:");
  console.log(stats.lastFormData);

  console.log("\n🗺️ LAST MAP DATA:");
  console.log(stats.lastMapData);

  console.log("\n⏰ RECENT TIMELINE:");
  stats.timeline.slice(-10).forEach((event, index) => {
    console.log(`${event.timestamp} - ${event.event}:`, event.data);
  });

  // Check actual map markers
  const mapContainer = document.querySelector(".maplibregl-map");
  if (mapContainer) {
    const markers = mapContainer.querySelectorAll(
      '[class*="marker"], div[style*="position: absolute"]'
    );
    console.log(`\n🎯 VISIBLE MARKERS ON MAP: ${markers.length}`);
  } else {
    console.log("\n❌ No map container found!");
  }

  return stats;
};

// Function to analyze data flow
window.analyzeDataFlow = function () {
  console.log("\n🔍 DATA FLOW ANALYSIS:");
  console.log("======================");

  const stats = window.mapDebug;

  if (stats.placeAdditions > 0 && stats.formCallbacks === 0) {
    console.error("❌ ISSUE: Places added but no form callbacks received!");
    console.log("This suggests the onFormDataChange callback is not working.");
  }

  if (stats.formCallbacks > 0 && stats.useEffectTriggers === 0) {
    console.error(
      "❌ ISSUE: Form callbacks received but useEffect not triggered!"
    );
    console.log(
      "This suggests the useEffect dependencies are not working correctly."
    );
  }

  if (stats.useEffectTriggers > 0 && stats.mapUpdates === 0) {
    console.error("❌ ISSUE: useEffect triggered but Map not updated!");
    console.log(
      "This suggests the Map component is not receiving updated props."
    );
  }

  if (stats.mapUpdates > 0) {
    console.log(
      "✅ Map is receiving updates - check if markers are being rendered correctly."
    );
  }

  // Expected flow: Place Addition -> Form Callback -> useEffect Trigger -> Map Update
  const expectedSequence = [
    "Place Addition",
    "Form Data Callback",
    "useEffect Trigger",
    "Map Update",
  ];
  const recentEvents = stats.timeline.slice(-10);

  console.log("\n🔄 EXPECTED FLOW ANALYSIS:");
  expectedSequence.forEach((step) => {
    const found = recentEvents.find((event) =>
      event.event.includes(step.split(" ")[0])
    );
    console.log(
      `${found ? "✅" : "❌"} ${step}: ${found ? "Found" : "Missing"}`
    );
  });
};

// Auto-check every 3 seconds for activity
setInterval(() => {
  const stats = window.mapDebug;
  const totalActivity =
    stats.formCallbacks +
    stats.mapUpdates +
    stats.placeAdditions +
    stats.placeRemovals;

  if (totalActivity > 0) {
    console.log(
      `⏰ Auto-check [${new Date().toLocaleTimeString()}]: Total activity: ${totalActivity}`
    );
  }
}, 3000);

console.log("\n🎮 AVAILABLE COMMANDS:");
console.log("======================");
console.log("window.checkMapDebug() - Check current debug state");
console.log("window.analyzeDataFlow() - Analyze the data flow for issues");
console.log("window.mapDebug.timeline - View event timeline");
console.log("\n📊 Start adding/removing places and watch the debug output!");
console.log(
  "🔍 The script will automatically track all events and help identify issues."
);
