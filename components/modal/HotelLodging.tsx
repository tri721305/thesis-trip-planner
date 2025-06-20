import React, { useState } from "react";

import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { MdHotel } from "react-icons/md";
const HotelLodging = () => {
  return (
    <div className="px-20 flex flex-col ">
      <Button className="bg-[#e9ecef] h-[48px] rounded-[100px] !text-[#212529] font-bold flex items-center">
        <MdHotel className="ml-2" />
        <div className="flex-1">Book hotel</div>
      </Button>
      <Separator className="my-4" />
      <Input
        placeholder="Search by name or address"
        className="bg-[#f3f4f5] h-[56px] border-none outline-none no-focus"
      />
    </div>
  );
};

export default HotelLodging;
