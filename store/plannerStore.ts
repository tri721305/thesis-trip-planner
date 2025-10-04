import { create } from "zustand";

interface RouteData {
  fromPlace: string;
  toPlace: string;
  distance: number; // in meters
  duration: number; // in seconds
  geometry: any; // GeoJSON LineString
  waypoints?: Array<{ lat: number; lon: number }>;
  legs?: Array<any>;
  routeCode?: string;
  detailedWaypoints?: Array<any>;
}

interface DayRoutingData {
  routes: RouteData[];
  totalDistance: number;
  totalDuration: number;
  isCalculating: boolean;
  lastUpdated: Date | null;
  error?: string;
}

interface PlannerState {
  plannerData: any;
  // NEW: Routing data for map visualization
  routingData: { [dayKey: string]: DayRoutingData };
  // NEW: State for flying to clicked places
  flyToPlace: {
    coordinates: [number, number];
    name: string;
    timestamp: number;
  } | null;
  // NEW: State for hotel data
  hotelsData: any[];
  setPlannerData: (data: any) => void;
  updatePlannerDetails: (details: any[]) => void;
  // NEW: Method to update routing data
  setRoutingData: (routingData: { [dayKey: string]: DayRoutingData }) => void;
  updateDayRouting: (dayKey: string, dayRouting: DayRoutingData) => void;
  // NEW: Method to set fly to place
  setFlyToPlace: (
    placeData: {
      coordinates: [number, number];
      name: string;
      timestamp: number;
    } | null
  ) => void;
  // NEW: Method to set hotels data
  setHotelsData: (hotelsData: any[]) => void;
  clearPlannerData: () => void;
}

export const usePlannerStore = create<PlannerState>((set, get) => ({
  plannerData: null,
  routingData: {}, // Initialize empty routing data
  flyToPlace: null, // Initialize fly to place state
  hotelsData: [], // Initialize empty hotels data

  setPlannerData: (data: any) => {
    console.log("🏪 Store - Setting planner data:", {
      title: data?.title,
      detailsCount: data?.details?.length || 0,
      placesCount:
        data?.details?.reduce((total: number, detail: any) => {
          return (
            total +
            (detail.data?.filter((item: any) => item.type === "place")
              ?.length || 0)
          );
        }, 0) || 0,
    });
    set({ plannerData: data });
  },

  updatePlannerDetails: (details: any[]) => {
    const currentData = get().plannerData;
    if (currentData) {
      const updatedData = {
        ...currentData,
        details: details,
      };
      console.log("🏪 Store - Updating planner details:", {
        detailsCount: details.length,
        placesCount:
          details.reduce((total: number, detail: any) => {
            return (
              total +
              (detail.data?.filter((item: any) => item.type === "place")
                ?.length || 0)
            );
          }, 0) || 0,
      });
      set({ plannerData: updatedData });
    }
  },

  // NEW: Set entire routing data
  setRoutingData: (routingData: { [dayKey: string]: DayRoutingData }) => {
    console.log("🏪 Store - Setting routing data:", {
      dayCount: Object.keys(routingData).length,
      totalRoutes: Object.values(routingData).reduce(
        (total, day) => total + day.routes.length,
        0
      ),
    });
    set({ routingData });
  },

  // NEW: Update specific day routing data
  updateDayRouting: (dayKey: string, dayRouting: DayRoutingData) => {
    const currentRoutingData = get().routingData;
    const updatedRoutingData = {
      ...currentRoutingData,
      [dayKey]: dayRouting,
    };
    console.log("🏪 Store - Updating day routing:", {
      dayKey,
      routeCount: dayRouting.routes.length,
      totalDistance: `${(dayRouting.totalDistance / 1000).toFixed(1)}km`,
      totalDuration: `${Math.round(dayRouting.totalDuration / 60)}min`,
      isCalculating: dayRouting.isCalculating,
    });
    set({ routingData: updatedRoutingData });
  },

  // NEW: Set fly to place data
  setFlyToPlace: (placeData) => {
    console.log("🏪 Store - Setting fly to place:", placeData);
    set({ flyToPlace: placeData });
  },

  // NEW: Set hotels data
  setHotelsData: (hotelsData) => {
    console.log("🏪 Store - Setting hotels data:", {
      hotelsCount: hotelsData.length,
      hotelsWithLocation: hotelsData.filter(
        (h) => h?.lodging?.location?.longitude && h?.lodging?.location?.latitude
      ).length,
    });
    set({ hotelsData });
  },

  clearPlannerData: () => {
    console.log("🏪 Store - Clearing all planner data");
    set({
      plannerData: null,
      routingData: {},
      flyToPlace: null,
      hotelsData: [],
    });
  },
}));
