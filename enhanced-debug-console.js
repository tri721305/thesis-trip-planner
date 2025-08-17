// Enhanced Map Marker Debug Script for Browser Console
// Paste this into your browser console when on a planner page

console.clear();
console.log("🔧 MAP MARKER DEBUG SCRIPT LOADED");
console.log("=====================================");

// Global variables to track state
window.debugMapMarkers = {
  formCallbacks: 0,
  mapUpdates: 0,
  placeAdditions: 0,
  placeRemovals: 0,
  lastFormData: null,
  lastMapData: null
};

// Override console.log to track our debug messages
const originalLog = console.log;
console.log = function(...args) {
  const message = args[0];
  
  if (typeof message === 'string') {
    // Track form data callbacks
    if (message.includes('🔄 CustomScrollLayoutPlanner - Received form data update')) {
      window.debugMapMarkers.formCallbacks++;
      window.debugMapMarkers.lastFormData = args[1];
      console.warn('📊 STATS: Form callbacks: ' + window.debugMapMarkers.formCallbacks);
    }
    
    // Track map updates
    if (message.includes('🗺️ Map component - Places data')) {
      window.debugMapMarkers.mapUpdates++;
      window.debugMapMarkers.lastMapData = args[1];
      console.warn('📊 STATS: Map updates: ' + window.debugMapMarkers.mapUpdates);
    }
    
    // Track place additions
    if (message.includes('🔄 PlannerForm - Notifying parent of form change') && 
        args[1] && args[1].changeType === 'addPlace') {
      window.debugMapMarkers.placeAdditions++;
      console.warn('📊 STATS: Place additions: ' + window.debugMapMarkers.placeAdditions);
    }
    
    // Track place removals
    if (message.includes('🔄 PlannerForm - Notifying parent of removeItem change')) {
      window.debugMapMarkers.placeRemovals++;
      console.warn('📊 STATS: Place removals: ' + window.debugMapMarkers.placeRemovals);
    }
  }
  
  // Call original console.log
  originalLog.apply(console, arguments);
};

// Function to check current state
window.checkMapState = function() {
  console.log("\n🔍 CURRENT MAP DEBUG STATE:");
  console.log("============================");
  console.log("Form callbacks received:", window.debugMapMarkers.formCallbacks);
  console.log("Map updates triggered:", window.debugMapMarkers.mapUpdates);
  console.log("Place additions tracked:", window.debugMapMarkers.placeAdditions);
  console.log("Place removals tracked:", window.debugMapMarkers.placeRemovals);
  
  console.log("\n📋 LAST FORM DATA:");
  console.log(window.debugMapMarkers.lastFormData);
  
  console.log("\n🗺️ LAST MAP DATA:");
  console.log(window.debugMapMarkers.lastMapData);
  
  // Check if map markers are actually visible
  const mapContainer = document.querySelector('[data-testid="map"]') || 
                      document.querySelector('.maplibregl-map') ||
                      document.querySelector('[class*="map"]');
  
  if (mapContainer) {
    const markers = mapContainer.querySelectorAll('[class*="marker"]') ||
                   mapContainer.querySelectorAll('div[style*="position: absolute"]');
    console.log("\n🎯 VISIBLE MAP MARKERS:", markers.length);
    
    // List visible markers
    markers.forEach((marker, index) => {
      console.log(`Marker ${index + 1}:`, marker);
    });
  } else {
    console.log("\n❌ No map container found!");
  }
  
  return {
    stats: window.debugMapMarkers,
    mapContainer: !!mapContainer,
    visibleMarkers: mapContainer ? 
      (mapContainer.querySelectorAll('[class*="marker"]').length || 
       mapContainer.querySelectorAll('div[style*="position: absolute"]').length) : 0
  };
};

// Function to simulate place addition (for testing)
window.testAddPlace = function() {
  console.log("🧪 TEST: Simulating place addition...");
  
  // Find and click an "Add Place" button
  const addButtons = document.querySelectorAll('button, div');
  let addButton = null;
  
  for (let button of addButtons) {
    if (button.textContent && button.textContent.toLowerCase().includes('add') && 
        button.textContent.toLowerCase().includes('place')) {
      addButton = button;
      break;
    }
  }
  
  if (addButton) {
    console.log("Found Add Place button:", addButton);
    addButton.click();
    setTimeout(() => {
      console.log("🔍 State after simulated add:");
      window.checkMapState();
    }, 1000);
  } else {
    console.log("❌ No Add Place button found");
  }
};

// Function to simulate place removal (for testing)
window.testRemovePlace = function() {
  console.log("🧪 TEST: Simulating place removal...");
  
  // Find remove buttons (usually X or trash icons)
  const removeButtons = document.querySelectorAll('button[type="button"]');
  let removeButton = null;
  
  for (let button of removeButtons) {
    const text = button.textContent || button.getAttribute('aria-label') || '';
    if (text.includes('×') || text.includes('✕') || text.includes('Remove') || 
        text.includes('Delete') || button.innerHTML.includes('trash')) {
      removeButton = button;
      break;
    }
  }
  
  if (removeButton) {
    console.log("Found Remove button:", removeButton);
    removeButton.click();
    setTimeout(() => {
      console.log("🔍 State after simulated removal:");
      window.checkMapState();
    }, 1000);
  } else {
    console.log("❌ No Remove button found");
  }
};

// Auto-check state every 5 seconds
setInterval(() => {
  const stats = window.debugMapMarkers;
  if (stats.formCallbacks > 0 || stats.mapUpdates > 0 || 
      stats.placeAdditions > 0 || stats.placeRemovals > 0) {
    console.log(`⏰ Auto-check [${new Date().toLocaleTimeString()}]: 
      Callbacks: ${stats.formCallbacks}, 
      Map updates: ${stats.mapUpdates}, 
      Adds: ${stats.placeAdditions}, 
      Removes: ${stats.placeRemovals}`);
  }
}, 5000);

console.log("\n🎮 AVAILABLE COMMANDS:");
console.log("======================");
console.log("window.checkMapState() - Check current debug state");
console.log("window.testAddPlace() - Simulate adding a place");
console.log("window.testRemovePlace() - Simulate removing a place");
console.log("\n📊 Stats will auto-update as you interact with the page");
console.log("🔍 Watch console for debug messages as you add/remove places");
