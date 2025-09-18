import React from "react";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { getPlannerByUserId } from "@/lib/actions/planner.action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import moment from "moment";
import { GoKebabHorizontal } from "react-icons/go";
const MyGuideAndPlan = async () => {
  const { data: planners, success } = await getPlannerByUserId({
    limit: 5,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  if (!success) {
    return;
  }
  console.log("planners", planners);
  return (
    <div className="px-40 flex gap-2 py-4 ">
      <div className="flex-1 rounded-lg p-4 px-6 bg-gray-100">
        <div className="flex justify-between pb-4 items-center">
          <h1 className="text-2xl font-bold">Your Trips</h1>
          <Button>
            <Plus /> Plan new trip
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {planners?.planners?.map((plan: any, index) => {
            return (
              <div
                key={plan?._id}
                className="flex gap-4 pr-4 items-center cursor-pointer"
              >
                <div className="rounded-lg flex w-[80px] h-[80px] overflow-hidden">
                  {/* <img
                    className="w-full h-full object-cover"
                    src={plan?.image || null}
                    alt="minimal-img"
                  /> */}
                  <div className="rounded-lg flex w-[80px] h-[80px] overflow-hidden">
                    <Avatar className="w-[80px] h-[80px] rounded-lg">
                      {" "}
                      {/* Thêm rounded-lg để làm vuông */}
                      <AvatarImage
                        src={plan?.image}
                        alt={plan?.title || "Trip image"}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 text-white font-bold text-xl">
                        {plan?.title ? plan?.title[0]?.toUpperCase() : "🏖️"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold">{plan?.title}</h1>
                  <div className="flex items-center gap-2">
                    <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
                      {plan?.tripmates?.map((tripmate: any, i: number) => (
                        <Avatar key={`tripmate-${i}`}>
                          <AvatarImage src={tripmate?.image} alt="@shadcn" />
                          <AvatarFallback className="border-2 border-white bg-gray-200">
                            {tripmate?.name[0]}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <h2 className="font-semibold">
                      {moment(plan?.startDate).format("DD MMM")} -{" "}
                      {moment(plan?.endDate).format("DD MMM")}
                    </h2>
                  </div>
                </div>
                <div className="flex flex-1 justify-end">
                  <Button className="" size={"icon"} variant="ghost">
                    <GoKebabHorizontal />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex-1 rounded-lg p-4 px-6 bg-gray-100">
        <div className="flex justify-between items-center">
          Your Guides
          <Button>
            <Plus />
            Create new guide
          </Button>
        </div>
        <div>List Plan</div>
      </div>
    </div>
  );
};

export default MyGuideAndPlan;
