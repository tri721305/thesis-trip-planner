import React from "react";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
// import GuideCardInline from "../cards/GuideCardInline";
import { Separator } from "../ui/separator";
import { auth } from "@/auth";

const MyGuideAndPlan = async () => {
  const session = await auth();

  console.log("Session:", session);
  return (
    <div className="flex items-start gap-4">
      <section className="p-4 rounded-lg background-light800_dark300 flex-1 text-dark200-light800 font-extrabold text-[1.5em] flex flex-col justify-between gap-6">
        <div className="flex items-center justify-between w-full">
          <p>Your trips</p>
          <Button key="add_trip">
            <Plus />
            Plan new trip
          </Button>
        </div>
        <div>
          {/* <GuideCardInline
            image="https://trip-planner-thesis.s3.ap-southeast-1.amazonaws.com/images/1749971979103-0-wpi7mr4aape.png"
            title="Hồ Chí Minh"
            like={10}
            type="trip"
            views={125}
          />
          <Separator className="my-4 h-[2px]" />
          <GuideCardInline
            image="https://trip-planner-thesis.s3.ap-southeast-1.amazonaws.com/images/1749971979103-0-wpi7mr4aape.png"
            title="Hồ Chí Minh"
            like={10}
            type="trip"
            views={125}
          /> */}
        </div>
      </section>
      <section className="p-4 rounded-lg background-light800_dark300 flex-1 text-dark200-light800 font-extrabold text-[1.5em] flex flex-col justify-between gap-6">
        <div className="flex items-center justify-between w-full">
          <p>Your guides</p>
          <Button key="add_guide">
            <Plus />
            Create new guide
          </Button>
        </div>
        <div>
          {/* <GuideCardInline
            image="https://trip-planner-thesis.s3.ap-southeast-1.amazonaws.com/images/1749971979103-0-wpi7mr4aape.png"
            title="Hồ Chí Minh"
            like={10}
            type="guide"
            views={125}
          />
          <Separator className="my-4 h-[2px]" />
          <GuideCardInline
            image="https://trip-planner-thesis.s3.ap-southeast-1.amazonaws.com/images/1749971979103-0-wpi7mr4aape.png"
            title="Hồ Chí Minh"
            like={10}
            type="guide"
            views={125}
          /> */}
        </div>
      </section>
    </div>
  );
};

export default MyGuideAndPlan;
