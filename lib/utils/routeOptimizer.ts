/**
 * Route Optimization Utilities
 *
 * This file contains algorithms for optimizing routes between multiple locations:
 * 1. Simulated Annealing (SA) - A probabilistic technique for finding global optimum
 * 2. Helper functions for distance calculation, time management, etc.
 */

const { calculateHaversineDistance } = require("./distance");

// Types definition
// Define interfaces without export keyword
interface Location {
  name: string;
  id: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  visitDuration: number; // in minutes
  priority: number; // importance of this location (1-5)
  openingPeriods?: any[]; // Opening hours data
  attractionId?: string;
  [key: string]: any; // Allow additional properties
}

interface RoutePoint extends Location {
  isHotel?: boolean;
}

interface TimeWarning {
  placeId: string;
  placeName: string;
  warning: string;
  arrivalTime: string;
  departureTime?: string;
  openingTime?: string;
  closingTime?: string;
  waitTime?: number;
}

interface TimelineEntry {
  name: string;
  arrivalTime: string;
  departureTime: string;
  visitDuration: number;
  status: "OK" | "WAIT_FOR_OPENING" | "AFTER_CLOSING" | "VISIT_EXCEEDS_CLOSING";
}

interface OptimizationResult {
  route: string[]; // Names of locations in order
  placeIds: string[]; // IDs of locations in order
  routeIndices: number[]; // Indices of locations in the original array
  totalDistance: number; // in meters
  totalDuration: number; // in seconds
  totalScore: number; // Route quality score
  timeWarnings: TimeWarning[];
  timeline: TimelineEntry[];
  visitedPointsCount: number;
  executionTime: number; // in milliseconds
}

interface OptimizationOptions {
  startTimeHour?: number; // Hour to start the day (default: 8)
  startTimeMinute?: number; // Minute to start the day (default: 0)
  returnToStart?: boolean; // Whether to return to starting point (default: true)
  maxIterations?: number; // Max iterations for SA (default: 10000)
  initialTemperature?: number; // Initial temperature for SA (default: 10000)
  coolingRate?: number; // Cooling rate for SA (default: 0.995)
  stoppingTemperature?: number; // Temperature to stop SA (default: 0.1)
  bonusFor24h?: number; // Bonus score for 24/7 locations (default: 200)
  distancePenaltyFactor?: number; // Factor to penalize distance (default: 0.01)
  waitTimePenaltyFactor?: number; // Factor to penalize waiting time (default: 0.5)
  afterClosingPenalty?: number; // Penalty for arriving after closing (default: 1000)
  exceedingClosingPenaltyFactor?: number; // Factor to penalize exceeding closing time (default: 0.8)
  exceedingClosingByHourPenalty?: number; // Additional penalty for exceeding by >60min (default: 500)
}

// Time utility functions - CommonJS style
const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
};

const formatTimeFromOpeningPeriod = (timeStr: string): string => {
  if (!timeStr || timeStr.length !== 4) return "00:00";
  const hours = timeStr.substring(0, 2);
  const minutes = timeStr.substring(2);
  return `${hours}:${minutes}`;
};

/**
 * Calculate a route between two points
 * This now uses OSRM Trip service if available, fallback to Haversine formula
 * 
 * @param fromCoords - Starting coordinates {lat, lon}
 * @param toCoords - Ending coordinates {lat, lon}
 * @returns Route information including distance and duration
 */
