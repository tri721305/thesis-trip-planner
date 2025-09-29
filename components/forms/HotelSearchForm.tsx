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
    to: new Date(),
  });
  const [location, setLocation] = useState<any>(null);
  const [guests, setGuests] = useState<any>(null);
  const [rooms, setRooms] = useState<any>(null);
  const form = useForm<z.infer<typeof SearchHotelSChema>>({
    resolver: zodResolver(SearchHotelSChema),
    defaultValues: {
      location: "",
      checkInDate: "",
      checkOutDate: "",
      guests: 2,
      rooms: 2,
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
          icon={<User />}
        />
        <InputWithIcon
          onChange={(e) => {
            setRooms(e.target.value);
          }}
          placeholder="Rooms"
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
