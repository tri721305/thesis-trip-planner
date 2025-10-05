/**
 * Route Optimization Example for PlannerForm
 *
 * This file demonstrates how to use the route optimizer in a Planner Form component.
 */

// For debugging, let's try a direct path without using the alias
const routeOptimizer = require("../utils/routeOptimizer");
console.log("DEBUG routeOptimizer directly loaded:", Object.keys(routeOptimizer));

// TypeScript type reference (these are just for TypeScript, not for runtime)
type RoutePoint = any;
type OptimizationResult = any;

/**
 * Example function to optimize a day's route in PlannerForm
 *
 * @param dayData - The day's data including places to visit
 * @param hotelInfo - Hotel information for that day (optional)
 * @returns Optimized route result
 */
async function optimizeDayRoute(
  dayData, 
  hotelInfo
) {
  try {
    // Skip if not a route day or no places
    if (
      !dayData ||
      dayData.type !== "route" ||
      !dayData.data ||
      dayData.data.length < 2
    ) {
      return null;
    }

    // Extract places with coordinates
    const places = dayData.data.filter((item: any) => item.type === "place");

    if (places.length < 2) {
      console.log("Not enough places to optimize");
      return null;
    }

    // Convert places to RoutePoint format
    const routePoints: RoutePoint[] = places
      .filter((place: any) => {
        return (
          place.location?.coordinates &&
          Array.isArray(place.location.coordinates) &&
          place.location.coordinates.length === 2
        );
      })
      .map((place: any) => {
        const [lon, lat] = place.location.coordinates;

        // Extract visit duration and priority
        const visitDuration = place.visitDuration || place.timeStart || 60; // Default 60 mins
        const priority = place.priority || place.timeEnd || 3; // Default priority 3

        // Extract opening/closing hours
        let openingPeriods = null;
        if (place.attractionData?.openingPeriods) {
          openingPeriods = place.attractionData.openingPeriods;
        } else if (place.openingPeriods) {
          openingPeriods = place.openingPeriods;
        }

        return {
          id: place.id || place.attractionId || `place-${Math.random()}`,
          name: place.name || "Unnamed Place",
          coordinates: { lat, lon },
          visitDuration:
            typeof visitDuration === "number"
              ? visitDuration
              : parseInt(visitDuration),
          priority:
            typeof priority === "number" ? priority : parseInt(priority),
          openingPeriods,
          attractionId: place.attractionId,
        };
      });

  // Add hotel as starting/ending point if available
  if (hotelInfo?.coordinates) {
    console.log(
      "🏨 routeOptimizationHelper - Adding hotel to route points:",
      {
        name: hotelInfo.name || "Hotel",
        coordinates: hotelInfo.coordinates,
      }
    );

    // Save original hotel info in a global variable that can be accessed later
    (global as any).currentHotelInfo = hotelInfo;

    routePoints.unshift({
      id: "hotel",
      name: hotelInfo.name || "Hotel",
      coordinates: {
        lat: hotelInfo.coordinates.lat,
        lon: hotelInfo.coordinates.lon,
      },
      visitDuration: 0,
      priority: 5,
      isHotel: true,
    });
  } else {
    console.log(
      "⚠️ routeOptimizationHelper - No valid hotel coordinates available:",
      hotelInfo
    );
    // Clear global hotel info
    (global as any).currentHotelInfo = null;
  }    // Log the final route points array
    console.log(
      `📍 routeOptimizationHelper - Total points for optimization: ${routePoints.length}`,
      routePoints.map((p) => ({ name: p.name, isHotel: p.isHotel, id: p.id }))
    );

    // Parse the date
    const dayDate = dayData.date ? new Date(dayData.date) : new Date();

    // Set optimization options
    const options = {
      startTimeHour: 8, // Start at 8:00 AM
      returnToStart: true, // Return to hotel at the end
      maxIterations: 5000, // Limit iterations for faster results
    };

    // Debug to see what routeOptimizer contains
    console.log("DEBUG - routeOptimizer.optimizeRoute type:", typeof routeOptimizer.optimizeRoute);
    
    // Use routeOptimizer.optimizeRoute directly
    const result = await routeOptimizer.optimizeRoute(routePoints, dayDate, options);

    return result;
  } catch (error) {
    console.error("Error optimizing route:", error);
    return null;
  }
};

/**
 * Update day data with optimized route
 *
 * @param dayData - Original day data
 * @param optimizationResult - Result from route optimization
 * @returns Updated day data with ordered places
 */
