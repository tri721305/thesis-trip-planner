"use client";
import React from "react";
import BorderCard from "../cards/BorderCard";
import moment from "moment";
import { Button } from "../ui/button";
import NumberCard from "../cards/NumberCard";
import SearchBar from "../search/SearchBar";
import Recently from "./Recently";
import MyGuideAndPlan from "./MyGuideAndPlan";
import Explore from "./Explore";

const Title = () => {
  return (
    <section className=" flex flex-col gap-20 justify-between">
      <section className=" flex justify-between   max-md:flex-col max-md:gap-4">
        <section className="text-dark200-light800 font-extrabold flex flex-col gap-6 text-[3.5em]">
          <div>
            <h2 className="text-[1rem] tracking-wide">
              {moment().format("DD  MMMM  YYYY")}
            </h2>
            <h1 className="tracking-wide">
              Plan Your <span className="text-primary-500">Ultimate</span>
            </h1>
            <h1 className="tracking-wide">
              <span className="text-primary-500">Adventure</span> with Our
            </h1>
            <h1>Itinerary Builder</h1>
          </div>

          <div className="flex gap-1">
            <Button className="primary-gradient rounded-[30px]">
              Learn More
            </Button>
            <Button className="rounded-[30px] primary-text-gradient !border-primary-500 !border">
              How it works
            </Button>
          </div>
          <div className="flex gap-4">
            <NumberCard number={123} content="Itinerary Plan" />
            <NumberCard number={46} content="User Registered" />
          </div>
        </section>
        <BorderCard />
      </section>
      <section className="flex-center">
        <SearchBar />
      </section>
      <section>
        <Recently />
      </section>
      <section>
        <MyGuideAndPlan />
      </section>
      <section>
        <Explore />
      </section>
    </section>
  );
};

export default Title;
