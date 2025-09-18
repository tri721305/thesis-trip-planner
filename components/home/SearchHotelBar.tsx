"use client";
import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Label } from "@/components/ui/label";
import ProvinceWardSearch from "../search/ProviceWardSearch";
import { CalendarDatePicker } from "../calendar-date-picker";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";

const SearchHotelBar = () => {
  const [location, setLocation] = useState();
  const [selectedDateRange, setSelectedDateRange] = useState<any>(null);

  return (
    <div className="flex px-20 items-center justify-around bg-gray-200  gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="font-bold text-2xl">Need a place to stay?</h1>
        <div className="flex gap-2 items-end">
          <div className="flex flex-col gap-2 min-w-[300px]">
            <Label>Where</Label>
            <ProvinceWardSearch
              onPlaceSelect={(place: any) => {
                setLocation(place);
              }}
              placeholder="Search destination"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>When</Label>
            <CalendarDatePicker
              date={selectedDateRange}
              onDateSelect={(e) => {
                setSelectedDateRange(e);
              }}
              typeShow="reduce"
              className="h-[56px] !bg-[#f3f4f5] text-black w-full border-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Travelers</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-[56px] !bg-[#f3f4f5] text-black border-none "
                >
                  Open popover
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="leading-none font-medium">
                      Rooms and Guests
                    </h4>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="width">Rooms</Label>
                      <Input
                        id="width"
                        defaultValue="100%"
                        className="col-span-2 h-8"
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="maxWidth">Adults</Label>
                      <Input
                        id="maxWidth"
                        defaultValue="300px"
                        className="col-span-2 h-8"
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="height">Children</Label>
                      <Input
                        id="height"
                        defaultValue="25px"
                        className="col-span-2 h-8"
                      />
                    </div>
                  </div>
                  <Separator className="mt-1" />
                  <div className="flex gap-2 w-full justify-end">
                    <Button variant={"outline"}>Reset</Button>
                    <Button className="bg-primary-500 hover:bg-orange-500">
                      Save
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <Button className="h-[56px] font-bold">Search</Button>
        </div>
      </div>
      <div>
        <img alt="icon-logo" src="/icons/hotel.png" />
      </div>
    </div>
  );
};

export default SearchHotelBar;
