"use client";

import React from "react";
import { User } from "lucide-react";

interface AvatarPlaceholderProps {
  size?: number;
  className?: string;
}

const AvatarPlaceholder: React.FC<AvatarPlaceholderProps> = ({
  size = 40,
  className = "",
}) => {
  return (
    <div
      className={`rounded-full bg-gray-200 flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <User className="text-gray-500" size={size * 0.5} />
    </div>
  );
};

export default AvatarPlaceholder;
