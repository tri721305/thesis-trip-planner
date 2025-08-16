"use client";

import { useState, useEffect } from "react";
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
import { GoDotFill, GoDot } from "react-icons/go";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const SidebarDetailPlanner = ({
  planner,
  leftContentRef,
  hiddenScrollRef,
}: any) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [scrollSyncStatus, setScrollSyncStatus] = useState<
    "synced" | "unsynced" | "unknown"
  >("unknown");

  // Monitor scroll sync status
  useEffect(() => {
    if (!leftContentRef?.current || !hiddenScrollRef?.current) return;

    const checkSync = () => {
      const contentPos = leftContentRef.current?.scrollTop || 0;
      const hiddenPos = hiddenScrollRef.current?.scrollTop || 0;
      const synced = Math.abs(contentPos - hiddenPos) < 2; // 2px tolerance

      setScrollSyncStatus(synced ? "synced" : "unsynced");
    };

    const contentContainer = leftContentRef.current;
    const hiddenContainer = hiddenScrollRef.current;

    contentContainer.addEventListener("scroll", checkSync);
    hiddenContainer.addEventListener("scroll", checkSync);

    // Initial check
    checkSync();

    return () => {
      contentContainer.removeEventListener("scroll", checkSync);
      hiddenContainer.removeEventListener("scroll", checkSync);
    };
  }, [leftContentRef, hiddenScrollRef]);

  // Create sections from planner data with detailed structure
  const plannerSections = [
    {
      id: "note",
      name: "Note",
      type: "note",
    },
    {
      id: "generalTips",
      name: "General Tips",
      type: "generalTips",
    },
    {
      id: "lodging",
      name: "Hotels and Lodging",
      type: "lodging",
    },
    // Add individual detail sections for each route/list
    ...(planner?.details || []).map((detail: any, index: number) => {
      // For route type, generate day number and detailed name
      const dayNumber = detail.index || index + 1;
      const shortName =
        detail.type === "route"
          ? `Day ${dayNumber}`
          : detail.name || `List ${index + 1}`;

      // For detailed name, use the actual name from detail.name (e.g., "Monday, 18th August")
      const detailedName =
        detail.type === "route"
          ? detail.name || shortName // Use detail.name if available, fallback to Day X
          : detail.name || `List ${index + 1}`;

      return {
        id: `detail-${index}`,
        name: shortName,
        detailedName: detailedName,
        type: "detail",
        detailType: detail.type, // route or list
        index: index,
        dayNumber: detail.type === "route" ? dayNumber : null,
        hasData: detail.data && detail.data.length > 0,
        itemCount: detail.data ? detail.data.length : 0,
      };
    }),
  ];

  // Debug function to test scroll
  const debugScroll = () => {
    console.log("=== DEBUG SCROLL ===");
    console.log("Refs available:", {
      leftContentRef: !!leftContentRef?.current,
      hiddenScrollRef: !!hiddenScrollRef?.current,
    });

    if (leftContentRef?.current) {
      console.log("Left content container:", {
        scrollTop: leftContentRef.current.scrollTop,
        scrollHeight: leftContentRef.current.scrollHeight,
        clientHeight: leftContentRef.current.clientHeight,
      });
    }

    if (hiddenScrollRef?.current) {
      console.log("Hidden scroll container:", {
        scrollTop: hiddenScrollRef.current.scrollTop,
        scrollHeight: hiddenScrollRef.current.scrollHeight,
        clientHeight: hiddenScrollRef.current.clientHeight,
      });
    }

    console.log("Available elements:");

    // Check main sections
    const mainSections = ["note", "generalTips", "lodging", "details"];
    mainSections.forEach((section) => {
      const element = document.getElementById(`${section}-section`);
      if (element) {
        console.log(`${section}-section:`, {
          found: true,
          offsetTop: element.offsetTop,
          offsetHeight: element.offsetHeight,
        });
      } else {
        console.log(`${section}-section:`, "❌ Not found");
      }
    });

    // Check detail sections
    for (let i = 0; i < 10; i++) {
      const element = document.getElementById(`section-${i}`);
      if (element) {
        console.log(`section-${i}:`, {
          found: true,
          offsetTop: element.offsetTop,
          offsetHeight: element.offsetHeight,
        });
      }
    }

    // Test scroll to first element
    const testElement = document.getElementById("note-section");
    if (testElement) {
      console.log("Testing scroll to note-section...");
      handleSectionClick("note");
    }
  };

  const handleSectionClick = (sectionId: string) => {
    console.log("Clicking section:", sectionId);
    setActiveSection(sectionId);

    // Handle different types of sections
    let targetElement = null;

    if (sectionId.startsWith("detail-")) {
      // For detail sections, scroll to specific section-index
      const index = sectionId.split("-")[1];
      targetElement = document.getElementById(`section-${index}`);
      console.log(
        "Looking for detail element:",
        `section-${index}`,
        targetElement
      );
    } else {
      // For main sections (note, generalTips, lodging)
      targetElement = document.getElementById(`${sectionId}-section`);
      console.log(
        "Looking for main element:",
        `${sectionId}-section`,
        targetElement
      );
    }

    if (targetElement && leftContentRef?.current && hiddenScrollRef?.current) {
      console.log("Target element found, scrolling with refs...");

      try {
        // Calculate the target position relative to the content container
        const contentContainer = leftContentRef.current;
        const scrollContainer = hiddenScrollRef.current;

        // Get the element's position relative to the content container
        const contentRect = contentContainer.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();

        // Calculate the actual scroll position needed
        const currentScrollTop = contentContainer.scrollTop;
        const targetRelativeTop = targetRect.top - contentRect.top;
        const targetScrollPos = Math.max(
          0,
          currentScrollTop + targetRelativeTop - 20
        ); // 20px offset for better visibility

        console.log("Improved scroll calculation:", {
          currentScrollTop,
          targetScrollPos,
          targetRelativeTop,
          contentRect: { top: contentRect.top, height: contentRect.height },
          targetRect: { top: targetRect.top, height: targetRect.height },
          targetElement: targetElement.id,
        });

        // Smooth scroll animation function
        const animateScroll = (
          startPos: number,
          targetPos: number,
          duration: number
        ) => {
          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation
            const easeInOutCubic = (t: number) =>
              t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

            const currentPosition =
              startPos + (targetPos - startPos) * easeInOutCubic(progress);

            // Update both scroll containers simultaneously
            contentContainer.scrollTop = currentPosition;
            scrollContainer.scrollTop = currentPosition;

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              console.log(
                "Scroll animation complete at position:",
                currentPosition
              );

              // Verify sync after animation
              setTimeout(() => {
                console.log("Post-animation sync check:", {
                  contentScroll: contentContainer.scrollTop,
                  hiddenScroll: scrollContainer.scrollTop,
                  synced:
                    Math.abs(
                      contentContainer.scrollTop - scrollContainer.scrollTop
                    ) < 1,
                });
              }, 50);
            }
          };

          requestAnimationFrame(animate);
        };

        // Start the scroll animation
        animateScroll(currentScrollTop, targetScrollPos, 800);

        // Add highlight effect after a brief delay
        setTimeout(() => {
          targetElement.style.transition = "all 0.3s ease";
          targetElement.style.borderLeft = "4px solid #ffb57f";
          targetElement.style.paddingLeft = "8px";

          setTimeout(() => {
            targetElement.style.borderLeft = "";
            targetElement.style.paddingLeft = "";
          }, 1000);
        }, 200);
      } catch (error) {
        console.error("Scroll error:", error);

        // Fallback: try regular scrollIntoView
        const rect = targetElement.getBoundingClientRect();
        const isNearBottom = rect.top + rect.height > window.innerHeight * 0.8;

        if (isNearBottom) {
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest",
          });
        } else {
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          });
        }
      }
    } else {
      console.error("Missing requirements:", {
        targetElement: !!targetElement,
        leftContentRef: !!leftContentRef?.current,
        hiddenScrollRef: !!hiddenScrollRef?.current,
        sectionId,
      });

      // Debug: List all available elements
      console.log("Available elements:", {
        sections: Array.from(document.querySelectorAll('[id*="section"]')).map(
          (el) => el.id
        ),
        details: Array.from(document.querySelectorAll('[id^="section-"]')).map(
          (el) => el.id
        ),
        main: Array.from(document.querySelectorAll('[id$="-section"]')).map(
          (el) => el.id
        ),
      });
    }
  };

  return (
    <div className="flex h-screen">
      <div
        className={`bg-transparent shadow-md transition-all relative duration-300 ${
          isCollapsed ? "w-16 overflow-hidden" : "w-64"
        }`}
      >
        <nav className="flex flex-col gap-2 p-4">
          <div
            className={`rounded-md flex gap-2 cursor-pointer p-2 hover:bg-gray-200 ${
              isCollapsed ? "justify-center" : "justify-start px-2 text-start"
            }`}
          >
            <Home className="h-5 w-5" />
            <span className={`${isCollapsed ? "hidden" : "block"}`}>Home</span>
          </div>

          {plannerSections.map((section, index) => (
            <Tooltip key={`planner-section-${index}`}>
              <TooltipTrigger>
                <div
                  onClick={() => handleSectionClick(section.id)}
                  className={`cursor-pointer rounded-md p-2 hover:bg-gray-200 transition-colors ${
                    activeSection === section.id
                      ? "bg-blue-100 border-l-4 border-blue-500"
                      : ""
                  } ${isCollapsed ? "justify-center" : "justify-start px-2 text-start"}`}
                >
                  {isCollapsed && (
                    <div className="text-[10px] font-semibold rounded px-1 bg-gray-100">
                      {section.type === "detail"
                        ? section.detailType === "route"
                          ? `D${section.dayNumber || section.index + 1}`
                          : `L${section.index + 1}`
                        : section.name.slice(0, 2)}
                    </div>
                  )}
                  <div className={`${isCollapsed ? "hidden" : "block"}`}>
                    <p className="font-medium">{section.name}</p>
                    {/* Show detailed name for route/list when expanded */}
                    {section.type === "detail" &&
                      section.detailedName !== section.name && (
                        <p className="text-xs text-gray-600 mt-1 font-normal">
                          {section.detailedName}
                        </p>
                      )}
                    {/* Show data status for detail sections */}
                    {section.type === "detail" && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <span>
                          {section.detailType === "route" ? "📍" : "📋"}
                        </span>
                        <span>
                          {section.hasData
                            ? `${section.itemCount} item${section.itemCount !== 1 ? "s" : ""}`
                            : "Empty"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="text-sm">
                  <div className="font-semibold">
                    {section.type === "detail"
                      ? section.detailedName !== section.name
                        ? section.detailedName
                        : section.name
                      : section.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {section.type === "detail"
                      ? `${section.detailType} • ${
                          section.hasData
                            ? `${section.itemCount} item${section.itemCount !== 1 ? "s" : ""}`
                            : "Empty"
                        }`
                      : `${section.type} section`}
                  </div>
                </div>
              </TooltipContent>
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

export default SidebarDetailPlanner;
