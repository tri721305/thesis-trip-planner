import { Dot, Eye, Heart, Share, Trash } from "lucide-react";
import Image from "next/image";
import React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BsThreeDots } from "react-icons/bs";
import { auth } from "@/auth";
import UserAvatar from "../UserAvatar";
const GuideCardInline = async ({
  image,
  title,
  like,
  views,
  author,
  style,
  type,
}: any) => {
  const session = await auth();

  return (
    <div className="relative flex gap-2 items-center  mt-4">
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
        className="shadow-md rounded-[12px]  h-[80px] w-[80px]"
        src={image || ""}
        alt=""
        style={{ objectFit: "cover" }}
        width={80}
        height={80}
      />
      <div className="min-h-[80px] flex flex-col items-start justify-around ">
        <p className="text-[1.4rem]"> {title}</p>
        {type == "guide" && (
          <div className="flex gap-4  text-[0.8rem]">
            <div className="flex gap-2 items-center">
              <Heart size={14} />
              {like || 0}
            </div>
            <div className="flex gap-2 items-center">
              <Eye size={14} />
              {views || 0}
            </div>
          </div>
        )}
        {type == "trip" && (
          <div>
            {session?.user?.id && (
              <div className="flex items-center ">
                <UserAvatar
                  id={session.user.name!}
                  name={session.user.name!}
                  imageUrl={session.user.image!}
                />
                {/* <Dot className="text-[0.8rem] text-gray-500" />
              <span className="text-[0.8rem] text-gray-500">
                {session.user.name}
              </span> */}
                <Dot className="text-[0.8rem] text-gray-500" />
                <span className="text-[0.8rem] text-gray-500">
                  4 Jul - 10 Jul
                </span>
                <Dot className="text-[0.8rem] text-gray-500" />
                <span className="text-[0.8rem] text-gray-500">12 places</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuideCardInline;
