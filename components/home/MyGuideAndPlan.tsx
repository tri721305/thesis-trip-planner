import React from "react";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { getPlannerByUserId } from "@/lib/actions/planner.action";
import { getGuideByUserId } from "@/lib/actions/guide.action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import moment from "moment";
import { GoKebabHorizontal } from "react-icons/go";
import Link from "next/link";
const MyGuideAndPlan = async () => {
  const { data: planners, success: plannerSuccess } = await getPlannerByUserId({
    limit: 5,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const { data: guidesData, success: guidesSuccess } = await getGuideByUserId({
    limit: 5,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  if (!plannerSuccess) {
    return;
  }
  // console.log("planners", planners);
  return (
    <div className="px-40 flex gap-2 py-4 ">
      <div className="flex-1 rounded-lg p-4 px-6 bg-gray-100">
        <div className="flex justify-between pb-4 items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Your Trips</h1>
            <Button variant="outline" size="sm" asChild>
              <Link href="/planners/manage">Manage All</Link>
            </Button>
          </div>
          <Button asChild>
            <Link href="/planners/create">
              <Plus className="mr-1" /> Plan new trip
            </Link>
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {planners?.planners?.map((plan: any, index) => {
            return (
              <Link
                href={`/planners/${plan?._id}`}
                key={plan?._id}
                className="flex gap-4 pr-4 items-center cursor-pointer hover:bg-gray-200 p-2 rounded-lg"
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
              </Link>
            );
          })}
        </div>
      </div>
      <div className="flex-1 rounded-lg p-4 px-6 bg-gray-100">
        <div className="flex justify-between pb-4 items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Your Guides</h1>
            <Button variant="outline" size="sm" asChild>
              <Link href="/guides">Manage All</Link>
            </Button>
          </div>
          <Button asChild>
            <Link href="/guides/create">
              <Plus className="mr-1" /> Create new guide
            </Link>
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {guidesSuccess &&
            guidesData?.guides?.map((guide: any) => (
              <Link
                href={`/guides/${guide._id}`}
                key={guide._id}
                className="flex gap-4 pr-4 items-center cursor-pointer hover:bg-gray-200 p-2 rounded-lg"
              >
                <div className="rounded-lg flex w-[80px] h-[80px] overflow-hidden">
                  <Avatar className="w-[80px] h-[80px] rounded-lg">
                    <AvatarImage
                      src={guide?.image}
                      alt={guide?.title || "Guide image"}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-green-400 to-blue-500 text-white font-bold text-xl">
                      {guide?.title ? guide?.title[0]?.toUpperCase() : "🗺️"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <h1 className="text-xl font-bold">{guide?.title}</h1>
                  <div className="flex items-center gap-2">
                    <div className="text-sm">
                      <span className="font-medium">
                        {guide?.destination?.name || "Unknown location"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-1 justify-end">
                  <Button className="" size={"icon"} variant="ghost">
                    <GoKebabHorizontal />
                  </Button>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};

export default MyGuideAndPlan;
