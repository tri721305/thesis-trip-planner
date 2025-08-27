// Demo để so sánh performance trước và sau khi áp dụng lazy loading

import React from "react";
import ImageGallery from "@/components/images/ImageGallery";

const ImageGalleryDemo = () => {
  // Mock data với nhiều ảnh để test performance
  const manyImages = Array.from(
    { length: 20 },
    (_, i) => `https://picsum.photos/400/300?random=${i + 1}`
  );

  const fewImages = [
    "https://picsum.photos/400/300?random=1",
    "https://picsum.photos/500/400?random=2",
    "https://picsum.photos/600/350?random=3",
  ];

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">ImageGallery Lazy Loading Demo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gallery với ít ảnh */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Gallery với 3 ảnh</h2>
          <ImageGallery
            images={fewImages}
            mainImageIndex={0}
            alt="Demo gallery with few images"
            className="w-64 h-48"
          />
          <p className="text-sm text-gray-600 mt-2">
            Performance tốt ngay cả không có lazy loading
          </p>
        </div>

        {/* Gallery với nhiều ảnh */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Gallery với 20 ảnh</h2>
          <ImageGallery
            images={manyImages}
            mainImageIndex={0}
            alt="Demo gallery with many images"
            className="w-64 h-48"
          />
          <p className="text-sm text-gray-600 mt-2">
            🚀 Lazy loading giúp tối ưu bandwidth và loading time!
          </p>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">🔍 Cách test lazy loading:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Mở Developer Tools (F12)</li>
          <li>Vào tab Network</li>
          <li>Click vào một gallery để mở preview</li>
          <li>Quan sát: chỉ main image + adjacent images được load</li>
          <li>Navigate qua các ảnh → load thêm ảnh theo nhu cầu</li>
          <li>Thumbnails chỉ load khi cần thiết</li>
        </ol>
      </div>

      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">✅ Improvements đã triển khai:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>
            <strong>Smart loading</strong>: Chỉ load main image ban đầu
          </li>
          <li>
            <strong>Progressive loading</strong>: Load adjacent images khi
            preview
          </li>
          <li>
            <strong>Skeleton UI</strong>: Placeholder đẹp cho ảnh chưa load
          </li>
          <li>
            <strong>Loading indicator</strong>: Spinner cho main image
          </li>
          <li>
            <strong>Image counter</strong>: Badge hiển thị số lượng ảnh
          </li>
          <li>
            <strong>Optimized callbacks</strong>: useCallback để tránh re-render
          </li>
          <li>
            <strong>Memoized components</strong>: React.memo cho performance
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ImageGalleryDemo;
