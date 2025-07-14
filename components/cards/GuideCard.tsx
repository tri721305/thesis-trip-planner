import { Eye, Heart, Share, Trash } from "lucide-react";
import Image from "next/image";
import React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BsThreeDots } from "react-icons/bs";
const GuideCard = ({ image, title, like, views, author, style }: any) => {
  return (
    <div className="relative w-[256px] mt-4">
      <div className="absolute top-1 right-2 w-[20px] h-[20px] bg-[#75757585] rounded-full p-auto flex-center">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <BsThreeDots color="white" size={14} />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Trash />
              Delete
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share />
              Share
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Image
        className="shadow-md rounded-[12px] mb-2"
        src={image || ""}
        alt=""
        width={256}
        height={178}
      />
      <p>{title}</p>
      <div className="flex gap-4 mt-4 text-[12px]">
        <div className="flex gap-2 items-center">
          <Heart />
          {like || 0}
        </div>
        <div className="flex gap-2 items-center">
          <Eye />
          {views || 0}
        </div>
      </div>
    </div>
  );
};

export default GuideCard;
