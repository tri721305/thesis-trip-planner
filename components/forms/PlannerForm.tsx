"use client";
import { PlannerSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState, useTransition } from "react";
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
} from "lucide-react";
import Image from "next/image";

import { CalendarDatePicker } from "../calendar-date-picker";
import moment from "moment";
import ReusableDialog from "../modal/ReusableDialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "../ui/label";
import { GrUserSettings } from "react-icons/gr";
import { MdFlight } from "react-icons/md";
import { BiRestaurant, BiSolidHotel } from "react-icons/bi";
import { GoKebabHorizontal } from "react-icons/go";
import Collaps from "../Collaps";
import { FaPen, FaTrash } from "react-icons/fa";
import InputWithIcon from "../input/InputIcon";
import InputCollapseHotelMultiple from "../input/InputCollapseHotelMultiple";
import InputHotelPlanner from "../input/InputHotelPlanner";
import HotelSearch from "../search/HotelSearch";
import LodgingSearch from "../search/LodgingSearch";

type PlannerFormData = z.infer<typeof PlannerSchema>;

const PlannerForm = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDialog, setShowDialog] = useState(false);
  const [manageTripmates, setManageTripmates] = useState(false);
  const [showAddHotel, setShowAddHotel] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const divRef = useRef<HTMLDivElement | null>(null);
  const [openModalHotel, setOpenModalHotel] = useState(false);
  // State for hotel search values - moved to component level to follow Rules of Hooks
  const [hotelSearchValues, setHotelSearchValues] = useState<{
    [key: number]: string;
  }>({});

  const form = useForm<PlannerFormData>({
    resolver: zodResolver(PlannerSchema),
    defaultValues: {
      title: "Planner Hồ Chí Minh Trip",
      image: "",
      note: "",
      author: "",
      state: "planning",
      startDate: "",
      endDate: "",
      location: {
        name: "",
        address: "",
        coordinates: {
          type: "Point",
          coordinates: [0, 0], // [longitude, latitude]
        },
      },
      generalTips: "",
      tripmates: [],
      lodging: [],
      details: [],
    },
  });

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

  const { watch } = form;
  const hotelsWatch = watch("lodging");

  const renderHotelPreview = (hotel: any, index: number) => {
    const hasData = hotel.name || hotel.address;
    if (!hasData) {
      <div className="text-gray-500 text-sm">Click to add hotel details</div>;
    }
    return (
      <div className="flex justify-between items-start">
        <div className="flex-1">
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
            <div className="text-md font-bold text-gray-700 mt-2">
              {Number(hotel.cost.value).toLocaleString("vi-VN")}{" "}
              {hotel.cost.type?.toUpperCase()}
            </div>
          )}
        </div>
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
  console.log("Data Form", form.watch()); // Comment out để tránh rerender liên tục
  return (
    <div className="container mx-auto  max-w-4xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="h-[400px] relative !pt-10">
            <Image alt="image-places" src="/images/ocean.jpg" fill />
            <Button
              className="absolute hover:text-white z-50 rounded-full top-4 right-4 !bg-[#21252980] hover:bg-[#21252980] text-white"
              size="icon"
              variant="ghost"
            >
              <Pencil />
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
                <CalendarDatePicker
                  className="!w-fit "
                  date={{
                    from: form.watch("startDate")
                      ? moment(form.watch("startDate")).toDate()
                      : new Date(),
                    to: form.watch("endDate")
                      ? moment(form.watch("endDate")).toDate()
                      : new Date(),
                  }}
                  onDateSelect={(e) => {
                    form.setValue("startDate", e.from);
                    form.setValue("endDate", e.to);
                  }}
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
            <Collaps
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
            {/* Lodging */}
            <Collaps
              titleFeature={
                <p className="pl-[28px] border-none font-bold !text-[24px] shadow-none no-focus ">
                  Hotels and Lodging
                </p>
              }
              itemExpand={
                <div className="flex flex-col gap-4">
                  {showAddHotel ? (
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
                  )}
                  {lodgingFields.map((field, index) => (
                    <Card
                      key={field.id}
                      className="relative background-form border-none shadow-none"
                    >
                      <CardContent className="relative !p-4">
                        {editingIndex === index ? (
                          renderHotelForm(index)
                        ) : (
                          <div
                            className="cursor-pointer min-h-[60px] flex items-center"
                            onClick={() => setEditingIndex(index)}
                          >
                            {hotelsWatch &&
                              renderHotelPreview(hotelsWatch[index], index)}
                          </div>
                        )}
                        {/* <div className="flex items-center justify-between absolute right-2 bottom-2">
                          <div className="flex items-center gap-2">
                            {hotelsWatch?.length > 1 && index > 0 && (
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

          {/* CARD HOTEL */}
          <Card>
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
          </Card>

          {/* Dates and Location */}

          <Card>
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
          </Card>

          {/* Tripmates */}
          <Card>
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
          </Card>

          {/* General Tips */}
          <Card>
            <CardHeader>
              <CardTitle>General Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="generalTips"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tips & Recommendations</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share useful tips for this trip..."
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Trip Details */}
          <Card>
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
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="flex-1">
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
    </div>
  );
};

export default PlannerForm;
