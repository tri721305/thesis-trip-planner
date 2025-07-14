import React from "react";
import { Button } from "../ui/button";

const Explore = () => {
  return (
    <section className="p-4 flex flex-col  txt-dark200-light800  font-extrabold flex justify-between gap-6 text-[1.5em]">
      <div className="flex items-center justify-between">
        <p>Popular destinations</p>
        <Button className="font-bold" variant={"ghost"}>
          See all
        </Button>
      </div>
    </section>
  );
};

export default Explore;
