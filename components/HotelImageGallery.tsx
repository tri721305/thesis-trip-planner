"use client";

import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HotelImageGalleryProps {
  images: string[];
  className?: string;
}

const HotelImageGallery: React.FC<HotelImageGalleryProps> = ({
  images = [],
  className,
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

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

  const openPreview = (index: number) => {
    setPreviewIndex(index);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
  };

  const goToPrevious = () => {
    setPreviewIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setPreviewIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToImage = (index: number) => {
    setPreviewIndex(index);
  };

  return (
    <>
      <div className={cn("space-y-2", className)}>
        {/* Ảnh chính */}
        <div
          className="relative w-full h-[400px] rounded-lg overflow-hidden cursor-pointer"
          onClick={() => openPreview(selectedImage)}
        >
          <img
            src={mainImage}
            alt="Hotel main"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300 rounded-lg flex items-center justify-center">
            <div className="opacity-0 hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm font-medium">
              Xem ảnh lớn
            </div>
          </div>
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
                <div
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    openPreview(5); // Mở preview với ảnh thứ 6
                  }}
                >
                  <span className="text-white font-semibold">
                    +{remainingCount}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal xem trước ảnh lớn */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          {/* Nút đóng */}
          <button
            onClick={closePreview}
            className="absolute top-4 right-4 z-10 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all duration-200"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Nút điều hướng */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all duration-200"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all duration-200"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          {/* Ảnh xem trước chính */}
          <div className="max-w-4xl max-h-[80vh] relative">
            <img
              src={images[previewIndex]}
              alt={`Hotel preview ${previewIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Hiển thị số ảnh */}
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-20 px-3 py-1 rounded-full text-white text-sm">
            {previewIndex + 1} / {images.length}
          </div>

          {/* Thumbnails dưới modal */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 max-w-full overflow-x-auto px-4">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`flex-shrink-0 w-16 h-12 rounded border-2 overflow-hidden transition-all duration-200 ${
                    index === previewIndex
                      ? "border-white"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default HotelImageGallery;
