import React, { useEffect, useRef } from "react";
import { FaChevronRight, FaChevronDown } from "react-icons/fa6";

import { FaPen } from "react-icons/fa";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "../ui/input";
import InputWithIcon from "./InputIcon";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  DefaultValues,
  FieldValues,
  Path,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { z, ZodType } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { HotelSchema } from "@/lib/validation";
import { DateRangePicker } from "../datepicker/RangePicker";
import PriceInput from "./PriceInput";
const InputCollapseHotel = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isEdit, setIsEdit] = React.useState(false);
  const divRef = useRef<HTMLDivElement | null>(null);
  const form = useForm<z.infer<typeof HotelSchema>>({
    resolver: zodResolver(HotelSchema),
    defaultValues: {
      name: "",
      address: "",
      checkin: "",
      checkout: "",
      note: "",
      confirmation: "",
      cost: {
        type: "",
        number: "",
      },
    },
  });
  const { watch } = form;
  const valueWatch = watch();
  console.log("valueWatch", valueWatch);
  // useEffect(() => {
  //   function handleClickOutside(event: MouseEvent) {
  //     if (divRef.current && !divRef.current.contains(event.target as Node)) {
  //       setIsEdit(false);
  //     }
  //   }

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="flex w-full  flex-col gap-2"
    >
      <div className="flex items-center justify-between gap-4 px-4">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            {!isOpen ? <FaChevronRight /> : <FaChevronDown />}
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
        <InputWithIcon
          //   className="text-[20px] border-none shadow-none"
          icon={<FaPen className="text-gray-600" size={14} />}
          placeholder="Hotels and lodging"
          className="paragraph-regular no-focus placeholder text-dark400_light700 border-none shadow-none !font-bold outline-none"
        />
      </div>
      <CollapsibleContent
        ref={divRef}
        onClick={() => {
          setIsEdit(true);
        }}
        className="flex flex-col gap-2"
      >
        {isEdit ? (
          <div className="p-4 ]">
            <Form {...form}>
              <FormField
                control={form.control}
                name="name"
                key="name"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col ">
                    <FormLabel className="paragraph-medium text-dark400_light700  !font-bold !text-[12px]">
                      HOTELS OR LODGING ADDRESS
                    </FormLabel>
                    <FormControl className="!mt-0">
                      <Input
                        required
                        type="text"
                        {...field}
                        className=" !min-h-[36px] border-none paragraph-regular background-light800_dark300 light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="checkin"
                key="checkin"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col ">
                    <FormLabel className="paragraph-medium text-dark400_light700  !font-bold !text-[12px]">
                      CHECKIN - CHECKOUT
                    </FormLabel>
                    <FormControl className="">
                      <DateRangePicker />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmation"
                key="confirmation"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col ">
                    <FormLabel className="paragraph-medium text-dark400_light700  !font-bold !text-[12px]">
                      CONFIRMATION
                    </FormLabel>
                    <FormControl className="!mt-0">
                      <Input
                        required
                        type="text"
                        {...field}
                        className=" !min-h-[36px] border-none paragraph-regular background-light800_dark300 light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="note"
                key="note"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col ">
                    <FormLabel className="paragraph-medium text-dark400_light700  !font-bold !text-[12px]">
                      NOTES
                    </FormLabel>
                    <FormControl className="!mt-0">
                      <Input
                        required
                        type="text"
                        {...field}
                        className=" !min-h-[36px] border-none paragraph-regular background-light800_dark300 light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border"
                        placeholder="Add additional notes here"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cost"
                key="cost"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col ">
                    <FormLabel className="paragraph-medium text-dark400_light700  !font-bold !text-[12px]">
                      COST
                    </FormLabel>
                    <FormControl className="!mt-0">
                      <PriceInput
                        required
                        {...field}
                        className=" !min-h-[36px] border-none paragraph-regular background-light800_dark300 light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border"
                        onChange={(e: any) => {
                          console.log("Cost changed:", e.target.value);
                          field.onChange({
                            type: "vnd",
                            number: e.target.value,
                          });
                        }}
                        value={field?.value?.number}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Form>
          </div>
        ) : (
          <Input
            className=" border-none paragraph-regular background-light800_dark300 light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border"
            placeholder="Write or paste anything here: how to get around, tips and tricks"
          />
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default InputCollapseHotel;
