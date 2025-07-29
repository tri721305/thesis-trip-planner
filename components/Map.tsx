"use client";
import React from "react";
import MapGL from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import data from "@/components/maps/streets.json";
const Map = () => {
  const MAPTILER_API_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;

  return (
    <div className="w-full h-full">
      <MapGL
        initialViewState={{
          longitude: 106.6297, // Vietnam coordinates
          latitude: 10.8231,
          zoom: 14,
        }}
        style={{ width: "100%", height: "100%" }}
        // mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=hEMXDuIkaSgqP6BBDlDV`}
        mapStyle={data}
      />
    </div>
  );
};

export default Map;
