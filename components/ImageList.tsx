"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageListProps {
  images: string[];
  className?: string;
}

const ImageList: React.FC<ImageListProps> = ({ images, className }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  // Nếu không có ảnh
  if (!images || images.length === 0) {
    return (
      <div
        className={cn(
          "relative w-full h-[400px] bg-gray-200 flex items-center justify-center",
          className
        )}
      >
        <p className="text-gray-500">Không có hình ảnh</p>
      </div>
    );
  }

  // Hiển thị tối đa 5 ảnh, ảnh chính và 4 ảnh thumbnail
  const mainImage = images[selectedImage];
  const thumbnails = images.slice(0, 5);
  const remainingCount = images.length > 5 ? images.length - 5 : 0;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Ảnh chính */}
      <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
        <img
          src={mainImage}
          alt="Hotel main"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Danh sách ảnh nhỏ */}
      <div className="grid grid-cols-5 gap-2 h-[100px]">
        {thumbnails.map((image, index) => (
          <div
            key={index}
            className={cn(
              "relative rounded-lg overflow-hidden cursor-pointer border-2",
              selectedImage === index
                ? "border-primary-500"
                : "border-transparent"
            )}
            onClick={() => setSelectedImage(index)}
          >
            <img
              src={image}
              alt={`Hotel thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Hiển thị số ảnh còn lại trên thumbnail cuối */}
            {index === 4 && remainingCount > 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white font-semibold">
                  +{remainingCount}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageList;
