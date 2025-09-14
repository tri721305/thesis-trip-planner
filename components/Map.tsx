"use client";
import React, { useRef, useEffect, useState } from "react";
import MapGL, { Marker, Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import data from "@/components/maps/streets.json";
import { getPlaceById } from "@/lib/actions/place.action";
import { usePlannerStore } from "@/store/plannerStore";

interface MapProps {
  destination?: {
    coordinates: [number, number]; // [longitude, latitude]
    name?: string;
  };
  className?: string;
  // NEW: Route data for visualization
  routeData?: Array<{
    geometry: any; // GeoJSON LineString
    fromPlace: string;
    toPlace: string;
    color?: string;
  }>;
}

const Map: React.FC<MapProps> = ({ destination, className, routeData }) => {
  const mapRef = useRef<any>(null);
  const MAPTILER_API_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;

  // Get planner data from Zustand store
  const { plannerData } = usePlannerStore();

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

  return (
    <div className={`w-full h-full ${className || ""}`}>
      <MapGL
        ref={mapRef}
        initialViewState={initialViewState}
        style={{ width: "100%", height: "100%" }}
        mapStyle={data as any}
        interactive={true}
        attributionControl={false}
      >
        {/* Destination marker */}
        {destination?.coordinates && (
          <Marker
            longitude={destination.coordinates[0]}
            latitude={destination.coordinates[1]}
            anchor="bottom"
          >
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer group relative">
                <span className="text-white text-sm">📍</span>
                {destination.name && (
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-2 py-1 rounded shadow-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {destination.name}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rotate-45"></div>
                  </div>
                )}
              </div>
            </div>
          </Marker>
        )}

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
      </MapGL>
    </div>
  );
};

export default Map;
