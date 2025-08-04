"use client";
import HotelSearchForm from "@/components/forms/HotelSearchForm";
import { Button } from "@/components/ui/button";
import React from "react";
import { LuHotel } from "react-icons/lu";
import { GrPlan } from "react-icons/gr";
import "./style.css"; // Assuming you have a CSS file for styles
import { useRouter } from "next/navigation";
const Hotels = () => {
  const router = useRouter();

  const navigatePlans = () => {
    router.push("/create-planner");
  };
  return (
    <div className="px-8 flex h-[calc(100vh-80px)] overflow-hidden ">
      <section className="flex-1 py-4 parabol-line">
        <div className="p-4 font-medium text-[1rem] text-light400_light500 background-light800_dark300 w-fit rounded-md">
          <p className="flex-center gap-2">
            <LuHotel /> BOOK A PERFECT ROOM{" "}
          </p>
        </div>
        <h1 className="text-[4rem] font-bold leading-tight">Your Ultimate</h1>
        <h1 className="text-[4rem] font-bold leading-tight">Hotel Booking</h1>
        <h1 className="text-[4rem] font-bold leading-tight">Destination.</h1>
        <p className="font-space-grotesk text-light-300 dark:text-light-700">
          Welcome to our hotel booking website. We are your go to platform for
          fiding the perfect accommodations for your travels.Whether you're
          planning a business trip.
        </p>

        <Button
          onClick={navigatePlans}
          className="rounded-none mt-4 h-[56px] text-[20px] font-bold"
        >
          <GrPlan /> Take a Plan
        </Button>
      </section>
      <section className="w-[60%] pl-8 relative">
        <div className="h-[100%] overflow-hidden z-0 ">
          <img alt="bg-hotel" src="/images/home1.png" />
        </div>
        <div className="bg-white dark:bg-black w-[60%] h-[50%] z-100 absolute bottom-2 -left-20 p-2">
          <div className="bg-black dark:bg-white w-full h-full">
            <HotelSearchForm />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hotels;
