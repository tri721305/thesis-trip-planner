"use client";
import { useDebounce } from "@/hooks/useDebounceCallback";
import { PlannerSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, {
  useEffect,
  useRef,
  useState,
  useTransition,
  useCallback,
} from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { z } from "zod";
import { usePlannerStore } from "@/store/plannerStore";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import {
  Trash2,
  Plus,
  MapPin,
  Calendar,
  Users,
  Hotel,
  Route,
  CalendarIcon,
  UserPlus,
  Share,
  Link,
  User,
  Settings,
  Undo,
  Car,
  Pencil,
  Trash,
  Save,
} from "lucide-react";
import Image from "next/image";

import { CalendarDatePicker } from "../calendar-date-picker";
import moment from "moment";
import ReusableDialog from "../modal/ReusableDialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "../ui/label";
import { GrUserSettings } from "react-icons/gr";
import { MdChecklist, MdFlight } from "react-icons/md";
import { BiMoney, BiRestaurant, BiSolidHotel } from "react-icons/bi";
import { GoKebabHorizontal } from "react-icons/go";
import Collaps from "../Collaps";
import { FaMapMarker, FaPen, FaTrash } from "react-icons/fa";
import InputWithIcon from "../input/InputIcon";
import DebouncedNoteInput from "../input/DebouncedNoteInput";
import DebouncedTextarea from "../input/DebouncedTextarea";
import InputCollapseHotelMultiple from "../input/InputCollapseHotelMultiple";
import InputHotelPlanner from "../input/InputHotelPlanner";
import HotelSearch from "../search/HotelSearch";
import LodgingSearch from "../search/LodgingSearch";
import "./style.css";
import PlaceSearch from "../search/PlaceSearch";
import { FaEllipsis, FaNoteSticky } from "react-icons/fa6";
import Checklist from "../input/Checklist";
import ImageGallery from "../images/ImageGallery";
import RangeTimePicker from "../timepicker/RangeTimePicker";
import { auth } from "@/auth";
import {
  updatePlanner,
  updatePlannerMainImage,
} from "@/lib/actions/planner.action";
import { getPlaceById } from "@/lib/actions/place.action";
import { useToast } from "@/hooks/use-toast";
import { Toast } from "../ui/toast";
type PlannerFormData = z.infer<typeof PlannerSchema>;

const PlannerForm = ({ planner }: { planner?: any }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Zustand store for planner data
  const { setPlannerData, updatePlannerDetails, updateDayRouting } =
    usePlannerStore();
  const [showDialog, setShowDialog] = useState(false);
  const [manageTripmates, setManageTripmates] = useState(false);
  const [showAddHotel, setShowAddHotel] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const divRef = useRef<HTMLDivElement | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showExpenses, setShowExpenses] = useState(false);
  const [openModalHotel, setOpenModalHotel] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [currentMainImage, setCurrentMainImage] = useState(
    planner?.image || "/images/ocean.jpg"
  );
  // State for preserving scroll position and preventing auto-scroll conflicts
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // State for hotel search values - moved to component level to follow Rules of Hooks
  const [hotelSearchValues, setHotelSearchValues] = useState<{
    [key: number]: string;
  }>({});

  // State for note inputs with debounce
  const [noteInputValues, setNoteInputValues] = useState<{
    [key: string]: string; // key format: "detailIndex-itemIndex"
  }>({});

  // NEW: State for routing information from OpenStreetMap API
  const [localRoutingData, setLocalRoutingData] = useState<{
    [dayKey: string]: {
      routes: Array<{
        fromPlace: string;
        toPlace: string;
        distance: number; // in meters
        duration: number; // in seconds
        geometry: any; // GeoJSON coordinates
        waypoints?: Array<{ lat: number; lon: number }>;
        // NEW: Detailed route information from OpenStreetMap
        legs?: Array<{
          summary: string;
          weight: number;
          duration: number;
          distance: number;
          steps: Array<{
            intersections: Array<{
              out?: number;
              in?: number;
              entry: boolean[];
              bearings: number[];
              location: [number, number]; // [longitude, latitude]
            }>;
            driving_side: string;
            geometry: string; // encoded polyline
            maneuver: {
              bearing_after: number;
              bearing_before: number;
              location: [number, number];
              modifier: string;
              type: string; // depart, turn, arrive, etc.
            };
            name: string; // street name
            ref?: string; // road reference
            mode: string; // driving, walking, etc.
            weight: number;
            duration: number;
            distance: number;
          }>;
        }>;
        routeCode?: string; // "Ok" or error code
        detailedWaypoints?: Array<{
          hint: string;
          location: [number, number];
          name: string;
          distance: number;
        }>;
      }>;
      totalDistance: number;
      totalDuration: number;
      isCalculating: boolean;
      lastUpdated: Date | null;
      error?: string;
    };
  }>({});

  // NEW: Enhanced function to call OpenStreetMap routing API with retry logic
  const calculateRoute = async (
    coordinates: Array<{ lat: number; lon: number }>,
    retryCount = 0
  ): Promise<{
    distance: number;
    duration: number;
    geometry: any;
    waypoints?: Array<{ lat: number; lon: number }>;
    legs?: Array<any>;
    routeCode?: string;
    detailedWaypoints?: Array<any>;
  } | null> => {
    if (coordinates.length < 2) return null;

    // Validate coordinates
    for (const coord of coordinates) {
      if (
        typeof coord.lat !== "number" ||
        typeof coord.lon !== "number" ||
        coord.lat < -90 ||
        coord.lat > 90 ||
        coord.lon < -180 ||
        coord.lon > 180 ||
        isNaN(coord.lat) ||
        isNaN(coord.lon)
      ) {
        console.error("❌ Invalid coordinates:", coord);
        return null;
      }
    }

    try {
      // Format coordinates for OpenStreetMap API: longitude,latitude;longitude,latitude
      const coordsString = coordinates
        .map((coord) => `${coord.lon.toFixed(6)},${coord.lat.toFixed(6)}`)
        .join(";");

      const response = await fetch(
        `https://routing.openstreetmap.de/routed-car/route/v1/driving/${coordsString}?overview=full&geometries=geojson&continue_straight=false&steps=true`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "User-Agent":
              "TravelPlannerApp/1.0 (Contact: admin@travelplanner.com)",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 429 && retryCount < 2) {
          // Rate limited, retry after delay
          console.warn("⚠️ Rate limited, retrying in 2 seconds...");
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return calculateRoute(coordinates, retryCount + 1);
        }
        throw new Error(
          `Routing API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        return {
          distance: Math.round(route.distance || 0), // in meters
          duration: Math.round(route.duration || 0), // in seconds
          geometry: route.geometry, // GeoJSON coordinates
          waypoints: data.waypoints?.map((wp: any) => ({
            lat: wp.location[1],
            lon: wp.location[0],
          })),
          // NEW: Add detailed route information
          legs: route.legs || [],
          routeCode: data.code || "Ok",
          detailedWaypoints: data.waypoints || [],
        };
      } else {
        throw new Error("No routes found in API response");
      }
    } catch (error) {
      if (retryCount < 2) {
        console.warn(
          `⚠️ Routing attempt ${retryCount + 1} failed, retrying...`,
          error
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return calculateRoute(coordinates, retryCount + 1);
      }

      console.error("❌ OpenStreetMap routing error after retries:", error);
      return null;
    }
  };

  // NEW: Enhanced function to calculate routes between consecutive places within each day
  const calculateDayRoutes = async (detailIndex: number) => {
    const detail = form.getValues(`details.${detailIndex}`);
    if (!detail?.data || !Array.isArray(detail.data)) return;

    const dayKey = `day-${detailIndex}`;

    // Set calculating state
    // Set calculating state and update store
    const currentRoutingData = localRoutingData[dayKey];
    const dayRoutingData = {
      routes: currentRoutingData?.routes || [],
      totalDistance: currentRoutingData?.totalDistance || 0,
      totalDuration: currentRoutingData?.totalDuration || 0,
      isCalculating: true,
      lastUpdated: currentRoutingData?.lastUpdated || null,
      error: undefined,
    };

    setLocalRoutingData((prev) => ({
      ...prev,
      [dayKey]: dayRoutingData,
    }));

    // NEW: Update Zustand store with calculating state
    updateDayRouting(dayKey, dayRoutingData);

    try {
      // Extract places with coordinates from the day's data
      const places = detail.data.filter((item: any) => item.type === "place");
      const placesWithCoords: Array<{
        name: string;
        coordinates: { lat: number; lon: number };
      }> = [];

      // Get coordinates for each place
      for (const place of places) {
        // Type guard to ensure we're working with place items
        if (place.type !== "place") continue;

        let coordinates: { lat: number; lon: number } | null = null;

        if (
          place.location?.coordinates &&
          Array.isArray(place.location.coordinates) &&
          place.location.coordinates.length === 2
        ) {
          const [lon, lat] = place.location.coordinates;
          if (typeof lon === "number" && typeof lat === "number") {
            coordinates = { lat, lon };
          }
        } else if ((place as any).id || (place as any).attractionId) {
          // Fetch coordinates using getPlaceById
          const lookupId = (place as any).id || (place as any).attractionId;
          try {
            const result = await getPlaceById(lookupId);
            if (result.success && result.data?.place?.location?.coordinates) {
              const [lon, lat] = result.data.place.location.coordinates;
              if (typeof lon === "number" && typeof lat === "number") {
                coordinates = { lat, lon };
              }
            }
          } catch (error) {
            console.warn(
              `⚠️ Failed to fetch coordinates for place ID ${lookupId}:`,
              error
            );
          }
        }

        if (coordinates) {
          placesWithCoords.push({
            name: place.name || "Unknown Place",
            coordinates,
          });
        } else {
          console.warn(
            `⚠️ No coordinates found for place: ${place.name || "Unknown"}`
          );
        }
      }

      if (placesWithCoords.length < 2) {
        const errorMessage =
          placesWithCoords.length === 0
            ? "No places with valid coordinates found"
            : "Need at least 2 places with coordinates to calculate routes";

        // Update routing data state and store
        const dayRoutingData = {
          routes: [],
          totalDistance: 0,
          totalDuration: 0,
          isCalculating: false,
          lastUpdated: new Date(),
          error: errorMessage,
        };

        setLocalRoutingData((prev) => ({
          ...prev,
          [dayKey]: dayRoutingData,
        }));

        // NEW: Update Zustand store with routing data
        updateDayRouting(dayKey, dayRoutingData);
        return;
      }

      // Calculate routes between consecutive places
      const routes: Array<{
        fromPlace: string;
        toPlace: string;
        distance: number;
        duration: number;
        geometry: any;
        waypoints?: Array<{ lat: number; lon: number }>;
        legs?: Array<any>;
        routeCode?: string;
        detailedWaypoints?: Array<any>;
      }> = [];
      let totalDistance = 0;
      let totalDuration = 0;
      let successfulRoutes = 0;

      for (let i = 0; i < placesWithCoords.length - 1; i++) {
        const fromPlace = placesWithCoords[i];
        const toPlace = placesWithCoords[i + 1];

        console.log(
          `🗺️ Calculating route ${i + 1}/${placesWithCoords.length - 1}: ${fromPlace.name} → ${toPlace.name}`
        );

        const routeResult = await calculateRoute([
          fromPlace.coordinates,
          toPlace.coordinates,
        ]);

        if (routeResult) {
          routes.push({
            fromPlace: fromPlace.name,
            toPlace: toPlace.name,
            distance: routeResult.distance,
            duration: routeResult.duration,
            geometry: routeResult.geometry,
            waypoints: routeResult.waypoints,
            // NEW: Add detailed route information
            legs: routeResult.legs,
            routeCode: routeResult.routeCode,
            detailedWaypoints: routeResult.detailedWaypoints,
          });

          totalDistance += routeResult.distance;
          totalDuration += routeResult.duration;
          successfulRoutes++;

          // NEW: Log detailed route information for debugging
          console.log(`✅ Route calculated with detailed steps:`, {
            fromPlace: fromPlace.name,
            toPlace: toPlace.name,
            distance: `${(routeResult.distance / 1000).toFixed(1)}km`,
            duration: `${Math.round(routeResult.duration / 60)}min`,
            legs: routeResult.legs?.length || 0,
            totalSteps:
              routeResult.legs?.reduce(
                (total, leg) => total + (leg.steps?.length || 0),
                0
              ) || 0,
            routeCode: routeResult.routeCode,
          });
        } else {
          console.warn(
            `⚠️ Failed to calculate route: ${fromPlace.name} → ${toPlace.name}`
          );
          // Add a placeholder route with unknown distance/duration
          routes.push({
            fromPlace: fromPlace.name,
            toPlace: toPlace.name,
            distance: 0,
            duration: 0,
            geometry: null,
          });
        }

        // Add small delay between requests to avoid rate limiting
        if (i < placesWithCoords.length - 2) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      // Update routing data state
      const errorMessage =
        successfulRoutes === 0
          ? "Failed to calculate any routes. Please check internet connection and try again."
          : successfulRoutes < routes.length
            ? `Calculated ${successfulRoutes}/${routes.length} routes successfully`
            : undefined;

      // Update routing data state and store
      const dayRoutingData = {
        routes,
        totalDistance,
        totalDuration,
        isCalculating: false,
        lastUpdated: new Date(),
        error: errorMessage,
      };

      setLocalRoutingData((prev) => ({
        ...prev,
        [dayKey]: dayRoutingData,
      }));

      // NEW: Update Zustand store with routing data
      updateDayRouting(dayKey, dayRoutingData);

      console.log(`✅ Day ${detailIndex + 1} routing completed:`, {
        places: placesWithCoords.length,
        routes: routes.length,
        successful: successfulRoutes,
        totalDistance: `${(totalDistance / 1000).toFixed(1)}km`,
        totalDuration: `${Math.round(totalDuration / 60)}min`,
      });
    } catch (error) {
      console.error(
        `❌ Error calculating routes for day ${detailIndex + 1}:`,
        error
      );
      // Update routing data state and store
      const dayRoutingData = {
        routes: [],
        totalDistance: 0,
        totalDuration: 0,
        isCalculating: false,
        lastUpdated: new Date(),
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };

      setLocalRoutingData((prev) => ({
        ...prev,
        [dayKey]: dayRoutingData,
      }));

      // NEW: Update Zustand store with routing data
      updateDayRouting(dayKey, dayRoutingData);
    }
  };

  // NEW: Function to recalculate all day routes with progress tracking
  const recalculateAllRoutes = async () => {
    const details = form.getValues("details") || [];
    const routeDays = details.filter((detail) => detail.type === "route");

    if (routeDays.length === 0) {
      console.log("ℹ️ No route-type days found to calculate");
      return;
    }

    console.log(
      `🔄 Starting route calculation for ${routeDays.length} days...`
    );

    for (let i = 0; i < details.length; i++) {
      if (details[i].type === "route") {
        console.log(`🗺️ Calculating routes for day ${i + 1}...`);
        await calculateDayRoutes(i);
        // Add delay between days to avoid overwhelming the API
        if (i < details.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }

    console.log("✅ All route calculations completed");
  };

  // NEW: Enhanced helper function to format distance and duration
  const formatRouteInfo = (distance: number, duration: number) => {
    if (distance === 0 || duration === 0) {
      return {
        distance: "Unknown",
        duration: "Unknown",
      };
    }

    const distanceStr =
      distance >= 1000
        ? `${(distance / 1000).toFixed(1)}km`
        : `${Math.round(distance)}m`;

    const durationStr =
      duration >= 3600
        ? `${Math.floor(duration / 3600)}h ${Math.round((duration % 3600) / 60)}min`
        : `${Math.round(duration / 60)}min`;

    return {
      distance: distanceStr,
      duration: durationStr,
    };
  };

  // NEW: Helper function to format route steps for display
  const formatRouteSteps = (legs: any[]) => {
    if (!legs || legs.length === 0) return [];

    const allSteps: any[] = [];

    legs.forEach((leg: any, legIndex: number) => {
      if (leg.steps && Array.isArray(leg.steps)) {
        leg.steps.forEach((step: any, stepIndex: number) => {
          // Format maneuver instructions
          let instruction = "";
          const maneuver = step.maneuver;

          if (maneuver) {
            switch (maneuver.type) {
              case "depart":
                instruction = `Bắt đầu hành trình${step.name ? ` trên ${step.name}` : ""}`;
                break;
              case "turn":
                const direction =
                  maneuver.modifier === "left"
                    ? "trái"
                    : maneuver.modifier === "right"
                      ? "phải"
                      : maneuver.modifier === "straight"
                        ? "thẳng"
                        : maneuver.modifier;
                instruction = `Rẽ ${direction}${step.name ? ` vào ${step.name}` : ""}`;
                break;
              case "arrive":
                instruction = `Đến đích${step.name ? ` tại ${step.name}` : ""}`;
                break;
              case "continue":
                instruction = `Tiếp tục${step.name ? ` trên ${step.name}` : ""}`;
                break;
              case "merge":
                instruction = `Nhập làn${step.name ? ` vào ${step.name}` : ""}`;
                break;
              case "on_ramp":
                instruction = `Lên đường cao tốc${step.name ? ` qua ${step.name}` : ""}`;
                break;
              case "off_ramp":
                instruction = `Xuống đường cao tốc${step.name ? ` tại ${step.name}` : ""}`;
                break;
              case "roundabout":
                instruction = `Đi qua bùng binh${step.name ? ` tại ${step.name}` : ""}`;
                break;
              default:
                instruction = `${maneuver.type}${step.name ? ` trên ${step.name}` : ""}`;
            }
          }

          allSteps.push({
            stepIndex: stepIndex,
            legIndex: legIndex,
            instruction,
            streetName: step.name || "",
            roadRef: step.ref || "",
            distance: step.distance || 0,
            duration: step.duration || 0,
            maneuverType: maneuver?.type || "",
            maneuverModifier: maneuver?.modifier || "",
            geometry: step.geometry || "",
            intersections: step.intersections || [],
          });
        });
      }
    });

    return allSteps;
  };

  // NEW: Helper function to get route summary from legs
  const getRouteSummary = (legs: any[]) => {
    if (!legs || legs.length === 0) return "Không có thông tin đường đi";

    // Get main roads from route
    const mainRoads = new Set<string>();

    legs.forEach((leg) => {
      if (leg.steps) {
        leg.steps.forEach((step: any) => {
          if (step.name && step.name.trim() !== "" && step.distance > 100) {
            mainRoads.add(step.name);
          }
        });
      }
    });

    const roadList = Array.from(mainRoads).slice(0, 3); // Take first 3 main roads
    return roadList.length > 0 ? roadList.join(" → ") : "Đường nội thành";
  };

  // NEW: Helper function to log detailed routing data for debugging
  const logRoutingData = () => {
    console.log("🗺️ DETAILED ROUTING DATA:");
    console.log("========================");

    Object.entries(localRoutingData).forEach(([dayKey, dayData]) => {
      console.log(`\n📅 ${dayKey.toUpperCase()}:`);
      console.log(
        `   Total Distance: ${formatRouteInfo(dayData.totalDistance, dayData.totalDuration).distance}`
      );
      console.log(
        `   Total Duration: ${formatRouteInfo(dayData.totalDistance, dayData.totalDuration).duration}`
      );
      console.log(`   Routes: ${dayData.routes.length}`);
      console.log(
        `   Status: ${dayData.isCalculating ? "Calculating..." : "Completed"}`
      );
      console.log(
        `   Last Updated: ${dayData.lastUpdated?.toLocaleString() || "Never"}`
      );

      if (dayData.error) {
        console.log(`   ⚠️ Error: ${dayData.error}`);
      }

      dayData.routes.forEach((route, index) => {
        console.log(
          `\n   Route ${index + 1}: ${route.fromPlace} → ${route.toPlace}`
        );
        console.log(
          `     Distance: ${formatRouteInfo(route.distance, route.duration).distance}`
        );
        console.log(
          `     Duration: ${formatRouteInfo(route.distance, route.duration).duration}`
        );
        console.log(`     Status: ${route.routeCode || "Unknown"}`);

        if (route.legs && route.legs.length > 0) {
          console.log(`     Main Roads: ${getRouteSummary(route.legs)}`);
          console.log(`     Steps: ${formatRouteSteps(route.legs).length}`);

          // Log detailed steps
          const steps = formatRouteSteps(route.legs);
          steps.forEach((step, stepIdx) => {
            console.log(
              `       ${stepIdx + 1}. ${step.instruction} (${formatRouteInfo(step.distance, step.duration).distance})`
            );
          });
        }
      });
    });

    console.log("\n========================");
    console.log("🔍 Raw routing data:", localRoutingData);
  };

  // const session = await auth();
  const form = useForm<PlannerFormData>({
    resolver: zodResolver(PlannerSchema),
    defaultValues: {
      title: planner?.title || "",
      image: planner?.image || "",
      note: planner?.note || "",
      author: planner?.author || "",
      state: "planning",
      startDate: planner?.startDate || "",
      endDate: planner?.endDate || "",
      destination: planner?.destination || {},
      generalTips: planner?.generalTips || "",
      tripmates: planner?.tripmates || [],
      lodging: planner?.lodging || [],
      details: planner?.details || [],
      type: planner?.type || "private", // Add missing type field
    },
  });

  // Initialize store with planner data on component mount
  useEffect(() => {
    if (planner) {
      setPlannerData(planner);
    }
  }, [planner, setPlannerData]);

  // Helper function to update store when form changes - MEMOIZED
  const updateStore = React.useCallback(() => {
    const currentFormData = form.getValues();
    setPlannerData(currentFormData);
  }, [form, setPlannerData]);

  // Debounced version of updateStore to prevent excessive calls - INCREASED TO 500ms
  const debouncedUpdateStore = useDebounce(updateStore, 500);

  // MEMOIZED function for updating item data to prevent infinite rerenders
  const updateItemData = React.useCallback(
    (detailIndex: number, itemIndex: number, newData: any) => {
      const currentRouteItems =
        form.getValues(`details.${detailIndex}.data`) || [];
      const updatedItems = [...currentRouteItems];

      // Check if the data actually changed to prevent unnecessary updates
      const currentItem = updatedItems[itemIndex];
      if (!currentItem) return;

      // Update the appropriate field based on item type
      const itemType = updatedItems[itemIndex]?.type;
      let hasChanged = false;

      if (itemType === "note") {
        const noteItem = currentItem as { type: "note"; content: string };
        if (noteItem.content !== newData) {
          updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            content: newData,
          };
          hasChanged = true;
        }
      } else if (itemType === "checklist") {
        const checklistItem = currentItem as {
          type: "checklist";
          items: string[];
        };
        const newItems = Array.isArray(newData) ? newData : [newData];
        if (JSON.stringify(checklistItem.items) !== JSON.stringify(newItems)) {
          updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            items: newItems,
          };
          hasChanged = true;
        }
      } else if (itemType === "place") {
        // For place type, always update as it can have complex nested data
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          ...newData,
        };
        hasChanged = true;
      }

      // Only update if data actually changed
      if (hasChanged) {
        form.setValue(`details.${detailIndex}.data`, updatedItems, {
          shouldValidate: false,
          shouldDirty: true,
          shouldTouch: false,
        });

        // Debounced store update to prevent excessive calls
        debouncedUpdateStore();
      }
    },
    [form, debouncedUpdateStore]
  );

  // MEMOIZED remove item function
  const removeItem = React.useCallback(
    (detailIndex: number, itemIndex: number) => {
      const currentRouteItems =
        form.getValues(`details.${detailIndex}.data`) || [];
      const updatedItems = currentRouteItems.filter((_, i) => i !== itemIndex);
      const removedItem = currentRouteItems[itemIndex];

      form.setValue(`details.${detailIndex}.data`, updatedItems, {
        shouldValidate: false,
        shouldDirty: true,
        shouldTouch: false,
      });

      // Immediate store update for removals
      updateStore();

      // If a place was removed, recalculate routes for this day
      if (removedItem?.type === "place") {
        setTimeout(() => {
          calculateDayRoutes(detailIndex);
        }, 500);
      }
    },
    [form, updateStore]
  );

  // Use specific watchers instead of general watch to reduce re-renders
  // const { watch } = form;
  // const hotelsWatch = watch("lodging");

  // Field arrays for dynamic sections
  const {
    fields: tripmateFields,
    append: appendTripmate,
    remove: removeTripmate,
  } = useFieldArray({
    control: form.control,
    name: "tripmates",
  });

  const {
    fields: lodgingFields,
    append: appendLodging,
    remove: removeLodging,
  } = useFieldArray({
    control: form.control,
    name: "lodging",
  });

  const {
    fields: detailFields,
    append: appendDetail,
    remove: removeDetail,
  } = useFieldArray({
    control: form.control,
    name: "details",
  });

  const onSubmit = (data: PlannerFormData) => {
    startTransition(() => {
      // TODO: Implement submit logic
    });
  };

  const addNewTripmate = () => {
    appendTripmate({
      name: "",
      email: "",
      image: "",
      userId: "",
    });
  };

  const addNewLodging = (hotel: any) => {
    appendLodging({
      name: hotel?.lodging?.name || "",
      address: hotel?.lodging?.address || "",
      checkIn: "",
      checkOut: "",
      confirmation: "",
      notes: "",
      cost: {
        type: "VND",
        value: hotel?.priceRate?.amount || 0,
      },
    });
  };

  const addNewDetail = (type: "route" | "list") => {
    appendDetail({
      type,
      name: "",
      index: detailFields.length + 1,
      data: [],
    });
  };

  const generateRouteDetailsForDateRange = (startDate: Date, endDate: Date) => {
    if (!startDate || !endDate) return;

    // Clear existing route-type details
    const existingDetails = form.getValues("details") || [];
    const nonRouteDetails = existingDetails.filter(
      (detail) => detail.type !== "route"
    );

    // Calculate the number of days between dates (inclusive)
    const start = moment(startDate);
    const end = moment(endDate);
    const daysDiff = end.diff(start, "days") + 1; // +1 to include both start and end dates

    // Generate route details for each day
    const newRouteDetails: any = [];
    for (let i = 0; i < daysDiff; i++) {
      const currentDate = moment(startDate).add(i, "days");

      // Format date like "Friday, 15th August"
      const formattedDate = currentDate.format("dddd, Do MMMM");

      newRouteDetails.push({
        type: "route",
        name: formattedDate,
        index: nonRouteDetails.length + i + 1,
        data: [],
      });
    }

    // Set all details at once to avoid multiple renders and auto-focus issues
    form.setValue("details", [...nonRouteDetails, ...newRouteDetails]);
  };

  // Function for handling user-initiated date changes (allows scrolling)
  const handleInteractiveDateChange = useCallback(
    (startDate: Date, endDate: Date) => {
      // Only auto-scroll if user is not currently scrolling manually
      if (!isUserScrolling) {
        generateRouteDetailsForDateRange(startDate, endDate);

        // Scroll to details section after a short delay to ensure DOM updates
        setTimeout(() => {
          const detailsSection = document.getElementById("details-section");
          if (detailsSection && !isUserScrolling) {
            detailsSection.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }, 300);
      } else {
        // Just generate route details without scrolling
        generateRouteDetailsForDateRange(startDate, endDate);
      }
    },
    [isUserScrolling]
  );

  const generateDayDetails = (startDate: Date, endDate: Date) => {
    const details = [];
    const currentDate = new Date(startDate);
    let index = 1;

    while (currentDate <= endDate) {
      const dayName = moment(currentDate).format("dddd, Do MMMM");

      details.push({
        type: "route" as const,
        name: dayName,
        index: index,
        data: [],
      });

      currentDate.setDate(currentDate.getDate() + 1);
      index++;
    }

    return details;
  };

  const renderHotelPreview = (hotel: any, index: number) => {
    const hasData = hotel.name || hotel.address;
    if (!hasData) {
      <div className="text-gray-500 text-sm">Click to add hotel details</div>;
    }
    const handleClickPriceHotel = () => {};
    return (
      <div className="flex item-hover-btn justify-between items-center gap-3 w-full">
        <div className="flex-1 background-form !p-4 rounded-lg">
          <div className="font-bold text-[16px] text-[#212529]">
            {hotel.name || "Unnamed Hotel"}
          </div>
          {hotel.address && (
            <div className="text-[12px] !text-[#6c757d] ">{hotel.address}</div>
          )}
          {(hotel.checkIn || hotel.checkOut) && (
            <div className="text-[20px] font-bold  text-[#212529] mt-[8px]">
              {moment(hotel.checkIn).format("ddd, DD MMM yyyy")} -{" "}
              {moment(hotel.checkOut).format("ddd, DD MMM yyyy")}
            </div>
          )}
          {hotel.cost?.value && (
            <div
              className="text-md font-bold text-gray-700 mt-2 hover:bg-gray-300  rounded-[30px] bg-gray-200 px-2 w-fit"
              onClick={handleClickPriceHotel}
            >
              {Number(hotel.cost.value).toLocaleString("vi-VN")}{" "}
              {hotel.cost.type?.toUpperCase()}
            </div>
          )}
        </div>
        <Button
          onClick={() => {
            removeLodging(index);
          }}
          className=" hover-btn !bg-transparent border-none shadow-none text-light800_dark300  flex items-center justify-center"
          size="icon"
          variant="ghost"
        >
          <Trash />
        </Button>
      </div>
    );
  };

  const renderDetailForm = (index: number) => {
    // Use form.getValues() instead of form.watch() to avoid re-renders
    const getCurrentRouteItems = () =>
      form.getValues(`details.${index}.data`) || [];

    // Get current items for rendering
    const currentRouteItems = getCurrentRouteItems();

    return (
      <div
        // ref={sectionRef}
        className="flex items-center justify-between flex-col scroll-mt-20"
        id={`section-${index}`}
      >
        <Collaps
          keyId={`detail-${index}`}
          titleFeature={
            <div className="flex-1">
              <Form {...form}>
                <div className="flex  items-center gap-2 justify-between">
                  <FormField
                    control={form.control}
                    name={`details.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="min-h-[48px] min-w-[260px] flex rounded-[8px] bg-white active:!background-form focus:background-light800_darkgradient hover:background-light800_darkgradient relative  grow items-center gap-1  px-4">
                        <FormControl>
                          <Input
                            type="text"
                            {...field}
                            className="border-none font-semibold !text-[24px] shadow-none no-focus "
                            placeholder="Add a Title (e.g, Restaurant )"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  ></FormField>
                  <FormField
                    control={form.control}
                    name={`details.${index}.type`}
                    render={({ field }) => (
                      <FormItem className="w-[100px] rounded-[8px] overflow-hidden background-form border-none shadow-none">
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="border-none font-semibold shadow-none">
                                <SelectValue
                                  placeholder="Select type"
                                  className="font-semibold"
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="list">List</SelectItem>
                              <SelectItem value="route">Route</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  ></FormField>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      // set
                    }}
                  >
                    <FaEllipsis />
                  </Button>
                </div>
              </Form>
            </div>
          }
          itemExpand={
            <div className="flex flex-col gap-2">
              {currentRouteItems?.map((item, idx) => {
                // Calculate the place number for this specific item
                const testPlace = currentRouteItems.slice(0, idx + 1);
                const placeIndex = currentRouteItems
                  .slice(0, idx + 1)
                  .filter((i) => i.type === "place").length;

                if (item.type == "note") {
                  return (
                    <div
                      key={`note-${idx}`}
                      className="flex gap-2 items-center item-hover-btn"
                    >
                      <DebouncedNoteInput
                        value={item.content || ""}
                        onChange={(value) => updateItemData(index, idx, value)}
                        placeholder="Write or paste notes here"
                        debounceMs={500}
                        className="border-none shadow-none no-focus"
                      />
                      <Button
                        onClick={() => {
                          removeItem(index, idx);
                        }}
                        className=" hover-btn !bg-transparent border-none shadow-none text-light800_dark300  flex items-center justify-center"
                      >
                        <Trash />
                      </Button>
                    </div>
                  );
                }
                if (item.type == "checklist") {
                  return (
                    <div
                      key={`checklist-${idx}`}
                      className="flex gap-2 items-center item-hover-btn"
                    >
                      <Checklist
                        className="flex-1"
                        onChange={(newItems) =>
                          updateItemData(index, idx, newItems)
                        }
                        onRemove={() => removeItem(index, idx)}
                        key={`checklist-${index}-${idx}`}
                        items={item.items as string[]}
                      />
                      <Button
                        onClick={() => {
                          removeItem(index, idx);
                        }}
                        className=" hover-btn !bg-transparent border-none shadow-none text-light800_dark300  flex items-center justify-center"
                      >
                        <Trash />
                      </Button>
                    </div>
                  );
                }
                if (item.type == "place") {
                  const listImgs = item?.imageKeys?.map(
                    (item: string) =>
                      `https://itin-dev.wanderlogstatic.com/freeImageSmall/${item}`
                  );
                  return (
                    <div
                      key={`place-${idx}`}
                      className="flex gap-3 items-center  rounded-lg item-hover-btn"
                    >
                      <div className="bg-gray-50 flex gap-3 items-start rounded-lg p-3  flex-1">
                        <section>
                          <div className="relative">
                            <FaMapMarker size={28} className="text-pink-500" />
                            <p className="text-[12px] text-white font-bold absolute top-[4px] left-[10px]">
                              {placeIndex}
                            </p>
                          </div>
                        </section>
                        <section className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {item.name || "Unnamed Place"}
                          </h3>
                          {item.address && (
                            <p className="text-sm text-gray-600 mb-2">
                              {item.address}
                            </p>
                          )}

                          {/* {item.description && (
                            <p className="text-sm text-gray-700 mb-2">
                              {item.description}
                            </p>
                          )}
                          {item.note && (
                            <p className="text-xs text-gray-500 italic">
                              Note: {item.note}
                            </p>
                          )} */}
                          <div className="flex">
                            <RangeTimePicker
                              key={`time-picker-${index}-${idx}`}
                              value={{
                                startTime: item.timeStart || "",
                                endTime: item.timeEnd || "",
                              }}
                              onChange={(timeRange: {
                                startTime: string;
                                endTime: string;
                              }) => {
                                // Get current route items
                                const currentRouteItems =
                                  getCurrentRouteItems();

                                const updatedItems = [...currentRouteItems];

                                // Update the specific place item with new time values
                                if (
                                  updatedItems[idx] &&
                                  updatedItems[idx].type === "place"
                                ) {
                                  updatedItems[idx] = {
                                    ...updatedItems[idx],
                                    timeStart: timeRange.startTime,
                                    timeEnd: timeRange.endTime,
                                  };

                                  // Update the form with the new data
                                  form.setValue(
                                    `details.${index}.data`,
                                    updatedItems,
                                    {
                                      shouldValidate: false,
                                      shouldDirty: true,
                                      shouldTouch: false,
                                    }
                                  );

                                  // Force re-render by triggering a form state update
                                  form.trigger(`details.${index}.data`);

                                  // Force trigger to ensure the update is registered
                                  setTimeout(() => {
                                    const verifyData = form.getValues(
                                      `details.${index}.data`
                                    );

                                    if (
                                      verifyData[idx]?.type === "place" &&
                                      (!verifyData[idx]?.timeStart ||
                                        !verifyData[idx]?.timeEnd)
                                    ) {
                                      console.warn(
                                        "⚠️ Time values seem to be missing after update, retrying..."
                                      );
                                      // Retry the update
                                      form.setValue(
                                        `details.${index}.data`,
                                        updatedItems,
                                        {
                                          shouldValidate: false,
                                          shouldDirty: true,
                                          shouldTouch: true,
                                        }
                                      );
                                    }
                                  }, 100);
                                } else {
                                  console.error(
                                    "❌ Failed to find item or item is not a place:",
                                    {
                                      itemExists: !!updatedItems[idx],
                                      itemType: updatedItems[idx]?.type,
                                      expectedIndex: idx,
                                    }
                                  );
                                }
                              }}
                            />
                            <Button
                              variant="ghost"
                              onClick={() => {
                                setShowExpenses(true);
                              }}
                            >
                              <BiMoney /> Add Cost
                            </Button>
                          </div>
                        </section>
                        <section>
                          <ImageGallery
                            images={listImgs}
                            mainImageIndex={0}
                            alt="Gallery description"
                            // className="w-full"
                          />
                        </section>
                      </div>
                      <Button
                        onClick={() => {
                          removeItem(index, idx);
                        }}
                        className=" hover-btn !bg-transparent border-none shadow-none text-light800_dark300  flex items-center justify-center"
                      >
                        <Trash />
                      </Button>
                    </div>
                  );
                }
              })}

              {/* NEW: Routing Information Display */}
              {(() => {
                const dayKey = `day-${index}`;
                const dayRouting = localRoutingData[dayKey];
                const placesInDay = currentRouteItems.filter(
                  (item: any) => item.type === "place"
                );

                if (placesInDay.length >= 2) {
                  return (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                          <Route className="h-4 w-4" />
                          Route Information
                        </h4>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => calculateDayRoutes(index)}
                            disabled={dayRouting?.isCalculating}
                            className="text-blue-600 border-blue-300 hover:bg-blue-100"
                          >
                            {dayRouting?.isCalculating ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                            ) : (
                              "Tính Routes"
                            )}
                          </Button>
                          {/* NEW: Debug button to log routing data */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={logRoutingData}
                            className="text-gray-600 hover:text-gray-800"
                            title="Xem chi tiết routing data trong console"
                          >
                            🔍
                          </Button>
                        </div>
                      </div>

                      {dayRouting?.error && (
                        <div className="mb-3 p-2 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded text-red-700 dark:text-red-300 text-sm">
                          ⚠️ {dayRouting.error}
                        </div>
                      )}

                      {dayRouting?.routes && dayRouting.routes.length > 0 && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-4 mb-3 p-2 bg-blue-100 dark:bg-blue-800/30 rounded">
                            <div className="text-sm">
                              <span className="font-medium">
                                Total Distance:
                              </span>
                              <span className="ml-2 text-blue-700 dark:text-blue-300">
                                {
                                  formatRouteInfo(
                                    dayRouting.totalDistance,
                                    dayRouting.totalDuration
                                  ).distance
                                }
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">
                                Total Duration:
                              </span>
                              <span className="ml-2 text-blue-700 dark:text-blue-300">
                                {
                                  formatRouteInfo(
                                    dayRouting.totalDistance,
                                    dayRouting.totalDuration
                                  ).duration
                                }
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            {dayRouting.routes.map((route, routeIdx) => (
                              <div
                                key={routeIdx}
                                className="text-xs bg-white dark:bg-gray-800 p-3 rounded border"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-gray-800 dark:text-gray-200">
                                    {route.fromPlace} → {route.toPlace}
                                  </span>
                                  <div className="flex gap-3 text-gray-600 dark:text-gray-400">
                                    <span>
                                      {
                                        formatRouteInfo(
                                          route.distance,
                                          route.duration
                                        ).distance
                                      }
                                    </span>
                                    <span>
                                      {
                                        formatRouteInfo(
                                          route.distance,
                                          route.duration
                                        ).duration
                                      }
                                    </span>
                                  </div>
                                </div>

                                {/* NEW: Route summary from main roads */}
                                {route.legs && route.legs.length > 0 && (
                                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                    <span className="font-medium">
                                      Đường đi:{" "}
                                    </span>
                                    {getRouteSummary(route.legs)}
                                  </div>
                                )}

                                {/* NEW: Detailed route steps - collapsible */}
                                {route.legs && route.legs.length > 0 && (
                                  <details className="mt-2">
                                    <summary className="cursor-pointer text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200">
                                      Xem chi tiết hướng dẫn đường đi (
                                      {formatRouteSteps(route.legs).length}{" "}
                                      bước)
                                    </summary>
                                    <div className="mt-2 space-y-1 pl-2 border-l-2 border-blue-200 dark:border-blue-700">
                                      {formatRouteSteps(route.legs).map(
                                        (step, stepIdx) => (
                                          <div
                                            key={stepIdx}
                                            className="text-xs text-gray-700 dark:text-gray-300"
                                          >
                                            <div className="flex items-start gap-2">
                                              <span className="text-blue-600 dark:text-blue-400 font-mono text-xs mt-0.5">
                                                {stepIdx + 1}.
                                              </span>
                                              <div className="flex-1">
                                                <div className="font-medium">
                                                  {step.instruction}
                                                </div>
                                                {step.distance > 0 && (
                                                  <div className="text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {
                                                      formatRouteInfo(
                                                        step.distance,
                                                        step.duration
                                                      ).distance
                                                    }{" "}
                                                    -{" "}
                                                    {
                                                      formatRouteInfo(
                                                        step.distance,
                                                        step.duration
                                                      ).duration
                                                    }
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </details>
                                )}

                                {/* NEW: Route status indicator */}
                                {route.routeCode && (
                                  <div className="flex items-center gap-1 mt-2">
                                    <span
                                      className={`w-2 h-2 rounded-full ${route.routeCode === "Ok" ? "bg-green-500" : "bg-red-500"}`}
                                    ></span>
                                    <span className="text-xs text-gray-500">
                                      Status: {route.routeCode}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {dayRouting.lastUpdated && (
                            <div className="text-xs text-gray-500 mt-2">
                              Last updated:{" "}
                              {new Date(
                                dayRouting.lastUpdated
                              ).toLocaleTimeString()}
                            </div>
                          )}
                        </div>
                      )}

                      {!dayRouting && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Click "Calculate Routes" to get distance and duration
                          between places in this day.
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })()}

              <div className="flex items-center gap-2">
                <PlaceSearch
                  onPlaceSelect={(place) => {
                    handlePlaceSelect(place, index);
                  }}
                  placeholder="Search for museums, parks, temples, beaches..."
                  maxResults={8}
                />
                <Button
                  onClick={() => {
                    handleAddNoteItem(index);
                  }}
                  className="shadow-none background-light800_dark300 hover:!bg-gray-300 dark:hover:!bg-dark-200 text-black dark:text-white rounded-full w-[48px] flex items-center h-[48px]"
                >
                  <FaNoteSticky />
                </Button>
                <Button
                  onClick={() => handleAddChecklistItem(index)}
                  className="shadow-none background-light800_dark300 hover:!bg-gray-300 dark:hover:!bg-dark-200 text-black dark:text-white  rounded-full w-[48px] flex items-center h-[48px]"
                >
                  <MdChecklist />
                </Button>
              </div>
            </div>
          }
        />

        {index + 1 < detailFields?.length && (
          <Separator className="my-[24px] " />
        )}
        {/* {isOpenDialog && (
            <ReusableDialog
              open={isOpenDialog}
              setOpen={setIsOpenDialog}
              data={{
                title: "Add hotels or lodging",
                content: <div>Hello</div>,
                showCloseButton: false,
              }}
            />
          )} */}
      </div>
    );
  };

  // Sync search values when editing index changes
  useEffect(() => {
    if (editingIndex !== null) {
      const currentHotel = form.getValues(`lodging.${editingIndex}`);
      if (currentHotel?.name) {
        setHotelSearchValues((prev: any) => ({
          ...prev,
          [editingIndex]: currentHotel.name,
        }));
      }
    }
  }, [editingIndex, form]);

  // Sync main image when planner changes
  useEffect(() => {
    if (planner?.image) {
      setCurrentMainImage(planner.image);
    }
  }, [planner?.image]);

  // Detect user scrolling to prevent auto-scroll interference
  useEffect(() => {
    const handleScroll = () => {
      setIsUserScrolling(true);

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Reset user scrolling flag after user stops scrolling
      scrollTimeoutRef.current = setTimeout(() => {
        setIsUserScrolling(false);
      }, 1500); // 1.5 second delay after user stops scrolling
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const renderHotelForm = (index: number) => {
    const searchValue = hotelSearchValues[index] || "";

    const setSearchValue = (value: string) => {
      setHotelSearchValues((prev) => ({
        ...prev,
        [index]: value,
      }));
    };

    return (
      <div className="p-4 space-y-4">
        <FormField
          control={form.control}
          name={`lodging.${index}.name`}
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Hotel Name</FormLabel>
                <LodgingSearch
                  key={`lodging-search-${index}-${editingIndex}`}
                  value={searchValue}
                  onSelectHotel={(hotel: any) => {
                    // Update search value
                    const hotelName = hotel?.lodging?.name || hotel?.name || "";
                    setSearchValue(hotelName);
                    // Cập nhật tất cả dữ liệu hotel vào form theo index
                    form.setValue(`lodging.${index}.name`, hotelName);
                    form.setValue(
                      `lodging.${index}.address`,
                      hotel?.lodging?.address || hotel?.address || ""
                    );
                    if (hotel?.priceRate?.amount) {
                      form.setValue(
                        `lodging.${index}.cost.value`,
                        hotel.priceRate.amount
                      );
                    }
                    if (hotel?.priceRate?.currency || hotel?.cost?.type) {
                      form.setValue(
                        `lodging.${index}.cost.type`,
                        hotel.priceRate.currency || hotel.cost.type || "VND"
                      );
                    }

                    // Update field value as well
                    field.onChange(hotelName);

                    // Đóng chế độ editing sau khi select
                    // setEditingIndex(null);
                    // setShowAddHotel(false);
                  }}
                  onSearchChange={(value: string) => {
                    setSearchValue(value);
                    field.onChange(value);
                  }}
                />
                <FormMessage />
              </FormItem>
            );
          }}
        />

        {/* Address Field */}
        <FormField
          control={form.control}
          name={`lodging.${index}.address`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input
                  className={` border-none paragraph-regular background-form-input light-border-2 text-dark300_light700 no-focus rounded-1.5 border`}
                  placeholder="Hotel address"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <Label className="">Check in - Check out</Label>
          <CalendarDatePicker
            className="!w-fit mt-[8px] "
            date={{
              from: form.watch(`lodging.${index}.checkIn`)
                ? moment(form.watch(`lodging.${index}.checkIn`)).toDate()
                : new Date(),
              to: form.watch(`lodging.${index}.checkOut`)
                ? moment(form.watch(`lodging.${index}.checkOut`)).toDate()
                : new Date(),
            }}
            onDateSelect={(e) => {
              form.setValue(`lodging.${index}.checkIn`, e.from);
              form.setValue(`lodging.${index}.checkOut`, e.to);
            }}
          />
        </div>
        {/* Cost Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name={`lodging.${index}.cost.value`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost</FormLabel>
                <FormControl>
                  <Input
                    className={` border-none paragraph-regular background-form-input light-border-2 text-dark300_light700 no-focus rounded-1.5 border`}
                    type="number"
                    min="0"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`lodging.${index}.cost.type`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger
                      className={` border-none paragraph-regular background-form-input light-border-2 text-dark300_light700 no-focus rounded-1.5 border`}
                    >
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="VND">VND</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name={`lodging.${index}.notes`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  className={` border-none paragraph-regular background-form-input light-border-2 text-dark300_light700 no-focus rounded-1.5 border`}
                  placeholder="Additional notes..."
                  {...field}
                  rows={2}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setEditingIndex(null)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => setEditingIndex(null)}
            className="flex-1"
          >
            Save
          </Button>
        </div>
      </div>
    );
  };

  const handleAddNoteItem = (parentIndex: number) => {
    const currentItems = form.getValues(`details.${parentIndex}.data`) || [];
    const newPosition = currentItems.length + 1;

    const newNoteItem = {
      type: "note" as const,
      content: "",
    };

    // Update the form with new item
    const updatedItems = [...currentItems, newNoteItem];
    form.setValue(`details.${parentIndex}.data`, updatedItems);

    // Trigger immediate store update
    updateStore();
  };
  const handleAddChecklistItem = (parentIndex: number) => {
    const currentItems = form.getValues(`details.${parentIndex}.data`) || [];
    const newPosition = currentItems.length + 1;

    const newChecklistItem = {
      type: "checklist" as const,
      items: [], // Empty checklist array
    };

    // Update the form with new item
    const updatedItems = [...currentItems, newChecklistItem];
    form.setValue(`details.${parentIndex}.data`, updatedItems);

    // Trigger immediate store update
    updateStore();
  };

  const handlePlaceSelect = (place: any, index: any) => {
    // Direct selection from component
    const currentItems = form.getValues(`details.${index}.data`) || [];
    // const newPosition = currentItems.length + 1;

    const newPlaceItem = {
      type: "place" as const,
      ...place,
      // Explicitly ensure location data is preserved
      location: place.location
        ? {
            type: place.location.type || "Point",
            coordinates: place.location.coordinates,
          }
        : undefined,
      timeStart: place.timeStart || "", // Ensure timeStart exists
      timeEnd: place.timeEnd || "", // Ensure timeEnd exists
    };

    // Update the form with new item
    const updatedItems = [...currentItems, newPlaceItem];
    form.setValue(`details.${index}.data`, updatedItems);

    // Update store immediately after adding place
    updateStore();

    // Automatically calculate routes for this day after adding a place
    setTimeout(() => {
      calculateDayRoutes(index);
    }, 1000); // Delay to allow form to update

    // // Verify the form value was set correctly
    // setTimeout(() => {
    //   const verifyData = form.getValues(`details.${index}.data`);
    //   const addedItem = verifyData[verifyData.length - 1];
    //   if (addedItem.type === "place") {
    //     console.log("🔍 DEBUG - Verified form data after adding place:", {
    //       hasLocation: !!addedItem.location,
    //       location: addedItem.location,
    //       coordinates: addedItem.location?.coordinates,
    //     });
    //   }
    // }, 100);
  };
  const handleUploadImage = () => {
    // Tạo một input file ẩn
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = false;

    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File quá lớn",
          description: "Vui lòng chọn ảnh có kích thước nhỏ hơn 5MB",
          variant: "destructive",
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "File không hợp lệ",
          description: "Vui lòng chọn file ảnh (jpg, png, webp, etc.)",
          variant: "destructive",
        });
        return;
      }

      // Show preview immediately while uploading
      const previewUrl = URL.createObjectURL(file);
      setCurrentMainImage(previewUrl);

      try {
        setIsUploadingImage(true);

        // Gọi function upload ảnh
        const result: any = await updatePlannerMainImage({
          plannerId: planner._id,
          imageFile: file,
        });

        if (result.success && result.data) {
          // Cleanup preview URL
          URL.revokeObjectURL(previewUrl);

          // Cập nhật với URL thực từ S3
          setCurrentMainImage(result.data.image);

          // Cập nhật form data
          form.setValue("image", result.data.image);

          toast({
            title: "Upload thành công!",
            description: "Ảnh bìa đã được cập nhật",
            variant: "success",
          });
        } else {
          // Revert to original image on failure
          setCurrentMainImage(planner?.image || "/images/ocean.jpg");
          URL.revokeObjectURL(previewUrl);

          toast({
            title: "Upload thất bại",
            description:
              result.error?.message ||
              "Không thể upload ảnh. Vui lòng thử lại!",
            variant: "destructive",
          });
          console.error("Upload failed:", result.error);
        }
      } catch (error) {
        // Revert to original image on error
        setCurrentMainImage(planner?.image || "/images/ocean.jpg");
        URL.revokeObjectURL(previewUrl);

        toast({
          title: "Có lỗi xảy ra",
          description:
            "Không thể upload ảnh. Vui lòng kiểm tra kết nối mạng và thử lại!",
          variant: "destructive",
        });
        console.error("Error uploading image:", error);
      } finally {
        setIsUploadingImage(false);
      }
    };

    // Trigger file picker
    input.click();
  };
  const handleSubmit = async () => {
    const formData = form.getValues();

    // Format and validate data before sending
    const formatDataForServer = (data: any) => {
      const formatted = { ...data };

      // Format dates to ISO strings if they're Date objects
      if (formatted.startDate) {
        formatted.startDate =
          formatted.startDate instanceof Date
            ? formatted.startDate.toISOString()
            : formatted.startDate;
      }

      if (formatted.endDate) {
        formatted.endDate =
          formatted.endDate instanceof Date
            ? formatted.endDate.toISOString()
            : formatted.endDate;
      }

      // Ensure required fields are present
      if (!formatted.title || formatted.title.trim() === "") {
        throw new Error("Title is required");
      }

      return formatted;
    };

    // // Debug: Check if location data exists in form data
    // if (formData.details) {
    //   formData.details.forEach((detail: any, detailIndex: number) => {
    //     if (detail.data) {
    //       detail.data.forEach((item: any, itemIndex: number) => {
    //         if (item.type === "place") {
    //           console.log(`Place ${detailIndex}-${itemIndex}:`, {
    //             name: item.name,
    //             hasLocation: !!item.location,
    //             location: item.location,
    //             coordinates: item.location?.coordinates,
    //           });
    //         }
    //       });
    //     }
    //   });
    // }

    // Workaround: Ensure location data is preserved for place items
    const processedFormData = {
      ...formData,
      details: formData.details?.map((detail: any) => ({
        ...detail,
        data: detail.data?.map((item: any) => {
          if (item.type === "place" && !item.location && item.id) {
            console.log(
              "⚠️ Place missing location data, will be fetched by ID:",
              item.name
            );
          }
          return item;
        }),
      })),
    };

    try {
      // Format data for server
      const formattedData = formatDataForServer(processedFormData);

      // Create Date objects with proper start/end times
      const startDate = new Date(formattedData.startDate);
      startDate.setHours(0, 0, 0, 0); // Set to beginning of day (00:00:00)

      const endDate = new Date(formattedData.endDate);
      endDate.setHours(23, 59, 59, 999); // Set to end of day (23:59:59.999)

      const dataTest: any = {
        ...formattedData,
        plannerId: planner._id,
        startDate: startDate,
        endDate: endDate,
      };

      const updatePlannerData: any = await updatePlanner(dataTest);

      if (updatePlannerData && updatePlannerData.success) {
        toast({
          title: "Update Planner Successfully!",
          description: "Your planner has been updated successfully.",
          variant: "success",
        });
      } else {
        console.error("Update failed:", updatePlannerData);

        // Show detailed error message
        const errorMessage =
          updatePlannerData?.error?.message ||
          updatePlannerData?.message ||
          "Unknown error occurred";

        toast({
          title: "Update Failed!",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating planner:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast({
        title: "Error!",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  console.log("dataForm", form.getValues(), "planner", planner);
  return (
    <div className="container mx-auto  max-w-4xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="h-[400px] relative !pt-10">
            <Image
              alt="image-places"
              src={currentMainImage}
              fill
              className="object-cover transition-opacity duration-300"
              priority
            />

            {/* Upload overlay */}
            {isUploadingImage && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent mx-auto mb-2"></div>
                  <p>Đang tải ảnh lên...</p>
                </div>
              </div>
            )}

            <Button
              className="absolute hover:text-white z-50 rounded-full top-4 right-4 !bg-[#21252980] hover:bg-[#21252980] text-white transition-all duration-200 hover:scale-105"
              size="icon"
              variant="ghost"
              onClick={handleUploadImage}
              disabled={isUploadingImage}
            >
              {isUploadingImage ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <Pencil />
              )}
            </Button>

            <div
              className="bg-white rounded-[8px] bottom-[-75px] left-[32px]
                ml-auo mr-auto min-h-[160px] p-[16px] absolute right-[32px] shadow-lg flex flex-col justify-between
                "
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        className="no-focus border-none shadow-none p-8 
                        font-bold hover:bg-gray-100
                        !text-[2rem]"
                        placeholder="Enter planner title..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="px-8 flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <CalendarDatePicker
                          className="!w-fit "
                          date={{
                            from: field.value
                              ? moment(field.value).toDate()
                              : new Date(),
                            to: form.getValues("endDate")
                              ? moment(form.getValues("endDate")).toDate()
                              : new Date(),
                          }}
                          onDateSelect={(e) => {
                            form.setValue("startDate", e.from);
                            form.setValue("endDate", e.to);
                            // Only automatically generate route details if not initial load
                            // and user has manually changed dates
                            if (e.from && e.to && !isInitialLoad) {
                              handleInteractiveDateChange(e.from, e.to);
                            }
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex items-center gap-2 ">
                  <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
                    <Avatar>
                      <AvatarImage
                        src="https://github.com/shadcn.png"
                        alt="@shadcn"
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <Avatar>
                      <AvatarImage
                        src="https://github.com/leerob.png"
                        alt="@leerob"
                      />
                      <AvatarFallback>LR</AvatarFallback>
                    </Avatar>
                    <Avatar>
                      <AvatarImage
                        src="https://github.com/evilrabbit.png"
                        alt="@evilrabbit"
                      />
                      <AvatarFallback>ER</AvatarFallback>
                    </Avatar>
                  </div>
                  <Button
                    onClick={() => {
                      setShowDialog(true);
                    }}
                    variant="ghost"
                    className="rounded-full"
                  >
                    <UserPlus className="!w-[24px] !h-[24px]" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis space */}
          <div className="!mt-[100px] flex flex-col gap-[24px]  px-8">
            <div className="flex items-center gap-2">
              <div className="p-4 flex-1 border-none paragraph-regular background-light800_darkgradient light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border">
                <span className="font-bold">Revervations and attachments</span>
                <div className="flex mt-4  items-center justify-center h-[40px]">
                  <div className="px-4 flex w-full flex-col items-center h-full justify-center">
                    <div className="flex-center cursor-pointer flex-col relative">
                      <MdFlight size={20} />
                      <p className="text-[12px]">Flight</p>
                      <div className="absolute -top-1 -right-[12px] flex-center text-[8px] background-light700_dark300 text-light800_dark300 rounded-full w-4 h-4">
                        <p>1</p>
                      </div>
                    </div>
                  </div>
                  <Separator orientation="vertical" />
                  <div className="px-4 flex w-full flex-col items-center h-full justify-center">
                    <div className="flex-center cursor-pointer flex-col relative">
                      <BiSolidHotel size={20} />
                      <p className="text-[12px]">Lodging</p>
                      <div className="absolute -top-1 -right-[12px] flex-center text-[8px] background-light700_dark300 text-light800_dark300 rounded-full w-4 h-4">
                        <p>1</p>
                      </div>
                    </div>
                  </div>
                  <Separator orientation="vertical" />
                  <div className="px-4 flex w-full flex-col items-center h-full justify-center">
                    <BiRestaurant size={20} />
                    <p className="text-[12px]">Restaurant</p>
                  </div>
                  <Separator orientation="vertical" />
                  <div className="px-4 flex w-full flex-col items-center h-full justify-center">
                    <Car size={20} />
                    <p className="text-[12px]">Rental Car</p>
                  </div>
                  <Separator orientation="vertical" />
                  <div className="px-4 flex w-[24px] ml-4 flex-col items-center h-full justify-center">
                    <GoKebabHorizontal
                      size={24}
                      className="font-bold cursor-pointer"
                    />
                  </div>
                </div>
              </div>
              <div className="p-4 w-fit border-none paragraph-regular background-light800_darkgradient light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border">
                <p className="font-bold text-[16px]">Budgeting</p>
                <h1 className="mt-2 mb-1 text-[#6c757d] text-[24px]">đ 0</h1>
                <h1 className="text-[14px]  text-[#6c757d] font-bold cursor-pointer">
                  View details
                </h1>
              </div>
            </div>
            <div id="note-section">
              <Collaps
                keyId={"note"}
                titleFeature={
                  <p className="pl-[28px] border-none font-bold !text-[24px] shadow-none no-focus ">
                    Note
                  </p>
                }
                itemExpand={
                  <div>
                    <FormField
                      control={form.control}
                      name="note"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <DebouncedTextarea
                              placeholder="Describe your travel plan..."
                              value={field.value || ""}
                              onChange={field.onChange}
                              rows={3}
                              debounceMs={500}
                              className="py-4 border-none paragraph-regular background-light800_darkgradient light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                }
              />
            </div>
            <Separator className="my-[24px]" />
            {/* General Tips */}
            <div id="generalTips-section">
              <Collaps
                keyId="General-tips"
                titleFeature={
                  <p className="pl-[28px] border-none font-bold !text-[24px] shadow-none no-focus ">
                    General Tips
                  </p>
                }
                itemExpand={
                  <div>
                    <FormField
                      control={form.control}
                      name="generalTips"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <DebouncedTextarea
                              placeholder="General Tips..."
                              value={field.value || ""}
                              onChange={field.onChange}
                              rows={3}
                              debounceMs={500}
                              className="py-4 border-none paragraph-regular background-light800_darkgradient light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                }
              />
            </div>
            {/* Lodging */}
            <Separator className="my-[24px]" />

            <div id="lodging-section">
              <Collaps
                keyId="lodging"
                titleFeature={
                  <p className="pl-[28px] border-none font-bold !text-[24px] shadow-none no-focus ">
                    Hotels and Lodging
                  </p>
                }
                itemExpand={
                  <div className="flex flex-col gap-4">
                    {/* {showAddHotel ? (
                      <LodgingSearch
                        size="large"
                        onSelectHotel={(hotel: any) => {
                          addNewLodging(hotel);
                        }}
                      />
                    ) : (
                      <Button
                        onClick={() => {
                          setShowAddHotel(true);
                        }}
                      >
                        Add Hotel
                      </Button>
                    )} */}{" "}
                    <LodgingSearch
                      size="large"
                      onSelectHotel={(hotel: any) => {
                        addNewLodging(hotel);
                      }}
                    />
                    {lodgingFields.map((field, index) => (
                      <Card
                        key={field.id}
                        className="relative border-none shadow-none"
                      >
                        <CardContent className="relative !p-0">
                          {editingIndex === index ? (
                            renderHotelForm(index)
                          ) : (
                            <div
                              className="cursor-pointer min-h-[60px] flex items-center"
                              onClick={() => setEditingIndex(index)}
                            >
                              {form.getValues("lodging") &&
                                form.getValues("lodging")![index] &&
                                renderHotelPreview(
                                  form.getValues("lodging")![index],
                                  index
                                )}
                            </div>
                          )}
                          {/* <div className="flex items-center justify-between absolute right-2 bottom-2">
                          <div className="flex items-center gap-2">
                            {form.getValues("lodging")?.length > 1 && index > 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-gray-500"
                                onClick={() => removeLodging(index)}
                              >
                                <FaTrash className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div> */}
                        </CardContent>
                      </Card>
                    ))}
                    <div className="flex gap-4 items-center pl-[18px]">
                      <div
                        onClick={() => {
                          setOpenModalHotel(true);
                        }}
                        className="flex  cursor-pointer h-5 items-center gap-2"
                      >
                        <Plus size={16} />
                        <span className="text-dark400_light700 font-bold text-[12px]">
                          Add another Lodging
                        </span>
                        <Separator orientation="vertical" />
                      </div>

                      <div className="flex items-center gap-2 cursor-pointer">
                        <BiSolidHotel />
                        <span className="text-dark400_light700 font-bold text-[12px]">
                          Find hotels
                        </span>
                      </div>
                    </div>
                  </div>
                }
              />
            </div>
            <Separator className="my-[24px]" />

            <div id="details-section">
              <div className="mb-[24px] flex items-center justify-between">
                <h1 className="text-[36px] font-bold">Itinerary</h1>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={recalculateAllRoutes}
                    className="text-blue-600 border-blue-300 hover:bg-blue-100"
                    disabled={Object.values(localRoutingData).some(
                      (day) => day.isCalculating
                    )}
                  >
                    <Route className="h-4 w-4 mr-2" />
                    {Object.values(localRoutingData).some(
                      (day) => day.isCalculating
                    )
                      ? "Calculating..."
                      : "Calculate All Routes"}
                  </Button>
                </div>
              </div>
              <div className="flex flex-col ">
                {detailFields.map((field, index) => (
                  <div key={field.id + index}>{renderDetailForm(index)}</div>
                  // <Collaps
                  //   key={field.id + index}
                  //   titleFeature={
                  //     <p className="pl-[28px] border-none font-bold !text-[24px] shadow-none no-focus ">
                  //       {field.name}
                  //     </p>
                  //   }
                  //   itemExpand={
                  //     <div>
                  //       <FormField
                  //         control={form.control}
                  //         name={`details.${index}.name`}
                  //         render={({ field }) => (
                  //           <FormItem>
                  //             <FormControl>
                  //               {/* <Textarea
                  //                 placeholder="General Tips..."
                  //                 {...field}
                  //                 rows={3}
                  //                 className="py-4 border-none paragraph-regular background-light800_darkgradient light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border"
                  //               /> */}
                  //             </FormControl>
                  //             <FormMessage />
                  //           </FormItem>
                  //         )}
                  //       />

                  //       {/* <div className="flex items-center gap-2">
                  //           <PlaceSearch
                  //             onPlaceSelect={(place) => {
                  //               handlePlaceSelect(place, index);
                  //             }}
                  //             placeholder="Search for museums, parks, temples, beaches..."
                  //             maxResults={8}
                  //           />
                  //           <Button
                  //             onClick={() => {
                  //               handleAddNoteItem(index);
                  //             }}
                  //             className="shadow-none background-light800_dark300 hover:!bg-gray-300 dark:hover:!bg-dark-200 text-black dark:text-white rounded-full w-[48px] flex items-center h-[48px]"
                  //           >
                  //             <FaNoteSticky />
                  //           </Button>
                  //           <Button
                  //             onClick={() => handleAddChecklistItem(index)}
                  //             className="shadow-none background-light800_dark300 hover:!bg-gray-300 dark:hover:!bg-dark-200 text-black dark:text-white  rounded-full w-[48px] flex items-center h-[48px]"
                  //           >
                  //             <MdChecklist />
                  //           </Button>
                  //         </div> */}
                  //     </div>
                  //   }
                  // />
                ))}
              </div>
            </div>
          </div>

          {/* CARD HOTEL */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hotel className="h-5 w-5" />
                Accommodation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lodgingFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border rounded-lg p-4 space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Accommodation {index + 1}</h4>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeLodging(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`lodging.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>HOTEL NAME</FormLabel>
                            <FormControl>
                              <Input placeholder="Hotel name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`lodging.${index}.address`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Hotel address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`lodging.${index}.checkIn`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Check-in</FormLabel>
                            <FormControl>
                              <Input
                                type="datetime-local"
                                {...field}
                                value={
                                  field.value instanceof Date
                                    ? field.value.toISOString().slice(0, 16)
                                    : field.value
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`lodging.${index}.checkOut`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Check-out</FormLabel>
                            <FormControl>
                              <Input
                                type="datetime-local"
                                {...field}
                                value={
                                  field.value instanceof Date
                                    ? field.value.toISOString().slice(0, 16)
                                    : field.value
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`lodging.${index}.confirmation`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirmation Code</FormLabel>
                            <FormControl>
                              <Input placeholder="ABC123" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`lodging.${index}.cost.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Currency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="VND">VND</SelectItem>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="EUR">EUR</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`lodging.${index}.cost.value`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cost</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                placeholder="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseFloat(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name={`lodging.${index}.notes`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Additional notes..."
                              {...field}
                              rows={2}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addNewLodging}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Accommodation
                </Button>
              </div>
            </CardContent>
          </Card> */}

          {/* Dates and Location */}

          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Dates & Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          value={
                            field.value instanceof Date
                              ? field.value.toISOString().slice(0, 16)
                              : field.value
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          value={
                            field.value instanceof Date
                              ? field.value.toISOString().slice(0, 16)
                              : field.value
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Hanoi, Vietnam" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location.address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Full address..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location.coordinates.coordinates.0"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="105.8523"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location.coordinates.coordinates.1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="21.0285"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card> */}

          {/* Tripmates */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Tripmates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tripmateFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border rounded-lg p-4 space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Tripmate {index + 1}</h4>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeTripmate(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`tripmates.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`tripmates.${index}.email`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="email@example.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name={`tripmates.${index}.image`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profile Image URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/avatar.jpg"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addNewTripmate}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tripmate
                </Button>
              </div>
            </CardContent>
          </Card> */}

          {/* Trip Details */}

          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5" />
                Trip Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {detailFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border rounded-lg p-4 space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">
                        {field.type === "route" ? "📍" : "📋"}{" "}
                        {field.name || `${field.type} ${index + 1}`}
                      </h4>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeDetail(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`details.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Day 1, Must-visit Places..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`details.${index}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="route">
                                  Route (Day-by-day)
                                </SelectItem>
                                <SelectItem value="list">
                                  List (Collection)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`details.${index}.index`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Order</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="text-sm text-muted-foreground p-3 bg-muted rounded">
                      <p>
                        <strong>Note:</strong> Detail data (places, notes,
                        checklists) can be added after creating the planner.
                      </p>
                    </div>
                  </div>
                ))}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addNewDetail("route")}
                    className="flex-1"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Route (Day)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addNewDetail("list")}
                    className="flex-1"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add List
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card> */}

          {/* Submit Button */}
          <div className="flex gap-4 w-full p-4 justify-end">
            <Button
              type="submit"
              disabled={isPending}
              onClick={handleSubmit}
              className=" !w-fit bg-primary-500 hover:bg-primary-500 font-bold p-4 "
            >
              {isPending ? "Creating..." : "Create Planner"}
            </Button>
          </div>
        </form>
      </Form>
      {showDialog && (
        <ReusableDialog
          data={{
            title: "Invite tripmates",
            content: (
              <div>
                <Tabs defaultValue="edit">
                  <TabsList>
                    <TabsTrigger value="edit">Can Edit</TabsTrigger>
                    <TabsTrigger value="view">View Only</TabsTrigger>
                  </TabsList>
                  <TabsContent value="edit">
                    {manageTripmates ? (
                      <div>
                        <Button
                          onClick={() => {
                            setManageTripmates(false);
                          }}
                          size={"icon"}
                        >
                          <Undo />
                        </Button>
                        Manager Triplate do it later
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2 items-center border border-gray-300 p-2 rounded-md text-[1rem] ">
                          <Link />
                          <Input className="border-none no-focus shadow-none" />
                          <Button className="bg-primary-500">Copy link</Button>
                        </div>
                        <div className="flex gap-2 items-center border-1 background-light800_dark300 p-2 rounded-md text-[1rem] ">
                          <User />
                          <Input className="border-none no-focus shadow-none" />
                        </div>
                        <Separator className="my-4" />
                        <Button
                          className="w-fit text-dark300_light400"
                          variant={"ghost"}
                          onClick={() => {
                            setManageTripmates(true);
                          }}
                        >
                          <GrUserSettings />
                          Manage tripmates
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="password">
                    <Card>
                      <CardHeader>
                        <CardTitle>Password</CardTitle>
                        <CardDescription>
                          Change your password here. After saving, you&apos;ll
                          be logged out.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-6">
                        <div className="grid gap-3">
                          <Label htmlFor="tabs-demo-current">
                            Current password
                          </Label>
                          <Input id="tabs-demo-current" type="password" />
                        </div>
                        <div className="grid gap-3">
                          <Label htmlFor="tabs-demo-new">New password</Label>
                          <Input id="tabs-demo-new" type="password" />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button>Save password</Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            ),
            showCloseButton: false,
          }}
          open={showDialog}
          setOpen={setShowDialog}
        />
      )}
      {showExpenses && (
        <ReusableDialog
          open={showExpenses}
          data={{
            title: "Add expense",
            content: (
              <div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="font-bold">Cost</Label>
                    <Input placeholder="Cost" className="h-[40px]" />
                  </div>
                  <div className="w-fit">
                    <Label className="font-bold">Currency</Label>
                    <Select defaultValue="VND">
                      <SelectTrigger
                        className={`h-[40px] border-none paragraph-regular background-form-input light-border-2 text-dark300_light700 no-focus rounded-1.5 border`}
                      >
                        <SelectValue placeholder="Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VND">VND</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* <div>
                  <Label className="font-bold">Category</Label>
                  <Input placeholder="Cost" className="h-[40px]" />
                </div> */}
                <div>
                  <Label className="font-bold">Description</Label>
                  <Textarea placeholder="Description" className="h-[40px]" />
                </div>
                <div>
                  <Label className="font-bold">Paid by</Label>
                  <Select key="Paidby" defaultValue="1">
                    <SelectTrigger
                      className={`h-[40px] border-none paragraph-regular background-form-input light-border-2 text-dark300_light700 no-focus rounded-1.5 border`}
                    >
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">
                        <div>{`You ( Đặng Hoàng Minh Trí )`}</div>
                      </SelectItem>
                      <SelectItem value="2">Hưng Trần</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="font-bold">Split</Label>
                  <Input placeholder="Cost" className="h-[40px]" />
                </div>
                <div className="mt-4 flex items-end justify-end">
                  <Button>
                    <Save />
                    Save
                  </Button>
                </div>
              </div>
            ),
            showCloseButton: false,
          }}
          setOpen={setShowExpenses}
        />
      )}
    </div>
  );
};

export default PlannerForm;
