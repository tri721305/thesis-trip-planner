"use client";

import React, { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FaChevronRight,
  FaChevronDown,
  FaTrash,
  FaPlus,
} from "react-icons/fa6";
import { FaPen } from "react-icons/fa";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "../ui/input";
import InputWithIcon from "./InputIcon";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, useFormContext } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { HotelSchema } from "@/lib/validation";
import PriceInput from "./PriceInput";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDatePicker } from "../calendar-date-picker";
import { Plus } from "lucide-react";
import { Separator } from "../ui/separator";
import { BiSolidHotel } from "react-icons/bi";
import ReusableDialog from "../modal/ReusableDialog";
import HotelLodging from "../modal/HotelLodging";
import { GoKebabHorizontal } from "react-icons/go";
import moment from "moment";
const InputHotelPlanner = () => {
  const [isOpen, setIsOpen] = React.useState(true);
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [selectedDateRange, setSelectedDateRange] = React.useState({
    from: new Date(),
    to: new Date(),
  });
  const [openModalHotel, setOpenModalHotel] = React.useState(false);
  const divRef = useRef<HTMLDivElement | null>(null);

  // Sử dụng form context thay vì tạo form riêng
  const form = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lodging", // Sử dụng field lodging từ PlannerForm
  });

  // URL State MANAGER
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const selectedHotelParam = searchParams.get("selectedHotel");
    const actionParam = searchParams.get("action");

    if (selectedHotelParam && actionParam === "addLodging") {
      try {
        const hotelData = JSON.parse(selectedHotelParam);
        // Add new hotel to parent form
        append({
          name: hotelData.name || "",
          address: hotelData.address || "",
          checkIn: moment().format("ddd, Do MMM YYYY"),
          checkOut: moment().format("ddd, Do MMM YYYY"),
          notes: "",
          confirmation: "",
          cost: {
            type: hotelData.cost?.type?.toLowerCase() || "VND",
            value: parseInt(hotelData.cost?.number) || 0,
          },
        });

        setEditingIndex(fields.length);
        setOpenModalHotel(false);

        // Clear URL params
        const params = new URLSearchParams(searchParams);
        params.delete("selectedHotel");
        params.delete("action");
        router.push(`?${params.toString()}`, { scroll: false });
      } catch (error) {
        console.error("Error parsing hotel data:", error);
      }
    }
  }, [searchParams, router, append, fields.length]);

  const { watch } = form;
  const lodgingWatch = watch("lodging");

  // Add new hotel
  const addHotel = () => {
    append({
      name: "",
      address: "",
      checkIn: "",
      checkOut: "",
      notes: "",
      confirmation: "",
      cost: {
        type: "VND",
        value: 0,
      },
    });
    setEditingIndex(fields.length);
  };

  // Remove hotel
  const removeHotel = (index: number) => {
    if (fields.length > 1) {
      remove(index);
      if (editingIndex === index) {
        setEditingIndex(null);
      } else if (editingIndex !== null && editingIndex > index) {
        setEditingIndex(editingIndex - 1);
      }
    }
  };

  // Form submit handler
  const onSubmit = () => {
    setEditingIndex(null);
  };

  // Render hotel form sử dụng field name từ lodging
  const renderHotelForm = (index: number) => {
    return (
      <div className="p-4 space-y-4">
        <FormField
          control={form.control}
          name={`lodging.${index}.name`} // Sử dụng lodging thay vì hotels
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
              <FormLabel className="paragraph-medium text-dark400_light700 !font-bold !text-[12px]">
                HOTEL NAME
              </FormLabel>
              <FormControl className="!mt-0">
                <Input
                  type="text"
                  {...field}
                  className="!min-h-[36px] border-none paragraph-regular light-border-2 text-dark300_light700 no-focus rounded-1.5 border background-form-input"
                  placeholder="Enter hotel name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`lodging.${index}.address`}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
              <FormLabel className="paragraph-medium text-dark400_light700 !font-bold !text-[12px]">
                ADDRESS
              </FormLabel>
              <FormControl className="!mt-0">
                <Input
                  type="text"
                  {...field}
                  className="!min-h-[36px] border-none paragraph-regular light-border-2 text-dark300_light700 no-focus rounded-1.5 border !background-form-input"
                  placeholder="Enter hotel address"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`lodging.${index}.checkIn`}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
              <FormLabel className="paragraph-medium text-dark400_light700 !font-bold !text-[12px]">
                CHECKIN - CHECKOUT
              </FormLabel>
              <FormControl>
                <CalendarDatePicker
                  date={selectedDateRange}
                  onDateSelect={(e) => {
                    setSelectedDateRange(e);

                    if (e?.from) {
                      form.setValue(
                        `lodging.${index}.checkIn`,
                        moment(e.from).format("ddd, Do MMM YYYY")
                      );
                    }
                    if (e?.to) {
                      form.setValue(
                        `lodging.${index}.checkOut`,
                        moment(e.to).format("ddd, Do MMM YYYY")
                      );
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ...rest of form fields with lodging.${index} paths... */}

        <div className="flex gap-2 pt-4">
          <Button type="button" onClick={onSubmit} className="flex-1">
            Save Hotel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setEditingIndex(null)}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  };

  // Render hotel preview sử dụng lodgingWatch
  const renderHotelPreview = (hotel: any, index: number) => {
    const hasData = hotel.name || hotel.address;

    if (!hasData) {
      return (
        <div className="text-gray-500 text-sm">Click to add hotel details</div>
      );
    }

    return (
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="font-bold text-[16px] text-[#212529]">
            {hotel.name || "Unnamed Hotel"}
          </div>
          {hotel.address && (
            <div className="text-[12px] !text-[#6c757d]">{hotel.address}</div>
          )}
          {(hotel.checkIn || hotel.checkOut) && (
            <div className="text-[16px] font-medium text-[#212529] mt-[8px]">
              {hotel.checkIn} - {hotel.checkOut}
            </div>
          )}
          {hotel.cost?.value && (
            <div className="text-md font-bold text-gray-700 mt-2">
              {hotel.cost.value} {hotel.cost.type?.toUpperCase()}
            </div>
          )}
        </div>
      </div>
    );
  };

  console.log("lodgingWatch", lodgingWatch);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="flex w-full flex-col gap-[24px]"
    >
      {/* ...rest of component using lodgingWatch instead of hotelsWatch... */}

      <CollapsibleContent ref={divRef} className="flex flex-col gap-[12px]">
        {fields.map((field, index) => (
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
                  {renderHotelPreview(lodgingWatch?.[index], index)}
                </div>
              )}
              {/* ...rest of card content... */}
            </CardContent>
          </Card>
        ))}

        {/* Add button */}
        <div className="flex gap-4 items-center pl-[18px]">
          <div
            onClick={() => setOpenModalHotel(true)}
            className="flex cursor-pointer h-5 items-center gap-2"
          >
            <Plus size={16} />
            <span className="text-dark400_light700 font-bold text-[12px]">
              Add another Lodging
            </span>
            <Separator orientation="vertical" />
          </div>
        </div>
      </CollapsibleContent>

      {/* Modal */}
      {openModalHotel && (
        <ReusableDialog
          open={openModalHotel}
          setOpen={setOpenModalHotel}
          data={{
            title: "Add hotels or lodging",
            content: <HotelLodging />,
            showCloseButton: false,
          }}
        />
      )}
    </Collapsible>
  );
};

export default InputHotelPlanner;
