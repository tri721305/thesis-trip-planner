"use client";

import HotelSearch from "../search/HotelSearch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MdHotel } from "react-icons/md";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const HotelLodging = () => {
  const searchParams = useSearchParams();
  const [selectedHotel, setSelectedHotel] = useState<any>(null);

  // Listen for selected hotel
  useEffect(() => {
    const selectedHotelParam = searchParams.get("selectedHotel");
    const actionParam = searchParams.get("action");

    if (selectedHotelParam && actionParam === "addLodging") {
      try {
        const hotelData = JSON.parse(selectedHotelParam);
        setSelectedHotel(hotelData);
      } catch (error) {
        console.error("Error parsing hotel data:", error);
      }
    }
  }, [searchParams]);

  return (
    <div className="px-20 flex flex-col">
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
