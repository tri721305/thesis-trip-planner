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

const SearchBar = async () => {
  // const provinces = await getProvinces();
  // const wards = await getWardById({
  //   provinceId: "1",
  // });
  // const ward = await getWardAndPolygonById({
  //   wardId: "6867457c1988c03a1a713466",
  // });
  // console.log("ward", ward);

  const ward = await getWardByName({
    wardName: "Vàm Cỏ",
  });
  console.log("ward", ward);
  // console.log("provinces", provinces, "Wards", wards);
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
