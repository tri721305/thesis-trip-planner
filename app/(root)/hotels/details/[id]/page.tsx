import { Button } from "@/components/ui/button";
import { getHotelDetailById } from "@/lib/actions/hotel.action";
import React from "react";
import { FcGoogle } from "react-icons/fc";
import { GoDotFill } from "react-icons/go";
import { SiExpedia } from "react-icons/si";
import parse from "html-react-parser";
import { Check } from "lucide-react";
import { CalendarDatePicker } from "@/components/calendar-date-picker";
import Availability from "@/components/Availability";
import "./style.css";

interface HotelDetails {}
const HotelDetail = async ({ params, searchParams }: RouteParams) => {
  const { id } = await params;
  const dataSearchParams = await searchParams;

  const { data }: any = await getHotelDetailById({
    hotelId: id,
  });

  return (
    <div className="h-[calc(100vh-80px)] overflow-auto flex flex-col gap-[60px] px-24 py-4">
      <section className="flex items-center justify-between">
        <div className="flex flex-col gap-4">
          <h1 className="font-bold text-[3rem] text-[#2c365d] leading-none">
            {data?.hotel?.details?.data?.name || "Hotel Name"}
          </h1>
          <div>
            <div className="flex gap-2 items-center">
              <div className="flex gap-1 items-center">
                <div className="p-1 rounded-md bg-[#6c757d] text-white font-medium">
                  10.0
                </div>
                <span>Few review (13)</span>
                <FcGoogle />
              </div>
              <GoDotFill size={8} />
              <div className="flex gap-1 items-center">
                <div className="p-1 rounded-md bg-[#2c365d] text-white font-medium">
                  9.8
                </div>
                <span>Few review (13)</span>
                <SiExpedia className="text-yellow-500" />
              </div>
            </div>
            <p className="text-[14px]">
              5-star hotel • {data?.hotel?.details?.data?.address}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <div>
            <span className="text-[24px] font-bold">₫18,886,261</span>
            <span className="text-[12px] text-gray-600">
              /night <span className="line-through">₫32,180,499</span>
            </span>
          </div>
          <Button className="bg-primary-500 h-[40px] rounded-[30px]">
            Select Room
          </Button>
        </div>
      </section>
      <section>Image list</section>
      <section className="flex flex-col gap-2">
        <h1 className="font-bold text-[24px] text-[#2c365d] leading-none">
          Over view
        </h1>
        {parse(data?.hotel?.details?.data?.description)}
        <div>
          <p>
            <strong>Check-in time</strong>
          </p>
          <p>
            Any time after {data?.hotel?.details?.data?.checkInInfo?.beginTime}
          </p>
        </div>
        <div>
          <p>
            <strong>Check-out time</strong>
          </p>
          <p>Any time before {data?.hotel?.details?.data?.checkOutTime}</p>
        </div>
      </section>
      <section>
        <h1 className="font-bold text-[24px] text-[#2c365d] leading-none">
          Amenities
        </h1>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {data?.hotel?.details?.data?.lodging?.amenities?.map(
            (item: any, index: number) => (
              <div key={item?.name + index} className="flex gap-1 items-center">
                <Check size={18} />
                {item?.name}
              </div>
            )
          )}
        </div>
      </section>
      <section>
        <h1 className="font-bold text-[24px] text-[#2c365d] leading-none">
          Location
        </h1>
        <div className="flex gap-4 mt-2">
          <div className="flex-1 bg-blue-200 rounded-lg">Map</div>
          <div className="w-[30%] flex flex-col gap-2">
            <p>{data?.hotel?.details?.data?.address}</p>
            <h2 className="font-bold text-[16px] text-[#2c365d] leading-none mt-2">
              What's nearby
            </h2>
            {data?.hotel?.details?.data?.nearbyAttractions?.map(
              (place: any, index: number) => (
                <p key={place?.name + index}> {place?.name}</p>
              )
            )}
          </div>
        </div>
      </section>
      <section>
        <h1 className="font-bold text-[24px] text-[#2c365d] leading-none">
          Availability
        </h1>
        <div className="">
          <Availability data={data} />
        </div>
      </section>
      <section>
        <h1 className="font-bold text-[24px] mb-[16px] text-[#2c365d] leading-none">
          Reviews
        </h1>
        <div className="flex items-center gap-8">
          <div className="flex gap-2">
            <div className="text-[48px] py-2 px-3 w-[120px] font-bold bg-[#2c365d] rounded-[16px] text-white text-center">
              <div>{data?.hotel?.details?.data?.ratings?.Google?.rating}</div>
              <div className="text-[12px] font-medium">out of 5</div>
            </div>
            <div className="flex flex-col justify-around">
              <h1 className="font-bold">Exceptional</h1>
              <p>
                {data?.hotel?.details?.data?.ratings?.Google?.ratingCount}{" "}
                reviews
              </p>
              <div className="flex gap-2 items-center cursor-pointer">
                <FcGoogle />
                <span>From Google</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="text-[48px] py-2 px-3 w-[120px] font-bold bg-[#2c365d] rounded-[16px] text-white text-center">
              <div>{data?.hotel?.details?.data?.ratings?.Expedia?.rating}</div>
              <div className="text-[12px] font-medium">out of 5</div>
            </div>
            <div className="flex flex-col justify-around">
              <h1 className="font-bold">Exceptional</h1>
              <p>
                {data?.hotel?.details?.data?.ratings?.Expedia?.ratingCount}{" "}
                reviews
              </p>
              <div className="flex gap-2 items-center cursor-pointer">
                <SiExpedia className="text-yellow-500" />

                <span>From Expedia</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section>
        <h1 className="font-bold text-[24px] mb-[16px] text-[#2c365d] leading-none">
          Aditional details
        </h1>
        <div>
          <p className="font-bold">Check-in instructions</p>
          <div className="list-custom">
            {parse(data?.hotel?.details?.data?.checkInInfo?.instructions)}
          </div>
        </div>
        <div className="my-3">
          <p className="font-bold">Check-in special instructions</p>
          <div className="list-custom">
            {parse(
              data?.hotel?.details?.data?.checkInInfo?.specialInstructions
            )}
          </div>
        </div>
        <div>
          <p className="font-bold">Additional hotel info</p>
          <div className="list-custom">
            {parse(data?.hotel?.details?.data?.policies)}
          </div>
        </div>
        <div>
          <p className="font-bold">Optional hotel fees</p>
          <div className="list-custom">
            {parse(data?.hotel?.details?.data?.fees?.optional)}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HotelDetail;
