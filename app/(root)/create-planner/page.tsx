"use client";
import { CalendarDatePicker } from "@/components/calendar-date-picker";
import ProvinceWardSearch from "@/components/search/ProviceWardSearch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Earth, Lock, Plus, Search } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FaUserFriends } from "react-icons/fa";
import { Input } from "@/components/ui/input";
interface LocationType {
  displayName?: string;
  [key: string]: any;
}
const CreatePlan = () => {
  const [selectedDateRange, setSelectedDateRange] = useState({
    from: new Date(),
    to: new Date(),
  });

  const [location, setLocation] = useState<LocationType | undefined>(undefined);
  const [showAddTripMates, setShowAddTripMates] = useState(false);

  const handleCreatePlanner = () => {
    let plannerName = location?.displayName;

    let dataSubmit = {
      plannerName,
      location,
      startDate: selectedDateRange.from,
      endDate: selectedDateRange.to,
    };
    console.log("data", dataSubmit);
  };
  // console.log("showAdd", selectedDateRange);

  return (
    <div className="w-full h-[calc(100vh-80px)] flex items-center justify-center gap-4">
      <div className="w-[40%]">
        <div className="text-center w-full text-[3rem] font-bold mb-12">
          <h1>Plan a new trip</h1>
        </div>
        <div className="mb-2">
          <Label className="font-bold" htmlFor="location">
            Where to ?
          </Label>
          <ProvinceWardSearch
            onPlaceSelect={(place) => {
              console.log("selected Place", place);
              setLocation(place);
            }}
          />
        </div>
        <div className="mb-2">
          <Label className="font-bold" htmlFor="dates">
            Dates (optional)
          </Label>
          <CalendarDatePicker
            date={selectedDateRange}
            onDateSelect={(e) => {
              console.log("Date PIcker VALUE", e);
              setSelectedDateRange(e);
            }}
            className="h-[56px] !bg-[#f3f4f5] text-black w-full"
          />
        </div>
        {showAddTripMates && (
          <div className="mb-2 ">
            <Label>Invite tripmates</Label>

            <Input className="h-[56px] !bg-[#f3f4f5] text-black  border-none outline-none no-focus" />
          </div>
        )}
        <div className="flex items-center justify-between">
          {!showAddTripMates && (
            <Button
              variant={"ghost"}
              onClick={() => {
                setShowAddTripMates(true);
              }}
            >
              <Plus />
              Invite tripmates
            </Button>
          )}
          <Select>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select state..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">
                <div className="flex items-center gap-2">
                  <FaUserFriends size={16} /> <p>Friends</p>
                </div>
              </SelectItem>
              <SelectItem value="dark">
                <div className="flex items-center gap-2">
                  <Earth size={16} />
                  <p>Public</p>
                </div>
              </SelectItem>
              <SelectItem value="system">
                <div className="flex items-center gap-2">
                  <Lock size={16} />
                  <p>Private</p>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-center flex-col gap-4 m-8">
          <Button
            onClick={handleCreatePlanner}
            className="w-[140px] font-bold rounded-[30px] h-[56px] text-[16px] bg-primary-500 text-white hover:bg-orange-400 "
          >
            Start planning
          </Button>
          <p className="text-gray-500 font-bold cursor-pointer">
            or write a new guide
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreatePlan;
