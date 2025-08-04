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

const HotelSearchForm = () => {
  const router = useRouter();
  const [selectedDateRange, setSelectedDateRange] = useState({
    from: new Date(),
    to: new Date(),
  });
  const form = useForm<z.infer<typeof SearchHotelSChema>>({
    resolver: zodResolver(SearchHotelSChema),
    defaultValues: {
      location: "asd123123",
      checkInDate: "12051997",
      checkOutDate: "sdsda",
      guests: 2,
      rooms: 2,
    },
  });

  return (
    <div className="text-black h-full p-4 flex flex-col justify-around gap-4">
      <PlaceSearch />
      <CalendarDatePicker
        date={selectedDateRange}
        onDateSelect={(e) => {
          console.log("Date PIcker VALUE", e);
          setSelectedDateRange(e);
        }}
        className="!background-form   !text-black !h-[56px]"
      />
      <div className="flex gap-4">
        <InputWithIcon placeholder="Guests" icon={<User />} />
        <InputWithIcon placeholder="Rooms" icon={<MdLocalHotel />} />
      </div>
      <Button className="h-[56px] rounded-md text-white dark:text-white primary-gradient text-[16px] font-bold">
        <Hotel />
        BOOK NOW
      </Button>
    </div>
  );
};

export default HotelSearchForm;
