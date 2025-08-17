"use client";
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
import { useToast } from "@/hooks/use-toast";
import { Toast } from "../ui/toast";
type PlannerFormData = z.infer<typeof PlannerSchema>;

const PlannerForm = ({
  planner,
  onFormDataChange,
}: {
  planner?: any;
  onFormDataChange?: (formData: any) => void;
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
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
    },
  });

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
      console.log("Form data:", data);
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
    // const currentRouteItems = form.watch(`details.${index}.data`) || [];
    const getCurrentRouteItems = () =>
      form.getValues(`details.${index}.data`) || [];

    const updateItemData = (itemIndex: number, newData: any) => {
      const currentRouteItems = getCurrentRouteItems();
      const updatedItems = [...currentRouteItems];

      // Update the appropriate field based on item type
      const itemType = updatedItems[itemIndex].type;
      if (itemType === "note") {
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          content: newData,
        };
      } else if (itemType === "checklist") {
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          items: Array.isArray(newData) ? newData : [newData],
        };
      } else if (itemType === "place") {
        // Handle place type updates as needed
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          ...newData,
        };
      }

      form.setValue(`details.${index}.data`, updatedItems);

      // Notify parent about form data change for map updates
      if (onFormDataChange) {
        const formData = form.getValues();
        console.log(
          "🔄 PlannerForm - Notifying parent of updateItemData change:",
          {
            itemIndex,
            detailIndex: index,
            itemsCount: updatedItems.length,
          }
        );
        onFormDataChange(formData);
      }
    };

    // Helper function to remove item
    const removeItem = (itemIndex: number) => {
      console.log("🗑️ removeItem called:", { itemIndex, detailIndex: index });
      
      const currentRouteItems = getCurrentRouteItems();
      const removedItem = currentRouteItems[itemIndex];
      
      console.log("🗑️ Item being removed:", {
        item: removedItem,
        itemType: removedItem?.type,
        itemName: (removedItem as any)?.name || (removedItem as any)?.content || "Unknown item",
        hasLocation: removedItem?.type === "place" && !!(removedItem as any)?.location
      });
      
      const updatedItems = currentRouteItems.filter((_, i) => i !== itemIndex);
      form.setValue(`details.${index}.data`, updatedItems);

      // Notify parent about form data change for map updates
      if (onFormDataChange) {
        const formData = form.getValues();
        console.log("🔄 PlannerForm - Notifying parent of removeItem change:", {
          removedItemIndex: itemIndex,
          detailIndex: index,
          remainingItems: updatedItems.length,
          removedItemType: removedItem?.type,
          wasPlace: removedItem?.type === "place"
        });
        onFormDataChange(formData);
      } else {
        console.warn("⚠️ onFormDataChange callback not available!");
      }
    };

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
                      <InputWithIcon
                        placeholder="Write or paste notes here"
                        icon={<FaNoteSticky />}
                        onChange={(value) =>
                          updateItemData(idx, value.target.value)
                        }
                      />
                      <Button
                        onClick={() => {
                          removeItem(idx);
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
                        onChange={(newItems) => updateItemData(idx, newItems)}
                        onRemove={() => removeItem(idx)}
                        key={idx}
                        items={item.items as string[]}
                      />
                      <Button
                        onClick={() => {
                          removeItem(idx);
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
                                console.log(
                                  "🔍 Current route items:",
                                  currentRouteItems
                                );

                                const updatedItems = [...currentRouteItems];

                                // Update the specific place item with new time values
                                if (
                                  updatedItems[idx] &&
                                  updatedItems[idx].type === "place"
                                ) {
                                  console.log(
                                    "🔧 Updating item at index:",
                                    idx
                                  );
                                  console.log(
                                    "🔧 Before update:",
                                    updatedItems[idx]
                                  );

                                  updatedItems[idx] = {
                                    ...updatedItems[idx],
                                    timeStart: timeRange.startTime,
                                    timeEnd: timeRange.endTime,
                                  };

                                  console.log(
                                    "🔧 After update:",
                                    updatedItems[idx]
                                  );

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
                                    console.log(
                                      "✅ Verification after 100ms:",
                                      verifyData[idx]
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
                          removeItem(idx);
                        }}
                        className=" hover-btn !bg-transparent border-none shadow-none text-light800_dark300  flex items-center justify-center"
                      >
                        <Trash />
                      </Button>
                    </div>
                  );
                }
              })}
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

  // useEffect(() => {
  //   if (planner && isInitialLoad) {
  //     // Generate initial route details without causing scroll/focus issues
  //     setTimeout(() => {
  //       generateRouteDetailsForDateRange(planner.startDate, planner.endDate);
  //       setIsInitialLoad(false);
  //     }, 100); // Small delay to ensure component is fully mounted
  //   }
  // }, [planner, isInitialLoad]);
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

    // Notify parent about form data change for map updates
    if (onFormDataChange) {
      const formData = form.getValues();
      console.log(
        "🔄 PlannerForm - Notifying parent of handleAddNoteItem change:",
        {
          detailIndex: parentIndex,
          totalItems: updatedItems.length,
        }
      );
      onFormDataChange(formData);
    }
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

    // Notify parent about form data change for map updates
    if (onFormDataChange) {
      const formData = form.getValues();
      console.log(
        "🔄 PlannerForm - Notifying parent of handleAddChecklistItem change:",
        {
          detailIndex: parentIndex,
          totalItems: updatedItems.length,
        }
      );
      onFormDataChange(formData);
    }
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

    console.log("🔍 DEBUG - handlePlaceSelect:", {
      place: place,
      hasLocation: !!place.location,
      location: place.location,
      coordinates: place.location?.coordinates,
      newPlaceItem: newPlaceItem,
      newItemHasLocation: !!newPlaceItem.location,
      newItemCoordinates: newPlaceItem.location?.coordinates,
    });

    // Update the form with new item
    const updatedItems = [...currentItems, newPlaceItem];
    form.setValue(`details.${index}.data`, updatedItems);

    // Notify parent about form data change for map updates
    if (onFormDataChange) {
      const formData = form.getValues();
      console.log(
        "🔄 PlannerForm - Notifying parent of handlePlaceSelect change:",
        {
          addedPlace: newPlaceItem.name,
          detailIndex: index,
          totalItems: updatedItems.length,
          hasLocation: !!newPlaceItem.location,
        }
      );
      onFormDataChange(formData);
    }

    // Verify the form value was set correctly
    setTimeout(() => {
      const verifyData = form.getValues(`details.${index}.data`);
      const addedItem = verifyData[verifyData.length - 1];
      if (addedItem.type === "place") {
        console.log("🔍 DEBUG - Verified form data after adding place:", {
          hasLocation: !!addedItem.location,
          location: addedItem.location,
          coordinates: addedItem.location?.coordinates,
        });
      }
    }, 100);
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

          console.log("Image uploaded successfully:", result.data.image);
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
    console.log("DataSubmit", formData);

    // Debug: Check if location data exists in form data
    if (formData.details) {
      formData.details.forEach((detail: any, detailIndex: number) => {
        if (detail.data) {
          detail.data.forEach((item: any, itemIndex: number) => {
            if (item.type === "place") {
              console.log(`Place ${detailIndex}-${itemIndex}:`, {
                name: item.name,
                hasLocation: !!item.location,
                location: item.location,
                coordinates: item.location?.coordinates,
              });
            }
          });
        }
      });
    }

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

    const dataTest: any = { ...processedFormData, plannerId: planner._id };
    const updatePlannerData = await updatePlanner(dataTest);
    console.log("datePlannerData", updatePlannerData);
    if (updatePlannerData) {
      console.log("Update successful:", updatePlannerData);
      toast({
        title: "Update Planner Successfully!",
        description: "Your planner has been updated successfully.",
        variant: "success",
      });
    } else {
      console.error("Update failed");
    }
  };

  console.log("Value Form", form.watch());

  // Debug: Monitor form data changes for location preservation
  const watchedDetails = form.watch("details");
  React.useEffect(() => {
    if (watchedDetails) {
      console.log(
        "🔍 Form details changed:",
        watchedDetails.map((detail: any, detailIndex: number) => ({
          name: detail.name,
          type: detail.type,
          dataItems: detail.data?.length || 0,
          places:
            detail.data
              ?.filter((item: any) => item.type === "place")
              .map((place: any) => ({
                name: place.name,
                hasLocation: !!place.location,
                coordinates: place.location?.coordinates,
              })) || [],
        }))
      );
    }
  }, [watchedDetails]);

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
                            <Textarea
                              placeholder="Describe your travel plan..."
                              {...field}
                              rows={3}
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
                            <Textarea
                              placeholder="General Tips..."
                              {...field}
                              rows={3}
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
              <div className="mb-[24px]">
                <h1 className="text-[36px] font-bold">Itinerary</h1>
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
