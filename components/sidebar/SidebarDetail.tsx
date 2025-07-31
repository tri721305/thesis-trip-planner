"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  File,
  Home,
  Menu,
  Package,
  Settings,
  User,
} from "lucide-react";
import { useGuideContentStore } from "@/store/guideContentStore";
import { GoDotFill, GoDot } from "react-icons/go";

import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
const SidebarDetail = () => {
  const {
    sections,
    routeCount,
    listCount,
    totalPlaces,
    totalItems,
    getRoutes,
    getLists,
  } = useGuideContentStore();

  const [isCollapsed, setIsCollapsed] = useState(true);
  const routes = getRoutes();
  const lists = getLists();

  console.log("routes", routes, "lists", lists, sections);
  return (
    <div className="flex h-screen">
      <div
        className={`bg-transparent shadow-md  transition-all relative duration-300 ${
          isCollapsed ? "w-16 overflow-hidden" : "w-64"
        }`}
      >
        {/* <div className="flex h-16 items-center justify-between border-b border-gray-800 px-4">
          <div className="flex items-center gap-2 font-semibold">
            <Package className="h-6 w-6" />
            <span className={`${isCollapsed ? "hidden" : "block"}`}>
              Acme Inc
            </span>
          </div>
        </div> */}
        <nav className="flex flex-col gap-2 p-4">
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-md p-2 hover:bg-gray-200 ${isCollapsed ? "justify-center" : "justify-start"}`}
          >
            <Home className="h-5 w-5" />
            <span className={`${isCollapsed ? "hidden" : "block"}`}>Home</span>
          </Button>
          {sections?.map((section, index) => (
            <Tooltip key={"hovercard" + index}>
              <TooltipTrigger>
                <div
                  className={`rounded-md p-2 hover:bg-gray-200 ${isCollapsed ? "justify-center" : "justify-start"}`}
                  // variant="ghost"
                  // size="icon"
                >
                  {isCollapsed &&
                    (section?.type == "list" ? (
                      <GoDot />
                    ) : (
                      <p className="text-[10px]">{section?.name}</p>
                    ))}
                  <p className={`${isCollapsed ? "hidden" : "block"}`}>
                    {section?.name}
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent>{section?.name}</TooltipContent>
            </Tooltip>
          ))}
          <Button
            className=""
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </nav>
      </div>
    </div>
  );
};

export default SidebarDetail;
