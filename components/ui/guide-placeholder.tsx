"use client";

import React from "react";
import { BookOpen } from "lucide-react";

interface GuidePlaceholderProps {
  width?: number;
  height?: number;
  className?: string;
}

const GuidePlaceholder: React.FC<GuidePlaceholderProps> = ({
  width = 100,
  height = 100,
  className = "",
}) => {
  return (
    <div
      className={`rounded-md bg-gray-100 flex flex-col items-center justify-center ${className}`}
      style={{ width, height }}
    >
      <BookOpen className="text-gray-400 mb-2" size={width * 0.3} />
      <div className="text-gray-400 text-xs text-center font-medium">
        Guide Image
      </div>
    </div>
  );
};

export default GuidePlaceholder;
