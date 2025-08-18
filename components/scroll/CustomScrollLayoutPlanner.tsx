"use client";
import React, { useRef, useEffect, useState } from "react";
import GuideHeader from "../GuideHeader";
import GuideContent from "../GuideContent";
import SidebarDetailPlanner from "../sidebar/SidebarDetailPlanner";
import PlannerForm from "../forms/PlannerForm";
import Map from "../Map";
import { getPlaceById } from "@/lib/actions/place.action";

const CustomScrollLayoutPlanner = (planner: any) => {
  const leftContentRef = useRef<HTMLDivElement>(null);
  const hiddenScrollRef = useRef<HTMLDivElement>(null);
  const leftContainerRef = useRef<HTMLDivElement>(null);
  const [scrollHeight, setScrollHeight] = useState(0);
  const [mapPlaces, setMapPlaces] = useState<
    Array<{
      name: string;
      location?: { coordinates: [number, number] };
      order: number;
      detailName: string;
      timeStart?: string;
      timeEnd?: string;
    }>
  >([]);

  // State to track form data changes from PlannerForm
  const [formDetailsData, setFormDetailsData] = useState<any[]>([]);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  console.log("MapDestination", mapDestination, mapPlaces, "mapPlaces");
  // Function to fetch place coordinates by ID
  const fetchPlaceCoordinates = async (placeId: string) => {
    try {
      console.log("🔍 Fetching coordinates for place ID:", placeId);
      const result = await getPlaceById(placeId);
      if (result.success && result.data?.place?.location?.coordinates) {
        console.log(
          "✅ Found coordinates:",
          result.data.place.location.coordinates
        );
        return result.data.place.location.coordinates as [number, number];
      } else {
        console.warn("⚠️ No coordinates found for place ID:", placeId);
      }
    } catch (error) {
      console.error("❌ Error fetching place coordinates:", error);
    }
    return null;
  };

  // Function to receive form data updates from PlannerForm with debounce
  const updateFormData = (formData: any) => {
    console.log(
      "🔄 CustomScrollLayoutPlanner - Received form data update:",
      formData
    );

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Create a new array reference to ensure React detects the change
    const newDetailsData = formData.details ? [...formData.details] : [];

    // Add timestamp to force re-render detection
    const detailsWithTimestamp = newDetailsData.map((detail: any) => ({
      ...detail,
      _updateTimestamp: Date.now(),
    }));

    console.log(
      "🔄 CustomScrollLayoutPlanner - Applying state update with new reference:",
      {
        oldLength: formDetailsData.length,
        newLength: detailsWithTimestamp.length,
        oldReference: formDetailsData,
        newReference: detailsWithTimestamp,
        totalPlaces: detailsWithTimestamp.reduce(
          (acc: number, detail: any) =>
            acc +
            (detail.data?.filter((item: any) => item.type === "place")
              ?.length || 0),
          0
        ),
      }
    );

    // Force state update with new reference
    setFormDetailsData(detailsWithTimestamp);

    // Optional: keep debounce as fallback
    debounceTimeoutRef.current = setTimeout(() => {
      console.log("🔄 CustomScrollLayoutPlanner - Debounce backup triggered");
    }, 50); // Reduced to 50ms
  };

  // Extract places from details and fetch their coordinates
  // Use formDetailsData if available, otherwise fallback to planner.planner.details
  useEffect(() => {
    const timestamp = Date.now();
    console.log(
      "🔍 useEffect triggered at:",
      new Date(timestamp).toLocaleTimeString(),
      {
        plannerDetailsCount: planner.planner?.details?.length || 0,
        formDetailsDataCount: formDetailsData.length,
        triggerSource: formDetailsData.length > 0 ? "formData" : "plannerProp",
        formDetailsDataReference: formDetailsData,
        plannerDetailsReference: planner.planner?.details,
      }
    );

    const extractPlacesWithCoordinates = async () => {
      const detailsToProcess =
        formDetailsData.length > 0 ? formDetailsData : planner.planner?.details;

      if (!detailsToProcess) {
        console.log("🔍 No details to process, clearing map places");
        setMapPlaces([]);
        return;
      }

      console.log("🔍 Processing details source:", {
        usingFormData: formDetailsData.length > 0,
        detailsCount: detailsToProcess.length,
        detailsPreview: detailsToProcess.map((d: any) => ({
          name: d.name,
          type: d.type,
          dataCount: d.data?.length || 0,
          placesCount:
            d.data?.filter((item: any) => item.type === "place")?.length || 0,
          hasTimestamp: !!d._updateTimestamp,
          timestamp: d._updateTimestamp,
        })),
      });

      const places: Array<{
        name: string;
        location?: { coordinates: [number, number] };
        order: number;
        detailName: string;
        timeStart?: string;
        timeEnd?: string;
      }> = [];

      let globalPlaceIndex = 1;

      for (const detail of detailsToProcess) {
        if (detail.data && Array.isArray(detail.data)) {
          for (const item of detail.data) {
            if (item.type === "place") {
              console.log(
                "🔍 CustomScrollLayoutPlanner - Processing place item:",
                {
                  name: item.name,
                  id: item.id,
                  hasLocation: !!item.location,
                  location: item.location,
                  coordinates: item.location?.coordinates,
                }
              );

              // Try to fetch coordinates by ID
              let coordinates: [number, number] | null = null;

              // First check if the item already has location data
              if (item.location?.coordinates) {
                coordinates = item.location.coordinates;
                console.log(
                  "✅ Using coordinates from item location:",
                  coordinates
                );
              } else if (item.id || item.attractionId) {
                // Try both id and attractionId for database lookup
                const lookupId = item.id || item.attractionId;
                console.log(
                  "🔍 Fetching coordinates from database for ID:",
                  lookupId
                );
                coordinates = await fetchPlaceCoordinates(lookupId);
                console.log("🔍 Fetched coordinates result:", coordinates);
              } else {
                console.warn(
                  "⚠️ No ID, attractionId, or location data available for place:",
                  item.name
                );
              }

              // If we have coordinates, add to places array
              if (coordinates) {
                places.push({
                  name: item.name || "Unknown Place",
                  location: {
                    coordinates: coordinates,
                  },
                  order: globalPlaceIndex,
                  detailName: detail.name || `Day ${globalPlaceIndex}`,
                  timeStart: item.timeStart,
                  timeEnd: item.timeEnd,
                });
                globalPlaceIndex++;
              } else {
                console.warn(
                  `⚠️ No coordinates found for place: ${item.name} (ID: ${item.id})`
                );
              }
            }
          }
        }
      }

      console.log(
        "🗺️ Extracted places for map with coordinates:",
        places.length,
        places
      );
      setMapPlaces(places);
    };

    extractPlacesWithCoordinates();
  }, [planner.planner?.details, formDetailsData]);

  // Debug: Log when formDetailsData changes
  useEffect(() => {
    console.log(
      "🔍 formDetailsData changed at:",
      new Date().toLocaleTimeString(),
      {
        length: formDetailsData.length,
        reference: formDetailsData,
        data: formDetailsData.map((d) => ({
          name: d.name,
          type: d.type,
          dataCount: d.data?.length || 0,
          placesCount:
            d.data?.filter((item: any) => item.type === "place")?.length || 0,
          hasTimestamp: !!d._updateTimestamp,
          timestamp: d._updateTimestamp,
        })),
      }
    );
  }, [formDetailsData]);

  useEffect(() => {
    console.log("🗺️ Map data updated:", {
      destination: mapDestination,
      placesCount: mapPlaces.length,
    });

    if (mapDestination) {
      console.log("🗺️ Destination details:", mapDestination);
    }

    if (mapPlaces.length > 0) {
      console.log(
        "🗺️ Places details:",
        mapPlaces.map((p) => ({
          name: p.name,
          order: p.order,
          coordinates: p.location?.coordinates,
          valid:
            p.location?.coordinates &&
            Array.isArray(p.location.coordinates) &&
            p.location.coordinates.length === 2 &&
            typeof p.location.coordinates[0] === "number" &&
            typeof p.location.coordinates[1] === "number",
        }))
      );
    }
  }, [mapDestination, mapPlaces]);

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
      // Cleanup debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
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
            <PlannerForm
              planner={planner.planner}
              onFormDataChange={(formData) => {
                console.log(
                  "🔄 Callback invoked in CustomScrollLayoutPlanner:",
                  {
                    hasFormData: !!formData,
                    detailsCount: formData?.details?.length || 0,
                  }
                );
                updateFormData(formData);
              }}
            />
          </div>
        </div>
      </div>

      {/* Map container - cố định */}
      <div className="w-1/2 h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 to-cyan-50 relative">
        <Map destination={mapDestination || undefined} places={mapPlaces} />
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

export default CustomScrollLayoutPlanner;
