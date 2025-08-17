"use client";
import React, { useRef, useEffect } from "react";
import MapGL, { Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import data from "@/components/maps/streets.json";

interface MapProps {
  destination?: {
    coordinates: [number, number]; // [longitude, latitude]
    name?: string;
  };
  places?: Array<{
    name: string;
    location?: {
      coordinates: [number, number];
    };
    order?: number; // Add order/sequence number
    detailName?: string; // Add detail section context
    timeStart?: string;
    timeEnd?: string;
  }>;
  className?: string;
}

const Map: React.FC<MapProps> = ({ destination, places = [], className }) => {
  const mapRef = useRef<any>(null);
  const MAPTILER_API_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;

  // Debug: Log places data to check location coordinates
  console.log(
    "🗺️ Map component - Places data:",
    places.map((place) => ({
      name: place.name,
      hasLocation: !!place.location,
      location: place.location,
      coordinates: place.location?.coordinates,
      detailName: place.detailName,
    }))
  );

  // Enhanced debug logging for places prop changes
  useEffect(() => {
    console.log("🗺️ MAP COMPONENT - Places prop updated:", {
      placesCount: places.length,
      placesData: places.map(p => ({
        name: p.name,
        order: p.order,
        hasLocation: !!p.location,
        coordinates: p.location?.coordinates,
        validCoordinates: p.location?.coordinates && 
          Array.isArray(p.location.coordinates) && 
          p.location.coordinates.length === 2 &&
          typeof p.location.coordinates[0] === 'number' &&
          typeof p.location.coordinates[1] === 'number'
      }))
    });
  }, [places]);

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
      console.log("🗺️ Flying to destination:", destination);
      console.log("🗺️ Destination coordinates:", destination.coordinates);

      // Fly to the destination coordinates
      mapRef.current.getMap()?.flyTo({
        center: destination.coordinates,
        zoom: 12,
        duration: 2000, // 2 seconds animation
        essential: true,
      });
    }
  }, [destination]);

  // Fly to places when places data changes and we have coordinates
  useEffect(() => {
    if (places.length > 0 && mapRef.current) {
      const placesWithCoords = places.filter(
        (place) => place.location?.coordinates
      );

      if (placesWithCoords.length > 0) {
        console.log(
          "🎯 Found places with coordinates and order:",
          placesWithCoords.map((p) => ({
            name: p.name,
            order: p.order,
            detailName: p.detailName,
            coordinates: p.location?.coordinates,
          }))
        );

        // Only auto-fly if we don't have a destination or if there are many places
        if (!destination?.coordinates || placesWithCoords.length > 3) {
          // If there are multiple places, fit bounds to show all
          const coordinates = placesWithCoords.map(
            (place) => place.location!.coordinates
          );

          // Calculate bounds
          const lngs = coordinates.map((coord) => coord[0]);
          const lats = coordinates.map((coord) => coord[1]);

          const bounds = [
            [Math.min(...lngs), Math.min(...lats)], // Southwest
            [Math.max(...lngs), Math.max(...lats)], // Northeast
          ];

          // Add some padding to bounds
          const padding = 0.01; // About 1km padding
          bounds[0][0] -= padding; // Southwest lng
          bounds[0][1] -= padding; // Southwest lat
          bounds[1][0] += padding; // Northeast lng
          bounds[1][1] += padding; // Northeast lat

          setTimeout(() => {
            mapRef.current?.getMap()?.fitBounds(bounds, {
              padding: 50,
              duration: 1500,
              essential: true,
            });
          }, 500); // Small delay to ensure map is ready
        }
      }
    }
  }, [places, destination]);

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
        {/* Render destination marker using proper MapLibre Marker */}
        {destination?.coordinates && (
          <Marker
            longitude={destination.coordinates[0]}
            latitude={destination.coordinates[1]}
            anchor="bottom"
          >
            <div className="flex flex-col items-center">
              {/* Destination pin */}
              <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer group relative">
                <span className="text-white text-sm">📍</span>

                {/* Tooltip */}
                {destination.name && (
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-2 py-1 rounded shadow-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {destination.name}
                    {/* Arrow pointing down */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rotate-45"></div>
                  </div>
                )}
              </div>
            </div>
          </Marker>
        )}

        {/* Render place markers using proper MapLibre Markers */}
        {places
          .filter((place) => {
            // Validate coordinates exist and are valid numbers
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
          .slice(0, 20) // Increase limit since real markers are more performant
          .map((place, index) => {
            const orderNumber = place.order || index + 1;
            const coords = place.location!.coordinates;

            console.log(`🎯 Rendering marker ${orderNumber}:`, {
              name: place.name,
              coordinates: coords,
              order: orderNumber,
            });

            return (
              <Marker
                key={`place-marker-${orderNumber}-${place.name}-${index}`}
                longitude={coords[0]}
                latitude={coords[1]}
                anchor="bottom"
              >
                <div className="flex flex-col items-center">
                  {/* Place marker with sequence number */}
                  <div className="w-10 h-10 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors group relative">
                    <span className="font-bold text-white text-sm">
                      {orderNumber}
                    </span>

                    {/* Rich tooltip */}
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
                      {/* Arrow pointing down */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-600 rotate-45"></div>
                    </div>
                  </div>
                </div>
              </Marker>
            );
          })}
      </MapGL>
    </div>
  );
};

export default Map;
