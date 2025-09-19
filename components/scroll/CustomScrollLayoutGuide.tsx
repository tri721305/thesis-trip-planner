"use client";
import React, { useRef, useEffect, useState } from "react";
import GuideHeader from "../GuideHeader";
import GuideContent from "../GuideContent";
import SidebarDetailPlanner from "../sidebar/SidebarDetailPlanner";
import PlannerForm from "../forms/PlannerForm";
import Map from "../Map";
import { usePlannerStore } from "@/store/plannerStore";
import GuideForm from "../forms/GuideForm";

const CustomScrollLayoutGuide = (planner: any) => {
  const leftContentRef = useRef<HTMLDivElement>(null);
  const hiddenScrollRef = useRef<HTMLDivElement>(null);
  const leftContainerRef = useRef<HTMLDivElement>(null);
  const [scrollHeight, setScrollHeight] = useState(0);

  // Get routing data from Zustand store
  const { routingData } = usePlannerStore();

  // Extract destination data for the map
  const mapDestination = React.useMemo(() => {
    if (planner.planner?.destination?.coordinates) {
      return {
        coordinates: planner.planner.destination.coordinates as [
          number,
          number,
        ],
        name: planner.planner.destination.name || "Destination",
      };
    }
    return null;
  }, [planner.planner?.destination]);

  // NEW: Convert routing data to format expected by Map component
  const mapRouteData = React.useMemo(() => {
    if (!routingData || Object.keys(routingData).length === 0) {
      return [];
    }

    const routeLines: Array<{
      geometry: any;
      fromPlace: string;
      toPlace: string;
      color?: string;
    }> = [];

    // Generate very dark and vibrant colors for each day - maximum visibility
    const dayColors = [
      "#1e40af", // Very dark blue
      "#991b1b", // Very dark red
      "#14532d", // Very dark green
      "#92400e", // Very dark amber/brown
      "#6b21a8", // Very dark purple
      "#c2410c", // Dark orange (kept as is - already quite dark)
      "#0c4a6e", // Very dark sky blue
      "#881337", // Very dark pink
    ];

    Object.entries(routingData).forEach(([dayKey, dayData], dayIndex) => {
      if (dayData.routes && dayData.routes.length > 0) {
        const dayColor = dayColors[dayIndex % dayColors.length];

        dayData.routes.forEach((route) => {
          if (route.geometry && route.geometry.coordinates) {
            routeLines.push({
              geometry: route.geometry,
              fromPlace: route.fromPlace,
              toPlace: route.toPlace,
              color: dayColor,
            });
          }
        });
      }
    });

    console.log("🗺️ Map route data prepared:", {
      totalRoutes: routeLines.length,
      routeLines: routeLines.map((r) => `${r.fromPlace} → ${r.toPlace}`),
    });

    return routeLines;
  }, [routingData]);

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

  console.log("Guide result", planner);

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden relative">
      <div>
        <SidebarDetailPlanner
          planner={planner.planner}
          leftContentRef={leftContentRef}
          hiddenScrollRef={hiddenScrollRef}
        />
      </div>
      {/* Phần bên trái - Content */}
      <div ref={leftContainerRef} className="flex-1 relative">
        <div ref={leftContentRef} className="h-full overflow-hidden">
          {/* Nội dung thực tế */}
          <div className="">
            {/* <PlannerForm planner={planner.planner} /> */}
            <GuideForm planner={planner.planner} />
          </div>
        </div>
      </div>

      {/* Map container - cố định */}
      <div className="w-1/2 h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 to-cyan-50 relative">
        <Map
          destination={mapDestination || undefined}
          routeData={mapRouteData}
        />
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

export default CustomScrollLayoutGuide;
