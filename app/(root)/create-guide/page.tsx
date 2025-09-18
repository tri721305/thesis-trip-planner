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
import { createPlanner } from "@/lib/actions/planner.action";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import ROUTES from "@/constants/route";
import moment from "moment";
interface LocationType {
  displayName?: string;
  [key: string]: any;
}
const CreateGuide = () => {
  const router = useRouter();

  const [location, setLocation] = useState<LocationType | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handleCreatePlanner = async () => {
    console.log("Submit");
  };

  return (
    <div className="w-full h-[calc(100vh-80px)] flex items-center justify-center gap-4">
      <div className="w-[40%]">
        <div className="text-center w-full text-[3rem] font-bold mb-12">
          <h1>Write a travel guide</h1>
          <h2 className="text-[14px] text-gray-500 font-semibold m-2">
            Help fellow travelers by writing up your tips or a past itinerary.
          </h2>
        </div>
        <div className="mb-2">
          <Label className="font-bold" htmlFor="location">
            For where ?
          </Label>
          <ProvinceWardSearch
            onPlaceSelect={(place) => {
              setLocation(place);
            }}
          />
        </div>

        <div className="flex-center flex-col gap-4 m-8">
          <Button
            disabled={!location}
            onClick={handleCreatePlanner}
            className={`w-[140px] font-bold rounded-[30px] h-[56px] text-[16px] bg-primary-500 text-white hover:bg-orange-400 ${loading && "opacity-50 "}`}
          >
            Start writing
          </Button>
          <p className="text-gray-500 font-bold cursor-pointer">
            Or start planning a trip
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateGuide;
