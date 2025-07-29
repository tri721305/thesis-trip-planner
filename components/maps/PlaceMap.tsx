"use client";

import React from "react";

interface PlaceMapProps {
  center: { lat: number; lng: number };
  places: any[];
  radius?: number; // in meters
  className?: string;
}

const PlaceMap = ({ center, places, radius = 5000, className = "" }: PlaceMapProps) => {
  // Simple static map placeholder with Google Maps URL
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${center.lat},${center.lng}&zoom=13&size=600x400&maptype=roadmap&markers=color:red%7Clabel:📍%7C${center.lat},${center.lng}${places.map(place => `&markers=color:blue%7Clabel:🎯%7C${place.location.coordinates[1]},${place.location.coordinates[0]}`).join('')}&key=YOUR_API_KEY`;

  return (
    <div className={`relative bg-gray-100 rounded-lg ${className}`}>
      {/* Placeholder Map */}
      <div className="w-full h-64 rounded-lg bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center relative overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#6B7280" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* Center marker */}
        <div className="absolute transform -translate-x-1/2 -translate-y-1/2" style={{
          left: '50%',
          top: '50%'
        }}>
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            📍
          </div>
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-sm text-xs font-medium whitespace-nowrap">
            Your Location
          </div>
        </div>

        {/* Radius circle */}
        <div 
          className="absolute border-2 border-blue-400 border-dashed rounded-full opacity-30"
          style={{
            width: `${Math.min(radius / 100, 200)}px`,
            height: `${Math.min(radius / 100, 200)}px`,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />

        {/* Place markers (simplified positioning) */}
        {places.slice(0, 8).map((place, index) => {
          // Simple random positioning around center for demo
          const angle = (index / places.length) * 2 * Math.PI;
          const distance = 50 + Math.random() * 60; // Random distance from center
          const x = 50 + Math.cos(angle) * distance / 2;
          const y = 50 + Math.sin(angle) * distance / 2;
          
          return (
            <div
              key={place._id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
              style={{
                left: `${Math.max(10, Math.min(90, x))}%`,
                top: `${Math.max(10, Math.min(90, y))}%`
              }}
            >
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs cursor-pointer hover:bg-blue-600 transition-colors">
                🎯
              </div>
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded shadow-sm text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {place.name}
                <div className="text-xs opacity-80">
                  {place.distance?.toFixed(1)}km away
                </div>
              </div>
            </div>
          );
        })}

        {/* Map info */}
        <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-2 rounded-lg shadow-sm">
          <div className="text-sm font-semibold text-gray-800">
            📍 {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {places.length} attractions within {(radius/1000).toFixed(1)}km
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white/90 px-3 py-2 rounded-lg shadow-sm">
          <div className="text-xs font-semibold text-gray-800 mb-1">Legend</div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            <span>Your Location</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            <span>Attractions</span>
          </div>
        </div>
      </div>

      {/* Map replacement notice */}
      <div className="mt-3 text-center">
        <p className="text-xs text-gray-500">
          💡 This is a demo visualization. In production, integrate with Google Maps, Mapbox, or OpenStreetMap
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Real coordinates: {center.lat.toFixed(6)}, {center.lng.toFixed(6)} | Radius: {(radius/1000)}km
        </p>
      </div>
    </div>
  );
};

export default PlaceMap;
