"use client";
import React, { useRef, useEffect, useState } from "react";
import GuideHeader from "../GuideHeader";
import GuideContent from "../GuideContent";
import SidebarDetail from "../sidebar/SidebarDetail";

const CustomScrollLayout = () => {
  const leftContentRef = useRef<HTMLDivElement>(null);
  const hiddenScrollRef = useRef<HTMLDivElement>(null);
  const leftContainerRef = useRef<HTMLDivElement>(null);
  const [scrollHeight, setScrollHeight] = useState(0);

  useEffect(() => {
    const updateScrollDimensions = () => {
      if (leftContentRef.current) {
        setScrollHeight(leftContentRef.current.scrollHeight);
      }
    };

    updateScrollDimensions();
    window.addEventListener("resize", updateScrollDimensions);

    // Observer để theo dõi thay đổi nội dung
    const observer = new MutationObserver(updateScrollDimensions);
    if (leftContentRef.current) {
      observer.observe(leftContentRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    }

    // Xử lý wheel event trên container bên trái
    const handleWheel = (e: any) => {
      e.preventDefault();
      if (hiddenScrollRef.current) {
        const delta = e.deltaY;
        hiddenScrollRef.current.scrollTop += delta;
      }
    };

    const leftContainer = leftContainerRef.current;
    if (leftContainer) {
      leftContainer.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      window.removeEventListener("resize", updateScrollDimensions);
      observer.disconnect();
      if (leftContainer) {
        leftContainer.removeEventListener("wheel", handleWheel);
      }
    };
  }, []);

  const handleScroll = (e: any) => {
    if (leftContentRef.current) {
      const scrollTop = e.target.scrollTop;
      leftContentRef.current.scrollTop = scrollTop;
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden relative">
      <div>
        <SidebarDetail />
      </div>
      {/* Phần bên trái - Content */}
      <div ref={leftContainerRef} className="flex-1 relative">
        <div ref={leftContentRef} className="h-full overflow-hidden">
          {/* Nội dung thực tế */}
          <div className="">
            <GuideHeader />
            <GuideContent />
          </div>
        </div>
      </div>

      {/* Map container - cố định */}
      <div className="w-1/2 h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 to-cyan-50 relative">
        {/* Export button */}
        <div className="absolute top-4 left-4 z-10">
          <button className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 shadow-lg">
            🗺️ Export PRO
          </button>
        </div>

        {/* Map content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-80 h-60 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-xl mb-4 flex items-center justify-center shadow-lg">
              <div className="text-center">
                <span className="text-4xl mb-2 block">🗺️</span>
                <span className="text-blue-700 text-lg font-medium">
                  Google Maps
                </span>
              </div>
            </div>
            <p className="text-blue-600 font-medium">
              Interactive Map Component
            </p>
            <p className="text-sm text-blue-500 mt-2">Fixed 100vh height</p>
          </div>
        </div>

        {/* Map controls */}
        <div className="absolute top-4 right-4 space-y-2 z-10">
          <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
            <span className="text-gray-600">🔍</span>
          </button>
          <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
            <span className="text-gray-600">📍</span>
          </button>
          <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
            <span className="text-gray-600">⚙️</span>
          </button>
        </div>

        {/* Fit map button */}
        <div className="absolute bottom-4 left-4 z-10">
          <button className="bg-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-md border">
            📐 Fit map to...
          </button>
        </div>
      </div>

      {/* Thanh scroll ẩn ở bên phải */}
      <div className="absolute right-0 top-0 w-4 h-[calc(100vh-80px)] z-20">
        <div
          ref={hiddenScrollRef}
          className="w-full h-full overflow-y-auto overflow-x-hidden opacity-100"
          onScroll={handleScroll}
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#CBD5E0 #F7FAFC",
          }}
        >
          {/* Div ẩn có cùng chiều cao với nội dung bên trái */}
          <div style={{ height: scrollHeight }}></div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .absolute.right-0.top-0::-webkit-scrollbar {
          width: 12px;
        }

        .absolute.right-0.top-0::-webkit-scrollbar-track {
          background: #f7fafc;
          border-radius: 6px;
        }

        .absolute.right-0.top-0::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 6px;
          border: 2px solid #f7fafc;
        }

        .absolute.right-0.top-0::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
      `}</style>
    </div>
  );
};

export default CustomScrollLayout;
