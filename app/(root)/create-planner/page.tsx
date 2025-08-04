import LocalSearch from "@/components/search/LocalSearch";
import ProvinceWardSearch from "@/components/search/ProviceWardSearch";
import LocalSearchInput from "@/components/search/Search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search } from "lucide-react";
import React from "react";

const CreatePlan = () => {
  return (
    <div className="w-full h-[calc(100vh-80px)] flex items-center justify-center gap-4">
      <div className="w-[40%]">
        <h1>Plan a new trip</h1>
        <div>
          <Label htmlFor="location">Where to ?</Label>
          <ProvinceWardSearch />
        </div>
        <div>
          <Label htmlFor="dates">Dates (optional)</Label>
          <Input id="dates" />
        </div>
        <div className="flex items-center justify-between">
          <Button variant={"ghost"}>
            <Plus />
            Invite tripmates
          </Button>
          <Button>Drop Down Button Chế độ</Button>
        </div>
      </div>
    </div>
  );
};

export default CreatePlan;
