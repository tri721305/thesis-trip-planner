// Utility functions to manage recently viewed items in localStorage

// Types for recently viewed items
export interface RecentlyViewedItem {
  id: string;
  title: string;
  image: string;
  type: "planner" | "guide";
  destination?: string;
  views?: number;
  likes?: number; // For backward compatibility
  upvotes?: number;
  downvotes?: number;
  author?: {
    name?: string;
    image?: string;
  };
  viewedAt: number; // timestamp
}

const RECENTLY_VIEWED_KEY = "recently_viewed_items";
const MAX_ITEMS = 20; // Maximum number of items to store in history

// Add an item to recently viewed
export const addToRecentlyViewed = (
  item: Omit<RecentlyViewedItem, "viewedAt">
) => {
  // Make sure we're on the client side
  if (typeof window === "undefined") {
    return;
  }

  try {
    // Get current items
    const currentItems: RecentlyViewedItem[] = getRecentlyViewedItems();

    // Check if item already exists
    const existingIndex = currentItems.findIndex(
      (i) => i.id === item.id && i.type === item.type
    );

    // Create new item with current timestamp
    const newItem: RecentlyViewedItem = {
      ...item,
      viewedAt: Date.now(),
    };

    // If item exists, update it and move it to the front
    if (existingIndex !== -1) {
      currentItems.splice(existingIndex, 1);
    }

    // Add new item at the beginning
    const updatedItems = [newItem, ...currentItems].slice(0, MAX_ITEMS);

    // Save to localStorage
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updatedItems));
  } catch (error) {
    console.error("Error saving to recently viewed:", error);
  }
};

// Get all recently viewed items
export const getRecentlyViewedItems = (): RecentlyViewedItem[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const items = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return items ? JSON.parse(items) : [];
  } catch (error) {
    console.error("Error getting recently viewed items:", error);
    return [];
  }
};

// Filter items by type ('planner' or 'guide')
export const getRecentlyViewedByType = (
  type: "planner" | "guide"
): RecentlyViewedItem[] => {
  const allItems = getRecentlyViewedItems();
  return allItems.filter((item) => item.type === type);
};

// Clear all recently viewed items
export const clearRecentlyViewedItems = () => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(RECENTLY_VIEWED_KEY);
};
