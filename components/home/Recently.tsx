"use client";
import { Plus } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

import SelectCus from "../select/SelectCus";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import GuideCard from "../cards/GuideCard";

const Recently = () => {
  return (
    <div className="">
      <section className="text-dark200-light800  font-extrabold flex justify-between gap-6 text-[2.5em]">
        <p>Recently viewed and upcoming</p>
        <Button className="primary-gradient rounded-[30px] py-6">
          <Plus />
          Plan new trip
        </Button>
      </section>
      <section className="flex justify-between items-center ">
        <SelectCus
          items={[
            { label: "Recently viewed", value: "recently" },
            {
              label: " Upcoming",
              value: "upcoming",
            },
          ]}
          onChange={() => {}}
        />
        <DropdownMenu>
          <DropdownMenuTrigger className="font-bold !border-none focus-within:border-none">
            See
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => {
                console.log("Clicked Trips");
              }}
            >
              Trips
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                console.log("Clicked Guides");
              }}
            >
              Guides
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>
      <div className="flex gap-6">
        <GuideCard
          image="https://trip-planner-thesis.s3.ap-southeast-1.amazonaws.com/images/1749971979103-0-wpi7mr4aape.png"
          title="Hồ Chí Minh"
          like={10}
          views={125}
        />
        <GuideCard
          image="https://trip-planner-thesis.s3.ap-southeast-1.amazonaws.com/images/1749971979103-0-wpi7mr4aape.png"
          title="Hồ Chí Minh"
          like={10}
          views={125}
        />
        <GuideCard
          image="https://trip-planner-thesis.s3.ap-southeast-1.amazonaws.com/images/1749971979103-0-wpi7mr4aape.png"
          title="Hồ Chí Minh"
          like={10}
          views={125}
        />
      </div>
    </div>
  );
};

export default Recently;
