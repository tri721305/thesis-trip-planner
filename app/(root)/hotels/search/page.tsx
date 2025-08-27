"use client";
import { CalendarDatePicker } from "@/components/calendar-date-picker";
import ProvinceWardSearch from "@/components/search/ProviceWardSearch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Hotel, Star } from "lucide-react";
import { GrLikeFill } from "react-icons/gr";
import { BiSolidLike } from "react-icons/bi";
import { getHotels } from "@/lib/actions/hotel.action";
import ImageGallery from "@/components/images/ImageGallery";
import { capitalizeFirstLetter } from "@/lib/utils";

const HotelSearchPage = () => {
  const [location, setLocation] = useState();
  const [selectedDateRange, setSelectedDateRange] = useState({
    from: new Date(),
    to: new Date(),
  });
  const [rangePrice, setRangePrice] = useState([300000, 500000]);
  const [hotelList, setHotelList] = useState<
    { hotels: any[]; isNext: boolean } | undefined
  >();

  // Function to format rating without unnecessary decimals
  const formatRating = (rating: number) => {
    return rating % 1 === 0 ? rating.toString() : rating.toFixed(1);
  };
  const handleGetHotelsByWanderLog = async () => {
    const listWanderlog = await getHotels({
      page: 1,
      pageSize: 10,
      // filter: {
      //   source: "wanderlog",
      //   // sortBy: "rating",
      // },
      query: "Ngan Ha Apartment 2",
    });

    console.log("listWanderlog", listWanderlog);
  };
  useEffect(() => {
    const funcGetHotels = async () => {
      const { data, success } = await getHotels({
        page: 1,
        pageSize: 10,
      });

      console.log("success", success, data);
      if (success) {
        setHotelList(data);
      }
    };

    funcGetHotels();
  }, []);

  console.log("hotelList", hotelList);
  return (
    <div className="flex h-[calc(100vh-80px)]">
      <section
        className="flex-1 overflow-auto"
        style={{ boxShadow: "1px 1px 10px 1px lightgray" }}
      >
        <div className="flex justify-between items-center p-2">
          <Button
            size="icon"
            className="rounded-full bg-gray-200"
            variant="ghost"
          >
            <IoMdClose />
          </Button>
          <div className="flex gap-2">
            <div className="flex flex-col gap-2 min-w-[300px]">
              <Label>Where</Label>
              <ProvinceWardSearch
                onPlaceSelect={(place) => {
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
                  console.log("Date PIcker VALUE", e);
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
          </div>
        </div>
        <Separator className="my-2" />
        <div className="p-2 flex  items-center justify-between">
          <div className="flex flex-col gap-4">
            <Label className="font-bold">
              Price:{" "}
              <span className="font-medium">{`đ${rangePrice[0].toLocaleString("vi", { style: "currency", currency: "VND" })}-đ${rangePrice[1].toLocaleString("vi", { style: "currency", currency: "VND" })}`}</span>
            </Label>
            <Slider
              value={rangePrice}
              max={2000000}
              step={50000}
              className="w-[20%]"
              onValueChange={(value) => {
                console.log("Slider value", value);
                setRangePrice(value);
              }}
            />
          </div>
          <div className="flex gap-1">
            <div className="flex gap-2 bg-gray-200 items-center p-2 rounded-[40px] w-fit px-4 cursor-pointer">
              <Star size={14} /> Hotel Class
            </div>
            <div className="flex gap-2 bg-gray-200 items-center p-2 rounded-[40px] w-fit px-4 cursor-pointer">
              <BiSolidLike size={14} /> Rated
            </div>
            <div
              onClick={handleGetHotelsByWanderLog}
              className="flex gap-2 bg-gray-200 items-center p-2 rounded-[40px] w-fit px-4 cursor-pointer"
            >
              <Hotel size={14} /> By
            </div>
          </div>
        </div>
        <Separator className="my-2" />
        <div>
          {hotelList?.hotels?.map((hotel, index) => {
            console.log("hotel", hotel);
            const listImgs = hotel?.lodging?.images?.map(
              (img: any) => img?.url
            );
            return (
              <div
                key={hotel?._id}
                className="flex gap-2 items-center px-4 py-2"
              >
                <ImageGallery
                  className="w-[180px]  h-[120px] rounded-md overflow-hidden object-cover"
                  images={listImgs}
                  mainImageIndex={0}
                  alt="Gallery description"
                  // className="w-full"
                />
                <div className="px-4 flex-1  flex justify-between">
                  <div className="max-w-[360px] flex-1">
                    <h1>{hotel?.lodging?.name}</h1>
                    <div>
                      <ul
                        className="flex flex-wrap gap-[12px] gap-y-0 "
                        style={{ listStyle: "circle" }}
                      >
                        {hotel?.lodging?.hotelClass && (
                          <li className="text-[10px]">
                            {`${hotel?.lodging?.hotelClass}-star hotel`}
                          </li>
                        )}
                        {hotel?.lodging?.amenities
                          ?.slice(0, 8)
                          .map((amentity: any, i: number) => (
                            <li
                              className="text-[10px]"
                              key={amentity?.name + i}
                            >
                              {amentity?.name}
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex gap-1 items-center">
                    <div className="p-2 text-white w-[40px] h-[40px] flex-center rounded-md bg-blue-900">
                      <p className="font-bold">
                        {formatRating(hotel?.lodging?.wanderlogRating || 10)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px]">
                        Exceptional ({hotel?.lodging?.ratingCount})
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <h1 className="font-bold text-[16px]">
                      {hotel?.priceRate?.total?.amount?.toLocaleString("vi", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </h1>
                    <Button className="bg-primary-500 hover:bg-primary-500">
                      View Deal
                    </Button>
                    <p className="text-[10px] text-gray-500">
                      {capitalizeFirstLetter(hotel?.source)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <section className="flex-1">Map</section>
    </div>
  );
};

export default HotelSearchPage;