// Changed to CommonJS style
const calculateRoute = async (
  fromCoords: { lat: number; lon: number },
  toCoords: { lat: number; lon: number }
): Promise<{ distance: number; duration: number }> => {
  try {
    // Format coordinates for OpenStreetMap API: longitude,latitude;longitude,latitude
    const coordsString = `${fromCoords.lon.toFixed(6)},${fromCoords.lat.toFixed(6)};${toCoords.lon.toFixed(6)},${toCoords.lat.toFixed(6)}`;
    
    // Call OSRM routing service
    const response = await fetch(
      `https://routing.openstreetmap.de/routed-car/route/v1/driving/${coordsString}?overview=false`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "TravelPlannerApp/1.0 (Contact: admin@travelplanner.com)",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Routing API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      
      // Log the real-world routing data
      console.log(`🚗 OSRM routing data: ${(route.distance/1000).toFixed(2)}km, ${(route.duration/60).toFixed(1)}min`);
      
      return {
        distance: Math.round(route.distance || 0), // in meters
        duration: Math.round(route.duration || 0), // in seconds (directly from OSRM)
      };
    }
    
    throw new Error("No routes found in OSRM API response");
  } catch (error) {
    console.warn("⚠️ Failed to use OSRM service, falling back to Haversine:", error);
    
    // Fallback: Calculate distance using Haversine formula
    const distance = calculateHaversineDistance(
      fromCoords.lat,
      fromCoords.lon,
      toCoords.lat,
      toCoords.lon
    );

    // Estimate duration with a more realistic model:
    // - Urban areas: ~20-30 km/h average (slower for traffic)
    // - Rural/highways: ~60-80 km/h average
    // Use a conservative estimate that accounts for traffic lights, congestion, etc.
    const distanceInKm = distance / 1000;
    
    // Use a non-linear model for time estimation:
    // - Short distances: slower speeds (urban traffic)
    // - Longer distances: faster speeds (highways)
    let estimatedSpeedKmh;
    if (distanceInKm < 1) {
      // Very short urban trip (many stops, traffic lights)
      estimatedSpeedKmh = 15;
    } else if (distanceInKm < 5) {
      // Urban trip
      estimatedSpeedKmh = 20;
    } else if (distanceInKm < 20) {
      // Mix of urban and suburban
      estimatedSpeedKmh = 30;
    } else {
      // Likely includes highways
      estimatedSpeedKmh = 50;
    }
    
    // Convert to m/s and calculate duration in seconds
    const speedInMps = estimatedSpeedKmh * 1000 / 3600;
    const duration = distance / speedInMps;
    
    console.log(`🚗 Fallback estimation: ${distanceInKm.toFixed(2)}km, ${(duration/60).toFixed(1)}min (at ${estimatedSpeedKmh}km/h)`);

    return {
      distance,
      duration,
    };
  }

/**
 * Build distance and duration matrices for a list of locations
 *
 * @param points - Array of locations with coordinates
 * @returns Object containing distance and duration matrices
 */
// Changed to CommonJS export style to fix parsing error
const buildDistanceMatrices = async (
  points: RoutePoint[]
): Promise<{
  distanceMatrix: number[][];
  durationMatrix: number[][];
}> => {
  const distanceMatrix: number[][] = [];
  const durationMatrix: number[][] = [];

  // Calculate matrices for all points
  for (let i = 0; i < points.length; i++) {
    const fromPlace = points[i];
    const distanceRow: number[] = [];
    const durationRow: number[] = [];

    for (let j = 0; j < points.length; j++) {
      if (i === j) {
        distanceRow.push(0);
        durationRow.push(0);
        continue;
      }

      const toPlace = points[j];

      try {
        // Calculate route using await since it's now async
        const routeResult = await calculateRoute(
          fromPlace.coordinates,
          toPlace.coordinates
        );

        distanceRow.push(routeResult.distance);
        durationRow.push(routeResult.duration);
      } catch (error) {
        console.error(`Failed to calculate route from ${fromPlace.name} to ${toPlace.name}:`, error);
        // Use Haversine as fallback in case of error
        const distance = calculateHaversineDistance(
          fromPlace.coordinates.lat, fromPlace.coordinates.lon,
          toPlace.coordinates.lat, toPlace.coordinates.lon
        );
        const duration = distance / 8.33; // Assume 30km/h = 8.33m/s
        
        distanceRow.push(distance);
        durationRow.push(duration);
      }
    }

    distanceMatrix.push(distanceRow);
    durationMatrix.push(durationRow);
  }

  return { distanceMatrix, durationMatrix };
};

/**
 * Optimize route using Simulated Annealing algorithm
 *
 * @param points - Array of locations to visit
 * @param dayDate - Date for checking opening hours
 * @param options - Optimization options
 * @returns Optimized route result
 */
const optimizeWithSimulatedAnnealing = async (
  points: RoutePoint[],
  dayDate: Date = new Date(),
  options: OptimizationOptions = {}
): Promise<OptimizationResult> => {
  const startTime = performance.now();

  // Destructure options with defaults
  const {
    startTimeHour = 8,
    startTimeMinute = 0,
    returnToStart = true,
    maxIterations = 10000,
    initialTemperature = 10000,
    coolingRate = 0.995,
    stoppingTemperature = 0.1,
    bonusFor24h = 200,
    distancePenaltyFactor = 0.01,
    waitTimePenaltyFactor = 0.5,
    afterClosingPenalty = 1000,
    exceedingClosingPenaltyFactor = 0.8,
    exceedingClosingByHourPenalty = 500,
  } = options;

  // Ensure there are points to optimize
  if (!points || points.length < 2) {
    throw new Error("Need at least 2 points to optimize");
  }

  // Check if we have a hotel/starting point
  const hasStartingPoint = points.some((p) => p.isHotel);

  // Build distance and duration matrices - with await since it's now async
  const { distanceMatrix, durationMatrix } = await buildDistanceMatrices(points);

  // Helper function to evaluate a route
  const evaluateRoute = (
    route: number[]
  ): {
    score: number;
    timeWarnings: TimeWarning[];
    timeline: TimelineEntry[];
  } => {
    let score = 0;
    let currentTime = startTimeHour * 60 + startTimeMinute;
    let totalDistance = 0;
    let totalDuration = 0;
    const timeWarnings: TimeWarning[] = [];
    const timeline: TimelineEntry[] = [];

    // Start with a fresh day time
    currentTime = startTimeHour * 60 + startTimeMinute;

    for (let i = 0; i < route.length; i++) {
      const placeIndex = route[i];
      const place = points[placeIndex];

      // Add travel time from previous place (if not the first place)
      if (i > 0) {
        const prevPlaceIndex = route[i - 1];
        const travelTime = durationMatrix[prevPlaceIndex][placeIndex] / 60; // Convert to minutes

        totalDistance += distanceMatrix[prevPlaceIndex][placeIndex];
        totalDuration += travelTime;

        currentTime += travelTime;
      }

      const arrivalTime = minutesToTime(currentTime);
      const arrivalTimeMinutes = currentTime;

      // Check opening/closing hours
      let timeStatus = "OK";
      let waitTime = 0;

      // If no opening periods, assume open 24/7
      if (!place.openingPeriods || place.openingPeriods.length === 0) {
        // No time constraints - place is open 24/7
        score += bonusFor24h; // Bonus for 24/7 places
      } else if (place.openingPeriods && place.openingPeriods.length > 0) {
        const dayOfWeek = dayDate.getDay();
        const todaySchedule = place.openingPeriods.find(
          (p: any) => p.open.day === dayOfWeek
        );

        if (todaySchedule) {
          const openTimeStr = formatTimeFromOpeningPeriod(
            todaySchedule.open.time
          );
          const closeTimeStr = formatTimeFromOpeningPeriod(
            todaySchedule.close.time
          );

          const openTimeMinutes = timeToMinutes(openTimeStr);
          const closeTimeMinutes = timeToMinutes(closeTimeStr);

          // If arriving before opening time
          if (currentTime < openTimeMinutes) {
            waitTime = openTimeMinutes - currentTime;
            currentTime = openTimeMinutes; // Wait until opening

            score -= waitTime * waitTimePenaltyFactor; // Penalty for waiting
            timeStatus = "WAIT_FOR_OPENING";

            timeWarnings.push({
              placeId: place.id,
              placeName: place.name,
              warning: `Arrive at ${arrivalTime}, before opening time (${openTimeStr}), need to wait ${waitTime} minutes`,
              arrivalTime,
              openingTime: openTimeStr,
              closingTime: closeTimeStr,
              waitTime,
            });
          }

          // If arriving after closing time
          if (currentTime > closeTimeMinutes) {
            score -= afterClosingPenalty; // Severe penalty for arriving after closing
            timeStatus = "AFTER_CLOSING";

            timeWarnings.push({
              placeId: place.id,
              placeName: place.name,
              warning: `Arrive at ${arrivalTime}, after closing time (${closeTimeStr})`,
              arrivalTime,
              openingTime: openTimeStr,
              closingTime: closeTimeStr,
            });
          }

          // Check if visit extends beyond closing time
          const departureTimeMinutes = currentTime + place.visitDuration;
          const departureTime = minutesToTime(departureTimeMinutes);

          if (
            currentTime <= closeTimeMinutes &&
            departureTimeMinutes > closeTimeMinutes
          ) {
            const overTime = departureTimeMinutes - closeTimeMinutes;
            score -= overTime * exceedingClosingPenaltyFactor; // Penalty for exceeding closing time

            if (overTime > 60) {
              score -= exceedingClosingByHourPenalty; // Severe penalty if exceeding by more than an hour
            }

            timeStatus = "VISIT_EXCEEDS_CLOSING";

            timeWarnings.push({
              placeId: place.id,
              placeName: place.name,
              warning: `Visit ends at ${departureTime}, after closing time (${closeTimeStr}), exceeding by ${overTime} minutes`,
              arrivalTime,
              departureTime,
              openingTime: openTimeStr,
              closingTime: closeTimeStr,
            });
          }
        }
      }

      // Add visit time
      const visitTime = place.visitDuration;
      totalDuration += visitTime;
      currentTime += visitTime;

      // Add timeline entry
      timeline.push({
        name: place.name,
        arrivalTime: arrivalTime,
        departureTime: minutesToTime(currentTime),
        visitDuration: visitTime,
        status: timeStatus as any,
      });

      // Add priority score for this place
      score += place.priority * 1000;

      // Special bonus for locations with no opening hours (24/7)
      if (!place.openingPeriods || place.openingPeriods.length === 0) {
        score += bonusFor24h;
      }
    }

    // For round-trip, add return journey to starting point
    if (returnToStart && hasStartingPoint && route.length > 0) {
      const lastPlaceIndex = route[route.length - 1];
      const startIndex = points.findIndex((p) => p.isHotel); // Find hotel/starting point

      if (lastPlaceIndex !== startIndex) {
        // Add time/distance for return to starting point
        const returnDistance = distanceMatrix[lastPlaceIndex][startIndex];
        const returnTime = durationMatrix[lastPlaceIndex][startIndex] / 60;

        totalDistance += returnDistance;
        totalDuration += returnTime;

        // Add to timeline
        timeline.push({
          name: "Return to " + points[startIndex].name,
          arrivalTime: minutesToTime(currentTime + returnTime),
          departureTime: minutesToTime(currentTime + returnTime),
          visitDuration: 0,
          status: "OK",
        });
      }
    }

    // Subtract total distance from score to promote shorter routes
    score -= totalDistance * distancePenaltyFactor;

    return { score, timeWarnings, timeline };
  };

  // Helper function to create initial solution
  const createInitialSolution = (): number[] => {
    // If starting point exists, always start with it
    let route: number[] = [];
    const startIndex = points.findIndex((p) => p.isHotel);

    if (hasStartingPoint && startIndex !== -1) {
      route.push(startIndex);
    }

    // Add the rest of the places in their current order
    for (let i = 0; i < points.length; i++) {
      if (!(hasStartingPoint && i === startIndex)) {
        route.push(i);
      }
    }

    // If starting point exists and we want to return, add it as the last point
    if (hasStartingPoint && returnToStart && startIndex !== -1) {
      route.push(startIndex);
    }

    return route;
  };

  // Helper function to generate neighbor solutions
  const generateNeighbor = (route: number[]): number[] => {
    const newRoute = [...route];

    // Don't swap the first or last point if they are starting points
    const startIdx = hasStartingPoint ? 1 : 0;
    const endIdx =
      hasStartingPoint && returnToStart ? route.length - 2 : route.length - 1;

    if (endIdx <= startIdx) return newRoute; // Not enough points to swap

    // Randomly select two indices to swap
    const i = startIdx + Math.floor(Math.random() * (endIdx - startIdx + 1));
    const j = startIdx + Math.floor(Math.random() * (endIdx - startIdx + 1));

    // Swap the points
    [newRoute[i], newRoute[j]] = [newRoute[j], newRoute[i]];

    return newRoute;
  };

  // Helper function to calculate acceptance probability
  const calculateAcceptanceProbability = (
    currentScore: number,
    newScore: number,
    temperature: number
  ): number => {
    // If new solution is better, always accept
    if (newScore > currentScore) return 1.0;

    // Otherwise, accept with a probability that decreases with temperature
    const scoreDiff = newScore - currentScore;
    return Math.exp(scoreDiff / temperature);
  };

  // Run Simulated Annealing algorithm
  let currentRoute = createInitialSolution();
  let currentEvaluation = evaluateRoute(currentRoute);
  let currentScore = currentEvaluation.score;

  let bestRoute = [...currentRoute];
  let bestScore = currentScore;
  let bestEvaluation = currentEvaluation;

  let temperature = initialTemperature;
  let iteration = 0;

  // Main SA loop
  while (temperature > stoppingTemperature && iteration < maxIterations) {
    // Generate neighbor solution
    const newRoute = generateNeighbor(currentRoute);
    const newEvaluation = evaluateRoute(newRoute);
    const newScore = newEvaluation.score;

    // Decide whether to accept new solution
    const acceptanceProbability = calculateAcceptanceProbability(
      currentScore,
      newScore,
      temperature
    );

    if (Math.random() < acceptanceProbability) {
      currentRoute = [...newRoute];
      currentScore = newScore;
      currentEvaluation = newEvaluation;

      // Update best solution if new solution is better
      if (newScore > bestScore) {
        bestRoute = [...newRoute];
        bestScore = newScore;
        bestEvaluation = newEvaluation;
      }
    }

    // Cool down
    temperature *= coolingRate;
    iteration++;
  }

  // Calculate total distance and duration of best route
  let totalDistance = 0;
  let totalDuration = 0;

  for (let i = 0; i < bestRoute.length - 1; i++) {
    const fromIdx = bestRoute[i];
    const toIdx = bestRoute[i + 1];

    totalDistance += distanceMatrix[fromIdx][toIdx];
    totalDuration += durationMatrix[fromIdx][toIdx];

    // Add visit duration except for hotel/starting point at end
    if (!(hasStartingPoint && returnToStart && i === bestRoute.length - 2)) {
      totalDuration += points[toIdx].visitDuration * 60; // Convert minutes to seconds
    }
  }

  // Map route indices back to place IDs and names
  const routePlaceIds = bestRoute.map((index) => points[index].id);
  const routePlaceNames = bestRoute.map((index) => points[index].name);

  const endTime = performance.now();
  const executionTime = endTime - startTime;

  return {
    route: routePlaceNames,
    placeIds: routePlaceIds,
    routeIndices: bestRoute,
    totalDistance,
    totalDuration,
    totalScore: bestScore,
    timeWarnings: bestEvaluation.timeWarnings,
    timeline: bestEvaluation.timeline,
    visitedPointsCount: new Set(bestRoute).size,
    executionTime,
  };
};

/**
 * Main route optimization function that selects the best algorithm
 * based on options provided
 *
 * @param points - Array of locations to visit
 * @param dayDate - Date for checking opening hours
 * @param options - Optimization options
 * @returns Optimized route result
 */
const optimizeRoute = async (
  points: RoutePoint[],
  dayDate: Date = new Date(),
  options: OptimizationOptions = {}
): Promise<OptimizationResult> => {
  return await optimizeWithSimulatedAnnealing(points, dayDate, options);
};

// Export all functions using module.exports (CommonJS style)
module.exports = {
  calculateRoute,
  buildDistanceMatrices,
  optimizeWithSimulatedAnnealing,
  optimizeRoute,
  timeToMinutes,
  minutesToTime
};
