// "use client";
import React from "react";

import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { MdHotel } from "react-icons/md";
import Hotel from "@/database/hotel.model";
import { getHotels } from "@/lib/actions/hotel.action";
import HotelSearch from "../search/HotelSearch";
const HotelLodging = () => {
  return (
    <div className="px-20 flex flex-col ">
      <Button className="background-light800_dark300 h-[48px] rounded-[100px] !text-[#212529] font-bold flex items-center">
        <MdHotel className="ml-2 dark:text-white" size={20} />
        <div className="dark:text-white">Book hotel</div>
      </Button>
      <Separator className="my-4" />
      <HotelSearch />
    </div>
  );
};

export default HotelLodging;
