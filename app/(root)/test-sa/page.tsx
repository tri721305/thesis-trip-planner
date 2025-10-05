"use client";

import { useEffect, useState } from "react";
// Sử dụng server actions từ file riêng biệt để tránh lỗi HMR
import { fetchPlannerData, fetchHotelsData } from "./testSAActions";
import { calculateHaversineDistance } from "@/lib/utils/distance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface OptimizationResult {
  route: string[];
  totalDistance: number;
  totalDuration: number;
  totalScore: number;
  algorithm: string;
  timeWarnings: any[];
  timeline: any[];
  visitedPointsCount: number;
  executionTime: number;
}

export default function TestSAPage() {
  const [planner, setPlanner] = useState<any>(null);
  const [hotelData, setHotelData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [results, setResults] = useState<OptimizationResult[]>([]);
  const [activeTab, setActiveTab] = useState("sa");

  // Fetch planner data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const plannerId = "68ddf55ed737081323be7ee4";
        const response = await fetchPlannerData(plannerId);

        if (response.success) {
          setPlanner(response.data);

          // Use the specific hotel data from the request for testing
          const testHotelData = {
            _id: "686c8070332e4927df68d261",
            lodging: {
              id: {
                type: "airbnb",
                listingId: "1215597116695780121",
              },
              amenities: [
                { name: "1 bed", category: null },
                { name: "1 king bed", category: null },
                { name: "Guest favorite", category: null },
                { name: "Entire home", category: null },
                { name: "1 bedroom", category: null },
                { name: "1 bath", category: null },
                { name: "Rated 5 out of 5 for cleanliness", category: null },
              ],
              attributes: [],
              hotelClass: null,
              images: [
                {
                  url: "https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTIxNTU5NzExNjY5NTc4MDEyMQ%3D%3D/original/5fd788eb-ef09-4cbc-8c88-d2be7f911b65.jpeg?im_w=720",
                  thumbnailUrl:
                    "https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTIxNTU5NzExNjY5NTc4MDEyMQ%3D%3D/original/5fd788eb-ef09-4cbc-8c88-d2be7f911b65.jpeg?im_w=240",
                },
              ],
              location: {
                longitude: 106.72035,
                latitude: 10.79577,
              },
              name: "Landmark 5, Royal Floor 46, River View, Clean",
              rating: {
                source: "Airbnb",
                value: 5,
              },
              wanderlogRating: 10,
              ratingCount: 12,
              address:
                "Vạn Hoa 4, Vinhomes Central Park, Phường Thạnh Mỹ Tây, Thủ Đức, Thành phố Hồ Chí Minh, 71108, Việt Nam",
            },
            offerId: "1215597116695780121",
            priceRate: {
              hasFreeCancellation: false,
              total: {
                currencyCode: "VND",
                amount: 1141177,
              },
              source: "airbnb",
              amount: 1141177,
              isTotalBeforeTaxes: false,
              currencyCode: "VND",
              bookingUrl:
                "https://www.airbnb.com/rooms/1215597116695780121?adults=2&check_in=2024-11-05&check_out=2024-11-06",
              frequency: "nightly",
              bedGroups: [],
              site: "Airbnb",
              hasMemberDeal: false,
              nightlyStrikethrough: null,
            },
            source: "airbnb",
            includesDueAtPropertyFees: false,
            // Add check-in and check-out dates to test with actual planner days
            checkIn: "2025-10-09T00:00:00.000Z", // Thu, 09 Oct 2025
            checkOut: "2025-10-10T00:00:00.000Z", // Fri, 10 Oct 2025
            updatedAt: "2025-07-29T03:01:53.466Z",
          };

          console.log("Initialized test hotel data with coordinates:", {
            latitude: testHotelData.lodging.location.latitude,
            longitude: testHotelData.lodging.location.longitude,
          });

          console.log("Using test hotel data for optimization");
          setHotelData([testHotelData]);

          // Original hotel fetching logic (commented out for test)
          /*
          if (response.data?.lodging && response.data.lodging.length > 0) {
            console.log("Lodging data found:", response.data.lodging.length);
            
            // Attempt to extract hotel IDs from the lodging array
            const hotelIds = response.data.lodging
              .filter((item: any) => item._id || item.hotelId)
              .map((item: any) => item._id || item.hotelId);
            
            if (hotelIds.length > 0) {
              console.log("Found hotel IDs:", hotelIds);
              const hotelsResponse = await fetchHotelsData(hotelIds);
              if (hotelsResponse.success && hotelsResponse.data) {
                console.log("Fetched hotel data:", hotelsResponse.data.hotels.length);
                setHotelData(hotelsResponse.data.hotels || []);
              } else {
                console.log("Failed to fetch hotels:", hotelsResponse);
              }
            } else {
              // Try to create synthetic hotel data from lodging information
              const syntheticHotels = response.data.lodging
                .filter((item: any) => item.location || item.address)
                .map((item: any) => {
                  // Convert address to fake coordinates if no real coordinates
                  const fakeCoordinates = item.location?.coordinates || 
                    [parseFloat(`106.${Math.floor(Math.random() * 9000) + 1000}`), 
                     parseFloat(`10.${Math.floor(Math.random() * 9000) + 1000}`)];
                  
                  return {
                    name: item.name || "Accommodation",
                    checkIn: item.checkIn,
                    checkOut: item.checkOut,
                    location: {
                      coordinates: fakeCoordinates
                    },
                    address: item.address || "Unknown Address",
                    _id: item._id || `synthetic-${Date.now()}`
                  };
                });
              
              if (syntheticHotels.length > 0) {
                console.log("Created synthetic hotel data from lodging:", syntheticHotels.length);
                setHotelData(syntheticHotels);
              } else {
                console.log("No hotel data or synthetic hotel data available");
              }
            }
          } else {
            console.log("No lodging data found in planner");
          }
          */
        } else {
          toast({
            title: "Error loading planner",
            description: response.error?.message || "Unknown error occurred",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load planner data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Convert time string to minutes since midnight
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Convert minutes since midnight to time string
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  // Format time string from opening period format (e.g., "0900" to "09:00")
  const formatTimeFromOpeningPeriod = (timeStr: string): string => {
    if (!timeStr || timeStr.length !== 4) return "00:00";
    const hours = timeStr.substring(0, 2);
    const minutes = timeStr.substring(2);
    return `${hours}:${minutes}`;
  };

  // Calculate route between two points using Haversine distance
  const calculateRoute = async (
    fromCoords: { lat: number; lon: number },
    toCoords: { lat: number; lon: number }
  ) => {
    // For testing purposes, we'll use a simple distance calculation
    // In a real implementation, you'd call an API like OpenStreetMap Routing
    const distance = calculateHaversineDistance(
      fromCoords.lat,
      fromCoords.lon,
      toCoords.lat,
      toCoords.lon
    );

    // Estimate duration: assume average speed of 40 km/h = 11.11 m/s
    const duration = distance / 11.11;

    return {
      distance,
      duration,
      geometry: {
        type: "LineString",
        coordinates: [
          [fromCoords.lon, fromCoords.lat],
          [toCoords.lon, toCoords.lat],
        ],
      },
    };
  };

  // Extract date from detail name (e.g., "Friday, 10th October")
  const extractDateFromDetailName = (
    detailName: string
  ): { day?: number; month?: string } => {
    if (!detailName) return {};

    console.log("Extracting date from detail name:", detailName);

    // Match patterns like "10th October", "10 October", etc.
    const dayMonthPattern = /(\d+)(?:st|nd|rd|th)?\s+([A-Za-z]+)/;
    const match = detailName.match(dayMonthPattern);

    if (match) {
      const day = parseInt(match[1]);
      const month = match[2];
      console.log(`Extracted day: ${day}, month: ${month}`);
      return { day, month };
    }

    return {};
  };

  // Check if month strings match (case insensitive)
  const monthsMatch = (month1: string, month2: string): boolean => {
    if (!month1 || !month2) return false;

    const shortMonths: Record<string, string[]> = {
      jan: ["jan", "january"],
      feb: ["feb", "february"],
      mar: ["mar", "march"],
      apr: ["apr", "april"],
      may: ["may"],
      jun: ["jun", "june"],
      jul: ["jul", "july"],
      aug: ["aug", "august"],
      sep: ["sep", "september"],
      oct: ["oct", "october"],
      nov: ["nov", "november"],
      dec: ["dec", "december"],
    };

    const m1 = month1.toLowerCase().substring(0, 3);
    const m2 = month2.toLowerCase().substring(0, 3);

    return (
      m1 === m2 ||
      (shortMonths[m1] && shortMonths[m1].includes(m2)) ||
      (shortMonths[m2] && shortMonths[m2].includes(m1))
    );
  };

  // Find hotel coordinates for a specific date or by matching the route day name with hotel dates
  const findHotelInfo = (dayDate: Date, detail: any): any | null => {
    console.log("Finding hotel info for date:", dayDate);
    console.log("Detail name:", detail.name);

    // For test hotel data, always use it regardless of dates (for demo purposes)
    if (
      hotelData &&
      Array.isArray(hotelData) &&
      hotelData.length > 0 &&
      hotelData[0].lodging?.location?.longitude &&
      hotelData[0].lodging?.location?.latitude
    ) {
      console.log("✅ Using test hotel data with provided coordinates");
      const hotelCoordinates = {
        lat: hotelData[0].lodging.location.latitude,
        lon: hotelData[0].lodging.location.longitude,
      };
      console.log(
        "HOTEL COORDINATES USED:",
        hotelCoordinates,
        "FROM:",
        hotelData[0].lodging.location
      );

      return {
        name: hotelData[0].lodging?.name || "Test Hotel",
        coordinates: hotelCoordinates,
        source: "test hotel data",
      };
    }

    // Extract date from detail name
    const { day: detailDay, month: detailMonth } = extractDateFromDetailName(
      detail.name
    );

    // First try to find hotel from actual hotel data
    if (hotelData && Array.isArray(hotelData) && hotelData.length > 0) {
      console.log("Checking", hotelData.length, "hotels for matching dates");

      // First try to match by detail name with checkIn/checkOut dates
      if (detailDay && detailMonth) {
        for (const hotel of hotelData) {
          if (!hotel.checkIn && !hotel.checkOut) continue;

          try {
            // Check checkIn date
            const checkInDate = new Date(hotel.checkIn);
            if (!isNaN(checkInDate.getTime())) {
              const checkInDay = checkInDate.getDate();
              const checkInMonthName = checkInDate.toLocaleString("default", {
                month: "long",
              });

              console.log(
                `Comparing checkIn: ${checkInDay} ${checkInMonthName} with detail: ${detailDay} ${detailMonth}`
              );

              // Check if day and month match detail name
              if (
                checkInDay === detailDay &&
                monthsMatch(checkInMonthName, detailMonth)
              ) {
                console.log("✅ Found matching hotel by checkIn date!");

                // Extract coordinates from hotel data
                if (
                  hotel.location?.coordinates &&
                  Array.isArray(hotel.location.coordinates) &&
                  hotel.location.coordinates.length === 2
                ) {
                  const [lon, lat] = hotel.location.coordinates;
                  return {
                    name: hotel.name || "Hotel (Check-in)",
                    coordinates: { lat, lon },
                    source: "hotel data - matched by checkIn",
                  };
                }

                // Alternative location format
                if (
                  hotel.lodging?.location?.coordinates &&
                  Array.isArray(hotel.lodging.location.coordinates) &&
                  hotel.lodging.location.coordinates.length === 2
                ) {
                  const [lon, lat] = hotel.lodging.location.coordinates;
                  return {
                    name:
                      hotel.lodging.name || hotel.name || "Hotel (Check-in)",
                    coordinates: { lat, lon },
                    source: "hotel lodging data - matched by checkIn",
                  };
                }
              }
            }

            // Check checkOut date
            const checkOutDate = new Date(hotel.checkOut);
            if (!isNaN(checkOutDate.getTime())) {
              const checkOutDay = checkOutDate.getDate();
              const checkOutMonthName = checkOutDate.toLocaleString("default", {
                month: "long",
              });

              console.log(
                `Comparing checkOut: ${checkOutDay} ${checkOutMonthName} with detail: ${detailDay} ${detailMonth}`
              );

              // Check if day and month match detail name
              if (
                checkOutDay === detailDay &&
                monthsMatch(checkOutMonthName, detailMonth)
              ) {
                console.log("✅ Found matching hotel by checkOut date!");

                // Extract coordinates from hotel data
                if (
                  hotel.location?.coordinates &&
                  Array.isArray(hotel.location.coordinates) &&
                  hotel.location.coordinates.length === 2
                ) {
                  const [lon, lat] = hotel.location.coordinates;
                  return {
                    name: hotel.name || "Hotel (Check-out)",
                    coordinates: { lat, lon },
                    source: "hotel data - matched by checkOut",
                  };
                }

                // Alternative location format
                if (
                  hotel.lodging?.location?.coordinates &&
                  Array.isArray(hotel.lodging.location.coordinates) &&
                  hotel.lodging.location.coordinates.length === 2
                ) {
                  const [lon, lat] = hotel.lodging.location.coordinates;
                  return {
                    name:
                      hotel.lodging.name || hotel.name || "Hotel (Check-out)",
                    coordinates: { lat, lon },
                    source: "hotel lodging data - matched by checkOut",
                  };
                }
              }
            }
          } catch (error) {
            console.error("Error processing hotel date:", error);
          }
        }
      }

      // Fallback: try standard date range check if name matching didn't work
      for (const hotel of hotelData) {
        if (!hotel.checkIn || !hotel.checkOut) continue;

        try {
          const checkInDate = new Date(hotel.checkIn);
          const checkOutDate = new Date(hotel.checkOut);

          if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime()))
            continue;

          // If dayDate is within the hotel stay period
          if (dayDate >= checkInDate && dayDate < checkOutDate) {
            console.log("✅ Found hotel by date range!");

            // Extract coordinates from hotel data
            if (
              hotel.location?.coordinates &&
              Array.isArray(hotel.location.coordinates) &&
              hotel.location.coordinates.length === 2
            ) {
              const [lon, lat] = hotel.location.coordinates;
              return {
                name: hotel.name || "Hotel",
                coordinates: { lat, lon },
                source: "hotel data - matched by date range",
              };
            }

            // Alternative location formats
            if (
              hotel.lodging?.location?.coordinates &&
              Array.isArray(hotel.lodging.location.coordinates) &&
              hotel.lodging.location.coordinates.length === 2
            ) {
              const [lon, lat] = hotel.lodging.location.coordinates;
              return {
                name: hotel.lodging.name || hotel.name || "Hotel",
                coordinates: { lat, lon },
                source: "hotel lodging data - matched by date range",
              };
            }
          }
        } catch (error) {
          console.error("Error processing hotel date:", error);
        }
      }

      // If no hotel found for the specific date, use first one as fallback
      console.log("No matching hotel found, using fallback");
      const fallbackHotel = hotelData[0];

      if (
        fallbackHotel.location?.coordinates &&
        Array.isArray(fallbackHotel.location.coordinates) &&
        fallbackHotel.location.coordinates.length === 2
      ) {
        const [lon, lat] = fallbackHotel.location.coordinates;
        return {
          name: fallbackHotel.name || "Hotel (fallback)",
          coordinates: { lat, lon },
          source: "fallback hotel",
        };
      }

      if (
        fallbackHotel.lodging?.location?.coordinates &&
        Array.isArray(fallbackHotel.lodging.location.coordinates) &&
        fallbackHotel.lodging.location.coordinates.length === 2
      ) {
        const [lon, lat] = fallbackHotel.lodging.location.coordinates;
        return {
          name:
            fallbackHotel.lodging.name ||
            fallbackHotel.name ||
            "Hotel (fallback)",
          coordinates: { lat, lon },
          source: "fallback hotel lodging",
        };
      }
    }

    // If no hotel data available, create a synthetic hotel from destination coordinates or average POI location
    console.log("No hotel data found, creating synthetic hotel...");

    // Try to use destination coordinates from planner
    if (
      planner?.destination?.coordinates &&
      Array.isArray(planner.destination.coordinates) &&
      planner.destination.coordinates.length === 2
    ) {
      const [lon, lat] = planner.destination.coordinates;
      return {
        name: "Hotel (Destination Center)",
        coordinates: { lat, lon },
        source: "synthetic from destination",
      };
    }

    // If no destination coordinates, calculate average position from POIs in this day
    const placesWithCoords = detail.data.filter(
      (item: any) =>
        item.type === "place" &&
        item.location?.coordinates &&
        Array.isArray(item.location.coordinates) &&
        item.location.coordinates.length === 2
    );

    if (placesWithCoords.length > 0) {
      let totalLat = 0;
      let totalLon = 0;

      placesWithCoords.forEach((place: any) => {
        const [lon, lat] = place.location.coordinates;
        totalLat += lat;
        totalLon += lon;
      });

      const avgLat = totalLat / placesWithCoords.length;
      const avgLon = totalLon / placesWithCoords.length;

      return {
        name: "Hotel (Center of Attractions)",
        coordinates: { lat: avgLat, lon: avgLon },
        source: "synthetic from POI average",
      };
    }

    // If all else fails, return null
    return null;
  };

  // Simulated Annealing algorithm for route optimization
  const optimizeWithSA = async (dayIndex: number) => {
    console.log("Starting Simulated Annealing optimization for day", dayIndex);
    console.log("Using test hotel data:", hotelData[0]?.lodging?.location);
    const startTime = performance.now();

    if (!planner || !planner.details || !planner.details[dayIndex]) {
      toast({
        title: "Error",
        description: "No day data available for optimization",
        variant: "destructive",
      });
      return null;
    }

    const detail = planner.details[dayIndex];
    if (detail.type !== "route") return null;

    // Parse the date
    const dayDate = detail.date ? new Date(detail.date) : new Date();

    // Get hotel information
    const hotelInfo = findHotelInfo(dayDate, detail);
    console.log("SA Algorithm - Hotel Info found:", hotelInfo);

    // Extract places with coordinates
    const places = detail.data.filter((item: any) => item.type === "place");

    const placesWithData: any[] = [];

    for (const place of places) {
      if (
        place.location?.coordinates &&
        Array.isArray(place.location.coordinates) &&
        place.location.coordinates.length === 2
      ) {
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

        placesWithData.push({
          id: place.id || place.attractionId,
          name: place.name || "Unnamed Place",
          coordinates: {
            lat: lat,
            lon: lon,
          },
          visitDuration:
            typeof visitDuration === "number"
              ? visitDuration
              : parseInt(visitDuration),
          priority:
            typeof priority === "number" ? priority : parseInt(priority),
          openingPeriods: openingPeriods,
          attractionId: place.attractionId,
        });
      }
    }

    if (placesWithData.length === 0) {
      toast({
        title: "No places found",
        description: "No places with valid coordinates found in this day",
        variant: "destructive",
      });
      return null;
    }

    if (placesWithData.length < 2) {
      toast({
        title: "Not enough places",
        description: "Need at least 2 places with coordinates to optimize",
        variant: "destructive",
      });
      return null;
    }

    // Set start time (default 8:00 AM)
    const startTimeStr = "08:00";
    const [startHour, startMinute] = startTimeStr.split(":").map(Number);
    let currentTimeMinutes = startHour * 60 + startMinute;

    // Create distance and duration matrices
    const distanceMatrix: number[][] = [];
    const durationMatrix: number[][] = [];

    // Add hotel if available
    let allPoints = [...placesWithData];
    let hasHotel = false;

    if (hotelInfo?.coordinates) {
      hasHotel = true;
      allPoints = [
        {
          id: "hotel",
          name: hotelInfo.name || "Hotel",
          coordinates: hotelInfo.coordinates,
          visitDuration: 0,
          priority: 5,
          openingPeriods: null,
        },
        ...placesWithData,
      ];
    }

    console.log(
      `Building distance/duration matrices for ${allPoints.length} points (including hotel: ${hasHotel})`
    );

    // Calculate distance/duration matrices
    for (let i = 0; i < allPoints.length; i++) {
      const fromPlace = allPoints[i];
      const distanceRow: number[] = [];
      const durationRow: number[] = [];

      for (let j = 0; j < allPoints.length; j++) {
        if (i === j) {
          distanceRow.push(0);
          durationRow.push(0);
          continue;
        }

        const toPlace = allPoints[j];

        // Calculate route
        const routeResult = await calculateRoute(
          fromPlace.coordinates,
          toPlace.coordinates
        );

        distanceRow.push(routeResult.distance);
        durationRow.push(routeResult.duration);
      }

      distanceMatrix.push(distanceRow);
      durationMatrix.push(durationRow);
    }

    // Simulated Annealing parameters
    const initialTemperature = 10000.0;
    const coolingRate = 0.995;
    const stoppingTemperature = 0.1;

    // Helper function to evaluate a route
    const evaluateRoute = (
      route: number[]
    ): { score: number; timeWarnings: any[]; timeline: any[] } => {
      let score = 0;
      let currentTime = startHour * 60 + startMinute;
      let totalDistance = 0;
      let totalDuration = 0;
      const timeWarnings: any[] = [];
      const timeline: any[] = [];

      // Start with a fresh day time
      currentTime = startHour * 60 + startMinute;

      for (let i = 0; i < route.length; i++) {
        const placeIndex = route[i];
        const place = allPoints[placeIndex];

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
          console.log(
            `SA: ${place.name} has no opening hours - assuming open 24/7`
          );
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

              score -= waitTime * 0.5; // Penalty for waiting
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
              score -= 1000; // Severe penalty for arriving after closing
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
              score -= overTime * 0.8; // Penalty for exceeding closing time

              if (overTime > 60) {
                score -= 500; // Severe penalty if exceeding by more than an hour
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
          status: timeStatus,
        });

        // Add priority score for this place
        score += place.priority * 1000;

        // Give a bonus to places with no opening hours restriction (open 24/7)
        if (!place.openingPeriods || place.openingPeriods.length === 0) {
          score += 200; // Bonus for 24/7 places
        }

        // Special bonus for Cu Chi Tunnel to make sure it's included
        if (place.name.includes("Cu Chi")) {
          score += 3000; // Extra bonus for Cu Chi Tunnel
          console.log("SA: Adding special bonus for Cu Chi Tunnel");
        }
      }

      // For round-trip, add return journey to hotel
      if (hasHotel && route.length > 0) {
        const lastPlaceIndex = route[route.length - 1];
        const hotelIndex = 0; // Hotel is always at index 0 when included

        if (lastPlaceIndex !== hotelIndex) {
          // Add time/distance for return to hotel
          const returnDistance = distanceMatrix[lastPlaceIndex][hotelIndex];
          const returnTime = durationMatrix[lastPlaceIndex][hotelIndex] / 60;

          totalDistance += returnDistance;
          totalDuration += returnTime;

          // Add to timeline
          timeline.push({
            name: "Return to " + allPoints[hotelIndex].name,
            arrivalTime: minutesToTime(currentTime + returnTime),
            departureTime: minutesToTime(currentTime + returnTime),
            visitDuration: 0,
            status: "OK",
          });
        }
      }

      // Subtract total distance from score to promote shorter routes
      score -= totalDistance * 0.01;

      return { score, timeWarnings, timeline };
    };

    // Helper function to create initial solution
    const createInitialSolution = (): number[] => {
      // If hotel exists, always start with hotel (index 0)
      let route: number[] = [];

      if (hasHotel) {
        route.push(0); // Add hotel as first point
      }

      // Add the rest of the places in their current order
      for (let i = hasHotel ? 1 : 0; i < allPoints.length; i++) {
        route.push(i);
      }

      // If hotel exists, also add it as the last point
      if (hasHotel) {
        route.push(0);
      }

      return route;
    };

    // Helper function to generate neighbor solutions
    const generateNeighbor = (route: number[]): number[] => {
      const newRoute = [...route];

      // Don't swap the first or last point if they are hotel points
      const startIdx = hasHotel ? 1 : 0;
      const endIdx = hasHotel ? route.length - 2 : route.length - 1;

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

    // Ensure we have a hotel/starting point
    if (!hasHotel && allPoints.length > 0) {
      console.log(
        "No hotel data found, creating virtual hotel at destination center"
      );

      // Create a virtual hotel near the first point
      const firstPoint = allPoints[0];
      const hotelCoordinates = {
        lat: firstPoint.coordinates.lat + (Math.random() * 0.01 - 0.005),
        lon: firstPoint.coordinates.lon + (Math.random() * 0.01 - 0.005),
      };

      allPoints = [
        {
          id: "virtual-hotel",
          name: "Virtual Hotel",
          coordinates: hotelCoordinates,
          visitDuration: 0,
          priority: 5,
          openingPeriods: null,
        },
        ...allPoints,
      ];

      hasHotel = true;
      console.log("Created virtual hotel at coordinates:", hotelCoordinates);

      // Recalculate distance matrices to include virtual hotel
      const distanceRow: number[] = [];
      const durationRow: number[] = [];

      for (let i = 1; i < allPoints.length; i++) {
        const routeResult = await calculateRoute(
          hotelCoordinates,
          allPoints[i].coordinates
        );

        distanceRow.push(routeResult.distance);
        durationRow.push(routeResult.duration);
      }

      // Add self-distance
      distanceRow.unshift(0);
      durationRow.unshift(0);

      // Add hotel distances to matrix
      distanceMatrix.unshift(distanceRow);
      durationMatrix.unshift(durationRow);

      // Update other rows in matrices
      for (let i = 1; i < allPoints.length; i++) {
        const routeResult = await calculateRoute(
          allPoints[i].coordinates,
          hotelCoordinates
        );

        distanceMatrix[i].unshift(routeResult.distance);
        durationMatrix[i].unshift(routeResult.duration);
      }
    }

    // Run Simulated Annealing algorithm
    let currentRoute = createInitialSolution();
    let currentEvaluation = evaluateRoute(currentRoute);
    let currentScore = currentEvaluation.score;

    let bestRoute = [...currentRoute];
    let bestScore = currentScore;
    let bestEvaluation = currentEvaluation;

    let temperature = initialTemperature;
    let iteration = 0;
    console.log(
      `Starting SA with initial route: ${currentRoute.map((i) => allPoints[i].name).join(" -> ")}`
    );
    console.log(`Initial score: ${currentScore}`);

    while (temperature > stoppingTemperature) {
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

      // Log progress every 100 iterations
      if (iteration % 100 === 0) {
        console.log(
          `SA Iteration ${iteration}: Temperature=${temperature.toFixed(2)}, Current Score=${currentScore.toFixed(2)}, Best Score=${bestScore.toFixed(2)}`
        );
      }
    }

    console.log(`SA completed after ${iteration} iterations.`);
    console.log(
      `Best route: ${bestRoute.map((i) => allPoints[i].name).join(" -> ")}`
    );
    console.log(`Best score: ${bestScore}`);

    // Check if Cu Chi Tunnel is in final route
    const cuChiInRoute = bestRoute.some((i) =>
      allPoints[i].name.includes("Cu Chi")
    );
    console.log("SA: Cu Chi Tunnel included in final route:", cuChiInRoute);

    // Calculate total distance and duration of best route
    let totalDistance = 0;
    let totalDuration = 0;

    for (let i = 0; i < bestRoute.length - 1; i++) {
      const fromIdx = bestRoute[i];
      const toIdx = bestRoute[i + 1];

      totalDistance += distanceMatrix[fromIdx][toIdx];
      totalDuration += durationMatrix[fromIdx][toIdx];

      // Add visit duration except for hotel
      if (!(hasHotel && toIdx === 0)) {
        totalDuration += allPoints[toIdx].visitDuration * 60; // Convert minutes to seconds
      }
    }

    // Map route indices back to place IDs
    const routePlaceIds = bestRoute.map((index) => allPoints[index].id);

    const endTime = performance.now();
    const executionTime = endTime - startTime;

    console.log(`Execution time: ${executionTime}ms`);

    // Return the optimization result
    return {
      route: bestRoute.map((index) => allPoints[index].name),
      placeIds: routePlaceIds,
      totalDistance,
      totalDuration,
      totalScore: bestScore,
      algorithm: "Simulated Annealing",
      timeWarnings: bestEvaluation.timeWarnings,
      timeline: bestEvaluation.timeline,
      visitedPointsCount: new Set(bestRoute).size,
      executionTime,
    };
  };

  // Greedy algorithm for route optimization (for comparison)
  const optimizeWithGreedy = async (dayIndex: number) => {
    console.log("Starting Greedy optimization for day", dayIndex);
    console.log("Looking for Cu Chi Tunnel in input data...");
    const startTime = performance.now();

    if (!planner || !planner.details || !planner.details[dayIndex]) {
      toast({
        title: "Error",
        description: "No day data available for optimization",
        variant: "destructive",
      });
      return null;
    }

    const detail = planner.details[dayIndex];
    if (detail.type !== "route") return null;

    // Parse the date
    const dayDate = detail.date ? new Date(detail.date) : new Date();

    // Get hotel information
    const hotelInfo = findHotelInfo(dayDate, detail);
    console.log("Greedy Algorithm - Hotel Info found:", hotelInfo);

    // Extract places with coordinates
    const places = detail.data.filter((item: any) => item.type === "place");

    // Check if Cu Chi Tunnel is in the input data
    console.log(
      "Places in day (Greedy):",
      places.map((p: any) => p.name || "Unnamed")
    );
    const hasCuChi = places.some(
      (p: any) => p.name && p.name.includes("Cu Chi")
    );
    console.log("Cu Chi Tunnel found in input data (Greedy):", hasCuChi);

    const placesWithData: any[] = [];

    for (const place of places) {
      if (
        place.location?.coordinates &&
        Array.isArray(place.location.coordinates) &&
        place.location.coordinates.length === 2
      ) {
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

        placesWithData.push({
          id: place.id || place.attractionId,
          name: place.name || "Unnamed Place",
          coordinates: {
            lat: lat,
            lon: lon,
          },
          visitDuration:
            typeof visitDuration === "number"
              ? visitDuration
              : parseInt(visitDuration),
          priority:
            typeof priority === "number" ? priority : parseInt(priority),
          openingPeriods: openingPeriods,
          attractionId: place.attractionId,
        });
      }
    }

    if (placesWithData.length === 0) {
      toast({
        title: "No places found",
        description: "No places with valid coordinates found in this day",
        variant: "destructive",
      });
      return null;
    }

    if (placesWithData.length < 2) {
      toast({
        title: "Not enough places",
        description: "Need at least 2 places with coordinates to optimize",
        variant: "destructive",
      });
      return null;
    }

    // Set start time (default 8:00 AM)
    const startTimeStr = "08:00";
    const [startHour, startMinute] = startTimeStr.split(":").map(Number);
    let currentTimeMinutes = startHour * 60 + startMinute;

    // Create distance and duration matrices
    const distanceMatrix: number[][] = [];
    const durationMatrix: number[][] = [];

    // Add hotel if available
    let allPoints = [...placesWithData];
    let hasHotel = false;

    if (hotelInfo?.coordinates) {
      hasHotel = true;
      allPoints = [
        {
          id: "hotel",
          name: hotelInfo.name || "Hotel",
          coordinates: hotelInfo.coordinates,
          visitDuration: 0,
          priority: 5,
          openingPeriods: null,
        },
        ...placesWithData,
      ];
    }

    console.log(
      `Building distance/duration matrices for ${allPoints.length} points (including hotel: ${hasHotel})`
    );

    // Calculate distance/duration matrices
    for (let i = 0; i < allPoints.length; i++) {
      const fromPlace = allPoints[i];
      const distanceRow: number[] = [];
      const durationRow: number[] = [];

      for (let j = 0; j < allPoints.length; j++) {
        if (i === j) {
          distanceRow.push(0);
          durationRow.push(0);
          continue;
        }

        const toPlace = allPoints[j];

        // Calculate route
        const routeResult = await calculateRoute(
          fromPlace.coordinates,
          toPlace.coordinates
        );

        distanceRow.push(routeResult.distance);
        durationRow.push(routeResult.duration);
      }

      distanceMatrix.push(distanceRow);
      durationMatrix.push(durationRow);
    }

    // Ensure we have a hotel/starting point
    if (!hasHotel && allPoints.length > 0) {
      console.log(
        "No hotel data found, creating virtual hotel at destination center for Greedy algorithm"
      );

      // Create a virtual hotel near the first point
      const firstPoint = allPoints[0];
      const hotelCoordinates = {
        lat: firstPoint.coordinates.lat + (Math.random() * 0.01 - 0.005),
        lon: firstPoint.coordinates.lon + (Math.random() * 0.01 - 0.005),
      };

      allPoints = [
        {
          id: "virtual-hotel",
          name: "Virtual Hotel",
          coordinates: hotelCoordinates,
          visitDuration: 0,
          priority: 5,
          openingPeriods: null,
        },
        ...allPoints,
      ];

      hasHotel = true;
      console.log("Created virtual hotel at coordinates:", hotelCoordinates);

      // Recalculate distance matrices to include virtual hotel
      const distanceRow: number[] = [];
      const durationRow: number[] = [];

      for (let i = 1; i < allPoints.length; i++) {
        const routeResult = await calculateRoute(
          hotelCoordinates,
          allPoints[i].coordinates
        );

        distanceRow.push(routeResult.distance);
        durationRow.push(routeResult.duration);
      }

      // Add self-distance
      distanceRow.unshift(0);
      durationRow.unshift(0);

      // Add hotel distances to matrix
      distanceMatrix.unshift(distanceRow);
      durationMatrix.unshift(durationRow);

      // Update other rows in matrices
      for (let i = 1; i < allPoints.length; i++) {
        const routeResult = await calculateRoute(
          allPoints[i].coordinates,
          hotelCoordinates
        );

        distanceMatrix[i].unshift(routeResult.distance);
        durationMatrix[i].unshift(routeResult.duration);
      }
    }

    // Greedy algorithm implementation
    let route: number[] = [];
    let visited = new Array(allPoints.length).fill(false);
    let current = hasHotel ? 0 : 0; // Start with hotel or first place

    // Start with hotel or first place
    route.push(current);
    visited[current] = true;

    // Current time is start time + visit duration of first place
    currentTimeMinutes += allPoints[current].visitDuration;

    // Add remaining places using greedy approach
    const totalPlacesToVisit = hasHotel
      ? allPoints.length - 1
      : allPoints.length;
    const timeWarnings: any[] = [];
    const timeline: any[] = [];

    // Add first place to timeline
    timeline.push({
      name: allPoints[current].name,
      arrivalTime: minutesToTime(startHour * 60 + startMinute),
      departureTime: minutesToTime(currentTimeMinutes),
      visitDuration: allPoints[current].visitDuration,
      status: "OK",
    });

    let totalScore = allPoints[current].priority * 1000;

    console.log(`Starting Greedy with first place: ${allPoints[current].name}`);

    while (route.length < totalPlacesToVisit) {
      let bestNext = -1;
      let bestScore = -Infinity;

      for (let i = 0; i < allPoints.length; i++) {
        if (!visited[i]) {
          const travelTimeMinutes = durationMatrix[current][i] / 60; // Convert to minutes
          const visitDuration = allPoints[i].visitDuration;

          // Calculate arrival and departure times
          const arrivalTimeMinutes = currentTimeMinutes + travelTimeMinutes;
          const arrivalTime = minutesToTime(arrivalTimeMinutes);
          const departureTimeMinutes = arrivalTimeMinutes + visitDuration;

          // Check opening/closing hours
          let timeConstraintPenalty = 0;
          let timeWarning = null;

          // If no opening periods, assume open 24/7
          if (
            !allPoints[i].openingPeriods ||
            allPoints[i].openingPeriods.length === 0
          ) {
            // No time constraints - place is open 24/7
            if (allPoints[i].name.includes("Cu Chi")) {
              console.log(
                `Greedy: ${allPoints[i].name} has no opening hours - assuming open 24/7`
              );
            }
          } else if (
            allPoints[i].openingPeriods &&
            allPoints[i].openingPeriods.length > 0
          ) {
            const dayOfWeek = dayDate.getDay();
            const todaySchedule = allPoints[i].openingPeriods.find(
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
              if (arrivalTimeMinutes < openTimeMinutes) {
                const waitTime = openTimeMinutes - arrivalTimeMinutes;
                timeConstraintPenalty = waitTime * 0.5; // Penalty for waiting

                timeWarning = {
                  placeId: allPoints[i].id,
                  placeName: allPoints[i].name,
                  warning: `Arrive at ${arrivalTime}, before opening time (${openTimeStr}), need to wait ${waitTime} minutes`,
                  arrivalTime,
                  openingTime: openTimeStr,
                  closingTime: closeTimeStr,
                  waitTime,
                };
              }

              // If arriving after closing time
              if (arrivalTimeMinutes > closeTimeMinutes) {
                timeConstraintPenalty = 1000; // Severe penalty

                timeWarning = {
                  placeId: allPoints[i].id,
                  placeName: allPoints[i].name,
                  warning: `Arrive at ${arrivalTime}, after closing time (${closeTimeStr})`,
                  arrivalTime,
                  openingTime: openTimeStr,
                  closingTime: closeTimeStr,
                };
              }

              // If visit extends beyond closing time
              if (
                arrivalTimeMinutes <= closeTimeMinutes &&
                departureTimeMinutes > closeTimeMinutes
              ) {
                const overTime = departureTimeMinutes - closeTimeMinutes;
                timeConstraintPenalty = overTime * 0.8;

                if (overTime > 60) {
                  timeConstraintPenalty = 500;
                }

                timeWarning = {
                  placeId: allPoints[i].id,
                  placeName: allPoints[i].name,
                  warning: `Visit ends at ${minutesToTime(departureTimeMinutes)}, after closing time (${closeTimeStr}), exceeding by ${overTime} minutes`,
                  arrivalTime,
                  departureTime: minutesToTime(departureTimeMinutes),
                  openingTime: openTimeStr,
                  closingTime: closeTimeStr,
                };
              }
            }
          }

          // Calculate score
          let score =
            allPoints[i].priority * 1000 -
            travelTimeMinutes -
            timeConstraintPenalty;

          // Give a bonus to places with no opening hours restriction (open 24/7)
          if (
            !allPoints[i].openingPeriods ||
            allPoints[i].openingPeriods.length === 0
          ) {
            score += 200; // Bonus for 24/7 places
          }

          // Special bonus for Cu Chi Tunnel to make sure it's included
          if (allPoints[i].name.includes("Cu Chi")) {
            score += 3000; // Extra bonus for Cu Chi Tunnel
            console.log("Adding special bonus for Cu Chi Tunnel");
          }

          // Log detailed scoring for Cu Chi Tunnel or any point with low score
          if (allPoints[i].name.includes("Cu Chi") || score < 0) {
            console.log(`Greedy scoring for ${allPoints[i].name}:`, {
              priority: allPoints[i].priority,
              priorityScore: allPoints[i].priority * 1000,
              travelTimeMinutes,
              timeConstraintPenalty,
              is24h:
                !allPoints[i].openingPeriods ||
                allPoints[i].openingPeriods.length === 0,
              finalScore: score,
              currentTime: minutesToTime(currentTimeMinutes),
              arrivalTime: minutesToTime(arrivalTimeMinutes),
            });
          }

          if (score > bestScore) {
            bestScore = score;
            bestNext = i;
          }
        }
      }

      // If can't find next place
      if (bestNext === -1) break;

      // Update route
      route.push(bestNext);
      visited[bestNext] = true;

      // Update time and score
      const travelTime = durationMatrix[current][bestNext] / 60;
      currentTimeMinutes += travelTime;

      // Check for time warnings
      let timeStatus = "OK";

      // If no opening periods, assume open 24/7
      if (
        !allPoints[bestNext].openingPeriods ||
        allPoints[bestNext].openingPeriods.length === 0
      ) {
        // No time constraints - place is open 24/7
        console.log(
          `Greedy (selected): ${allPoints[bestNext].name} has no opening hours - assuming open 24/7`
        );
      } else if (
        allPoints[bestNext].openingPeriods &&
        allPoints[bestNext].openingPeriods.length > 0
      ) {
        const dayOfWeek = dayDate.getDay();
        const todaySchedule = allPoints[bestNext].openingPeriods.find(
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

          // Handle early arrival
          if (currentTimeMinutes < openTimeMinutes) {
            const waitTime = openTimeMinutes - currentTimeMinutes;
            timeWarnings.push({
              placeId: allPoints[bestNext].id,
              placeName: allPoints[bestNext].name,
              warning: `Arrive at ${minutesToTime(currentTimeMinutes)}, before opening time (${openTimeStr}), need to wait ${waitTime} minutes`,
              arrivalTime: minutesToTime(currentTimeMinutes),
              openingTime: openTimeStr,
              closingTime: closeTimeStr,
              waitTime,
            });

            // Adjust time to opening time
            currentTimeMinutes = openTimeMinutes;
            timeStatus = "WAIT_FOR_OPENING";
          }

          // Check for late arrival
          if (currentTimeMinutes > closeTimeMinutes) {
            timeWarnings.push({
              placeId: allPoints[bestNext].id,
              placeName: allPoints[bestNext].name,
              warning: `Arrive at ${minutesToTime(currentTimeMinutes)}, after closing time (${closeTimeStr})`,
              arrivalTime: minutesToTime(currentTimeMinutes),
              openingTime: openTimeStr,
              closingTime: closeTimeStr,
            });
            timeStatus = "AFTER_CLOSING";
          }

          // Check if visit extends past closing
          const departureTime =
            currentTimeMinutes + allPoints[bestNext].visitDuration;
          if (
            currentTimeMinutes <= closeTimeMinutes &&
            departureTime > closeTimeMinutes
          ) {
            timeWarnings.push({
              placeId: allPoints[bestNext].id,
              placeName: allPoints[bestNext].name,
              warning: `Visit ends at ${minutesToTime(departureTime)}, after closing time (${closeTimeStr}), exceeding by ${departureTime - closeTimeMinutes} minutes`,
              arrivalTime: minutesToTime(currentTimeMinutes),
              departureTime: minutesToTime(departureTime),
              openingTime: openTimeStr,
              closingTime: closeTimeStr,
            });
            timeStatus = "VISIT_EXCEEDS_CLOSING";
          }
        }
      }

      // Add to timeline
      timeline.push({
        name: allPoints[bestNext].name,
        arrivalTime: minutesToTime(currentTimeMinutes),
        departureTime: minutesToTime(
          currentTimeMinutes + allPoints[bestNext].visitDuration
        ),
        visitDuration: allPoints[bestNext].visitDuration,
        status: timeStatus,
      });

      // Update time and score
      currentTimeMinutes += allPoints[bestNext].visitDuration;
      totalScore += bestScore;
      current = bestNext;

      console.log(
        `Added to Greedy route: ${allPoints[bestNext].name} (score: ${bestScore.toFixed(2)})`
      );
    }

    // If hotel exists, add return to hotel
    if (hasHotel && route[route.length - 1] !== 0) {
      const lastPlace = route[route.length - 1];
      const returnTime = durationMatrix[lastPlace][0] / 60;

      currentTimeMinutes += returnTime;

      // Add hotel return to timeline
      timeline.push({
        name: "Return to " + allPoints[0].name,
        arrivalTime: minutesToTime(currentTimeMinutes),
        departureTime: minutesToTime(currentTimeMinutes),
        visitDuration: 0,
        status: "OK",
      });

      route.push(0); // Add hotel as final point
    }

    // Calculate total distance and duration
    let totalDistance = 0;
    let totalDuration = 0;

    for (let i = 0; i < route.length - 1; i++) {
      totalDistance += distanceMatrix[route[i]][route[i + 1]];
      totalDuration += durationMatrix[route[i]][route[i + 1]];

      // Add visit duration except for hotel at end
      if (!(hasHotel && i === route.length - 2)) {
        totalDuration += allPoints[route[i]].visitDuration * 60; // Convert minutes to seconds
      }
    }

    console.log(
      `Greedy route: ${route.map((i) => allPoints[i].name).join(" -> ")}`
    );

    // Check if Cu Chi Tunnel is in final route
    const cuChiInRoute = route.some((i) =>
      allPoints[i].name.includes("Cu Chi")
    );
    console.log("Cu Chi Tunnel included in final route:", cuChiInRoute);

    // Check all places that weren't visited
    const unvisitedPlaces = allPoints.filter((place, index) => !visited[index]);
    console.log(
      "Places not included in route:",
      unvisitedPlaces.map((p) => p.name)
    );

    // Map route indices back to place IDs
    const routePlaceIds = route.map((index) => allPoints[index].id);

    const endTime = performance.now();
    const executionTime = endTime - startTime;

    console.log(`Execution time: ${executionTime}ms`);

    // Return the optimization result
    return {
      route: route.map((index) => allPoints[index].name),
      placeIds: routePlaceIds,
      totalDistance,
      totalDuration,
      totalScore,
      algorithm: "Greedy",
      timeWarnings,
      timeline,
      visitedPointsCount: new Set(route).size,
      executionTime,
    };
  };

  // Function to run both algorithms and compare results
  const runOptimization = async () => {
    if (!planner) return;

    console.log("Starting optimization with hotel data:", hotelData);
    // Explicitly log the hotel location being used
    if (hotelData && hotelData.length > 0 && hotelData[0].lodging?.location) {
      console.log("TEST HOTEL COORDINATES:", {
        latitude: hotelData[0].lodging.location.latitude,
        longitude: hotelData[0].lodging.location.longitude,
        name: hotelData[0].lodging.name,
        address: hotelData[0].lodging.address,
      });
    }

    setOptimizing(true);
    const newResults: OptimizationResult[] = [];

    try {
      // Find days with route data
      const routeDays = planner.details
        .map((detail: any, index: number) => ({ detail, index }))
        .filter(({ detail }: { detail: any }) => detail.type === "route");

      console.log(
        "Found route days:",
        routeDays.map(
          (d: { detail: any; index: number }) =>
            d.detail.name || `Day ${d.index + 1}`
        )
      );

      if (routeDays.length === 0) {
        toast({
          title: "No route days found",
          description: "This planner doesn't have any route days to optimize",
          variant: "destructive",
        });
        return;
      }

      // Optimize first day with both algorithms for comparison
      const dayIndex = routeDays[0].index;
      const dayName = routeDays[0].detail.name || `Day ${dayIndex + 1}`;

      toast({
        title: "Starting optimization",
        description: `Optimizing routes for ${dayName} using multiple algorithms...`,
      });

      // Run SA algorithm
      const saResult = await optimizeWithSA(dayIndex);
      if (saResult) {
        newResults.push({
          ...saResult,
          algorithm: `Simulated Annealing - ${dayName}`,
        });

        toast({
          title: "SA Optimization complete",
          description: `Simulated Annealing algorithm completed in ${saResult.executionTime.toFixed(2)}ms`,
        });
      }

      // Run Greedy algorithm for comparison
      const greedyResult = await optimizeWithGreedy(dayIndex);
      if (greedyResult) {
        newResults.push({
          ...greedyResult,
          algorithm: `Greedy - ${dayName}`,
        });

        toast({
          title: "Greedy Optimization complete",
          description: `Greedy algorithm completed in ${greedyResult.executionTime.toFixed(2)}ms`,
        });
      }

      // Compare results
      if (saResult && greedyResult) {
        const saDistance = (saResult.totalDistance / 1000).toFixed(2);
        const greedyDistance = (greedyResult.totalDistance / 1000).toFixed(2);

        const saDuration = Math.round(saResult.totalDuration / 60);
        const greedyDuration = Math.round(greedyResult.totalDuration / 60);

        const saWarnings = saResult.timeWarnings.length;
        const greedyWarnings = greedyResult.timeWarnings.length;

        toast({
          title: "Comparison Results",
          description: `SA: ${saDistance}km, ${saDuration}min, ${saWarnings} warnings | Greedy: ${greedyDistance}km, ${greedyDuration}min, ${greedyWarnings} warnings`,
          variant: "default",
          duration: 10000, // Show for 10 seconds
        });
      }

      // Update results state
      setResults(newResults);
    } catch (error: any) {
      console.error("Optimization error:", error);
      toast({
        title: "Optimization failed",
        description: error.message || "An error occurred during optimization",
        variant: "destructive",
      });
    } finally {
      setOptimizing(false);
    }
  };

  // Format functions for display
  const formatDistance = (meters: number): string => {
    return meters < 1000
      ? `${meters.toFixed(0)}m`
      : `${(meters / 1000).toFixed(2)}km`;
  };

  const formatDuration = (seconds: number): string => {
    const minutes = seconds / 60;
    return minutes < 60
      ? `${minutes.toFixed(0)} min`
      : `${Math.floor(minutes / 60)}h ${Math.round(minutes % 60)}min`;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">
        Route Optimization Algorithm Test
      </h1>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="mr-2 h-8 w-8 animate-spin" />
          <p className="text-xl">Loading planner data...</p>
        </div>
      ) : !planner ? (
        <div className="flex items-center justify-center h-64">
          <AlertCircle className="mr-2 h-8 w-8 text-red-500" />
          <p className="text-xl">Failed to load planner data</p>
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{planner.title || "Untitled Planner"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Date Range</p>
                  <p>
                    {new Date(planner.startDate).toLocaleDateString()} -{" "}
                    {new Date(planner.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Destination</p>
                  <p>{planner.destination?.name || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Days</p>
                  <p>
                    {planner.details?.filter((d: any) => d.type === "route")
                      .length || 0}{" "}
                    days
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hotels</p>
                  <p>{hotelData.length || 0} hotels loaded</p>
                </div>
              </div>

              <Button
                onClick={runOptimization}
                disabled={optimizing}
                className="w-full"
              >
                {optimizing && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {optimizing
                  ? "Optimizing routes..."
                  : "Compare Simulated Annealing vs Greedy Algorithm"}
              </Button>
            </CardContent>
          </Card>

          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Optimization Results</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs
                  defaultValue={results[0].algorithm}
                  onValueChange={setActiveTab}
                >
                  <TabsList className="mb-4">
                    {results.map((result, index) => (
                      <TabsTrigger key={index} value={result.algorithm}>
                        {result.algorithm.split(" - ")[0]}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {results.map((result, index) => (
                    <TabsContent key={index} value={result.algorithm}>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <Card>
                            <CardHeader className="p-4">
                              <p className="text-sm font-medium text-muted-foreground">
                                Distance
                              </p>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              <p className="text-2xl font-bold">
                                {formatDistance(result.totalDistance)}
                              </p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="p-4">
                              <p className="text-sm font-medium text-muted-foreground">
                                Duration
                              </p>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              <p className="text-2xl font-bold">
                                {formatDuration(result.totalDuration)}
                              </p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="p-4">
                              <p className="text-sm font-medium text-muted-foreground">
                                Time Warnings
                              </p>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              <p className="text-2xl font-bold">
                                {result.timeWarnings.length}
                              </p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="p-4">
                              <p className="text-sm font-medium text-muted-foreground">
                                Execution Time
                              </p>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              <p className="text-2xl font-bold">
                                {result.executionTime.toFixed(0)}ms
                              </p>
                            </CardContent>
                          </Card>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-2">Route</h3>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {result.route.map((place, i) => (
                              <div key={i} className="flex items-center">
                                <Badge variant="secondary" className="mr-1">
                                  {i + 1}
                                </Badge>
                                <span>{place}</span>
                                {i < result.route.length - 1 && (
                                  <span className="mx-2">→</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            Timeline
                          </h3>
                          <div className="relative border rounded-lg p-4 overflow-x-auto">
                            <div className="space-y-4">
                              {result.timeline.map((item, i) => (
                                <div
                                  key={i}
                                  className="flex flex-col sm:flex-row sm:items-center gap-2"
                                >
                                  <div className="flex items-center gap-2 min-w-[200px]">
                                    <Badge
                                      variant="outline"
                                      className="w-8 text-center"
                                    >
                                      {i + 1}
                                    </Badge>
                                    <span className="font-medium">
                                      {item.name}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 text-sm">
                                    <Clock className="w-4 h-4" />
                                    <span>
                                      {item.arrivalTime} - {item.departureTime}
                                    </span>
                                    <span className="text-muted-foreground">
                                      ({item.visitDuration} min)
                                    </span>

                                    {item.status !== "OK" && (
                                      <Badge
                                        variant={
                                          item.status === "WAIT_FOR_OPENING"
                                            ? "outline"
                                            : item.status === "AFTER_CLOSING"
                                              ? "destructive"
                                              : "secondary"
                                        }
                                      >
                                        {item.status}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {result.timeWarnings.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold mb-2">
                              Time Constraint Warnings
                            </h3>
                            <div className="space-y-2">
                              {result.timeWarnings.map((warning, i) => (
                                <Card key={i} className="border-amber-200">
                                  <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                      <AlertCircle className="h-5 w-5 text-amber-500" />
                                      <span className="font-medium">
                                        {warning.placeName}
                                      </span>
                                    </div>
                                    <p className="text-sm mt-1">
                                      {warning.warning}
                                    </p>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
