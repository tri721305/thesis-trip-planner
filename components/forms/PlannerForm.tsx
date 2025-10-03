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
import { RiArrowDownSFill } from "react-icons/ri";
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
  SelectGroup,
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
  ChartBar,
  Clock,
  AlertTriangle,
  Circle,
  InfoIcon,
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
import { FaMapMarker, FaPen, FaTrash, FaUserPlus } from "react-icons/fa";
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
  getPlannerById,
  partialUpdatePlanner,
} from "@/lib/actions/planner.action";
import { getPlaceById } from "@/lib/actions/place.action";
import { useToast } from "@/hooks/use-toast";
import { Toast } from "../ui/toast";
import UserSearch from "../search/UserSearch";
import { formatCurrency } from "@/lib/currency";
import LocationCard from "../cards/LocationCard";

type PlannerFormData = z.infer<typeof PlannerSchema>;

const splitType = ["Don't split", "Everyone", "Invidiuals"];

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
  const [currentPlannerData, setCurrentPlannerData] = useState(planner);
  // State for preserving scroll position and preventing auto-scroll conflicts
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // State for storing previous route data before optimization (for undo functionality)
  const [previousRouteData, setPreviousRouteData] = useState<{
    [dayIndex: number]: any[];
  }>({});

  // State cho thời gian bắt đầu đi của mỗi ngày
  const [dayStartTimes, setDayStartTimes] = useState<{
    [dayIndex: number]: string;
  }>({});

  // State cho cảnh báo thời gian của mỗi ngày
  const [timeWarnings, setTimeWarnings] = useState<{
    [dayIndex: number]: Array<{
      placeId: string;
      placeName: string;
      warning: string;
      arrivalTime?: string;
      openingTime?: string;
      closingTime?: string;
      waitTime?: number;
    }>;
  }>({});

  // State for hotel search values - moved to component level to follow Rules of Hooks
  const [hotelSearchValues, setHotelSearchValues] = useState<{
    [key: number]: string;
  }>({});

  // State for note inputs with debounce
  const [noteInputValues, setNoteInputValues] = useState<{
    [key: string]: string; // key format: "detailIndex-itemIndex"
  }>({});

  // State for expense management
  const [currentExpenseContext, setCurrentExpenseContext] = useState<{
    detailIndex: number;
    itemIndex: number;
  } | null>(null);

  const [expenseFormData, setExpenseFormData] = useState({
    value: 0,
    type: "VND",
    description: "",
    paidBy: "",
    splitBetween: [] as Array<{
      userId?: string;
      name: string;
      amount: number;
      settled: boolean;
      selected?: boolean; // Add selected field for checkbox functionality
    }>,
  });

  // Add split mode state
  const [splitMode, setSplitMode] = useState<
    "everyone" | "individuals" | "dontsplit"
  >("everyone");

  // State for debounced cost input to reduce re-renders
  const [costInputValue, setCostInputValue] = useState<string>("");

  // LocationCard states - same as GuideForm
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [showLocationCard, setShowLocationCard] = useState(false);

  // Debounced callback for cost input
  const debouncedCostUpdate = useDebounce((value: number) => {
    handleExpenseFormChange("value", value);
  }, 300); // 300ms debounce delay

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

  // Hàm tìm tọa độ gần nhất trong danh sách
  const findClosestCoordinate = (
    waypoint: { lat: number; lon: number },
    placesMap: Record<string, string>,
    maxDistance: number = 0.0001
  ): string | null => {
    const keys = Object.keys(placesMap);
    let closestKey = null;
    let minDistance = Infinity;

    for (const key of keys) {
      const [lat, lon] = key.split(",").map(Number);

      // Tính khoảng cách theo Haversine
      const distance = Math.sqrt(
        Math.pow(waypoint.lat - lat, 2) + Math.pow(waypoint.lon - lon, 2)
      );

      if (distance < minDistance && distance < maxDistance) {
        minDistance = distance;
        closestKey = key;
      }
    }

    return closestKey;
  };

  // Hàm tối ưu hóa lộ trình sử dụng OSRM Trip API
  const optimizeRouteWithOSRM = async (
    coordinates: Array<{ lat: number; lon: number }>,
    source: string = "first",
    destination: string = "last"
  ) => {
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
        console.error("❌ Tọa độ không hợp lệ:", coord);
        return null;
      }
    }

    try {
      // Format coordinates for OSRM API: longitude,latitude;longitude,latitude
      const coordsString = coordinates
        .map((coord) => `${coord.lon.toFixed(6)},${coord.lat.toFixed(6)}`)
        .join(";");

      console.log(`🔍 Gọi OSRM Trip API với ${coordinates.length} điểm`);

      // Use OSRM Trip API to find the optimal route through all points
      const response = await fetch(
        `https://routing.openstreetmap.de/routed-car/trip/v1/driving/${coordsString}?overview=full&geometries=geojson&steps=true&source=${source}&destination=${destination}`,
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
        throw new Error(
          `Lỗi OSRM Trip API: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.trips && data.trips.length > 0) {
        const trip = data.trips[0];
        // Lấy thứ tự tối ưu của các điểm
        const waypointOrder = data.waypoints.sort(
          (a, b) => a.waypoint_index - b.waypoint_index
        );

        console.log(
          `✅ OSRM Trip API thành công: ${Math.round(trip.distance / 1000)}km, ${Math.round(trip.duration / 60)} phút`
        );

        return {
          distance: Math.round(trip.distance || 0), // in meters
          duration: Math.round(trip.duration || 0), // in seconds
          geometry: trip.geometry, // GeoJSON coordinates
          waypoints: waypointOrder.map((wp) => ({
            lat: wp.location[1],
            lon: wp.location[0],
            originalIndex: wp.waypoint_index,
          })),
          legs: trip.legs || [],
        };
      } else {
        throw new Error("Không tìm thấy lộ trình trong phản hồi API");
      }
    } catch (error) {
      console.error("❌ Lỗi OSRM Trip API:", error);
      return null;
    }
  };

  // Hàm tối ưu hóa lộ trình cho một ngày sử dụng OSRM Trip API
  const optimizeDayRouteOSRM = async (dayIndex: number) => {
    const details = form.getValues("details");
    if (!details || !details[dayIndex]) return;

    const detail = details[dayIndex];
    if (detail.type !== "route") return;

    toast({
      title: "Tối ưu hóa lộ trình",
      description: "Đang tính toán đường đi tối ưu...",
    });

    // Extract date from the day
    const dayDate = new Date(detail.date);

    // Get hotel information for this date if available
    let hotelInfo = null;
    try {
      const lodgings = form.getValues("lodging") || [];

      // Find a hotel where the date falls between check-in and check-out
      for (const hotel of lodgings) {
        if (!hotel.checkIn || !hotel.checkOut) continue;

        const checkInDate = new Date(hotel.checkIn);
        const checkOutDate = new Date(hotel.checkOut);

        // If dayDate is on or after checkIn and before checkOut
        if (dayDate >= checkInDate && dayDate < checkOutDate) {
          // Return hotel with coordinates if available
          if (
            hotel.location?.coordinates &&
            Array.isArray(hotel.location.coordinates) &&
            hotel.location.coordinates.length === 2
          ) {
            const [lon, lat] = hotel.location.coordinates;
            hotelInfo = {
              name: hotel.name,
              coordinates: {
                lat: lat,
                lon: lon,
              },
            };
            break;
          }
        }
      }
    } catch (error) {
      console.error("Lỗi khi tìm khách sạn cho ngày:", error);
    }

    // Extract places with coordinates from the day's data
    const places = detail.data.filter((item: any) => item.type === "place");
    const placesWithCoords = [];
    const placesMap = {};

    for (const place of places) {
      if (
        place.location?.coordinates &&
        Array.isArray(place.location.coordinates) &&
        place.location.coordinates.length === 2
      ) {
        const [lon, lat] = place.location.coordinates;
        const placeCoords = {
          id: place.id,
          name: place.name,
          coordinates: {
            lat: lat,
            lon: lon,
          },
        };
        placesWithCoords.push(placeCoords.coordinates);
        // Sử dụng định dạng chính xác hơn để lưu tọa độ làm key
        placesMap[`${lat.toFixed(6)},${lon.toFixed(6)}`] = place.id;

        // In ra log để debug
        console.log(
          `🗺️ Địa điểm: ${place.name}, ID: ${place.id}, Tọa độ: [${lat.toFixed(6)},${lon.toFixed(6)}]`
        );
      }
    }

    if (placesWithCoords.length <= 1) {
      toast({
        title: "Không thể tối ưu hóa lộ trình",
        description: "Cần ít nhất 2 địa điểm có tọa độ để tối ưu hóa.",
        variant: "destructive",
      });
      return;
    }

    // If we have a hotel, add it as first and last point
    let coordinates = [...placesWithCoords];
    let source = "first";
    let destination = "last";

    if (hotelInfo?.coordinates) {
      // Add hotel coordinates at the beginning
      coordinates = [hotelInfo.coordinates, ...placesWithCoords];
      // Configure OSRM to use first point (hotel) as source and destination
      source = "first";
      destination = "first";
    }

    // Get optimized route using OSRM Trip API
    const optimizedRoute = await optimizeRouteWithOSRM(
      coordinates,
      source,
      destination
    );

    if (!optimizedRoute) {
      toast({
        title: "Lỗi tối ưu hóa lộ trình",
        description:
          "Không thể tính toán lộ trình tối ưu. Vui lòng thử lại sau.",
        variant: "destructive",
      });
      return;
    }

    // Create mapping of original coordinates to new order
    const newOrder = [];

    // In ra debug các waypoints được trả về từ API
    console.log(
      `🗺️ Số waypoints nhận được: ${optimizedRoute.waypoints.length}`
    );
    for (const wp of optimizedRoute.waypoints) {
      console.log(`📍 Waypoint: [${wp.lat.toFixed(6)},${wp.lon.toFixed(6)}]`);
    }

    // In ra tất cả các keys trong placesMap để debug
    console.log(`🔑 Tất cả placesMap keys:`, Object.keys(placesMap));

    for (let i = 0; i < optimizedRoute.waypoints.length; i++) {
      const wp = optimizedRoute.waypoints[i];
      // Format với độ chính xác giống như khi tạo key
      const coordKey = `${wp.lat.toFixed(6)},${wp.lon.toFixed(6)}`;
      const placeId = placesMap[coordKey];

      console.log(
        `🔍 Tìm kiếm ID cho tọa độ: ${coordKey}, tìm thấy: ${placeId || "không tìm thấy"}`
      );

      // Skip hotel coordinates (if they were added)
      if (placeId) {
        newOrder.push(placeId);
      } else {
        // Thử tìm kiếm với dung sai
        const foundKey = findClosestCoordinate(wp, placesMap);
        if (foundKey) {
          console.log(`🔄 Tìm thấy điểm gần nhất: ${foundKey}`);
          newOrder.push(placesMap[foundKey]);
        }
      }
    }

    // Create a mapping for the new order of places
    const placeOrderMap = {};
    newOrder.forEach((id, index) => {
      placeOrderMap[id] = index;
    });

    // Reorder the places in the day's data
    const updatedData = [...detail.data];
    updatedData.sort((a, b) => {
      if (a.type !== "place" || b.type !== "place") return 0;
      return (placeOrderMap[a.id] || 0) - (placeOrderMap[b.id] || 0);
    });

    // Update the form with the optimized route
    const updatedDetails = [...details];
    updatedDetails[dayIndex] = {
      ...detail,
      data: updatedData,
    };

    form.setValue("details", updatedDetails);

    toast({
      title: "Lộ trình đã được tối ưu hóa",
      description: hotelInfo
        ? `Lộ trình đã được tối ưu hóa bắt đầu và kết thúc tại ${hotelInfo.name}`
        : "Lộ trình đã được tối ưu hóa để di chuyển hiệu quả nhất",
      variant: "default",
    });

    // Recalculate routes
    calculateDayRoutes(dayIndex);
  };

  // Hàm khôi phục lại trạng thái trước khi tối ưu hóa
  const restorePreviousRouteData = (dayIndex: number) => {
    if (!previousRouteData[dayIndex]) {
      toast({
        title: "Không thể hoàn tác",
        description: "Không có dữ liệu trước đó để khôi phục",
        variant: "destructive",
      });
      return;
    }

    const details = form.getValues("details");
    if (!details || !details[dayIndex]) return;

    // Khôi phục lại dữ liệu trước đó
    const updatedDetails = [...details];
    updatedDetails[dayIndex] = {
      ...updatedDetails[dayIndex],
      data: [...previousRouteData[dayIndex]],
    };

    // Cập nhật form
    form.setValue("details", updatedDetails);

    toast({
      title: "Đã hoàn tác thay đổi",
      description:
        "Lộ trình đã được khôi phục về trạng thái trước khi tối ưu hóa",
      variant: "default",
    });

    // Tính toán lại lộ trình
    calculateDayRoutes(dayIndex);
  };

  // Hàm tối ưu hóa lộ trình với ràng buộc thời gian
  const optimizeDayRouteWithTimeConstraints = async (dayIndex: number) => {
    const details = form.getValues("details");
    if (!details || !details[dayIndex]) return;

    const detail = details[dayIndex];
    if (detail.type !== "route") return;

    // Lưu trạng thái hiện tại để có thể hoàn tác sau này
    setPreviousRouteData((prev) => ({
      ...prev,
      [dayIndex]: [...detail.data],
    }));

    toast({
      title: "Tối ưu hóa lộ trình theo thời gian",
      description: "Đang tính toán đường đi tối ưu với ràng buộc thời gian...",
    });

    // Extract date from the day
    const dayDate = new Date(detail.date);

    // Lấy thời gian bắt đầu từ state hoặc sử dụng giá trị mặc định
    const startTimeStr = dayStartTimes[dayIndex] || "08:00";
    const [startHour, startMinute] = startTimeStr.split(":").map(Number);

    // Khởi tạo thời gian hiện tại bắt đầu từ thời điểm xuất phát
    let currentTime = new Date(dayDate);
    currentTime.setHours(startHour, startMinute, 0, 0);

    console.log(`🕘 Thời gian bắt đầu đi: ${startTimeStr}`);

    // Get hotel information for this date if available
    let hotelInfo = null;
    try {
      const lodgings = form.getValues("lodging") || [];

      // Find a hotel where the date falls between check-in and check-out
      for (const hotel of lodgings) {
        if (!hotel.checkIn || !hotel.checkOut) continue;

        const checkInDate = new Date(hotel.checkIn);
        const checkOutDate = new Date(hotel.checkOut);

        // If dayDate is on or after checkIn and before checkOut
        if (dayDate >= checkInDate && dayDate < checkOutDate) {
          // Return hotel with coordinates if available
          if (
            hotel.location?.coordinates &&
            Array.isArray(hotel.location.coordinates) &&
            hotel.location.coordinates.length === 2
          ) {
            const [lon, lat] = hotel.location.coordinates;
            hotelInfo = {
              name: hotel.name,
              coordinates: {
                lat: lat,
                lon: lon,
              },
            };
            break;
          }
        }
      }
    } catch (error) {
      console.error("Lỗi khi tìm khách sạn cho ngày:", error);
    }

    // Extract places with coordinates and time constraints from the day's data
    const places = detail.data.filter((item: any) => item.type === "place");
    const placesWithData = [];
    const placesMap = {};
    let hasMissingTimeData = false;
    const timeWarningsList = [];

    for (const place of places) {
      if (
        place.location?.coordinates &&
        Array.isArray(place.location.coordinates) &&
        place.location.coordinates.length === 2
      ) {
        const [lon, lat] = place.location.coordinates;

        // Lấy thông tin thời gian và ưu tiên
        // timeStart sẽ lưu thời gian thăm (phút) - theo hướng dẫn
        // timeEnd sẽ lưu mức độ ưu tiên (1-5) - theo hướng dẫn
        const visitDuration = place.timeStart ? parseInt(place.timeStart) : 0;
        const priority = place.timeEnd ? parseInt(place.timeEnd) : 3;

        if (!visitDuration) {
          hasMissingTimeData = true;
        }

        // Trích xuất thông tin giờ mở cửa và đóng cửa từ place.attractionData
        let openingPeriods = null;

        if (place.attractionData?.openingPeriods) {
          openingPeriods = place.attractionData.openingPeriods;
        }

        const placeData = {
          id: place.id,
          name: place.name,
          coordinates: {
            lat: lat,
            lon: lon,
          },
          visitDuration: visitDuration || 60, // Mặc định 60 phút nếu không có
          priority: priority || 3, // Mặc định ưu tiên trung bình (3)
          openingPeriods: openingPeriods,
          attractionId: place.attractionId,
        };

        placesWithData.push(placeData);
        placesMap[`${lat.toFixed(6)},${lon.toFixed(6)}`] = place.id;

        console.log(
          `🗺️ Địa điểm: ${place.name}, ID: ${place.id}, Thời gian thăm: ${visitDuration} phút, Ưu tiên: ${priority}/5`
        );
        if (openingPeriods) {
          console.log(`   ⏰ Có thông tin giờ mở/đóng cửa`);
        }
      }
    }

    if (placesWithData.length <= 1) {
      toast({
        title: "Không thể tối ưu hóa lộ trình",
        description: "Cần ít nhất 2 địa điểm có tọa độ để tối ưu hóa.",
        variant: "destructive",
      });
      return;
    }

    if (hasMissingTimeData) {
      toast({
        title: "Thiếu thông tin thời gian",
        description:
          "Một số địa điểm chưa có thời gian thăm. Sẽ sử dụng giá trị mặc định (60 phút).",
        variant: "warning",
      });
    }

    // Bước 1: Tính ma trận khoảng cách và thời gian di chuyển giữa các địa điểm
    const distanceMatrix = [];
    const durationMatrix = [];

    for (let i = 0; i < placesWithData.length; i++) {
      const fromPlace = placesWithData[i];
      const distanceRow = [];
      const durationRow = [];

      for (let j = 0; j < placesWithData.length; j++) {
        if (i === j) {
          distanceRow.push(0);
          durationRow.push(0);
          continue;
        }

        const toPlace = placesWithData[j];

        // Tính khoảng cách và thời gian di chuyển giữa 2 điểm
        const routeResult = await calculateRoute([
          fromPlace.coordinates,
          toPlace.coordinates,
        ]);

        if (routeResult) {
          distanceRow.push(routeResult.distance);
          durationRow.push(routeResult.duration);
        } else {
          // Nếu không tính được, ước lượng thô bằng khoảng cách đường chim bay
          const distance = calculateHaversineDistance(
            fromPlace.coordinates.lat,
            fromPlace.coordinates.lon,
            toPlace.coordinates.lat,
            toPlace.coordinates.lon
          );
          const estimatedDuration = distance * 0.06; // Ước lượng 60s cho 1km

          distanceRow.push(distance);
          durationRow.push(estimatedDuration);
        }
      }

      distanceMatrix.push(distanceRow);
      durationMatrix.push(durationRow);
    }

    console.log("Ma trận khoảng cách:", distanceMatrix);
    console.log("Ma trận thời gian:", durationMatrix);

    // Bước 2: Triển khai thuật toán sắp xếp dựa trên thời gian và ưu tiên
    // Nếu có khách sạn, thêm vào đầu và cuối lộ trình
    let startPointIndex = -1;
    if (hotelInfo?.coordinates) {
      // Tính toán khoảng cách từ khách sạn đến các địa điểm
      const hotelDistances = [];
      const hotelDurations = [];

      for (const place of placesWithData) {
        const routeResult = await calculateRoute([
          hotelInfo.coordinates,
          place.coordinates,
        ]);

        if (routeResult) {
          hotelDistances.push(routeResult.distance);
          hotelDurations.push(routeResult.duration);
        } else {
          const distance = calculateHaversineDistance(
            hotelInfo.coordinates.lat,
            hotelInfo.coordinates.lon,
            place.coordinates.lat,
            place.coordinates.lon
          );
          const estimatedDuration = distance * 0.06;

          hotelDistances.push(distance);
          hotelDurations.push(estimatedDuration);
        }
      }

      startPointIndex = 0; // Bắt đầu từ khách sạn
    }

    // Thuật toán tham lam kết hợp với ưu tiên
    let route = [];
    let visited = new Array(placesWithData.length).fill(false);
    let current = startPointIndex >= 0 ? startPointIndex : 0;

    // Khởi tạo thời gian hiện tại bằng thời gian bắt đầu đi
    let currentTimeMinutes = startHour * 60 + startMinute;

    if (startPointIndex < 0) {
      // Nếu không có khách sạn, chọn điểm xuất phát là điểm có ưu tiên cao nhất
      let maxPriority = -1;
      for (let i = 0; i < placesWithData.length; i++) {
        if (placesWithData[i].priority > maxPriority) {
          maxPriority = placesWithData[i].priority;
          current = i;
        }
      }
    }

    route.push(current);
    visited[current] = true;

    // Cập nhật thời gian hiện tại sau khi thăm địa điểm đầu tiên
    currentTimeMinutes += placesWithData[current].visitDuration;

    // Tham lam: Chọn điểm tiếp theo dựa trên thời gian di chuyển và ưu tiên
    while (route.length < placesWithData.length) {
      let bestNext = -1;
      let bestScore = -Infinity;

      for (let i = 0; i < placesWithData.length; i++) {
        if (!visited[i]) {
          const travelTimeMinutes = durationMatrix[current][i] / 60; // Chuyển sang phút
          const visitDuration = placesWithData[i].visitDuration;

          // Tính thời gian đến địa điểm tiếp theo
          const arrivalTimeMinutes = currentTimeMinutes + travelTimeMinutes;
          const arrivalTime = minutesToTime(arrivalTimeMinutes);
          const departureTimeMinutes = arrivalTimeMinutes + visitDuration;

          // Kiểm tra thời gian mở/đóng cửa nếu có
          let timeConstraintViolation = false;
          let timeWarning = null;

          if (
            placesWithData[i].openingPeriods &&
            placesWithData[i].openingPeriods.length > 0
          ) {
            // Lấy thông tin mở/đóng cửa cho ngày trong tuần hiện tại
            const dayOfWeek = dayDate.getDay(); // 0: Chủ nhật, 1-6: Thứ 2-Thứ 7
            const todaySchedule = placesWithData[i].openingPeriods.find(
              (p) => p.open.day === dayOfWeek
            );

            if (todaySchedule) {
              const openTimeStr = formatTimeFromOpeningPeriod(
                todaySchedule.open.time
              );
              const closeTimeStr = formatTimeFromOpeningPeriod(
                todaySchedule.close.time
              );

              const openTimeMinutes = timeToMinutes(openTimeStr);
              const closeTimeMinutes = timeToMinutes(closeTimeStr);

              // Kiểm tra nếu đến trước giờ mở cửa
              if (arrivalTimeMinutes < openTimeMinutes) {
                timeConstraintViolation = true;
                const waitTime = openTimeMinutes - arrivalTimeMinutes;
                timeWarning = {
                  placeId: placesWithData[i].id,
                  placeName: placesWithData[i].name,
                  warning: `Đến lúc ${arrivalTime}, trước giờ mở cửa (${openTimeStr}), cần đợi ${waitTime} phút`,
                  arrivalTime: arrivalTime,
                  openingTime: openTimeStr,
                  closingTime: closeTimeStr,
                  waitTime: waitTime,
                };
              }

              // Kiểm tra nếu đến sau giờ đóng cửa
              if (arrivalTimeMinutes > closeTimeMinutes) {
                timeConstraintViolation = true;
                timeWarning = {
                  placeId: placesWithData[i].id,
                  placeName: placesWithData[i].name,
                  warning: `Đến lúc ${arrivalTime}, sau giờ đóng cửa (${closeTimeStr})`,
                  arrivalTime: arrivalTime,
                  openingTime: openTimeStr,
                  closingTime: closeTimeStr,
                };
              }
            }
          }

          // Nếu địa điểm này còn trong thời gian hoạt động
          if (!timeConstraintViolation) {
            // Công thức tính điểm: ưu tiên * 100 - thời gian di chuyển
            const score = placesWithData[i].priority * 100 - travelTimeMinutes;

            if (score > bestScore) {
              bestScore = score;
              bestNext = i;
            }
          } else if (timeWarning) {
            // Thêm vào danh sách cảnh báo ngay cả khi không chọn địa điểm này
            timeWarningsList.push(timeWarning);
          }
        }
      }

      // Nếu không tìm được điểm tiếp theo thỏa mãn điều kiện thời gian
      if (bestNext === -1) break;

      // Cập nhật
      route.push(bestNext);
      visited[bestNext] = true;

      // Cập nhật thời gian hiện tại
      currentTimeMinutes +=
        durationMatrix[current][bestNext] / 60 +
        placesWithData[bestNext].visitDuration;
      current = bestNext;

      // Kiểm tra thời gian mở/đóng cửa cho địa điểm này
      const placeIndex = bestNext;
      if (
        placesWithData[placeIndex].openingPeriods &&
        placesWithData[placeIndex].openingPeriods.length > 0
      ) {
        const dayOfWeek = dayDate.getDay();
        const todaySchedule = placesWithData[placeIndex].openingPeriods.find(
          (p) => p.open.day === dayOfWeek
        );

        if (todaySchedule) {
          const arrivalTimeMinutes =
            currentTimeMinutes - placesWithData[placeIndex].visitDuration;
          const arrivalTime = minutesToTime(arrivalTimeMinutes);

          const openTimeStr = formatTimeFromOpeningPeriod(
            todaySchedule.open.time
          );
          const closeTimeStr = formatTimeFromOpeningPeriod(
            todaySchedule.close.time
          );

          const openTimeMinutes = timeToMinutes(openTimeStr);
          const closeTimeMinutes = timeToMinutes(closeTimeStr);

          // Kiểm tra và ghi nhận cảnh báo thời gian
          if (arrivalTimeMinutes < openTimeMinutes) {
            const waitTime = openTimeMinutes - arrivalTimeMinutes;
            timeWarningsList.push({
              placeId: placesWithData[placeIndex].id,
              placeName: placesWithData[placeIndex].name,
              warning: `Đến lúc ${arrivalTime}, trước giờ mở cửa (${openTimeStr}), cần đợi ${waitTime} phút`,
              arrivalTime: arrivalTime,
              openingTime: openTimeStr,
              closingTime: closeTimeStr,
              waitTime: waitTime,
            });

            // Điều chỉnh thời gian hiện tại, thêm thời gian đợi
            currentTimeMinutes += waitTime;
          }
        }
      }
    }

    // Cập nhật state cảnh báo thời gian
    if (timeWarningsList.length > 0) {
      setTimeWarnings((prev) => ({
        ...prev,
        [dayIndex]: timeWarningsList,
      }));

      console.log("⚠️ Cảnh báo thời gian:", timeWarningsList);
    } else {
      // Xóa cảnh báo cũ nếu có
      if (timeWarnings[dayIndex]) {
        setTimeWarnings((prev) => {
          const newWarnings = { ...prev };
          delete newWarnings[dayIndex];
          return newWarnings;
        });
      }
    }

    // Nếu có khách sạn, kết thúc tại khách sạn
    if (hotelInfo) {
      console.log("Kết thúc lộ trình tại khách sạn:", hotelInfo.name);
    }

    // Tạo thứ tự mới cho các địa điểm
    const newOrder = route.map((index) => placesWithData[index].id);
    console.log("Thứ tự tối ưu:", newOrder);

    // Tạo ánh xạ thứ tự cho các địa điểm
    const placeOrderMap = {};
    newOrder.forEach((id, index) => {
      placeOrderMap[id] = index;
    });

    // Sắp xếp lại các địa điểm trong dữ liệu
    const updatedData = [...detail.data];
    updatedData.sort((a, b) => {
      if (a.type !== "place" || b.type !== "place") return 0;

      // Nếu cả hai đều có trong thứ tự mới
      if (
        placeOrderMap[a.id] !== undefined &&
        placeOrderMap[b.id] !== undefined
      ) {
        return placeOrderMap[a.id] - placeOrderMap[b.id];
      }

      // Nếu chỉ a có trong thứ tự mới
      if (placeOrderMap[a.id] !== undefined) return -1;

      // Nếu chỉ b có trong thứ tự mới
      if (placeOrderMap[b.id] !== undefined) return 1;

      return 0;
    });

    // Cập nhật form với lộ trình đã tối ưu hóa
    const updatedDetails = [...details];
    updatedDetails[dayIndex] = {
      ...detail,
      data: updatedData,
    };

    form.setValue("details", updatedDetails);

    // Tính toán tổng thời gian tham quan
    const totalVisitMinutes = route.reduce(
      (sum, index) => sum + placesWithData[index].visitDuration,
      0
    );

    // Tính tổng thời gian di chuyển
    let totalTravelMinutes = 0;
    for (let i = 0; i < route.length - 1; i++) {
      totalTravelMinutes += durationMatrix[route[i]][route[i + 1]] / 60;
    }

    // Chuẩn bị thông báo tối ưu hóa
    let toastMessage = `Lộ trình bao gồm ${route.length} địa điểm (tổng thời gian: ${Math.round(totalVisitMinutes + totalTravelMinutes)} phút)`;

    // Thêm thông tin về cảnh báo thời gian nếu có
    if (timeWarningsList.length > 0) {
      toastMessage += `. Có ${timeWarningsList.length} cảnh báo thời gian.`;
    }

    toast({
      title: "Lộ trình đã được tối ưu hóa theo thời gian",
      description: toastMessage,
      variant: timeWarningsList.length > 0 ? "warning" : "default",
    });

    // Tính toán lại lộ trình
    calculateDayRoutes(dayIndex);
  };

  // Hàm tính khoảng cách Haversine (đường chim bay) giữa 2 tọa độ
  const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Bán kính trái đất tính bằng mét
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  // Hàm chuyển đổi định dạng thời gian từ openingPeriods (format "0700" thành "07:00")
  const formatTimeFromOpeningPeriod = (timeStr: string): string => {
    if (!timeStr || timeStr.length !== 4) return "00:00";
    const hours = timeStr.substring(0, 2);
    const minutes = timeStr.substring(2);
    return `${hours}:${minutes}`;
  };

  // Hàm chuyển đổi thời gian thành phút trong ngày
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Hàm tạo thời gian từ phút trong ngày
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  // Hàm định dạng thời gian để hiển thị thân thiện
  const formatTimeForDisplay = (date: Date): string => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Hàm tính thời gian di chuyển giữa các điểm
  const calculateTravelTime = (dayIndex: number, routeIndex: number) => {
    const routingData = localRoutingData[`day-${dayIndex}`];

    // Nếu có dữ liệu routing và route tồn tại
    if (routingData?.routes && routingData.routes[routeIndex]?.duration) {
      // Chuyển đổi từ giây sang phút và làm tròn
      return Math.round(routingData.routes[routeIndex].duration / 60);
    }

    // Nếu không có dữ liệu, trả về giá trị mặc định (30 phút)
    return 30;
  };

  // Hàm phân tích các ràng buộc thời gian cho một ngày
  const analyzeTimeConstraints = (dayIndex: number) => {
    const details = form.getValues("details");
    if (!details || !details[dayIndex]) return;

    const detail = details[dayIndex];
    if (detail.type !== "route") return;

    // Extract date from the day
    const dayDate = new Date(detail.date);
    console.log(
      `🔍 Analyzing time constraints for day ${dayIndex + 1}:`,
      dayDate.toDateString()
    );

    // Fix lỗi ngày không hợp lệ
    if (isNaN(dayDate.getTime())) {
      console.warn("⚠️ Invalid date detected, using current date instead");
      dayDate.setTime(Date.now());
    }

    // Lấy thời gian bắt đầu từ state hoặc sử dụng giá trị mặc định
    const startTimeStr = dayStartTimes[dayIndex] || "08:00";
    const [startHour, startMinute] = startTimeStr.split(":").map(Number);
    console.log(`⏱️ Starting time: ${startTimeStr}`);

    // Extract places with coordinates and time constraints from the day's data
    const places = detail.data.filter((item: any) => item.type === "place");
    if (places.length === 0) return;

    const placesWithData = [];
    const timeWarningsList = [];

    for (const place of places) {
      if (place.location?.coordinates) {
        // Lấy thông tin thời gian và ưu tiên
        const visitDuration = place.timeStart ? parseInt(place.timeStart) : 60; // Default 60 min

        // Trích xuất thông tin giờ mở cửa và đóng cửa
        let openingPeriods = null;
        if (place.openingPeriods) {
          openingPeriods = place.openingPeriods;
        } else if (place.attractionData?.openingPeriods) {
          openingPeriods = place.attractionData.openingPeriods;
        }

        // Debug log for Cu Chi Tunnel
        if (place.name === "Cu Chi Tunnel") {
          console.log("🧪 Cu Chi Tunnel debug:", {
            name: place.name,
            hasOpeningPeriods: !!place.openingPeriods,
            hasAttractionOpeningPeriods: !!place.attractionData?.openingPeriods,
            openingPeriods: openingPeriods,
            raw: place,
          });
        }

        placesWithData.push({
          id: place.id,
          name: place.name,
          visitDuration: visitDuration,
          openingPeriods: openingPeriods,
        });
      }
    }

    console.log(`📍 Found ${placesWithData.length} places with location data`);

    // Chuẩn bị các dữ liệu thời gian cho mỗi điểm dừng
    const timeline = [];

    // Tính tổng thời gian cộng dồn cho cả lịch trình
    let currentTimeMinutes = startHour * 60 + startMinute;

    for (let i = 0; i < placesWithData.length; i++) {
      const place = placesWithData[i];
      const travelTimeToDestination =
        i > 0 ? calculateTravelTime(dayIndex, i - 1) : 0;

      // Cập nhật thời gian hiện tại với thời gian di chuyển đến địa điểm này
      if (i > 0) {
        currentTimeMinutes += travelTimeToDestination;
      }

      const arrivalTime = minutesToTime(currentTimeMinutes);
      const arrivalTimeMinutes = currentTimeMinutes;
      const departureTimeMinutes = currentTimeMinutes + place.visitDuration;
      const departureTime = minutesToTime(departureTimeMinutes);

      // Lưu thông tin thời gian cho điểm này
      timeline.push({
        id: place.id,
        name: place.name,
        arrivalTimeMinutes,
        arrivalTime,
        departureTimeMinutes,
        departureTime,
        visitDuration: place.visitDuration,
      });

      // Cập nhật thời gian hiện tại cho điểm tiếp theo
      currentTimeMinutes = departureTimeMinutes;
    }

    // Debug timeline
    console.log("🗓️ Calculated timeline:", timeline);

    // Kiểm tra các ràng buộc thời gian
    for (const stop of timeline) {
      const place = placesWithData.find((p) => p.id === stop.id);
      // Skip if no place data or no opening periods
      if (!place) continue;

      const arrivalTime = stop.arrivalTime;
      const arrivalTimeMinutes = stop.arrivalTimeMinutes;
      const departureTime = stop.departureTime;
      const departureTimeMinutes = stop.departureTimeMinutes;

      // Trường hợp đặc biệt cho Cu Chi Tunnel - biết là đóng cửa lúc 17:00
      let openTimeStr = "08:00";
      let closeTimeStr = "17:00";
      let openTimeMinutes = timeToMinutes(openTimeStr);
      let closeTimeMinutes = timeToMinutes(closeTimeStr);

      // Lấy thông tin giờ mở/đóng cửa từ dữ liệu nếu có
      if (place.openingPeriods && place.openingPeriods.length > 0) {
        const dayOfWeek = dayDate.getDay();
        const todaySchedule = place.openingPeriods.find(
          (p) => p.open.day === dayOfWeek
        );

        if (todaySchedule) {
          openTimeStr = formatTimeFromOpeningPeriod(todaySchedule.open.time);
          closeTimeStr = formatTimeFromOpeningPeriod(todaySchedule.close.time);

          openTimeMinutes = timeToMinutes(openTimeStr);
          closeTimeMinutes = timeToMinutes(closeTimeStr);
        }
      } else if (place.name === "Cu Chi Tunnel") {
        // Thông tin mặc định đã thiết lập ở trên (8:00 - 17:00)
        console.log(
          "📌 Using default opening hours for Cu Chi Tunnel: 8:00 - 17:00"
        );
      } else {
        // Bỏ qua địa điểm không có thông tin giờ mở cửa
        continue;
      }

      console.log(
        `⏰ Place: ${place.name}, Open: ${openTimeStr}, Close: ${closeTimeStr}`
      );
      console.log(`🚶 Arrival: ${arrivalTime}, Departure: ${departureTime}`);

      // Kiểm tra các tình huống vi phạm ràng buộc thời gian

      // 1. Đến trước giờ mở cửa
      if (arrivalTimeMinutes < openTimeMinutes) {
        const waitTime = openTimeMinutes - arrivalTimeMinutes;
        timeWarningsList.push({
          placeId: place.id,
          placeName: place.name,
          warning: `Đến lúc ${arrivalTime}, trước giờ mở cửa (${openTimeStr}), cần đợi ${waitTime} phút`,
          arrivalTime,
          openingTime: openTimeStr,
          closingTime: closeTimeStr,
          waitTime,
        });
        console.log(`⚠️ WARNING: ${place.name} - Arriving before opening time`);
      }

      // 2. Đến sau giờ đóng cửa
      if (arrivalTimeMinutes > closeTimeMinutes) {
        timeWarningsList.push({
          placeId: place.id,
          placeName: place.name,
          warning: `Đến lúc ${arrivalTime}, sau giờ đóng cửa (${closeTimeStr})`,
          arrivalTime,
          openingTime: openTimeStr,
          closingTime: closeTimeStr,
        });
        console.log(`⚠️ WARNING: ${place.name} - Arriving after closing time`);
      }

      // 3. Rời đi sau giờ đóng cửa
      if (
        arrivalTimeMinutes <= closeTimeMinutes &&
        departureTimeMinutes > closeTimeMinutes
      ) {
        timeWarningsList.push({
          placeId: place.id,
          placeName: place.name,
          warning: `Thời gian thăm quan kết thúc lúc ${departureTime}, sau giờ đóng cửa (${closeTimeStr}), sẽ không đủ thời gian thăm quan đầy đủ`,
          arrivalTime,
          departureTime,
          openingTime: openTimeStr,
          closingTime: closeTimeStr,
        });
        console.log(
          `⚠️ WARNING: ${place.name} - Visit time exceeds closing time`
        );
      }
    }

    // Cập nhật state cảnh báo thời gian
    if (timeWarningsList.length > 0) {
      setTimeWarnings((prev) => ({
        ...prev,
        [dayIndex]: timeWarningsList,
      }));

      console.log(
        `⚠️ Cảnh báo thời gian cho ngày ${dayIndex + 1}:`,
        timeWarningsList
      );
      // Tạo bản ghi chi tiết thời gian cho mỗi địa điểm
      const timelineDetails = placesWithData.map((place, idx) => {
        // Tính lại thời gian đến và rời đi cho mỗi địa điểm
        let arrivalTime = startHour * 60 + startMinute;

        for (let i = 0; i < idx; i++) {
          const routingData = localRoutingData[`day-${dayIndex}`];
          const travelTime =
            i > 0 && routingData?.routes[i - 1]?.duration
              ? Math.round(routingData.routes[i - 1].duration / 60)
              : 30;
          arrivalTime += travelTime + placesWithData[i].visitDuration;
        }

        // Thêm thời gian di chuyển đến địa điểm hiện tại (trừ điểm đầu tiên)
        if (idx > 0) {
          const routingData = localRoutingData[`day-${dayIndex}`];
          const travelTime = routingData?.routes[idx - 1]?.duration
            ? Math.round(routingData.routes[idx - 1].duration / 60)
            : 30;
          arrivalTime += travelTime;
        }

        const departureTime = arrivalTime + place.visitDuration;

        // Kiểm tra thời gian mở/đóng cửa
        let status = "OK";
        if (place.openingPeriods && place.openingPeriods.length > 0) {
          const dayOfWeek = dayDate.getDay();
          const todaySchedule = place.openingPeriods.find(
            (p) => p.open.day === dayOfWeek
          );

          if (todaySchedule) {
            const openTimeMinutes = timeToMinutes(
              formatTimeFromOpeningPeriod(todaySchedule.open.time)
            );
            const closeTimeMinutes = timeToMinutes(
              formatTimeFromOpeningPeriod(todaySchedule.close.time)
            );

            if (arrivalTime < openTimeMinutes) {
              status = "BEFORE_OPENING";
            } else if (arrivalTime > closeTimeMinutes) {
              status = "AFTER_CLOSING";
            } else if (departureTime > closeTimeMinutes) {
              status = "VISIT_EXCEEDS_CLOSING";
            }
          }
        }

        return {
          name: place.name,
          arrivalTime: minutesToTime(arrivalTime),
          departureTime: minutesToTime(departureTime),
          visitDuration: place.visitDuration,
          status,
        };
      });

      console.log(`💡 Chi tiết lịch trình dự kiến:`, {
        startTime: startTimeStr,
        routeDate: dayDate.toDateString(),
        numberOfPlaces: placesWithData.length,
        warnings: timeWarningsList.length,
        timeline: timelineDetails,
      });
    } else {
      // Tạo bản ghi chi tiết thời gian dự kiến cho mỗi địa điểm (không có cảnh báo)
      const timelineDetails = placesWithData.map((place, idx) => {
        let arrivalTime = startHour * 60 + startMinute;

        for (let i = 0; i < idx; i++) {
          // Tính thời gian di chuyển giữa các điểm
          const routingData = localRoutingData[`day-${dayIndex}`];
          const travelTime =
            i > 0 && routingData?.routes[i - 1]?.duration
              ? Math.round(routingData.routes[i - 1].duration / 60)
              : 30;
          arrivalTime += travelTime + placesWithData[i].visitDuration;
        }

        if (idx > 0) {
          const routingData = localRoutingData[`day-${dayIndex}`];
          const travelTime = routingData?.routes[idx - 1]?.duration
            ? Math.round(routingData.routes[idx - 1].duration / 60)
            : 30;
          arrivalTime += travelTime;
        }

        const departureTime = arrivalTime + place.visitDuration;

        return {
          name: place.name,
          arrivalTime: minutesToTime(arrivalTime),
          departureTime: minutesToTime(departureTime),
          visitDuration: place.visitDuration,
        };
      });

      console.log(
        `✅ Không phát hiện cảnh báo thời gian cho ngày ${dayIndex + 1}`,
        {
          startTime: startTimeStr,
          routeDate: dayDate.toDateString(),
          timeline: timelineDetails,
        }
      );

      // Xóa cảnh báo cũ nếu có
      if (timeWarnings[dayIndex]) {
        setTimeWarnings((prev) => {
          const newWarnings = { ...prev };
          delete newWarnings[dayIndex];
          return newWarnings;
        });
      }
    }
  };

  // Enhanced function to calculate routes between consecutive places within each day
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
          totalDuration: 0, // Will be 0 in error case
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

      // Calculate total visit duration for all places
      let totalVisitDuration = 0;
      places.forEach((place: any) => {
        // Get visit duration from place data (stored in timeStart field)
        const visitDuration = place.timeStart ? parseInt(place.timeStart) : 60; // Default 60 min if not specified
        totalVisitDuration += visitDuration * 60; // Convert minutes to seconds
      });

      // Update routing data state and store with both travel time and visit durations
      const dayRoutingData = {
        routes,
        totalDistance,
        totalDuration: totalDuration + totalVisitDuration, // Add visit durations to travel time
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

      // After routes are calculated, analyze time constraints
      analyzeTimeConstraints(detailIndex);

      console.log(`✅ Day ${detailIndex + 1} routing completed:`, {
        places: placesWithCoords.length,
        routes: routes.length,
        successful: successfulRoutes,
        totalDistance: `${(totalDistance / 1000).toFixed(1)}km`,
        travelDuration: `${Math.round(totalDuration / 60)}min`,
        visitDuration: `${Math.round(totalVisitDuration / 60)}min`,
        totalDuration: `${Math.round((totalDuration + totalVisitDuration) / 60)}min`,
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
        totalDuration: 0, // Will be 0 in error case
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

  // Enhanced helper function to format distance and duration
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
      durationTooltip:
        "Tổng thời gian bao gồm cả thời gian thăm quan và di chuyển", // Add tooltip text
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

  // Handle keyboard shortcuts for location card overlay - same as GuideForm
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showLocationCard) {
        setShowLocationCard(false);
        setSelectedPlaceId(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showLocationCard]);

  // Helper function to update store when form changes - MEMOIZED
  const updateStore = React.useCallback(() => {
    const currentFormData = form.getValues();
    setPlannerData(currentFormData);
  }, [form, setPlannerData]);

  // Analyze time constraints whenever form details or day start times change
  useEffect(() => {
    const details = form.getValues("details") || [];

    // Run time constraint analysis for each route-type day
    details.forEach((detail, index) => {
      if (detail.type === "route" && detail.data?.length > 0) {
        analyzeTimeConstraints(index);
      }
    });
  }, [form.watch("details"), dayStartTimes]);

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
              {/* Thêm UI chọn thời gian bắt đầu đi */}
              <div className="p-3 mb-2 border rounded-md bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-sm">
                      Thời gian bắt đầu đi:
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      className="border rounded px-2 py-1 text-sm"
                      value={dayStartTimes[index] || "08:00"}
                      onChange={(e) => {
                        // Cập nhật state thời gian bắt đầu cho ngày này
                        setDayStartTimes((prev) => ({
                          ...prev,
                          [index]: e.target.value,
                        }));
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Nếu có cảnh báo, tính toán lại các cảnh báo với thời gian mới
                        if (timeWarnings[index]?.length > 0) {
                          toast({
                            title: "Cập nhật thời gian bắt đầu",
                            description:
                              "Đang kiểm tra lại các cảnh báo thời gian...",
                          });
                          // Tối ưu hóa lại lộ trình với thời gian bắt đầu mới
                          optimizeDayRouteWithTimeConstraints(index);
                        } else {
                          toast({
                            title: "Cập nhật thời gian bắt đầu",
                            description: `Lộ trình sẽ bắt đầu lúc ${dayStartTimes[index] || "08:00"}`,
                          });
                        }
                      }}
                    >
                      Áp dụng
                    </Button>
                  </div>
                </div>

                {/* Hiển thị cảnh báo thời gian nếu có */}
                {timeWarnings[index]?.length > 0 ? (
                  <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded">
                    <h4 className="text-sm font-medium text-amber-800 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Cảnh báo thời gian
                    </h4>
                    <ul className="mt-1 space-y-1">
                      {timeWarnings[index].map((warning, wIdx) => (
                        <li
                          key={wIdx}
                          className="text-xs text-amber-700 flex items-center"
                        >
                          <Circle className="h-1.5 w-1.5 mr-1 flex-shrink-0" />
                          <span>
                            {warning.placeName}: {warning.warning}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                    <h4 className="text-sm font-medium text-blue-800 flex items-center">
                      <InfoIcon className="h-3 w-3 mr-1" />
                      Thông tin lịch trình
                    </h4>
                    <div className="mt-1 text-xs text-blue-700">
                      <p>
                        Chưa có cảnh báo về thời gian - hãy nhấn nút "Tối ưu
                        thời gian" để kiểm tra lịch trình với các giờ mở/đóng
                        cửa.
                      </p>
                    </div>
                  </div>
                )}
              </div>

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
                      onClick={() => handleClickPlace(item)}
                      key={`place-${idx}`}
                      className="flex gap-3 cursor-pointer items-center  rounded-lg item-hover-btn"
                    >
                      <div className="background-light800_darkgradient flex gap-3 items-start rounded-lg p-3  flex-1">
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
                          <div className="flex flex-wrap gap-2">
                            {/* Visit Duration Input */}
                            <div className="flex items-center gap-2 p-1 px-2 border rounded-md bg-white">
                              <span className="text-xs text-gray-500">
                                Thời gian thăm:
                              </span>
                              <input
                                type="number"
                                min="0"
                                max="480"
                                className="w-12 text-center border-none focus:ring-0"
                                placeholder="60"
                                value={item.timeStart || ""}
                                onChange={(e) => {
                                  // Get current route items
                                  const currentRouteItems =
                                    getCurrentRouteItems();
                                  const updatedItems = [...currentRouteItems];

                                  // Update the specific place item with visit duration
                                  if (
                                    updatedItems[idx] &&
                                    updatedItems[idx].type === "place"
                                  ) {
                                    updatedItems[idx] = {
                                      ...updatedItems[idx],
                                      timeStart: e.target.value,
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

                                    form.trigger(`details.${index}.data`);
                                  }
                                }}
                              />
                              <span className="text-xs">phút</span>
                            </div>

                            {/* Priority Input */}
                            <div className="flex items-center gap-2 p-1 px-2 border rounded-md bg-white">
                              <span className="text-xs text-gray-500">
                                Độ ưu tiên:
                              </span>
                              <select
                                className="text-center border-none focus:ring-0 bg-transparent"
                                value={item.timeEnd || "3"}
                                onChange={(e) => {
                                  // Get current route items
                                  const currentRouteItems =
                                    getCurrentRouteItems();
                                  const updatedItems = [...currentRouteItems];

                                  // Update the specific place item with priority level
                                  if (
                                    updatedItems[idx] &&
                                    updatedItems[idx].type === "place"
                                  ) {
                                    updatedItems[idx] = {
                                      ...updatedItems[idx],
                                      timeEnd: e.target.value,
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

                                    form.trigger(`details.${index}.data`);
                                  }
                                }}
                              >
                                <option value="1">Thấp (1)</option>
                                <option value="2">Khá thấp (2)</option>
                                <option value="3">Trung bình (3)</option>
                                <option value="4">Khá cao (4)</option>
                                <option value="5">Cao (5)</option>
                              </select>
                            </div>

                            {/* Cost Button */}
                            <Button
                              variant="ghost"
                              onClick={() => {
                                handleOpenExpenseDialog(index, idx);
                              }}
                            >
                              <BiMoney />{" "}
                              {item.cost?.value && item.cost.value > 0
                                ? formatCurrency(
                                    item.cost.value,
                                    item.cost.type?.toLowerCase() || "vnd",
                                    { showSymbol: true, compact: false }
                                  )
                                : "Add Cost"}
                            </Button>

                            {/* Hiển thị cảnh báo thời gian cho địa điểm này nếu có */}
                            {timeWarnings[index]?.some(
                              (warning) => warning.placeId === item.id
                            ) && (
                              <div className="w-full mt-1 p-1 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-700 flex items-center">
                                <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />
                                <span>
                                  {
                                    timeWarnings[index].find(
                                      (warning) => warning.placeId === item.id
                                    )?.warning
                                  }
                                </span>
                              </div>
                            )}

                            {/* Hiển thị thông tin giờ mở/đóng cửa nếu có */}
                            {item.attractionData?.openingPeriods && (
                              <div className="w-full flex flex-wrap text-xs text-gray-500">
                                <span className="flex items-center mr-2">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Giờ hoạt động:
                                </span>
                                {(() => {
                                  const dayOfWeek = new Date().getDay();
                                  const todayPeriod =
                                    item.attractionData.openingPeriods.find(
                                      (p) => p.open.day === dayOfWeek
                                    );
                                  if (todayPeriod) {
                                    return (
                                      <span>
                                        {formatTimeFromOpeningPeriod(
                                          todayPeriod.open.time
                                        )}{" "}
                                        -{" "}
                                        {formatTimeFromOpeningPeriod(
                                          todayPeriod.close.time
                                        )}
                                      </span>
                                    );
                                  }
                                  return <span>Không có thông tin</span>;
                                })()}
                              </div>
                            )}
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
                    <div className=" p-3 mr-[58px]  rounded-lg border border-none background-light800_darkgradient">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold  dark:text-blue-200 flex items-center gap-2">
                          <Route className="h-4 w-4" />
                          Route Information
                        </h4>
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <Button
                              // variant="primary"
                              size="sm"
                              onClick={() => calculateDayRoutes(index)}
                              disabled={dayRouting?.isCalculating}
                              className="h-[36px] text-[14px] font-bold"
                            >
                              {dayRouting?.isCalculating ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                              ) : (
                                "Calculate Routes"
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => optimizeDayRouteOSRM(index)}
                              disabled={dayRouting?.isCalculating}
                              className="flex items-center gap-2 text-xs"
                              title="Tối ưu hóa thứ tự các địa điểm để giảm thời gian di chuyển"
                            >
                              <Route className="h-3 w-3" />
                              Optimize
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                optimizeDayRouteWithTimeConstraints(index)
                              }
                              disabled={dayRouting?.isCalculating}
                              className="flex items-center gap-2 text-xs"
                              title="Tối ưu hóa theo thời gian thăm và độ ưu tiên"
                            >
                              <Clock className="h-3 w-3" />
                              Time Optimize
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                analyzeTimeConstraints(index);
                                toast({
                                  title: "Đã phân tích ràng buộc thời gian",
                                  description:
                                    timeWarnings[index]?.length > 0
                                      ? `Phát hiện ${timeWarnings[index].length} cảnh báo thời gian`
                                      : "Không phát hiện cảnh báo thời gian nào",
                                  variant:
                                    timeWarnings[index]?.length > 0
                                      ? "warning"
                                      : "default",
                                });
                              }}
                              disabled={dayRouting?.isCalculating}
                              className="flex items-center gap-2 text-xs"
                              title="Kiểm tra cảnh báo thời gian cho lộ trình hiện tại"
                            >
                              <AlertTriangle className="h-3 w-3" />
                              Check Time
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => restorePreviousRouteData(index)}
                              disabled={
                                !previousRouteData[index] ||
                                dayRouting?.isCalculating
                              }
                              className="flex items-center gap-2 text-xs"
                              title="Hoàn tác lộ trình về trạng thái trước khi tối ưu hóa"
                            >
                              <Undo className="h-3 w-3" />
                              Undo
                            </Button>
                          </div>

                          {/* Help tooltip for Time Optimization */}
                          <div className="text-xs text-gray-500 p-1 rounded-md bg-gray-100">
                            <span className="font-medium">
                              Tối ưu theo thời gian:
                            </span>{" "}
                            Nhập thời gian thăm (phút) và độ ưu tiên (1-5) cho
                            mỗi địa điểm
                          </div>
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
                              <span
                                className="font-medium tooltip"
                                title="Tổng thời gian bao gồm cả thời gian thăm quan và di chuyển"
                              >
                                Total Duration:
                              </span>
                              <span
                                className="ml-2 text-blue-700 dark:text-blue-300"
                                title="Tổng thời gian bao gồm cả thời gian thăm quan và di chuyển"
                              >
                                {
                                  formatRouteInfo(
                                    dayRouting.totalDistance,
                                    dayRouting.totalDuration
                                  ).duration
                                }
                              </span>
                              <span className="ml-2 text-xs text-gray-500">
                                (Bao gồm thời gian thăm quan)
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
                                    <span className="font-medium">Way</span>
                                    {getRouteSummary(route.legs)}
                                  </div>
                                )}

                                {/* NEW: Detailed route steps - collapsible */}
                                {route.legs && route.legs.length > 0 && (
                                  <details className="mt-2">
                                    <summary className="cursor-pointer text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200">
                                      Way details (
                                      {formatRouteSteps(route.legs).length}{" "}
                                      step)
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

  // Sync cost input value with expense form data
  useEffect(() => {
    setCostInputValue(expenseFormData.value.toString());
  }, [expenseFormData.value]);

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
    // Show LocationCard overlay with place ID - same as GuideForm
    setSelectedPlaceId(place.id || place._id);
    setShowLocationCard(true);

    // Direct selection from component - add to route immediately (original behavior)
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

  // Helper function to get all available people for expense splitting
  const getAllAvailablePeople = () => {
    const tripmates = form.getValues("tripmates") || [];
    return [
      {
        userId: "current-user", // This would be the current user ID
        name: "You", // This would be the current user name
      },
      ...tripmates.map((tripmate: any) => ({
        userId: tripmate.userId || "",
        name: tripmate.name,
      })),
    ];
  };

  // Helper function to sync existing splitBetween with current tripmates
  const syncSplitBetweenWithTripmates = (existingSplitBetween: any[]) => {
    const allAvailablePeople = getAllAvailablePeople();
    const synced = [];

    // Add all available people
    for (const person of allAvailablePeople) {
      // Find existing data for this person
      const existingPerson = existingSplitBetween.find(
        (split) => split.name === person.name || split.userId === person.userId
      );

      synced.push({
        userId: person.userId,
        name: person.name,
        amount: existingPerson?.amount || 0,
        settled: existingPerson?.settled || false,
        selected:
          existingPerson?.selected !== undefined
            ? existingPerson.selected
            : true,
      });
    }

    return synced;
  };

  // Function to auto-sync all existing expenses when tripmates change
  const syncAllExpensesWithTripmates = () => {
    // Get current form data
    const currentData = form.getValues();
    let hasChanges = false;

    // Sync lodging expenses
    if (currentData.lodging) {
      const updatedLodging = currentData.lodging.map((lodging: any) => {
        if (
          lodging.cost?.splitBetween &&
          lodging.cost.splitBetween.length > 0
        ) {
          const syncedSplitBetween = syncSplitBetweenWithTripmates(
            lodging.cost.splitBetween
          );
          hasChanges = true;
          return {
            ...lodging,
            cost: {
              ...lodging.cost,
              splitBetween: syncedSplitBetween,
            },
          };
        }
        return lodging;
      });

      if (hasChanges) {
        form.setValue("lodging", updatedLodging, { shouldDirty: true });
      }
    }

    // Sync place expenses
    if (currentData.details) {
      const updatedDetails = currentData.details.map((detail: any) => ({
        ...detail,
        data:
          detail.data?.map((item: any) => {
            if (
              item.type === "place" &&
              item.cost?.splitBetween &&
              item.cost.splitBetween.length > 0
            ) {
              const syncedSplitBetween = syncSplitBetweenWithTripmates(
                item.cost.splitBetween
              );
              hasChanges = true;
              return {
                ...item,
                cost: {
                  ...item.cost,
                  splitBetween: syncedSplitBetween,
                },
              };
            }
            return item;
          }) || [],
      }));

      if (hasChanges) {
        form.setValue("details", updatedDetails, { shouldDirty: true });
      }
    }

    if (hasChanges) {
      updateStore();
      toast({
        title: "Expenses synced",
        description:
          "All existing expenses have been updated with current tripmates.",
        variant: "default",
      });
    }
  };

  // Expense management functions
  const handleOpenExpenseDialog = (detailIndex: number, itemIndex: number) => {
    // Get current place data
    const currentPlace = form.getValues(
      `details.${detailIndex}.data.${itemIndex}`
    );

    if (currentPlace?.type === "place") {
      // Set the context for which place we're editing
      setCurrentExpenseContext({ detailIndex, itemIndex });

      // Pre-populate form with existing cost data if available
      const existingCost = currentPlace.cost || ({} as any);

      // Get all available people for splitting
      const allAvailablePeople = getAllAvailablePeople();
      const totalValue = existingCost.value || 0;
      const splitCount = allAvailablePeople.length;
      const defaultSplitAmount = splitCount > 0 ? totalValue / splitCount : 0;

      // Create synchronized split between array
      let splitBetween;
      if (existingCost.splitBetween && existingCost.splitBetween.length > 0) {
        // Sync existing data with current tripmates
        splitBetween = syncSplitBetweenWithTripmates(existingCost.splitBetween);
      } else {
        // Create new default split for all available people
        splitBetween = allAvailablePeople.map((person) => ({
          userId: person.userId,
          name: person.name,
          amount: defaultSplitAmount,
          settled: false,
          selected: true, // Default to selected
        }));
      }

      setExpenseFormData({
        value: existingCost.value || 0,
        type: existingCost.type || "VND",
        description: existingCost.description || "",
        paidBy: existingCost.paidBy || "You",
        splitBetween: splitBetween,
      });

      // Initialize split mode based on existing data
      if (existingCost.splitBetween && existingCost.splitBetween.length > 0) {
        const selectedCount = splitBetween.filter(
          (person: any) => person.selected !== false
        ).length;
        const totalCount = splitBetween.length;

        if (selectedCount === 0) {
          setSplitMode("dontsplit");
        } else if (selectedCount === totalCount) {
          setSplitMode("everyone");
        } else {
          setSplitMode("individuals");
        }
      } else {
        setSplitMode("everyone"); // Default to everyone
      }

      setShowExpenses(true);
    }
  };

  const handleSaveExpense = () => {
    if (!currentExpenseContext) return;

    const { detailIndex, itemIndex } = currentExpenseContext;

    // Get current place data
    const currentPlace = form.getValues(
      `details.${detailIndex}.data.${itemIndex}`
    );

    if (currentPlace?.type === "place") {
      // Update the place with new cost information
      const updatedPlace = {
        ...currentPlace,
        cost: {
          value: expenseFormData.value,
          type: expenseFormData.type as "VND" | "USD" | "EUR",
          description: expenseFormData.description,
          paidBy: expenseFormData.paidBy,
          splitBetween: expenseFormData.splitBetween,
        },
      };

      // Update the form
      const currentItems = form.getValues(`details.${detailIndex}.data`) || [];
      const updatedItems = [...currentItems];
      updatedItems[itemIndex] = updatedPlace;

      form.setValue(`details.${detailIndex}.data`, updatedItems, {
        shouldValidate: false,
        shouldDirty: true,
        shouldTouch: true,
      });

      // Update store
      updateStore();

      // Show success message
      toast({
        title: "Expense saved!",
        description: "Cost information has been updated for this place.",
        variant: "default",
      });

      // Close dialog and reset state
      setShowExpenses(false);
      setCurrentExpenseContext(null);
      resetExpenseForm();
    }
  };

  const handleClickPlace = (place: any) => {
    console.log("Clicked place", place);

    // Get place ID for LocationCard
    const placeId = place.id || place._id || place.attractionId;

    if (placeId) {
      // Show LocationCard với place ID
      setSelectedPlaceId(placeId);
      setShowLocationCard(true);
      console.log("Showing LocationCard for place ID:", placeId);
    }

    // Extract coordinates from place
    let coordinates: [number, number] | null = null;

    if (
      place.location?.coordinates &&
      Array.isArray(place.location.coordinates) &&
      place.location.coordinates.length === 2
    ) {
      const [lon, lat] = place.location.coordinates;
      if (typeof lon === "number" && typeof lat === "number") {
        coordinates = [lon, lat];
      }
    }

    if (coordinates) {
      // Use setFlyToPlace từ store để Map có thể fly đến đó
      const { setFlyToPlace } = usePlannerStore.getState();
      setFlyToPlace({
        coordinates,
        name: place.name || "Unknown Place",
        timestamp: Date.now(), // để trigger effect trong Map
      });

      console.log(
        "Flying to place:",
        place.name,
        "at coordinates:",
        coordinates
      );
    } else {
      console.warn("No valid coordinates found for place:", place.name);
    }
  };
  const resetExpenseForm = () => {
    setExpenseFormData({
      value: 0,
      type: "VND",
      description: "",
      paidBy: "",
      splitBetween: [],
    });
    setSplitMode("everyone"); // Reset split mode to default
  };

  const handleExpenseFormChange = (field: string, value: any) => {
    setExpenseFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // If value changes, recalculate split amounts based on current split mode
    if (field === "value") {
      recalculateSplitAmounts(value);
    }
  };

  // Add function to handle split mode changes
  const handleSplitModeChange = (
    mode: "everyone" | "individuals" | "dontsplit"
  ) => {
    setSplitMode(mode);

    if (mode === "everyone") {
      // Split equally among all people
      recalculateSplitAmounts(expenseFormData.value);
    } else if (mode === "individuals") {
      // Keep current selection but allow checkbox selection
      // Don't change amounts, just enable checkbox selection
    } else if (mode === "dontsplit") {
      // Only the person who paid pays
      setExpenseFormData((prev) => ({
        ...prev,
        splitBetween: prev.splitBetween.map((person) => ({
          ...person,
          amount: person.name === prev.paidBy ? prev.value : 0,
          selected: person.name === prev.paidBy,
        })),
      }));
    }
  };

  // Add function to recalculate split amounts
  const recalculateSplitAmounts = (totalValue: number) => {
    if (splitMode === "everyone") {
      const splitCount = expenseFormData.splitBetween.length;
      const splitAmount = splitCount > 0 ? totalValue / splitCount : 0;

      setExpenseFormData((prev) => ({
        ...prev,
        value: totalValue,
        splitBetween: prev.splitBetween.map((person) => ({
          ...person,
          amount: splitAmount,
          selected: true,
        })),
      }));
    } else if (splitMode === "individuals") {
      // Only split among selected people
      const selectedPeople = expenseFormData.splitBetween.filter(
        (person) => person.selected
      );
      const splitCount = selectedPeople.length;
      const splitAmount = splitCount > 0 ? totalValue / splitCount : 0;

      setExpenseFormData((prev) => ({
        ...prev,
        value: totalValue,
        splitBetween: prev.splitBetween.map((person) => ({
          ...person,
          amount: person.selected ? splitAmount : 0,
        })),
      }));
    }
  };

  // Add function to handle individual checkbox changes
  const handlePersonSelectionChange = (
    personIndex: number,
    selected: boolean
  ) => {
    setExpenseFormData((prev) => {
      const updatedSplitBetween = prev.splitBetween.map((person, index) =>
        index === personIndex ? { ...person, selected } : person
      );

      // Recalculate amounts for selected people
      const selectedPeople = updatedSplitBetween.filter(
        (person) => person.selected
      );
      const splitCount = selectedPeople.length;
      const splitAmount = splitCount > 0 ? prev.value / splitCount : 0;

      return {
        ...prev,
        splitBetween: updatedSplitBetween.map((person) => ({
          ...person,
          amount: person.selected ? splitAmount : 0,
        })),
      };
    });
  };

  const updateSplitAmount = (personIndex: number, amount: number) => {
    setExpenseFormData((prev) => ({
      ...prev,
      splitBetween: prev.splitBetween.map((person, index) =>
        index === personIndex ? { ...person, amount } : person
      ),
    }));
  };

  const handleUploadImage = () => {
    // Tạo một input file ẩn
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = false;

    input.onchange = async (event: Event) => {
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

  // Function to remove a tripmate from planner
  const removeTripmateMember = async (tripmateIndex: number) => {
    if (!planner?._id && !planner?.id) {
      console.error("No planner ID available");
      return;
    }

    try {
      const plannerId = planner._id || planner.id;
      const currentTripmates = [...(form.getValues("tripmates") || [])];

      if (tripmateIndex < 0 || tripmateIndex >= currentTripmates.length) {
        toast({
          title: "Error",
          description: "Invalid tripmate index",
          variant: "destructive",
        });
        return;
      }

      // Create updated tripmates array without the tripmate to remove
      const updatedTripmates = currentTripmates.filter(
        (_, index) => index !== tripmateIndex
      );

      // Cập nhật giao diện và form trước khi gọi API

      // 1. Cập nhật form trực tiếp (quan trọng nhất)
      form.setValue("tripmates", updatedTripmates);

      // 2. Tạo bản sao của planner hiện tại và cập nhật
      const updatedPlanner = {
        ...currentPlannerData,
        tripmates: updatedTripmates,
      };

      // 3. Cập nhật state hiển thị
      setCurrentPlannerData(updatedPlanner);

      // 4. Cập nhật state của component - rất quan trọng
      planner.tripmates = updatedTripmates;

      // 5. Cập nhật store
      setPlannerData(updatedPlanner);

      // Update the planner with partial update
      const updateResult = await partialUpdatePlanner({
        plannerId,
        tripmates: updatedTripmates,
      });

      if (updateResult.success) {
        toast({
          title: "Tripmate removed",
          description: "Tripmate has been removed from the planner",
          variant: "default",
        });

        // Đã cập nhật UI trước rồi, nên không cần refreshPlannerData nữa
        // Điều này giúp tránh tình trạng UI nhấp nháy
      } else {
        // Nếu có lỗi, khôi phục lại dữ liệu ban đầu
        form.setValue("tripmates", currentTripmates);
        setCurrentPlannerData({
          ...currentPlannerData,
          tripmates: currentTripmates,
        });
        planner.tripmates = currentTripmates;
        setPlannerData({
          ...currentPlannerData,
          tripmates: currentTripmates,
        });

        toast({
          title: "Failed to remove tripmate",
          description: updateResult.error?.message || "An error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error removing tripmate:", error);
      toast({
        title: "Error",
        description: "Failed to remove tripmate",
        variant: "destructive",
      });
    }
  };

  // Function to refresh planner data after tripmate is added
  const refreshPlannerData = async () => {
    if (!planner?._id && !planner?.id) {
      console.error("No planner ID available for refresh");
      return;
    }

    try {
      const plannerId = planner._id || planner.id;
      const refreshedPlanner = await getPlannerById({ plannerId });

      if (refreshedPlanner.success && refreshedPlanner.data) {
        console.log("✅ Planner data refreshed:", refreshedPlanner.data);
        setCurrentPlannerData(refreshedPlanner.data);

        // Update form with fresh tripmates data
        form.setValue("tripmates", refreshedPlanner.data.tripmates || []);

        // Update store as well
        setPlannerData(refreshedPlanner.data);

        // Auto-sync all existing expenses with new tripmates
        setTimeout(() => {
          syncAllExpensesWithTripmates();
        }, 100); // Small delay to ensure form state is updated

        toast({
          title: "Updated!",
          description: "Planner refreshed with latest tripmate data.",
          variant: "default",
        });
      } else {
        console.error("Failed to refresh planner:", refreshedPlanner.error);
      }
    } catch (error) {
      console.error("Error refreshing planner data:", error);
    }
  };

  const handleSubmit = async () => {
    const formData = form.getValues();
    console.log("formData submit", formData);
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

    // // Workaround: Ensure location data is preserved for place items
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

      console.log("DataSubmit", dataTest, "DataResponse", updatePlannerData);
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

  console.log("Form Data", form.getValues());
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
                    {/* Display tripmates from current planner data */}
                    {(currentPlannerData?.tripmates || planner?.tripmates || [])
                      .slice(0, 3)
                      .map((tripmate: any, index: number) => (
                        <Avatar key={index}>
                          <AvatarImage
                            src={tripmate.image || ""}
                            alt={tripmate.name || "Tripmate"}
                          />
                          <AvatarFallback>
                            {tripmate.name
                              ? tripmate.name.charAt(0).toUpperCase()
                              : "U"}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    {/* Show additional count if more than 3 tripmates */}
                    {(currentPlannerData?.tripmates || planner?.tripmates || [])
                      .length > 3 && (
                      <Avatar>
                        <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                          +
                          {(
                            currentPlannerData?.tripmates ||
                            planner?.tripmates ||
                            []
                          ).length - 3}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    {/* Show placeholder if no tripmates */}
                    {/* {(!currentPlannerData?.tripmates ||
                      currentPlannerData.tripmates.length === 0) &&
                      (!planner?.tripmates ||
                        planner.tripmates.length === 0) && (
                        <Avatar>
                          <AvatarImage
                            src="https://github.com/shadcn.png"
                            alt="@shadcn"
                          />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                      )} */}
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
                    onClick={recalculateAllRoutes}
                    className="h-[36px] font-bold"
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
              {isPending ? "Updating..." : "Update Planner"}
            </Button>
          </div>
          <div className="px-8 pb-8 flex flex-col gap-4">
            <h1 className="text-[36px] font-bold">Budgeting</h1>
            <div className="p-4 px-12 flex justify-between items-center rounded-lg background-light800_darkgradient">
              <div>
                <div className="text-[30px] font-bold mb-2">
                  {formatCurrency(1000000, "vnd", {
                    showSymbol: true,
                    compact: false,
                  })}
                </div>
                <div>
                  <Button className="h-[36px]">Set Budget</Button>
                  <Button className="h-[36px] ml-2">Group Balances </Button>
                </div>
              </div>
              <div className="flex flex-col gap-4 pr-8">
                <div className="flex items-center gap-2 text-[14px] font-semibold">
                  <ChartBar size={14} /> View breakdown
                </div>
                <div className="flex items-center gap-2 text-[14px] font-semibold">
                  <FaUserPlus size={14} /> Add Tripmate
                </div>
                <div className="flex items-center gap-2 text-[14px] font-semibold">
                  <Settings size={14} /> Settings
                </div>
              </div>
            </div>
            <h2 className="text-[24px] font-semibold">Expenses</h2>
            <div className="">
              {(() => {
                const lodgingData = form.getValues("lodging") || [];
                const detailsData = form.getValues("details") || [];

                // Extract lodging costs
                const lodgingCosts = lodgingData
                  .filter(
                    (lodging) => lodging.cost?.value && lodging.cost.value > 0
                  )
                  .map((lodging) => ({
                    ...lodging.cost,
                    name: lodging.name || "Lodging",
                    category: "Lodging",
                  }));

                // Extract place costs
                const placeCosts = detailsData.flatMap((day: any) =>
                  (day.data || [])
                    .filter(
                      (item: any) =>
                        item.type === "place" &&
                        item.cost?.value &&
                        item.cost.value > 0
                    )
                    .map((place: any) => ({
                      ...place.cost,
                      name: place.name || "Place Visit",
                      category: "Activities",
                    }))
                );

                const allExpenses = [...lodgingCosts, ...placeCosts];

                if (allExpenses.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      <BiMoney className="mx-auto text-4xl mb-4" />
                      <p className="text-lg">No expenses added yet</p>
                      <p className="text-sm">
                        Add costs to lodging and places to see expense breakdown
                        here
                      </p>
                    </div>
                  );
                }

                // Calculate totals by currency
                const totalsByCurrency = allExpenses.reduce(
                  (acc, expense) => {
                    const currency = expense.type?.toLowerCase() || "vnd";
                    acc[currency] = (acc[currency] || 0) + expense.value;
                    return acc;
                  },
                  {} as Record<string, number>
                );

                // Group expenses by category
                const expensesByCategory = allExpenses.reduce(
                  (acc, expense) => {
                    const category = expense.category;
                    if (!acc[category]) acc[category] = [];
                    acc[category].push(expense);
                    return acc;
                  },
                  {} as Record<string, any[]>
                );

                return (
                  <div className="space-y-6">
                    {/* Total Summary */}
                    <div className="background-light800_darkgradient p-4 rounded-lg border-none">
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <BiMoney className="mr-2" />
                        Total Expenses
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(totalsByCurrency).map(
                          ([currency, total]) => (
                            <div
                              key={currency}
                              className="text-center p-3 bg-blue-100 rounded"
                            >
                              <div className="text-2xl font-bold text-blue-600">
                                {formatCurrency(total, currency, {
                                  showSymbol: true,
                                  compact: false,
                                })}
                              </div>
                              <div className="text-sm text-gray-600 uppercase">
                                {currency}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Expenses by Category */}
                    {Object.entries(expensesByCategory).map(
                      ([category, expenses]) => (
                        <div
                          key={category}
                          className="background-light800_darkgradient p-4 rounded-lg border-none"
                        >
                          <h4 className="text-md font-semibold mb-3 text-gray-800">
                            {category}
                          </h4>
                          <div className="space-y-2">
                            {expenses.map((expense, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded"
                              >
                                <div className="flex-1">
                                  <div className="font-medium">
                                    {expense.name}
                                  </div>
                                  {expense.description && (
                                    <div className="text-sm text-gray-600">
                                      {expense.description}
                                    </div>
                                  )}
                                  {expense.paidBy && (
                                    <div className="text-xs text-blue-600">
                                      Paid by: {expense.paidBy}
                                    </div>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold">
                                    {formatCurrency(
                                      expense.value,
                                      expense.type?.toLowerCase() || "vnd",
                                      { showSymbol: true, compact: false }
                                    )}
                                  </div>
                                  {expense.splitBetween &&
                                    expense.splitBetween.length > 0 && (
                                      <div className="text-xs text-gray-500">
                                        Split between{" "}
                                        {
                                          expense.splitBetween?.filter(
                                            (value: any) => value?.amount > 0
                                          )?.length
                                        }{" "}
                                        people
                                      </div>
                                    )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Category Total */}
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex justify-between items-center font-semibold">
                              <span>{category} Total:</span>
                              <div className="space-y-1">
                                {Object.entries(
                                  expenses.reduce(
                                    (acc, expense) => {
                                      const currency =
                                        expense.type?.toLowerCase() || "vnd";
                                      acc[currency] =
                                        (acc[currency] || 0) + expense.value;
                                      return acc;
                                    },
                                    {} as Record<string, number>
                                  )
                                ).map(([currency, total]) => (
                                  <div key={currency} className="text-right">
                                    {formatCurrency(total, currency, {
                                      showSymbol: true,
                                      compact: false,
                                    })}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    )}

                    {/* Detailed Breakdown */}
                    <div className="background-light800_darkgradient p-4 rounded-lg border-none">
                      <h4 className="text-md font-semibold mb-3 text-gray-800">
                        All Expenses
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2">Item</th>
                              <th className="text-left py-2">Category</th>
                              <th className="text-left py-2">Amount</th>
                              <th className="text-left py-2">Paid By</th>
                              <th className="text-left py-2">Split</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allExpenses.map((expense, index) => (
                              <tr key={index} className="border-b">
                                <td className="py-2">
                                  <div className="font-medium">
                                    {expense.name}
                                  </div>
                                  {expense.description && (
                                    <div className="text-xs text-gray-500">
                                      {expense.description}
                                    </div>
                                  )}
                                </td>
                                <td className="py-2">{expense.category}</td>
                                <td className="py-2 font-medium">
                                  {formatCurrency(
                                    expense.value,
                                    expense.type?.toLowerCase() || "vnd",
                                    { showSymbol: true, compact: false }
                                  )}
                                </td>
                                <td className="py-2">
                                  {expense.paidBy || "-"}
                                </td>
                                <td className="py-2">
                                  {expense.splitBetween &&
                                  expense.splitBetween.length > 0
                                    ? `${expense.splitBetween?.filter((value: any) => value?.amount > 0)?.length} people`
                                    : "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </form>
      </Form>
      {/* <LocationCard /> */}
      {showDialog && (
        <ReusableDialog
          data={{
            title: "Invite tripmates",
            content: (
              <div>
                <Tabs defaultValue="edit">
                  <TabsList>
                    <TabsTrigger value="edit">Can Edit</TabsTrigger>
                    {/* <TabsTrigger value="view">View Only</TabsTrigger> */}
                  </TabsList>
                  <TabsContent value="edit">
                    {manageTripmates ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">
                            Manage Tripmates
                          </h3>
                          <Button
                            onClick={() => {
                              setManageTripmates(false);
                            }}
                            size="sm"
                            variant="outline"
                          >
                            <Undo className="mr-2 h-4 w-4" />
                            Back
                          </Button>
                        </div>

                        {planner?.tripmates?.length > 0 ? (
                          <div className="space-y-2">
                            {planner.tripmates.map(
                              (tripmate: any, index: number) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 border rounded-lg bg-white dark:bg-gray-800"
                                >
                                  <div className="flex items-center gap-3">
                                    {tripmate.image ? (
                                      <img
                                        src={tripmate.image}
                                        alt={tripmate.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                        <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                                      </div>
                                    )}
                                    <div>
                                      <p className="font-medium">
                                        {tripmate.name}
                                      </p>
                                      {tripmate.email && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                          {tripmate.email}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeTripmateMember(index)}
                                    title="Remove tripmate"
                                    className="h-8 w-8 p-0"
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <div className="text-center p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                            <p className="text-gray-500 dark:text-gray-400">
                              No tripmates added yet
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2 items-center border border-gray-300 p-2 rounded-md text-[1rem] ">
                          <Link />
                          <Input
                            className="border-none no-focus shadow-none"
                            value={
                              typeof window !== "undefined"
                                ? window.location.href
                                : ""
                            }
                            readOnly
                          />
                          <Button
                            className="bg-primary-500 hover:bg-[#fe9a4d]"
                            onClick={() => {
                              const url =
                                typeof window !== "undefined"
                                  ? window.location.href
                                  : "";
                              navigator.clipboard
                                .writeText(url)
                                .then(() => {
                                  toast({
                                    title: "Link copied!",
                                    description:
                                      "The link has been copied to clipboard.",
                                    variant: "success",
                                  });
                                })
                                .catch(() => {
                                  toast({
                                    title: "Copy failed",
                                    description:
                                      "Failed to copy link to clipboard.",
                                    variant: "destructive",
                                  });
                                });
                            }}
                          >
                            Copy link
                          </Button>
                        </div>
                        <div className="flex gap-2 items-start border-1 background-light800_dark300 p-2 rounded-md text-[1rem] ">
                          <User className="mt-[18px]" />
                          {/* <Input className="border-none no-focus shadow-none" /> */}
                          <UserSearch
                            onUserSelect={(user) =>
                              console.log("Selected user:", user)
                            }
                            onTripmateAdded={refreshPlannerData}
                            placeholder="Enter user email to search"
                            plannerId={planner?._id || planner?.id} // Add plannerId
                            // className="border-none no-focus shadow-none"
                          />
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
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="font-bold">Cost</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      className="h-[40px]"
                      value={costInputValue}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        setCostInputValue(inputValue);

                        // Debounce the actual form update
                        const numericValue = parseFloat(inputValue) || 0;
                        debouncedCostUpdate(numericValue);
                      }}
                    />
                  </div>
                  <div className="w-fit min-w-[120px]">
                    <Label className="font-bold">Currency</Label>
                    <Select
                      value={expenseFormData.type}
                      onValueChange={(value) =>
                        handleExpenseFormChange("type", value)
                      }
                    >
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

                <div>
                  <Label className="font-bold">Description</Label>
                  <Textarea
                    placeholder="Enter expense description..."
                    className="min-h-[80px]"
                    value={expenseFormData.description}
                    onChange={(e) =>
                      handleExpenseFormChange("description", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label className="font-bold">Paid by</Label>
                  <Select
                    value={expenseFormData.paidBy}
                    onValueChange={(value) =>
                      handleExpenseFormChange("paidBy", value)
                    }
                  >
                    <SelectTrigger
                      className={`h-[40px] border-none paragraph-regular background-form-input light-border-2 text-dark300_light700 no-focus rounded-1.5 border`}
                    >
                      <SelectValue placeholder="Select who paid" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="You">
                        <div>You (Current User)</div>
                      </SelectItem>
                      {(form.getValues("tripmates") || []).map(
                        (tripmate: any, index: number) => (
                          <SelectItem key={index} value={tripmate.name}>
                            {tripmate.name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="font-bold">Split Between</Label>

                  <div className="mb-4">
                    <Select
                      value={splitMode}
                      onValueChange={handleSplitModeChange}
                    >
                      <SelectTrigger
                        className={`h-[40px] border-none paragraph-regular background-form-input light-border-2 text-dark300_light700 no-focus rounded-1.5 border`}
                      >
                        <SelectValue placeholder="Split between ..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="everyone">Everyone</SelectItem>
                          <SelectItem value="individuals">
                            Individuals
                          </SelectItem>
                          <SelectItem value="dontsplit">Don't Split</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Split explanation */}
                  <div className="mb-3 text-sm text-gray-600">
                    {splitMode === "everyone" &&
                      "Split equally among all tripmates"}
                    {splitMode === "individuals" &&
                      "Select specific people to split with"}
                    {splitMode === "dontsplit" &&
                      "Only the person who paid will cover this expense"}
                  </div>

                  {/* People list with checkboxes for individuals mode */}
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {expenseFormData.splitBetween.map((person, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                          splitMode === "individuals"
                            ? person.selected
                              ? "bg-blue-50 border-blue-200"
                              : "bg-gray-50 border-gray-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        {/* Checkbox for individuals mode */}
                        {splitMode === "individuals" && (
                          <input
                            type="checkbox"
                            checked={person.selected || false}
                            onChange={(e) =>
                              handlePersonSelectionChange(
                                index,
                                e.target.checked
                              )
                            }
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                        )}

                        {/* Person name */}
                        <div className="flex-1">
                          <span className="font-medium">{person.name}</span>
                          {person.name === expenseFormData.paidBy && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Paid
                            </span>
                          )}
                        </div>

                        {/* Amount input */}
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={person.amount || ""}
                            onChange={(e) =>
                              updateSplitAmount(
                                index,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-24 h-8"
                            placeholder="0"
                            disabled={
                              splitMode === "dontsplit" &&
                              person.name !== expenseFormData.paidBy
                            }
                            readOnly={
                              splitMode === "everyone" ||
                              (splitMode === "individuals" && !person.selected)
                            }
                          />
                          <span className="text-sm text-gray-600 min-w-[35px]">
                            {expenseFormData.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total calculation */}
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">Total Split:</span>
                      <span className="font-bold">
                        {expenseFormData.splitBetween
                          .reduce(
                            (sum, person) => sum + (person.amount || 0),
                            0
                          )
                          .toFixed(2)}{" "}
                        {expenseFormData.type}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-1">
                      <span>Expense Amount:</span>
                      <span>
                        {expenseFormData.value.toFixed(2)}{" "}
                        {expenseFormData.type}
                      </span>
                    </div>
                    {Math.abs(
                      expenseFormData.value -
                        expenseFormData.splitBetween.reduce(
                          (sum, person) => sum + (person.amount || 0),
                          0
                        )
                    ) > 0.01 && (
                      <div className="flex justify-between items-center text-sm mt-1 text-red-600">
                        <span>Difference:</span>
                        <span>
                          {(
                            expenseFormData.value -
                            expenseFormData.splitBetween.reduce(
                              (sum, person) => sum + (person.amount || 0),
                              0
                            )
                          ).toFixed(2)}{" "}
                          {expenseFormData.type}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowExpenses(false);
                      resetExpenseForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveExpense}
                    className="bg-primary-500 hover:bg-primary-600"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Expense
                  </Button>
                </div>
              </div>
            ),
            showCloseButton: false,
          }}
          setOpen={setShowExpenses}
        />
      )}

      {/* LocationCard Overlay - Show when user selects a place */}
      {showLocationCard && selectedPlaceId && (
        <LocationCard placeId={selectedPlaceId} />
      )}
    </div>
  );
};

export default PlannerForm;
