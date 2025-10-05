"use client";
import { Plus } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import SelectCus from "../select/SelectCus";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import GuideCard from "../cards/GuideCard";
import PlannerCard from "../cards/PlannerCard";
import {
  RecentlyViewedItem,
  getRecentlyViewedItems,
  clearRecentlyViewedItems,
} from "@/lib/utils/recentlyViewed";

const Recently = () => {
  const [viewType, setViewType] = useState<"recently" | "upcoming">("recently");
  const [contentType, setContentType] = useState<"all" | "guides" | "trips">(
    "all"
  );
  const [recentItems, setRecentItems] = useState<RecentlyViewedItem[]>([]);

  // Fetch recently viewed items from localStorage on component mount and when window gains focus
  useEffect(() => {
    // Function to load items from localStorage
    const loadItems = () => {
      if (typeof window !== "undefined") {
        const items = getRecentlyViewedItems();
        setRecentItems(items);
      }
    };

    // Load items initially
    loadItems();

    // Add event listeners to refresh data when user returns to the page
    window.addEventListener("focus", loadItems);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        loadItems();
      }
    });

    // Clean up event listeners
    return () => {
      window.removeEventListener("focus", loadItems);
      document.removeEventListener("visibilitychange", loadItems);
    };
  }, []);

  // Filter items based on content type
  const filteredItems = recentItems.filter((item) => {
    if (contentType === "all") return true;
    if (contentType === "guides") return item.type === "guide";
    if (contentType === "trips") return item.type === "planner";
    return true;
  });

  // Only show first 8 items
  const displayItems = filteredItems.slice(0, 8);

  // For upcoming items - could be implemented with actual upcoming trips in the future
  // For now, we'll just use placeholder data if viewType is "upcoming"
  const upcomingItems: RecentlyViewedItem[] =
    viewType === "upcoming"
      ? [
          {
            id: "upcoming-1",
            title: "Your next trip",
            destination: "Plan your next adventure",
            image: "/images/ocean.jpg",
            type: "planner",
            views: 0,
            author: { name: "Trip Planner" },
            viewedAt: Date.now(),
          },
          {
            id: "upcoming-2",
            title: "Explore new destinations",
            destination: "Find inspiration for your travels",
            image: "/images/ocean.jpg",
            type: "guide",
            views: 0,
            likes: 0,
            upvotes: 0,
            downvotes: 0,
            author: { name: "Trip Planner" },
            viewedAt: Date.now(),
          },
        ]
      : [];

  const itemsToDisplay = viewType === "recently" ? displayItems : upcomingItems;

  console.log("Items to display:", itemsToDisplay);
  return (
    <div className="px-20 py-10">
      <section className="text-dark200-light800 font-extrabold flex justify-between gap-6 text-[2.5em] mb-6">
        <p>Recently viewed and upcoming</p>
        <Button className="primary-gradient rounded-[30px] py-6" asChild>
          <Link href="/create-planner">
            <Plus className="mr-2" />
            Plan new trip
          </Link>
        </Button>
      </section>

      <section className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <SelectCus
            items={[
              { label: "Recently viewed", value: "recently" },
              { label: "Upcoming", value: "upcoming" },
            ]}
            defaultValue="recently"
            onChange={(value: string) =>
              setViewType(value as "recently" | "upcoming")
            }
          />

          {viewType === "recently" && recentItems.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearRecentlyViewedItems();
                setRecentItems([]);
              }}
            >
              Clear history
            </Button>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="font-bold !border-none focus-within:border-none">
            {contentType === "all"
              ? "All"
              : contentType === "guides"
                ? "Guides"
                : "Trips"}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setContentType("all")}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setContentType("trips")}>
              Trips
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setContentType("guides")}>
              Guides
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>

      {itemsToDisplay.length > 0 ? (
        <Carousel
          className="w-full"
          opts={{
            align: "start",
            loop: false,
          }}
        >
          <CarouselContent className="-ml-4">
            {itemsToDisplay.map((item) => (
              <CarouselItem
                key={item.id}
                className="pl-4 md:basis-1/2 lg:basis-1/4"
              >
                {item.type === "guide" ? (
                  <GuideCard
                    id={item.id}
                    image={item.image}
                    title={item.title}
                    destination={item.destination}
                    upvotes={item.upvotes || item.likes || 0}
                    downvotes={item.downvotes || 0}
                    views={item.views || 0}
                    author={item.author}
                  />
                ) : (
                  <PlannerCard
                    id={item.id}
                    image={item.image}
                    title={item.title}
                    destination={item.destination}
                    views={item.views || 0}
                    like={item.likes || 0}
                    author={item.author}
                  />
                )}
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="mt-4">
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </Carousel>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-lg text-gray-500">
            {viewType === "recently"
              ? "You haven't viewed any items yet. Explore our guides and planners!"
              : "You don't have any upcoming trips. Start planning your next adventure!"}
          </p>
          <div className="flex gap-4 mt-6">
            <Button asChild variant="outline">
              <Link href="/guides">Explore Guides</Link>
            </Button>
            <Button asChild>
              <Link href="/planners/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Trip Plan
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recently;
