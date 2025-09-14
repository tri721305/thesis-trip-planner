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
import { useForm, useFieldArray } from "react-hook-form";
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
// Schema cho multiple hotels
const MultipleHotelsSchema = z.object({
  hotels: z.array(HotelSchema).min(1, "At least one hotel is required"),
});

type MultipleHotelsFormData = z.infer<typeof MultipleHotelsSchema>;

const InputHotelSchema = () => {
  const [isOpen, setIsOpen] = React.useState(true);
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [selectedDateRange, setSelectedDateRange] = React.useState({
    from: new Date(),
    to: new Date(),
  });
  const [openModalHotel, setOpenModalHotel] = React.useState(false);
  const divRef = useRef<HTMLDivElement | null>(null);

  const form = useForm<MultipleHotelsFormData>({
    resolver: zodResolver(MultipleHotelsSchema),
    defaultValues: {
      hotels: [],
    },
  });

  // URL State MANAGER
  const searchParams = useSearchParams();
  const router = useRouter();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "hotels",
  });

  useEffect(() => {
    const selectedHotelParam = searchParams.get("selectedHotel");
    const actionParam = searchParams.get("action");

    if (selectedHotelParam && actionParam === "addLodging") {
      try {
        const hotelData = JSON.parse(selectedHotelParam);
        // Add new hotel to form
        append({
          name: hotelData.name || "",
          address: hotelData.address || "",
          checkin: moment().format("ddd, Do MMM YYYY"),
          checkout: moment().format("ddd, Do MMM YYYY"),
          note: "",
          confirmation: "",
          cost: {
            type: hotelData.cost?.type?.toLowerCase() || "VND",
            number: JSON.stringify(hotelData.cost?.number) || "",
          },
        });

        // Set editing index to the newly added hotel
        setEditingIndex(fields.length);
        // Close modal
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
  }, [searchParams, router]);

  const { watch } = form;
  const hotelsWatch = watch("hotels");

  // Add new hotel

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
  const onSubmit = (data: MultipleHotelsFormData) => {
    setEditingIndex(null);
  };

  // Render hotel preview
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
            <div className="text-[12px] !text-[#6c757d] ">{hotel.address}</div>
          )}
          {(hotel.checkin || hotel.checkout) && (
            <div className="text-[16px] font-medium  text-[#212529] mt-[8px]">
              {hotel.checkin} - {hotel.checkout}
            </div>
          )}
          {hotel.cost?.number && (
            <div className="text-md font-bold text-gray-700 mt-2">
              {hotel.cost.number} {hotel.cost.type?.toUpperCase()}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderHotelForm = (index: number) => {
    return (
      <div className="p-4 space-y-4">
        <Form {...form}>
          <FormField
            control={form.control}
            name={`hotels.${index}.name`}
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
            name={`hotels.${index}.address`}
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className="paragraph-medium text-dark400_light700 !font-bold !text-[12px]">
                  ADDRESS
                </FormLabel>
                <FormControl className="!mt-0">
                  <Input
                    type="text"
                    {...field}
                    className=" !min-h-[36px] border-none paragraph-regular  light-border-2 text-dark300_light700 no-focus rounded-1.5 border !background-form-input"
                    placeholder="Enter hotel address"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`hotels.${index}.checkin`}
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

                      // Set form values for checkin and checkout
                      if (e?.from) {
                        form.setValue(
                          `hotels.${index}.checkin`,
                          // e.from.toLocaleDateString()
                          moment(e.from).format("ddd, Do MMM YYYY")
                        );
                      }
                      if (e?.to) {
                        form.setValue(
                          `hotels.${index}.checkout`,
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

          <FormField
            control={form.control}
            name={`hotels.${index}.confirmation`}
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className="paragraph-medium text-dark400_light700 !font-bold !text-[12px]">
                  CONFIRMATION
                </FormLabel>
                <FormControl className="!mt-0">
                  <Input
                    type="text"
                    {...field}
                    className="!min-h-[36px] border-none paragraph-regular background-form-input light-border-2 text-dark300_light700 no-focus rounded-1.5 border"
                    placeholder="Confirmation number"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`hotels.${index}.note`}
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className="paragraph-medium text-dark400_light700 !font-bold !text-[12px]">
                  NOTES
                </FormLabel>
                <FormControl className="!mt-0">
                  <Input
                    type="text"
                    {...field}
                    className="!min-h-[36px] border-none paragraph-regular background-form-input light-border-2 text-dark300_light700 no-focus rounded-1.5 border"
                    placeholder="Add additional notes here"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`hotels.${index}.cost`}
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className="paragraph-medium text-dark400_light700 !font-bold !text-[12px]">
                  COST
                </FormLabel>
                <FormControl className="!mt-0">
                  <PriceInput
                    value={field.value}
                    onChange={field.onChange}
                    // defaultCurrency="vnd"
                    allowCurrencyChange={true}
                    compact={false}
                    displayFormatted={true} // Show formatted value in input
                    showSymbolInInput={true} // Show ₫ symbol inside input
                    placeholder="0"
                    className="!min-h-[36px] border-none paragraph-regular background-form-input light-border-2 text-dark300_light700 no-focus rounded-1.5 border"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* <CurrencyDisplay
            amount={1500000}
            currency="vnd"
            variant="compact"
            showSymbol={true}
          /> */}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              onClick={() => form.handleSubmit(onSubmit)()}
              className="flex-1"
            >
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
        </Form>
      </div>
    );
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="flex w-full flex-col gap-[24px]"
    >
      <div className="item-hover-btn flex items-center justify-between gap-4 ">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8 font-medium">
            {!isOpen ? <FaChevronRight /> : <FaChevronDown />}
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
        <InputWithIcon
          icon={<FaPen className="text-gray-600 hover-btn" size={14} />}
          placeholder="Hotels and lodging"
          value="Hotels and lodging"
          background="none"
          hover="true"
          onChange={() => {}}
          className=" !text-[24px] paragraph-regular no-focus placeholder text-dark400_light700 border-none shadow-none !font-bold outline-none"
        />
        <Button
          onClick={() => {
            // removeItem(idx);
          }}
          className=" !bg-transparent border-none shadow-none text-light800_dark300  flex items-center justify-center"
        >
          <GoKebabHorizontal size={24} />
        </Button>
      </div>

      <CollapsibleContent ref={divRef} className="flex  flex-col gap-[12px]">
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
                  {renderHotelPreview(hotelsWatch[index], index)}
                </div>
              )}
              <div className="flex items-center justify-between absolute right-2 bottom-2">
                <div className="flex items-center gap-2">
                  {fields.length > 1 && index > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-500"
                      onClick={() => removeHotel(index)}
                    >
                      <FaTrash className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
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
      </CollapsibleContent>
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

export default InputHotelSchema;
