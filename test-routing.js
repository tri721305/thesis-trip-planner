// Test script to demonstrate OpenStreetMap routing functionality
// This can be run in the browser console or Node.js environment

/**
 * Test the OpenStreetMap Routing API
 * Calculates routes between places in Ho Chi Minh City
 */

// Sample coordinates for popular places in Ho Chi Minh City
const testPlaces = [
  {
    name: "Ben Thanh Market",
    coordinates: { lat: 10.7723, lon: 106.6982 },
  },
  {
    name: "War Remnants Museum",
    coordinates: { lat: 10.7796, lon: 106.6916 },
  },
  {
    name: "Notre-Dame Cathedral",
    coordinates: { lat: 10.7798, lon: 106.699 },
  },
  {
    name: "Independence Palace",
    coordinates: { lat: 10.7769, lon: 106.6955 },
  },
];

/**
 * Call OpenStreetMap routing API
 */
async function calculateRoute(coordinates) {
  if (coordinates.length < 2) return null;

  try {
    // Format coordinates for OpenStreetMap API: longitude,latitude;longitude,latitude
    const coordsString = coordinates
      .map((coord) => `${coord.lon.toFixed(6)},${coord.lat.toFixed(6)}`)
      .join(";");

    console.log(`🗺️ Calling routing API with coordinates: ${coordsString}`);

    const response = await fetch(
      `https://routing.openstreetmap.de/routed-car/route/v1/driving/${coordsString}?overview=full&geometries=geojson&continue_straight=false&steps=true`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent":
            "TravelPlannerApp/1.0 (Contact: admin@travelplanner.com)",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Routing API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];

      // NEW: Extract detailed route information
      const detailedInfo = {
        distance: Math.round(route.distance || 0), // in meters
        duration: Math.round(route.duration || 0), // in seconds
        geometry: route.geometry, // GeoJSON coordinates
        waypoints: data.waypoints?.map((wp) => ({
          lat: wp.location[1],
          lon: wp.location[0],
        })),
        legs: route.legs || [],
        routeCode: data.code || "Ok",
        detailedWaypoints: data.waypoints || [],
      };

      // NEW: Log detailed step information
      if (route.legs && route.legs.length > 0) {
        console.log(
          `📋 Route details for ${(route.distance / 1000).toFixed(1)}km journey:`
        );

        route.legs.forEach((leg, legIndex) => {
          console.log(`  Leg ${legIndex + 1}: ${leg.summary || "No summary"}`);

          if (leg.steps && leg.steps.length > 0) {
            leg.steps.forEach((step, stepIndex) => {
              const maneuver = step.maneuver;
              let instruction = "";

              if (maneuver) {
                switch (maneuver.type) {
                  case "depart":
                    instruction = `Start journey${step.name ? ` on ${step.name}` : ""}`;
                    break;
                  case "turn":
                    instruction = `Turn ${maneuver.modifier}${step.name ? ` onto ${step.name}` : ""}`;
                    break;
                  case "arrive":
                    instruction = `Arrive at destination${step.name ? ` on ${step.name}` : ""}`;
                    break;
                  default:
                    instruction = `${maneuver.type}${step.name ? ` on ${step.name}` : ""}`;
                }
              }

              console.log(
                `    ${stepIndex + 1}. ${instruction} (${(step.distance / 1000).toFixed(1)}km, ${Math.round(step.duration / 60)}min)`
              );
            });
          }
        });
      }

      return detailedInfo;
    } else {
      throw new Error("No routes found in API response");
    }
  } catch (error) {
    console.error("❌ OpenStreetMap routing error:", error);
    return null;
  }
}

/**
 * Calculate routes between consecutive places
 */
