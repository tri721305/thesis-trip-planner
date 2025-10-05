"use client";

import { Clock, Eye, Heart, MapPin, Share, Trash, User } from "lucide-react";
import Image from "next/image";
import React from "react";
import { BsThreeDots } from "react-icons/bs";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define proper types for our component props
interface PlannerCardProps {
  id: string;
  image?: string;
  title: string;
  destination?: string;
  like?: number;
  views?: number;
  author?: {
    name?: string;
    image?: string;
  };
  startDate?: string;
  endDate?: string;
  onDelete?: () => void;
  style?: React.CSSProperties;
}

const PlannerCard: React.FC<PlannerCardProps> = ({
  id,
  image,
  title,
  destination,
  like = 0,
  views = 0,
  author,
  startDate,
  endDate,
  onDelete,
  style,
}) => {
  return (
    <Link href={`/planners/${id}`} className="block">
      <div className="relative w-[256px] mt-4" style={style}>
        <div className="absolute top-1 right-2 z-10 w-[20px] h-[20px] bg-[#75757585] rounded-full p-auto flex-center">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <BsThreeDots color="white" size={14} />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {onDelete && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault(); // Prevent navigation
                    onDelete();
                  }}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                <Share className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="relative h-[178px] w-full">
          {image ? (
            <Image
              className="shadow-md rounded-[12px] mb-2 object-cover"
              src={image}
              alt={title}
              fill
              sizes="256px"
            />
          ) : (
            <div className="shadow-md rounded-[12px] mb-2 h-[178px] w-full bg-gradient-to-br from-blue-400 to-purple-500 flex justify-center items-center">
              <MapPin className="h-10 w-10 text-white" />
            </div>
          )}
        </div>
        <p className="font-medium mt-2 text-[16px] truncate">{title}</p>
        {destination && (
          <div className="flex items-center text-gray-600 text-sm mt-1">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="truncate">{destination}</span>
          </div>
        )}
        <div className="flex gap-4 mt-2 text-[12px] text-gray-700">
          {/* <div className="flex gap-1 items-center">
            <Heart className="h-3 w-3 text-red-500" />
            {like}
          </div>
          <div className="flex gap-1 items-center">
            <Eye className="h-3 w-3" />
            {views}
          </div> */}
          {startDate && endDate && (
            <div className="flex gap-1 items-center">
              <Clock className="h-3 w-3" />
              <span className="truncate">
                {new Date(startDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                -
                {new Date(endDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
          {author?.name && (
            <div className="flex gap-1 items-center">
              <User className="h-3 w-3" />
              <span className="truncate">{author.name}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PlannerCard;
