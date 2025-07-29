import React from "react";
import { Textarea } from "./ui/textarea";
import { FaChevronRight, FaChevronDown } from "react-icons/fa6";
import { Separator } from "@/components/ui/separator";
import InputWithIcon from "./input/InputIcon";
import { FaPen } from "react-icons/fa";

import { BiRestaurant, BiSolidHotel } from "react-icons/bi";
import { GoKebabHorizontal } from "react-icons/go";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "./ui/input";
import HotelCard from "./cards/HotelCard";
import InputCollapse from "./input/InputCollapse";
import InputCollapseHotel from "./input/InputCollapseHotel";
import InputCollapseHotelMultiple from "./input/InputCollapseHotelMultiple";
import { Car, Flashlight, Hotel, Plus, Trash } from "lucide-react";
import ReusableDialog from "./modal/ReusableDialog";
import HotelLodging from "./modal/HotelLodging";
import ContentGuide from "./input/ContentGuide";
import { MdFlight } from "react-icons/md";
import { Badge } from "./ui/badge";
const GuideContent = () => {
  const [isOpen, setIsOpen] = React.useState(true);
  const [openModalHotel, setOpenModalHotel] = React.useState(false);
  return (
    <div className="!mt-[100px] flex flex-col gap-[24px]  px-8">
      <Textarea
        placeholder="Tell readers how you know Ha Noi (e.g., 'Lived in Hanoi )"
        className="py-4 border-none paragraph-regular background-light800_darkgradient light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border"
      />
      <div className="p-4 border-none paragraph-regular background-light800_darkgradient light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border">
        <span className="font-bold">Revervations and attachments</span>
        <div className="flex mt-4  items-center justify-center h-[40px]">
          <div className="px-4 flex w-full flex-col items-center h-full justify-center">
            <div className="flex-center cursor-pointer flex-col relative">
              <MdFlight size={20} />
              <p className="text-[12px]">Flight</p>
              <div className="absolute -top-1 -right-[12px] flex-center text-[8px] background-light700_dark300 text-light800_dark300 rounded-full w-4 h-4">
                <p>1</p>
              </div>
            </div>
          </div>
          <Separator orientation="vertical" />
          <div className="px-4 flex w-full flex-col items-center h-full justify-center">
            <div className="flex-center cursor-pointer flex-col relative">
              <BiSolidHotel size={20} />
              <p className="text-[12px]">Lodging</p>
              <div className="absolute -top-1 -right-[12px] flex-center text-[8px] background-light700_dark300 text-light800_dark300 rounded-full w-4 h-4">
                <p>1</p>
              </div>
            </div>
          </div>
          <Separator orientation="vertical" />
          <div className="px-4 flex w-full flex-col items-center h-full justify-center">
            <BiRestaurant size={20} />
            <p className="text-[12px]">Restaurant</p>
          </div>
          <Separator orientation="vertical" />
          <div className="px-4 flex w-full flex-col items-center h-full justify-center">
            <Car size={20} />
            <p className="text-[12px]">Rental Car</p>
          </div>
          <Separator orientation="vertical" />
          <div className="px-4 flex w-[24px] ml-4 flex-col items-center h-full justify-center">
            <GoKebabHorizontal size={24} className="font-bold cursor-pointer" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className="flex w-full  flex-col gap-2"
        >
          <div className="  flex items-center justify-between gap-4 ">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                {!isOpen ? <FaChevronRight /> : <FaChevronDown />}
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
            <InputWithIcon
              //   className="text-[20px] border-none shadow-none"
              icon={<FaPen className="text-gray-600 hover-btn" size={14} />}
              placeholder="Test"
              background="none"
              value={"General Tips"}
              hover="true"
              onChange={() => {}}
              className="paragraph-regular  !text-[24px] no-focus placeholder text-dark400_light700 border-none shadow-none !font-bold outline-none"
            />
            <Button
              onClick={() => {
                // removeItem(idx);
              }}
              className=" !bg-transparent border-none shadow-none text-light800_dark300  flex items-center justify-center"
            >
              <GoKebabHorizontal size={24} />
            </Button>
          </div>

          <CollapsibleContent className="flex flex-col gap-2">
            <Input
              className=" border-none paragraph-regular background-light800_darkgradient light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border"
              placeholder="Write or paste anything here: how to get around, tips and tricks"
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
      <Separator className="my-[1px]" />
      <div>
        <InputCollapseHotelMultiple />
      </div>
      <ContentGuide />
    </div>
  );
};

export default GuideContent;
