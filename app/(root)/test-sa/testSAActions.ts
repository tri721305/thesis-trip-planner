"use server";

import { getPlannerById } from "@/lib/actions/planner.action";
import { getHotelsById } from "@/lib/actions/hotel.action";

// Bọc các server actions vào một file riêng
export const fetchPlannerData = async (plannerId: string) => {
  return await getPlannerById({ plannerId });
};

export const fetchHotelsData = async (hotelIds: string[]) => {
  return await getHotelsById({ hotelIds });
};
