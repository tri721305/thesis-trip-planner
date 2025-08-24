import { create } from "zustand";

interface PlannerState {
  plannerData: any;
  setPlannerData: (data: any) => void;
  updatePlannerDetails: (details: any[]) => void;
  clearPlannerData: () => void;
}

export const usePlannerStore = create<PlannerState>((set, get) => ({
  plannerData: null,

  setPlannerData: (data: any) => {
    console.log("🏪 Store - Setting planner data:", {
      title: data?.title,
      detailsCount: data?.details?.length || 0,
      placesCount:
        data?.details?.reduce((total: number, detail: any) => {
          return (
            total +
            (detail.data?.filter((item: any) => item.type === "place")
              ?.length || 0)
          );
        }, 0) || 0,
    });
    set({ plannerData: data });
  },

  updatePlannerDetails: (details: any[]) => {
    const currentData = get().plannerData;
    if (currentData) {
      const updatedData = {
        ...currentData,
        details: details,
      };
      console.log("🏪 Store - Updating planner details:", {
        detailsCount: details.length,
        placesCount:
          details.reduce((total: number, detail: any) => {
            return (
              total +
              (detail.data?.filter((item: any) => item.type === "place")
                ?.length || 0)
            );
          }, 0) || 0,
      });
      set({ plannerData: updatedData });
    }
  },

  clearPlannerData: () => {
    console.log("🏪 Store - Clearing planner data");
    set({ plannerData: null });
  },
}));