async function calculateDayRoutes(places) {
  console.log(`🔄 Calculating routes for ${places.length} places...`);

  if (places.length < 2) {
    console.log("⚠️ Need at least 2 places to calculate routes");
    return { routes: [], totalDistance: 0, totalDuration: 0 };
  }

  const routes = [];
  let totalDistance = 0;
  let totalDuration = 0;

  for (let i = 0; i < places.length - 1; i++) {
    const fromPlace = places[i];
    const toPlace = places[i + 1];

    console.log(
      `🗺️ Route ${i + 1}/${places.length - 1}: ${fromPlace.name} → ${toPlace.name}`
    );

    const routeResult = await calculateRoute([
      fromPlace.coordinates,
      toPlace.coordinates,
    ]);

    if (routeResult) {
      routes.push({
        fromPlace: fromPlace.name,
        toPlace: toPlace.name,
        distance: routeResult.distance,
        duration: routeResult.duration,
        geometry: routeResult.geometry,
        waypoints: routeResult.waypoints,
        // NEW: Add detailed route information
        legs: routeResult.legs,
        routeCode: routeResult.routeCode,
        detailedWaypoints: routeResult.detailedWaypoints,
      });

      totalDistance += routeResult.distance;
      totalDuration += routeResult.duration;

      console.log(
        `✅ Route calculated: ${(routeResult.distance / 1000).toFixed(1)}km, ${Math.round(routeResult.duration / 60)}min`
      );
    } else {
      console.warn(
        `⚠️ Failed to calculate route: ${fromPlace.name} → ${toPlace.name}`
      );
    }

    // Add delay between requests to avoid rate limiting
    if (i < places.length - 2) {
      console.log("⏳ Waiting 500ms before next request...");
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return { routes, totalDistance, totalDuration };
}

/**
 * Format distance and duration for display
 */
function formatRouteInfo(distance, duration) {
  if (distance === 0 || duration === 0) {
    return { distance: "Unknown", duration: "Unknown" };
  }

  const distanceStr =
    distance >= 1000
      ? `${(distance / 1000).toFixed(1)}km`
      : `${Math.round(distance)}m`;

  const durationStr =
    duration >= 3600
      ? `${Math.floor(duration / 3600)}h ${Math.round((duration % 3600) / 60)}min`
      : `${Math.round(duration / 60)}min`;

  return { distance: distanceStr, duration: durationStr };
}

/**
 * Main test function
 */
async function testRouting() {
  console.log("🚀 Starting OpenStreetMap routing test...");
  console.log("📍 Test places:", testPlaces.map((p) => p.name).join(" → "));

  const startTime = Date.now();

  try {
    const result = await calculateDayRoutes(testPlaces);

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.log("\n🎉 Routing test completed!");
    console.log("📊 Summary:", {
      routes: result.routes.length,
      totalDistance: formatRouteInfo(result.totalDistance, result.totalDuration)
        .distance,
      totalDuration: formatRouteInfo(result.totalDistance, result.totalDuration)
        .duration,
      calculationTime: `${(totalTime / 1000).toFixed(1)}s`,
    });

    console.log("\n📋 Detailed Routes:");
    result.routes.forEach((route, index) => {
      const { distance, duration } = formatRouteInfo(
        route.distance,
        route.duration
      );
      console.log(`${index + 1}. ${route.fromPlace} → ${route.toPlace}`);
      console.log(`   Distance: ${distance}, Duration: ${duration}`);
    });

    return result;
  } catch (error) {
    console.error("❌ Test failed:", error);
    return null;
  }
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    calculateRoute,
    calculateDayRoutes,
    formatRouteInfo,
    testRouting,
    testPlaces,
  };
}

// Auto-run test if this is the main script
if (typeof window !== "undefined") {
  console.log(
    "🌐 Browser environment detected. Run testRouting() to start the test."
  );
} else if (require.main === module) {
  testRouting();
}

// Example usage in PlannerForm:
/*
const routingResult = await calculateDayRoutes([
  { name: "Ben Thanh Market", coordinates: { lat: 10.7723, lon: 106.6982 }},
  { name: "War Remnants Museum", coordinates: { lat: 10.7796, lon: 106.6916 }},
  { name: "Notre-Dame Cathedral", coordinates: { lat: 10.7798, lon: 106.6990 }}
]);

console.log("Total distance:", formatRouteInfo(routingResult.totalDistance, routingResult.totalDuration).distance);
console.log("Total duration:", formatRouteInfo(routingResult.totalDistance, routingResult.totalDuration).duration);
*/
