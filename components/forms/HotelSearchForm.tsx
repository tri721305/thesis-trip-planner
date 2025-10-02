"use client";

import { SearchHotelSChema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import PlaceSearch from "../search/PlaceSearch";
import { CalendarDatePicker } from "../calendar-date-picker";
import InputWithIcon from "../input/InputIcon";
import { Hotel, Search, User } from "lucide-react";
import { MdLocalHotel } from "react-icons/md";
import { Button } from "../ui/button";
import ProvinceWardSearch from "../search/ProviceWardSearch";

const HotelSearchForm = () => {
  const router = useRouter();
  const [selectedDateRange, setSelectedDateRange] = useState({
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 1)), // Default to tomorrow
  });
  const [location, setLocation] = useState<any>(null);
  const [guests, setGuests] = useState<any>(2);
  const [rooms, setRooms] = useState<any>(1);
  const form = useForm<z.infer<typeof SearchHotelSChema>>({
    resolver: zodResolver(SearchHotelSChema),
    defaultValues: {
      location: "",
      checkInDate: "",
      checkOutDate: "",
      guests: 2,
      rooms: 1,
    },
  });

  const handleSearchHotel = () => {
    console.log("Search hotels:");
    let dataSubmit = {
      place: location,
      checkInDate: selectedDateRange.from,
      checkOutDate: selectedDateRange.to,
      guests,
      rooms,
    };
    console.log(dataSubmit);

    // Navigate to the search page with query parameters
    const searchParams = new URLSearchParams();

    // Add location parameter if it exists
    if (location) {
      // If location is an object with displayName property
      if (typeof location === "object" && location?.displayName) {
        searchParams.append("location", location.displayName);
      }
      // If location is a string
      else if (typeof location === "string") {
        searchParams.append("location", location);
      }
    }

    // Add date parameters
    searchParams.append("checkInDate", selectedDateRange.from.toISOString());
    searchParams.append("checkOutDate", selectedDateRange.to.toISOString());

    // Add guest and room parameters
    searchParams.append("adults", guests?.toString() || "2");
    searchParams.append("children", "0"); // Default to 0 children
    searchParams.append("roomCount", rooms?.toString() || "1");

    // Redirect to the search page with parameters
    router.push(`/hotels/search?${searchParams.toString()}`);
  };

  return (
    <div className="text-black h-full p-4 flex flex-col justify-around gap-4">
      <ProvinceWardSearch
        onPlaceSelect={(place) => {
          setLocation(place);
        }}
      />
      <CalendarDatePicker
        date={selectedDateRange}
        onDateSelect={(e) => {
          setSelectedDateRange(e);
        }}
        className="!background-form   !text-black !h-[56px]"
      />
      <div className="flex gap-4">
        <InputWithIcon
          onChange={(e) => {
            setGuests(e.target.value);
          }}
          placeholder="Guests"
          defaultValue="2"
          icon={<User />}
        />
        <InputWithIcon
          onChange={(e) => {
            setRooms(e.target.value);
          }}
          placeholder="Rooms"
          defaultValue="1"
          icon={<MdLocalHotel />}
        />
      </div>
      <Button
        onClick={handleSearchHotel}
        className="h-[56px] rounded-md text-white dark:text-white primary-gradient text-[16px] font-bold"
      >
        <Hotel />
        BOOK NOW
      </Button>
    </div>
  );
};

export default HotelSearchForm;
