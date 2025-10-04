"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [location, setLocation] = useState<any>();
  const [selectedDateRange, setSelectedDateRange] = useState<any>({
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 1)), // Default to tomorrow
  });
  const [roomCount, setRoomCount] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const handleSearch = () => {
    if (!location) {
      alert("Please select a location");
      return;
    }

    if (
      !selectedDateRange ||
      !selectedDateRange.from ||
      !selectedDateRange.to
    ) {
      alert("Please select check-in and check-out dates");
      return;
    }

    // Create query parameters for the search page
    const params = new URLSearchParams();
    params.append("location", location.displayName || location);
    params.append("checkInDate", selectedDateRange.from.toISOString());
    params.append("checkOutDate", selectedDateRange.to.toISOString());
    params.append("adults", adults.toString());
    params.append("children", children.toString());
    params.append("roomCount", roomCount.toString());

    // Navigate to the search page with query parameters
    router.push(`/hotels/search?${params.toString()}`);
  };

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
                  className="h-[56px] !bg-[#f3f4f5] text-black border-none"
                >
                  {roomCount} Room{roomCount > 1 ? "s" : ""}, {adults} Adult
                  {adults > 1 ? "s" : ""}, {children} Child
                  {children > 1 ? "ren" : ""}
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
                      <Label htmlFor="roomCount">Rooms</Label>
                      <div className="col-span-2 flex items-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 w-8"
                          onClick={() =>
                            setRoomCount(Math.max(1, roomCount - 1))
                          }
                        >
                          -
                        </Button>
                        <Input
                          id="roomCount"
                          type="number"
                          min={1}
                          value={roomCount}
                          onChange={(e) =>
                            setRoomCount(parseInt(e.target.value) || 1)
                          }
                          className="h-8 mx-2 text-center"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 w-8"
                          onClick={() => setRoomCount(roomCount + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="adults">Adults</Label>
                      <div className="col-span-2 flex items-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 w-8"
                          onClick={() => setAdults(Math.max(1, adults - 1))}
                        >
                          -
                        </Button>
                        <Input
                          id="adults"
                          type="number"
                          min={1}
                          value={adults}
                          onChange={(e) =>
                            setAdults(parseInt(e.target.value) || 1)
                          }
                          className="h-8 mx-2 text-center"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 w-8"
                          onClick={() => setAdults(adults + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="children">Children</Label>
                      <div className="col-span-2 flex items-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 w-8"
                          onClick={() => setChildren(Math.max(0, children - 1))}
                        >
                          -
                        </Button>
                        <Input
                          id="children"
                          type="number"
                          min={0}
                          value={children}
                          onChange={(e) =>
                            setChildren(parseInt(e.target.value) || 0)
                          }
                          className="h-8 mx-2 text-center"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 w-8"
                          onClick={() => setChildren(children + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Separator className="mt-1" />
                  <div className="flex gap-2 w-full justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setRoomCount(1);
                        setAdults(2);
                        setChildren(0);
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      className="bg-primary-500 hover:bg-orange-500"
                      onClick={() => document.body.click()} // Close popover
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <Button
            className="h-[56px] font-bold bg-primary-500 hover:bg-orange-500"
            onClick={handleSearch}
          >
            Search
          </Button>
        </div>
      </div>
      <div>
        <img alt="icon-logo" src="/icons/hotel.png" />
      </div>
    </div>
  );
};

export default SearchHotelBar;
