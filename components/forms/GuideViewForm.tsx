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
import { VoteButtons } from "../votes";
import AuthDebug from "../debug/AuthDebug";
import {
  Trash2,
  Plus,
  MapPin,
  Calendar,
  Users,
  Hotel,
  // Route, // Disabled for Guide Form - used to show routing info
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
  X,
} from "lucide-react";
import Image from "next/image";

import { CalendarDatePicker } from "../calendar-date-picker";
import moment from "moment";

import { Label } from "../ui/label";
import { MdChecklist, MdFlight } from "react-icons/md";
import { BiMoney, BiRestaurant, BiSolidHotel } from "react-icons/bi";
import { GoKebabHorizontal } from "react-icons/go";
import Collaps from "../Collaps";
import {
  FaMapMarker,
  FaPen,
  FaPlus,
  FaTrash,
  FaUserPlus,
} from "react-icons/fa";
import InputWithIcon from "../input/InputIcon";
import DebouncedTextarea from "../input/DebouncedTextarea";
import InputCollapseHotelMultiple from "../input/InputCollapseHotelMultiple";
import InputHotelPlanner from "../input/InputHotelPlanner";
import HotelSearch from "../search/HotelSearch";
import LodgingSearch from "../search/LodgingSearch";
import "./style.css";
import PlaceSearch from "../search/PlaceSearch";
import { FaArrowTurnUp, FaEllipsis, FaNoteSticky } from "react-icons/fa6";
import Checklist from "../input/Checklist";
import ImageGallery from "../images/ImageGallery";
import RangeTimePicker from "../timepicker/RangeTimePicker";
import { auth } from "@/auth";
import {
  updateGuide,
  getGuideById,
  updateGuideMainImage,
} from "@/lib/actions/guide.action";
import { createComment } from "@/lib/actions/comment.action";
import { getPlaceById } from "@/lib/actions/place.action";
import { useToast } from "@/hooks/use-toast";
import { Toast } from "../ui/toast";
import UserSearch from "../search/UserSearch";
import { formatCurrency } from "@/lib/currency";
import LocationCard from "../cards/LocationCard";
import CommentsSection from "../comments/CommentsSection";
import DebouncedNoteInput from "../input/DebouncedNoteInput";

type PlannerFormData = z.infer<typeof PlannerSchema>;

const splitType = ["Don't split", "Everyone", "Invidiuals"];