function applyOptimizedRoute(
  dayData,
  optimizationResult
) {
  if (!optimizationResult) return dayData;

  // Create a copy of the day data
  const updatedDay = { ...dayData };

  // Get the optimized order of place IDs (including hotel for complete route visualization)
  // We keep the hotel ID in this version to ensure routes to/from hotel are displayed
  const orderedPlaceIds = optimizationResult.placeIds;
  
  console.log(
    "🔄 applyOptimizedRoute - Original place IDs:",
    optimizationResult.placeIds
  );

  // Create a map for quick lookup - only include places with valid IDs
  const placeMap = new Map(
    dayData.data
      .filter((item: any) => item.type === "place" && (item.id || item.attractionId))
      .map((item: any) => {
        const placeId = item.id || item.attractionId;
        if (!placeId) {
          console.warn("⚠️ Found place without ID:", item.name);
        }
        return [placeId, item];
      })
  );

  console.log(
    "🗺️ applyOptimizedRoute - Place map keys:",
    Array.from(placeMap.keys())
  );

  // Create a new data array with non-place items preserved
  const nonPlaces = dayData.data.filter((item: any) => item.type !== "place");

  // Find hotel info from the original day data
  // This assumes you've passed hotel info when calling optimizeDayRoute
  let hotelInfo: any = null;
  // Look for hotel info in non-place items
  for (const item of dayData.data) {
    if (item.isHotel || (item.type === "hotel")) {
      hotelInfo = item;
      break;
    }
  }
  
  // If we don't have hotel info in the dayData, try to extract from various sources
  if (!hotelInfo) {
    // Try to get from global saved hotel info
    if ((global as any).currentHotelInfo) {
      hotelInfo = (global as any).currentHotelInfo;
      console.log("🏨 Using global hotel info:", hotelInfo.name);
    }
    // If still no hotel info, extract from optimization result
    else {
      // Extract hotel name from optimization result
      const hotelNames = optimizationResult.route
        .filter((name, index) => optimizationResult.placeIds[index] === "hotel");
      
      if (hotelNames.length > 0) {
        // Create basic hotel info - ensure we have coordinates data
        // Attempt to extract hotel coordinates from any available source
        // Check if we have hotel coordinates stored in the global variable
        let hotelCoordinates = { lat: 0, lon: 0 };
        
        // Try to get from the global variable we saved when starting optimization
        if ((global as any).currentHotelInfo?.coordinates) {
          hotelCoordinates = (global as any).currentHotelInfo.coordinates;
          console.log("📍 Found hotel coordinates from global storage");
        }
        
        hotelInfo = {
          type: "place",
          name: hotelNames[0],
          id: "hotel",
          isHotel: true,
          coordinates: hotelCoordinates
        };
        console.log("🏨 Created hotel info from optimization result:", hotelInfo.name);
      }
    }
  }
  
  // Log hotel info for debugging
  console.log("🏨 Hotel info:", hotelInfo ? hotelInfo.name : "None");
  
  // Create ordered places array - handle both hotel and regular places
  const orderedPlaces = orderedPlaceIds
    .map((id, index) => {
      // For hotel positions, use our hotelInfo
      if (id === "hotel") {
        if (hotelInfo) {
          // Clone hotel info to avoid modifying the original
          // Add suffix if this is the return to hotel (last position)
          const isReturn = index === orderedPlaceIds.length - 1;
          const hotelClone = { 
            ...hotelInfo,
            name: isReturn ? `${hotelInfo.name} (Return)` : hotelInfo.name,
            id: isReturn ? "hotel-return" : "hotel",
            isHotel: true,
            type: "place"
          };
          
          console.log(`🏨 Including hotel in route (${isReturn ? "return" : "start"}):`, hotelClone.name);
          return hotelClone;
        }
        console.log("⚠️ Hotel info not available for", id);
        return null;
      } else {
        // For regular places, look up in the place map
        const place = placeMap.get(id);
        if (!place) {
          console.warn(`⚠️ Cannot find place with ID ${id} in place map`);
        }
        return place;
      }
    })
    .filter((item) => item); // Filter out any undefined items

  // Combine non-places and ordered places
  updatedDay.data = [...nonPlaces, ...orderedPlaces];

  // Verify our route has hotel points if expected
  const hasHotelInOptimized = optimizationResult.placeIds.includes("hotel");
  const hasHotelInOutput = orderedPlaces.some(place => place.isHotel === true);
  
  if (hasHotelInOptimized && !hasHotelInOutput) {
    console.warn("⚠️ Warning: Hotel exists in optimized route but missing in final output!");
    // This diagnostic logging will help with debugging
    console.log("Optimized route places:", optimizationResult.placeIds);
    console.log("Final output places:", orderedPlaces.map(p => p.id || p.attractionId));
  }

  // Add hotel to day metadata for later use in route calculations
  if (hotelInfo) {
    // Store hotel info directly in day data for future access
    updatedDay.hotelInfo = {
      name: hotelInfo.name,
      coordinates: hotelInfo.coordinates,
      id: hotelInfo.id || "hotel"
    };
  }
  
  // Add optimization summary to metadata
  updatedDay.optimizationMetadata = {
    totalDistance: optimizationResult.totalDistance,
    totalDuration: optimizationResult.totalDuration,
    optimizedAt: new Date().toISOString(),
    timeWarnings: optimizationResult.timeWarnings.length,
    hasHotel: !!hotelInfo
  };

  return updatedDay;
};

/**
 * Example usage in a component
 *
 * This demonstrates how to call these functions from a component
 */
/*
// Inside your PlannerForm component:

import { optimizeDayRoute, applyOptimizedRoute } from './routeOptimizationHelper';

// ...

const handleOptimizeRoute = async (dayIndex: number) => {
  // Get current day data
  const dayData = planner.details[dayIndex];
  
  // Get hotel information for that day
  const hotelInfo = findHotelInfo(dayData.date);
  
  // Optimize route
  const optimizationResult = optimizeDayRoute(dayData, hotelInfo);
  
  if (optimizationResult) {
    // Update day data with optimized route
    const updatedDayData = applyOptimizedRoute(dayData, optimizationResult);
    
    // Update planner state with new day data
    const updatedDetails = [...planner.details];
    updatedDetails[dayIndex] = updatedDayData;
    
    setPlanner({
      ...planner,
      details: updatedDetails
    });
    
    // Show optimization summary
    toast({
      title: "Route optimized",
      description: `Optimized route with total distance ${(optimizationResult.totalDistance / 1000).toFixed(2)}km`,
    });
  }
};
*/

// Export functions using CommonJS style to match routeOptimizer.ts
module.exports = {
  optimizeDayRoute,
  applyOptimizedRoute
};
