"use client";

import React, { useEffect } from "react";
import { addToRecentlyViewed } from "@/lib/utils/recentlyViewed";

interface ViewTrackerProps {
  id: string;
  title: string;
  image?: string;
  type: "planner" | "guide";
  destination?: string;
  views?: number;
  likes?: number; // Keeping for backward compatibility
  upvotes?: number;
  downvotes?: number;
  author?: {
    name?: string;
    image?: string;
  };
}

/**
 * A component that tracks when a user views a guide or planner
 * and adds it to the recently viewed items in localStorage
 */
const ViewTracker: React.FC<ViewTrackerProps> = ({
  id,
  title,
  image,
  type,
  destination,
  views,
  likes,
  upvotes,
  downvotes,
  author,
}) => {
  useEffect(() => {
    // Only track on the client side
    if (typeof window === "undefined") return;

    // Add a slight delay to avoid tracking just navigating through pages quickly
    const timeoutId = setTimeout(() => {
      addToRecentlyViewed({
        id,
        title,
        image: image || "",
        type,
        destination,
        views,
        likes,
        upvotes,
        downvotes,
        author,
      });
    }, 2000); // 2 seconds delay

    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    id,
    title,
    image,
    type,
    destination,
    views,
    likes,
    upvotes,
    downvotes,
    author,
  ]);

  // This component doesn't render anything
  return null;
};

export default ViewTracker;
