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

const SidebarDetail = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
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
            className={`rounded-md p-2 hover:bg-gray-800 ${isCollapsed ? "justify-center" : "justify-start"}`}
          >
            <Home className="h-5 w-5" />
            <span className={`${isCollapsed ? "hidden" : "block"}`}>Home</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-md p-2 hover:bg-gray-800 ${isCollapsed ? "justify-center" : "justify-start"}`}
          >
            <File className="h-5 w-5" />
            <span className={`${isCollapsed ? "hidden" : "block"}`}>Files</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-md p-2 hover:bg-gray-800 ${isCollapsed ? "justify-center" : "justify-start"}`}
          >
            <Calendar className="h-5 w-5" />
            <span className={`${isCollapsed ? "hidden" : "block"}`}>
              Calendar
            </span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-md p-2 hover:bg-gray-800 ${isCollapsed ? "justify-center" : "justify-start"}`}
          >
            <User className="h-5 w-5" />
            <span className={`${isCollapsed ? "hidden" : "block"}`}>Users</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-md p-2 hover:bg-gray-800 ${isCollapsed ? "justify-center" : "justify-start"}`}
          >
            <Settings className="h-5 w-5" />
            <span className={`${isCollapsed ? "hidden" : "block"}`}>
              Settings
            </span>
          </Button>
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
