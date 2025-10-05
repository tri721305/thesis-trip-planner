"use client";

import React from "react";
import { MapPin } from "lucide-react";

interface TripPlaceholderProps {
  width?: number;
  height?: number;
  className?: string;
}

const TripPlaceholder: React.FC<TripPlaceholderProps> = ({
  width = 100,
  height = 100,
  className = "",
}) => {
  return (
    <div
      className={`rounded-md bg-gray-100 flex flex-col items-center justify-center ${className}`}
      style={{ width, height }}
    >
      <MapPin className="text-gray-400 mb-2" size={width * 0.3} />
      <div className="text-gray-400 text-xs text-center font-medium">
        Trip Image
      </div>
    </div>
  );
};

export default TripPlaceholder;