const GuideViewForm = ({ planner }: { planner?: any }) => {
  console.log("🚀 ~ file: GuideViewForm.tsx:283 ~ planner:", planner);
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Zustand store for planner data
  const { setPlannerData, updatePlannerDetails } = usePlannerStore(); // removed updateDayRouting for Guide Form
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

  // State for LocationCard overlay - store selected place ID
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [showLocationCard, setShowLocationCard] = useState(false);

  // Debounced callback for cost input
  const debouncedCostUpdate = useDebounce((value: number) => {
    handleExpenseFormChange("value", value);
  }, 300); // 300ms debounce delay

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

      // Route calculation disabled for Guide Form
      // If a place was removed, recalculate routes for this day
      // if (removedItem?.type === "place") {
      //   setTimeout(() => {
      //     calculateDayRoutes(detailIndex);
      //   }, 500);
      // }
    },
    [form, updateStore]
  );

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

  // Wrapper function for removeDetail to update store
  const handleRemoveDetail = (index: number) => {
    removeDetail(index);

    // Immediately update store after removing detail
    setTimeout(() => {
      const updatedFormData = form.getValues();
      setPlannerData(updatedFormData);
    }, 0);
  };

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
    let name = "";

    if (type === "route") {
      // Count existing route-type details to determine the day number
      const existingDetails = form.getValues("details") || [];
      const routeDetailsCount = existingDetails.filter(
        (detail) => detail.type === "route"
      ).length;
      name = `Day ${routeDetailsCount + 1}`;
    } else {
      // For list type, leave name empty so user can fill it
      name = "";
    }

    appendDetail({
      type,
      name,
      index: detailFields.length + 1,
      data: [],
    });

    // Immediately update store after adding detail
    setTimeout(() => {
      const updatedFormData = form.getValues();
      setPlannerData(updatedFormData);
    }, 0);
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
        {/* <Button
          onClick={() => {
            removeLodging(index);
          }}
          className=" hover-btn !bg-transparent border-none shadow-none text-light800_dark300  flex items-center justify-center"
          size="icon"
          variant="ghost"
        >
          <Trash />
        </Button> */}
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
                        className="border-none shadow-none no-focus pointer-events-none"
                      />
                      {/* <Button
                        onClick={() => {
                          removeItem(index, idx);
                        }}
                        className=" hover-btn !bg-transparent border-none shadow-none text-light800_dark300  flex items-center justify-center"
                      >
                        <Trash />
                      </Button> */}
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
                      {/* <Button
                        onClick={() => {
                          removeItem(index, idx);
                        }}
                        className=" hover-btn !bg-transparent border-none shadow-none text-light800_dark300  flex items-center justify-center"
                      >
                        <Trash />
                      </Button> */}
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
                          {/* <div className="flex">
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
                          </div> */}
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
                      {/* <Button
                        onClick={() => {
                          removeItem(index, idx);
                        }}
                        className=" hover-btn !bg-transparent border-none shadow-none text-light800_dark300  flex items-center justify-center"
                      >
                        <Trash />
                      </Button> */}
                    </div>
                  );
                }
              })}

              {/* Route Information Display - DISABLED FOR GUIDE */}
              {/* {(() => {
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

                                {route.legs && route.legs.length > 0 && (
                                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                    <span className="font-medium">Way</span>
                                    {getRouteSummary(route.legs)}
                                  </div>
                                )}

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
              })()} */}

              {/* <div className="flex items-center gap-2">
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
              </div> */}
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

  // Handle keyboard shortcuts for location card overlay
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showLocationCard && event.key === "Escape") {
        setShowLocationCard(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showLocationCard]);

  // Watch for changes in detailFields (routes/lists) and update store immediately for sidebar
  useEffect(() => {
    // Update store when details array structure changes (add/remove routes/lists)
    const currentFormData = form.getValues();
    setPlannerData(currentFormData);

    console.log("🔄 Details structure changed, updating store for sidebar", {
      detailsCount: detailFields.length,
      details: detailFields.map((field, index) => ({
        id: field.id,
        type: currentFormData.details?.[index]?.type,
        name: currentFormData.details?.[index]?.name,
        itemCount: currentFormData.details?.[index]?.data?.length || 0,
      })),
    });
  }, [detailFields.length, setPlannerData, form]);

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
    // Show LocationCard overlay with place ID
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

    // Route calculation disabled for Guide Form
    // Automatically calculate routes for this day after adding a place
    // setTimeout(() => {
    //   calculateDayRoutes(index);
    // }, 1000); // Delay to allow form to update
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
        const result: any = await updateGuideMainImage({
          guideId: planner._id,
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

  // Function to refresh planner data after tripmate is added
  const refreshPlannerData = async () => {
    if (!planner?._id && !planner?.id) {
      console.error("No planner ID available for refresh");
      return;
    }

    try {
      const plannerId = planner._id || planner.id;
      const refreshedPlanner = await getGuideById({ guideId: plannerId });

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

      const dataToSubmit: any = {
        ...formattedData,
        guideId: planner._id,
        startDate: startDate,
        endDate: endDate,
      };

      const updateGuideData: any = await updateGuide(dataToSubmit);

      console.log("DataSubmit", dataToSubmit, "DataResponse", updateGuideData);
      if (updateGuideData && updateGuideData.success) {
        toast({
          title: "Update Guide Successfully!",
          description: "Your guide has been updated successfully.",
          variant: "success",
        });
      } else {
        console.error("Update failed:", updateGuideData);

        // Show detailed error message
        const errorMessage =
          updateGuideData?.error?.message ||
          updateGuideData?.message ||
          "Unknown error occurred";

        toast({
          title: "Update Failed!",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating guide:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast({
        title: "Error!",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

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

            <div
              className="bg-white  rounded-[8px] bottom-[-75px] left-[32px]
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

              {/* Vote Buttons for testing */}
              <div className="px-8 flex items-center justify-between py-4 border-t ">
                <div>
                  <div className="flex gap-2">
                    <Avatar>
                      <AvatarImage src={planner?.authorDetails?.image} />
                      <AvatarFallback>AVT</AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-bold">
                        {planner?.authorDetails?.username}
                      </h2>
                      <p className="text-[12px]">
                        {moment(planner?.createdAt).format("DD MMM YYYY")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  {planner?._id ? (
                    <VoteButtons
                      targetId={planner._id}
                      targetType="guide"
                      upvotes={planner.upvotes || 0}
                      downvotes={planner.downvotes || 0}
                      className=""
                    />
                  ) : (
                    <div className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded">
                      ⚠️ Save guide first to test voting
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Analysis space */}
          <div className="!mt-[100px] flex flex-col gap-[24px]  px-8">
            <div className="flex items-center gap-2"></div>
            <div id="note-section">
              <div className="py-4 px-2 border-none paragraph-regular background-light800_darkgradient light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border">
                {planner?.note}
              </div>
              {/* <Collaps
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
              /> */}
            </div>
            <Separator className="my-[24px]" />
            {/* General Tips */}
            <div id="generalTips-section relative">
              <div className="h-4 relative z-1 top-[36px] w-full bg-pink-100"></div>

              <Collaps
                keyId="General-tips"
                titleFeature={
                  <p className="pl-[28px] border-none font-bold !text-[24px] shadow-none no-focus ">
                    General Tips
                  </p>
                }
                itemExpand={
                  <div>
                    <p className="px-2 py-4 border-none paragraph-regular background-light800_darkgradient light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border">
                      {planner?.generalTips}
                    </p>
                    {/* <FormField
                      control={form.control}
                      name="generalTips"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <DebouncedTextarea
                              placeholder="General Tips..."
                              value={field.value || ""}
                              onChange={field.onChange}
                              rows={4}
                              debounceMs={500}
                              className="py-4 border-none paragraph-regular background-light800_darkgradient light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}
                  </div>
                }
              />
            </div>
            {/* Lodging */}
            <Separator className="my-[24px]" />
            <div id="lodging-section relative">
              <div className="h-4 relative z-1 top-[36px] w-full bg-pink-100"></div>

              <Collaps
                keyId="lodging"
                titleFeature={
                  <p className="pl-[28px] border-none font-bold !text-[24px] shadow-none no-focus ">
                    Hotels and Lodging
                  </p>
                }
                itemExpand={
                  <div className="flex flex-col gap-4">
                    {/* <LodgingSearch
                      size="large"
                      onSelectHotel={(hotel: any) => {
                        addNewLodging(hotel);
                      }}
                    /> */}
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
                        </CardContent>
                      </Card>
                    ))}
                    {/* <div className="flex gap-4 items-center pl-[18px]">
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
                    </div> */}
                  </div>
                }
              />
            </div>
            <Separator className="my-[24px]" />

            <div id="details-section cursor-pointer relative">
              {/* <div className="h-4 relative z-1 top-[36px] w-full bg-pink-100"></div> */}

              <div className="mb-[24px] flex items-center justify-between">
                <h1 className="text-[36px] font-bold">Itinerary</h1>
                {/* Route calculation disabled for Guide */}
                {/* <div className="flex gap-2">
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
                </div> */}
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

          {/* <div className="flex items-center justify-start gap-2 px-8">
            <Button
              type="button"
              onClick={() => addNewDetail("route")}
              className="h-[40px] min-w-[160px] text-md font-bold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Route
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => addNewDetail("list")}
              className="h-[40px] w-[160px] text-md font-bold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add List
            </Button>
          </div> */}

          {/* Submit Button */}
          {/* <div className="flex gap-4 w-full p-4 justify-end">
            <Button
              type="submit"
              disabled={isPending}
              onClick={handleSubmit}
              className=" !w-fit bg-primary-500 hover:bg-primary-500 font-bold p-4 "
            >
              {isPending ? "Updating..." : "Update Guide"}
            </Button>
          </div> */}
          {/* Comments Section */}
          <div className="px-8">
            <CommentsSection
              guideId={planner?._id}
              currentUserImage={planner?.authorDetails?.image}
            />
          </div>
        </form>
      </Form>

      {/* LocationCard Overlay - Show when user selects a place */}
      {showLocationCard && selectedPlaceId && (
        <LocationCard placeId={selectedPlaceId} />
      )}
    </div>
  );
};

export default GuideViewForm;
