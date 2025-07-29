import React from "react";
import SearchWithDropdown from "./SearchWithDropdown";
import { FaCalendarAlt, FaSearch, FaUserFriends } from "react-icons/fa";
import { Button } from "../ui/button";
import { getProvinces } from "@/lib/actions/province.action";
import {
  getWardAndPolygonById,
  getWardById,
  getWardByName,
} from "@/lib/actions/ward.action";
import { getHotels } from "@/lib/actions/hotel.action";

const SearchBar = () => {
  return (
    <div>
      <div className="flex gap-2 items-center shadow-lg p-4 rounded-lg">
        <SearchWithDropdown placeholder="Where ..." />
        <SearchWithDropdown
          placeholder="When ..."
          icon={
            <FaCalendarAlt
              size={24}
              className="cursor-pointer text-[#7c8fc8]"
            />
          }
        />
        <SearchWithDropdown
          placeholder="Travelers ..."
          icon={
            <FaUserFriends
              size={24}
              className="cursor-pointer text-[#7c8fc8]"
            />
          }
        />
        <Button className="h-[56px] primary-gradient text-white">
          <FaSearch />
          Search
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
