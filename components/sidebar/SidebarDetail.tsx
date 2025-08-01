// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Calendar,
//   File,
//   Home,
//   Menu,
//   Package,
//   Settings,
//   User,
// } from "lucide-react";
// import { useGuideContentStore } from "@/store/guideContentStore";
// import { GoDotFill, GoDot } from "react-icons/go";

// import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
// const SidebarDetail = () => {
//   const {
//     sections,
//     routeCount,
//     listCount,
//     totalPlaces,
//     totalItems,
//     getRoutes,
//     getLists,
//     scrollToSection,
//   } = useGuideContentStore();

//   const [isCollapsed, setIsCollapsed] = useState(true);
//   const [activeSection, setActiveSection] = useState<number | null>(null);
//   const routes = getRoutes();
//   const lists = getLists();

//   const handleSectionClick = (index: number) => {
//     console.log("Clicking section:", index);
//     setActiveSection(index);
//     scrollToSection(index);
//   };

//   return (
//     <div className="flex h-screen">
//       <div
//         className={`bg-transparent shadow-md  transition-all relative duration-300 ${
//           isCollapsed ? "w-16 overflow-hidden" : "w-64"
//         }`}
//       >
//         {/* <div className="flex h-16 items-center justify-between border-b border-gray-800 px-4">
//           <div className="flex items-center gap-2 font-semibold">
//             <Package className="h-6 w-6" />
//             <span className={`${isCollapsed ? "hidden" : "block"}`}>
//               Acme Inc
//             </span>
//           </div>
//         </div> */}
//         <nav className="flex flex-col gap-2 p-4">
//           <Button
//             variant="ghost"
//             size="icon"
//             className={`rounded-md p-2 hover:bg-gray-200 ${isCollapsed ? "justify-center" : "justify-start"}`}
//           >
//             <Home className="h-5 w-5" />
//             <span className={`${isCollapsed ? "hidden" : "block"}`}>Home</span>
//           </Button>
//           {sections?.map((section, index) => (
//             <Tooltip key={`hovercard-${index}`}>
//               <TooltipTrigger>
//                 <div
//                   className={`cursor-pointer rounded-md p-2 w-[36px] h-[36px] hover:bg-gray-200 transition-colors ${
//                     activeSection === index
//                       ? "bg-blue-100 border-l-4 border-blue-500"
//                       : ""
//                   } ${isCollapsed ? "justify-center" : "justify-start"}`}
//                   onClick={() => handleSectionClick(index)}
//                 >
//                   {isCollapsed &&
//                     (section?.type == "list" ? (
//                       <GoDot className="h-5 w-5" />
//                     ) : (
//                       <div className="text-[10px] font-semibold  rounded px-1">
//                         {section?.name?.slice(0, 3) || "R"}
//                       </div>
//                     ))}
//                   <div className={`${isCollapsed ? "hidden" : "block"}`}>
//                     <div className="flex items-center gap-2">
//                       {section?.type === "route" ? (
//                         <div className="w-2 h-2  rounded-full"></div>
//                       ) : (
//                         <GoDot className="h-5 w-5" />
//                       )}
//                       {/* <span className="font-medium">{section?.name}</span> */}
//                       <span className="font-medium">Day 4</span>
//                     </div>
//                     <div className="text-xs text-gray-500 ml-4">
//                       {section?.data?.filter((item) => item.type === "place")
//                         ?.length || 0}{" "}
//                       places
//                     </div>
//                   </div>
//                 </div>
//               </TooltipTrigger>
//               <TooltipContent side="right">
//                 <div className="text-sm">
//                   <div className="font-semibold">{section?.name}</div>
//                   <div className="text-xs text-gray-500">
//                     {section?.type === "route" ? "Route" : "List"} •{" "}
//                     {section?.data?.filter((item) => item.type === "place")
//                       ?.length || 0}{" "}
//                     places
//                   </div>
//                 </div>
//               </TooltipContent>
//             </Tooltip>
//           ))}
//           <Button
//             className=""
//             variant="ghost"
//             size="icon"
//             onClick={() => setIsCollapsed(!isCollapsed)}
//           >
//             <Menu className="h-5 w-5" />
//             <span className="sr-only">Toggle sidebar</span>
//           </Button>
//         </nav>
//       </div>
//     </div>
//   );
// };

// export default SidebarDetail;

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
    scrollToSection,
  } = useGuideContentStore();

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeSection, setActiveSection] = useState<number | null>(null);

  const routes = getRoutes();
  const lists = getLists();

  const handleSectionClick = (index: number) => {
    console.log("Clicking section:", index);
    setActiveSection(index);
    scrollToSection(index);
  };

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
                  onClick={() => {
                    console.log("scroll nè");
                    handleSectionClick(index);
                  }}
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
