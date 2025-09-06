"use client";
import React, { useEffect, useState } from "react";
import { CalendarDatePicker } from "./calendar-date-picker";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { MdHotel } from "react-icons/md";
import { BsPeople, BsPeopleFill } from "react-icons/bs";
import { getHotelOfferById } from "@/lib/actions/hotel.action";
import ImageGallery from "./images/ImageGallery";
import { CheckCircle } from "lucide-react";
import { IoMdCloseCircle } from "react-icons/io";
import { FaUser } from "react-icons/fa";

const Availability = ({ data }: { data: any }) => {
  const [offers, setOffers] = useState([]);

  const handleGetHotelOffer = async () => {
    const hotel = await getHotelOfferById({ hotelId: data?.hotel?.hotel_id });
    if (hotel.success) {
      setOffers(hotel.data?.hotel || []);
    }
  };

  useEffect(() => {
    handleGetHotelOffer();
  }, []);

  console.log("offers", offers);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <div>
          <Label className="font-bold">Checkin - Checkout</Label>
          <CalendarDatePicker
            date={{
              from: new Date(),
              to: new Date(),
            }}
            onDateSelect={(e) => {
              console.log(e);
            }}
            className="h-[56px]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Travelers</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-[56px]  background-form-input text-black border-none dark:text-white"
              >
                <div className="flex items-center gap-2">
                  <MdHotel /> 1
                  <BsPeopleFill /> 2
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="leading-none font-medium">Rooms and Guests</h4>
                </div>
                <div className="grid gap-2">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="width">Rooms</Label>
                    <Input id="width" className="col-span-2 h-8" />
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
      <div className="flex flex-col gap-2">
        {/* <Button onClick={handleGetHotelOffer}>Check Service</Button> */}
        {offers?.offers?.data?.offers?.map((offer: any, index: number) => {
          const listImgs = offer?.images?.map((img: any) => img?.url);
          return (
            <div key={offer?.name + index}>
              <div className="flex justify-between items-start gap-2">
                <div className="flex gap-2">
                  <ImageGallery
                    images={listImgs}
                    mainImageIndex={0}
                    alt="Gallery description"
                    className="w-fit"
                  />
                  <div>
                    <h1 className="text-[24px] font-bold">{offer?.name}</h1>
                    <div className="text-[12px]">
                      <p>1 King Bed</p>
                      <p>{offer?.areaSquareMeters} meters</p>
                      <p>Air conditioning</p>
                      <h1 className="font-bold text-gray-700 cursor-pointer">
                        See all details
                      </h1>
                    </div>
                    {offer?.priceRate?.cancellationPolicy?.type ==
                    "fullRefund" ? (
                      <div className="flex gap-2 items-center text-green-400 text-[14px] font-bold">
                        <CheckCircle size={14} />
                        <p>Free cancellation</p>
                      </div>
                    ) : (
                      <div className="flex gap-2 items-center text-red-500 text-[14px] font-bold">
                        <IoMdCloseCircle size={14} />
                        <p>Non-refundable</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-[12px] mr-8">
                    <p>Sleeps</p>
                    <div className="flex gap-2 items-center">
                      {offer?.maxPeople?.total > 0 &&
                        Array.from({ length: offer?.maxPeople?.total }).map(
                          (_, index) => <FaUser size={14} key={"use" + index} />
                        )}
                    </div>
                  </div>
                  <div className="flex min-w-[200px] flex-col gap-1 items-end">
                    <h1 className="p-1 w-fit font-extrabold text-[10px] rounded-md bg-[#ec9b3b] text-white">
                      MEMBER DEAL
                    </h1>
                    <h1 className="font-bold text-[14px]">
                      {offer?.priceRate?.total?.amount?.toLocaleString("vi", {
                        style: "currency",
                        currency: "VND",
                      })}
                      <span className="text-[12px] font-normal text-gray-600">
                        {" "}
                        /night{" "}
                        <span className="line-through">
                          {offer?.priceRate?.nightlyStrikethrough?.amount?.toLocaleString(
                            "vi",
                            {
                              style: "currency",
                              currency: "VND",
                            }
                          )}
                        </span>
                      </span>
                    </h1>
                    <p className="text-gray-500 text-[10px]">
                      {offer?.priceRate?.total?.amount?.toLocaleString("vi", {
                        style: "currency",
                        currency: "VND",
                      })}{" "}
                      total with fee
                    </p>
                  </div>
                  <div>
                    <Button className="bg-primary-500 h-[40px] text-white rounded-[30px]">
                      Booking
                    </Button>
                  </div>
                </div>
              </div>
              <Separator className="my-2" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Availability;
