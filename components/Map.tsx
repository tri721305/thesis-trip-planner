"use client";
import React, { useRef, useEffect, useState } from "react";
import MapGL, { Marker, Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import data from "@/components/maps/streets.json";
import { getPlaceById } from "@/lib/actions/place.action";
import { usePlannerStore } from "@/store/plannerStore";

// Interface for hotel data
interface Hotel {
  _id: string; // Có thể là string sau khi serialized từ ObjectId
  offerId?: string;
  source?: string;
  lodging: {
    name: string;
    location: {
      longitude: number;
      latitude: number;
    };
    hotelClass?: number;
    rating?: {
      source?: string;
      value: number;
    };
    wanderlogRating?: number;
    ratingCount?: number;
    images?: Array<{ url: string }>;
    amenities?: Array<{ name: string }>;
  };
  priceRate?: {
    amount?: number;
    currencyCode?: string;
    total?: {
      amount: number;
      currencyCode: string;
    };
  };
  // Các trường đã serialized
  createdAt?: string;
  updatedAt?: string;
  availableRooms?: number;
  isLowAvailability?: boolean;
}

interface MapProps {
  destination?: {
    coordinates: [number, number]; // [longitude, latitude]
    name?: string;
  };
  className?: string;
  // Route data for visualization
  routeData?: Array<{
    geometry: any; // GeoJSON LineString
    fromPlace: string;
    toPlace: string;
    color?: string;
  }>;
  // Hotel data for displaying on map
  hotels?: Hotel[];
  // Nearby attraction places data
  nearbyPlaces?: Array<{
    name: string;
    coordinates: [number, number]; // [longitude, latitude]
    distance?: number; // distance in km
    placeType?: string; // "attraction", "restaurant", etc.
  }>;
}

const Map: React.FC<MapProps> = ({
  destination,
  className,
  routeData,
  hotels,
  nearbyPlaces,
}) => {
  const mapRef = useRef<any>(null);
  const MAPTILER_API_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;

  // Get planner data from Zustand store
  const { plannerData, flyToPlace } = usePlannerStore();

  // Add a force re-render mechanism
  const [forceRender, setForceRender] = useState(0);

  const [mapPlaces, setMapPlaces] = useState<
    Array<{
      name: string;
      location?: { coordinates: [number, number] };
      order: number;
      detailName: string;
      timeStart?: string;
      timeEnd?: string;
    }>
  >([]);

  // Function to fetch place coordinates by ID
  const fetchPlaceCoordinates = async (placeId: string) => {
    try {
      const result = await getPlaceById(placeId);
      if (result.success && result.data?.place?.location?.coordinates) {
        return result.data.place.location.coordinates as [number, number];
      } else {
        console.warn("⚠️ Map - No coordinates found for place ID:", placeId);
      }
    } catch (error) {
      console.error("❌ Map - Error fetching place coordinates:", error);
    }
    return null;
  };

  // Extract places from planner details - Using Zustand store
  useEffect(() => {
    // Force re-render to ensure fresh state
    setForceRender((prev) => prev + 1);

    const extractPlaces = async () => {
      if (!plannerData?.details) {
        setMapPlaces([]);
        return;
      }

      const places: Array<{
        name: string;
        location?: { coordinates: [number, number] };
        order: number;
        detailName: string;
        timeStart?: string;
        timeEnd?: string;
      }> = [];

      let globalPlaceIndex = 1;

      for (const detail of plannerData.details) {
        if (detail.data && Array.isArray(detail.data)) {
          for (const item of detail.data) {
            if (item.type === "place") {
              let coordinates: [number, number] | null = null;

              // Check if item has location data
              if (item.location?.coordinates) {
                coordinates = item.location.coordinates;
              } else if (item.id || item.attractionId) {
                const lookupId = item.id || item.attractionId;
                coordinates = await fetchPlaceCoordinates(lookupId);
              }

              if (coordinates) {
                places.push({
                  name: item.name || "Unknown Place",
                  location: { coordinates },
                  order: globalPlaceIndex,
                  detailName: detail.name || `Day ${globalPlaceIndex}`,
                  timeStart: item.timeStart,
                  timeEnd: item.timeEnd,
                });
                globalPlaceIndex++;
              }
            }
          }
        }
      }

      setMapPlaces(places);
    };

    extractPlaces();
  }, [plannerData]); // Watch entire plannerData object to catch all changes

  // Default coordinates (Vietnam)
  const defaultCoordinates = {
    longitude: 106.6297,
    latitude: 10.8231,
    zoom: 14,
  };

  // Use destination coordinates if available, otherwise use default
  const initialViewState = destination?.coordinates
    ? {
        longitude: destination.coordinates[0],
        latitude: destination.coordinates[1],
        zoom: 12,
      }
    : defaultCoordinates;

  // Fly to destination when destination prop changes
  useEffect(() => {
    if (destination?.coordinates && mapRef.current) {
      mapRef.current.getMap()?.flyTo({
        center: destination.coordinates,
        zoom: 12,
        duration: 2000,
        essential: true,
      });
    }
  }, [destination]);

  // NEW: Fly to clicked place when flyToPlace changes
  useEffect(() => {
    if (flyToPlace?.coordinates && mapRef.current) {
      console.log(
        "🗺️ Map - Flying to clicked place:",
        flyToPlace.name,
        "at",
        flyToPlace.coordinates
      );
      mapRef.current.getMap()?.flyTo({
        center: flyToPlace.coordinates,
        zoom: 15, // Zoom closer for individual places
        duration: 2000,
        essential: true,
      });
    }
  }, [flyToPlace?.timestamp]); // Watch timestamp to trigger on new clicks

  // Fly to places when places data changes
  useEffect(() => {
    if (mapPlaces.length > 0 && mapRef.current) {
      const placesWithCoords = mapPlaces.filter(
        (place) => place.location?.coordinates
      );

      if (placesWithCoords.length > 0) {
        // If no destination or multiple places, fit bounds
        if (!destination?.coordinates || placesWithCoords.length > 3) {
          const coordinates = placesWithCoords.map(
            (place) => place.location!.coordinates
          );

          const lngs = coordinates.map((coord) => coord[0]);
          const lats = coordinates.map((coord) => coord[1]);

          const bounds = [
            [Math.min(...lngs), Math.min(...lats)],
            [Math.max(...lngs), Math.max(...lats)],
          ];

          const padding = 0.01;
          bounds[0][0] -= padding;
          bounds[0][1] -= padding;
          bounds[1][0] += padding;
          bounds[1][1] += padding;

          setTimeout(() => {
            mapRef.current?.getMap()?.fitBounds(bounds, {
              padding: 50,
              duration: 1500,
              essential: true,
            });
          }, 300);
        }
      }
    }
  }, [mapPlaces, destination]);

  // Fit map to show all hotels when hotels data changes
  useEffect(() => {
    if (hotels && hotels.length > 0 && mapRef.current) {
      // If there are hotels, fit bounds to show all of them
      const validHotels = hotels.filter(
        (hotel) =>
          hotel?.lodging?.location?.longitude &&
          hotel?.lodging?.location?.latitude &&
          !isNaN(hotel.lodging.location.longitude) &&
          !isNaN(hotel.lodging.location.latitude)
      );

      if (validHotels.length === 0) return;

      const lngs = validHotels.map((hotel) => hotel.lodging.location.longitude);
      const lats = validHotels.map((hotel) => hotel.lodging.location.latitude);

      const bounds = [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ];

      const padding = 0.01;
      bounds[0][0] -= padding;
      bounds[0][1] -= padding;
      bounds[1][0] += padding;
      bounds[1][1] += padding;

      setTimeout(() => {
        mapRef.current?.getMap()?.fitBounds(bounds as any, {
          padding: 50,
          duration: 1500,
          essential: true,
        });
      }, 300);
    }
  }, [hotels]);

  // Helper function to format price
  const formatPrice = (amount?: number, currency?: string) => {
    if (!amount) return "";

    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: currency || "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={`w-full h-full ${className || ""}`}>
      <MapGL
        ref={mapRef}
        initialViewState={initialViewState}
        style={{ width: "100%", height: "100%" }}
        mapStyle={data as any}
        interactive={true}
        attributionControl={false}
        projection={"globe"}
      >
        {/* Place markers */}
        {mapPlaces
          .filter((place) => {
            const coords = place.location?.coordinates;
            if (!coords || !Array.isArray(coords) || coords.length !== 2) {
              return false;
            }
            const [lng, lat] = coords;
            return (
              typeof lng === "number" &&
              typeof lat === "number" &&
              lng >= -180 &&
              lng <= 180 &&
              lat >= -90 &&
              lat <= 90 &&
              !isNaN(lng) &&
              !isNaN(lat)
            );
          })
          .slice(0, 20)
          .map((place, index) => {
            const orderNumber = place.order || index + 1;
            const coords = place.location!.coordinates;

            // Create a more unique key that includes coordinates
            const uniqueKey = `marker-${place.name}-${coords[0]}-${coords[1]}-${orderNumber}`;

            return (
              <Marker
                key={uniqueKey}
                longitude={coords[0]}
                latitude={coords[1]}
                anchor="bottom"
              >
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors group relative">
                    <span className="font-bold text-white text-sm">
                      {orderNumber}
                    </span>

                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-2 rounded shadow-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 max-w-64">
                      <div className="font-bold text-sm">{place.name}</div>
                      {place.detailName && (
                        <div className="text-blue-200 text-xs mt-1">
                          📅 {place.detailName}
                        </div>
                      )}
                      {(place.timeStart || place.timeEnd) && (
                        <div className="text-blue-200 text-xs mt-1">
                          {place.timeStart && place.timeEnd
                            ? `🕐 ${place.timeStart} - ${place.timeEnd}`
                            : `🕐 ${place.timeStart || place.timeEnd}`}
                        </div>
                      )}
                      <div className="text-blue-200 text-xs mt-1">
                        📍 {coords[0].toFixed(4)}, {coords[1].toFixed(4)}
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-600 rotate-45"></div>
                    </div>
                  </div>
                </div>
              </Marker>
            );
          })}

        {/* NEW: Route Lines Visualization */}
        {routeData &&
          routeData.map((route, routeIndex) => {
            if (!route.geometry || !route.geometry.coordinates) return null;

            const routeGeoJSON = {
              type: "Feature" as const,
              properties: {
                fromPlace: route.fromPlace,
                toPlace: route.toPlace,
              },
              geometry: route.geometry,
            };

            return (
              <Source
                key={`route-${routeIndex}`}
                id={`route-${routeIndex}`}
                type="geojson"
                data={routeGeoJSON}
              >
                {/* Route outline first (underneath) */}
                <Layer
                  id={`route-outline-${routeIndex}`}
                  type="line"
                  paint={{
                    "line-color": "#ffffff",
                    "line-width": 8, // Wider outline
                    "line-opacity": 0.9,
                  }}
                  layout={{
                    "line-join": "round",
                    "line-cap": "round",
                  }}
                />
                {/* Main route line on top */}
                <Layer
                  id={`route-line-${routeIndex}`}
                  type="line"
                  paint={{
                    "line-color": route.color || "#1e40af", // Even darker blue
                    "line-width": 6, // Thicker line
                    "line-opacity": 1.0, // Full opacity
                  }}
                  layout={{
                    "line-join": "round",
                    "line-cap": "round",
                  }}
                />
              </Source>
            );
          })}
        {/* Nearby Places markers - Render these FIRST so they appear UNDER the hotel marker */}
        {nearbyPlaces &&
          nearbyPlaces.map((place, index) => {
            // Skip invalid coordinates
            if (
              !place.coordinates ||
              !Array.isArray(place.coordinates) ||
              place.coordinates.length !== 2 ||
              isNaN(place.coordinates[0]) ||
              isNaN(place.coordinates[1])
            ) {
              return null;
            }

            // Generate unique key
            const uniqueKey = `place-${place.name}-${index}`;

            return (
              <Marker
                key={uniqueKey}
                longitude={place.coordinates[0]}
                latitude={place.coordinates[1]}
                anchor="bottom"
              >
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors group relative">
                    <span className="text-white text-xs font-bold">
                      {index + 1}
                    </span>

                    {/* Place tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 px-3 py-2 rounded shadow-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 min-w-44 max-w-64 border border-blue-300">
                      <div className="font-bold text-sm">{place.name}</div>

                      {/* Distance */}
                      {place.distance !== undefined && (
                        <div className="text-blue-600 text-xs mt-1 font-semibold">
                          {place.distance.toFixed(1)} km from hotel
                        </div>
                      )}

                      {/* Place Type */}
                      {place.placeType && (
                        <div className="text-gray-500 text-xs mt-1">
                          Type:{" "}
                          {place.placeType.charAt(0).toUpperCase() +
                            place.placeType.slice(1)}
                        </div>
                      )}

                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-r border-b border-blue-300"></div>
                    </div>
                  </div>
                </div>
              </Marker>
            );
          })}

        {/* Hotel markers */}
        {hotels &&
          hotels.map((hotel, index) => {
            const { longitude, latitude } = hotel.lodging.location;
            // Skip invalid coordinates
            if (
              !longitude ||
              !latitude ||
              isNaN(longitude) ||
              isNaN(latitude)
            ) {
              return null;
            }

            // Calculate hotel rating stars
            const ratingValue =
              hotel.lodging.rating?.value || hotel.lodging.wanderlogRating || 0;
            const starsCount =
              hotel.lodging.hotelClass || Math.round(ratingValue / 2);

            // Format hotel price - prefer total price if available
            const price =
              hotel.priceRate?.total?.amount || hotel.priceRate?.amount;
            const currency =
              hotel.priceRate?.total?.currencyCode ||
              hotel.priceRate?.currencyCode;

            // Generate unique key
            const uniqueKey = `hotel-${hotel._id || hotel.offerId}-${index}`;

            return (
              <Marker
                key={uniqueKey}
                longitude={longitude}
                latitude={latitude}
                anchor="bottom"
              >
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-amber-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:bg-amber-600 transition-colors group relative">
                    <span className="text-white text-sm">🏨</span>

                    {/* Hotel tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 px-3 py-2 rounded shadow-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 min-w-44 max-w-64 border border-amber-300">
                      <div className="font-bold text-sm">
                        {hotel.lodging.name}
                      </div>

                      {/* Stars */}
                      {starsCount > 0 && (
                        <div className="flex text-amber-500 mt-1">
                          {Array.from(
                            { length: Math.min(starsCount, 5) },
                            (_, i) => (
                              <span key={i}>⭐</span>
                            )
                          )}
                        </div>
                      )}

                      {/* Rating */}
                      {(hotel.lodging.rating ||
                        hotel.lodging.wanderlogRating) && (
                        <div className="text-green-600 text-xs mt-1 font-semibold">
                          {(
                            hotel.lodging.rating?.value ||
                            hotel.lodging.wanderlogRating ||
                            0
                          ).toFixed(1)}{" "}
                          / 10
                          {hotel.lodging.rating?.source &&
                            ` (${hotel.lodging.rating.source})`}
                          {hotel.lodging.ratingCount &&
                            ` - ${hotel.lodging.ratingCount} ratings`}
                        </div>
                      )}

                      {/* Price */}
                      {price && (
                        <div className="text-blue-600 text-xs mt-1 font-bold">
                          {formatPrice(price, currency)}
                          <span className="text-gray-500 ml-1">/ đêm</span>
                        </div>
                      )}

                      {/* Source */}
                      {hotel.source && (
                        <div className="text-gray-500 text-xs mt-1">
                          Nguồn:{" "}
                          {hotel.source.charAt(0).toUpperCase() +
                            hotel.source.slice(1)}
                        </div>
                      )}

                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-r border-b border-amber-300"></div>
                    </div>
                  </div>
                </div>
              </Marker>
            );
          })}
        {/* Destination marker - Render this LAST so it appears ON TOP */}
        {destination?.coordinates && (
          <Marker
            longitude={destination.coordinates[0]}
            latitude={destination.coordinates[1]}
            anchor="bottom"
          >
            <div
              className="flex flex-col items-center"
              style={{ zIndex: 1000 }}
            >
              <div className="w-12 h-12 bg-red-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center cursor-pointer group relative">
                <span className="text-white text-sm font-bold">H</span>
                {destination.name && (
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-2 py-1 rounded shadow-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                    {destination.name}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rotate-45"></div>
                  </div>
                )}
              </div>
            </div>
          </Marker>
        )}
      </MapGL>
    </div>
  );
};

export default Map;
