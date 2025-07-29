import React from "react";
import "./style.css";
import Image from "next/image";
import { Calendar, Hotel, LucideSquareMenu, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BsPeople, BsPerson } from "react-icons/bs";
import { MdHotel } from "react-icons/md";
import { FaMoneyBill } from "react-icons/fa";
import { Separator } from "@/components/ui/separator";
const Dashboard = () => {
  return (
    <div className="px-12">
      <p className=" xt-dark200-light800  font-extrabold  text-[1.5em]">
        Trip Overview
      </p>
      <div className="flex gap-4">
        <div className="w-fit">
          <section className="w-[480px] h-[500px] bg-red-300 circle overflow-hidden">
            <img
              src="/images/hotel.jpg"
              alt="test-hotel"
              className="w-full h-full object-cover"
              // fill
              // objectFit="cover"
            />
          </section>
          <section className="font-mono flex flex-col gap-4 relative backdrop-blur-md -top-10 h-[460px] rounded-[20px] w-full p-4 bg-white/70 shadow-md pr-[20px]">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-[1.5rem] font-bold">Imperial Hotel</h1>
                <h2 className="text-[1rem] flex items-center gap-2 font-medium text-gray-600">
                  <Calendar size={"1rem"} />
                  20.8 - 22.8
                </h2>
              </div>

              <Button className="rounded-[30px] min-h-[44px] text-[1.1rem]">
                Contact <Phone />
              </Button>
            </div>
            <div className="flex gap-2 items-center">
              <div className="p-1 flex items-center gap-2  w-[80px] bg-gray-50 rounded-[40px]">
                <div className="p-2 rounded-full background-light700_dark300 w-[36px] h-[36px] flex-center  ">
                  <BsPerson width={24} height={24} />
                </div>
                <p>4</p>
              </div>
              <div className="p-1 flex items-center gap-2   w-[80px] bg-gray-50 rounded-[40px]">
                <div className="p-2 rounded-full background-light700_dark300 w-[36px] h-[36px] flex-center  ">
                  <MdHotel width={24} height={24} />
                </div>
                <p>2</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[1.2rem] text-gray-700 ">
                  <FaMoneyBill />
                  <p>Amount</p>
                </div>
                <p className="text-[1.5rem] font-medium">VND 700.000</p>
              </div>
              <Button
                variant={"ghost"}
                className="rounded-full w-[40px] h-[40px] border border-gray-500 dark:border-white"
              >
                <LucideSquareMenu width={40} height={40} />
              </Button>
            </div>
            <Separator />
            <div>
              <div>
                <h3>Security</h3>
              </div>
            </div>
          </section>
        </div>
        <div className="flex-1 p-4 bg-white shadow-md rounded-[20px]">
          <div>
            <h1 className="text-[1.2rem] font-semibold">Invoices</h1>
            <h2 className="text-[0.6rem] ">All members</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
