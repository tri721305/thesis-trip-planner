// hooks/useHotelSelection.ts
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback } from "react";

export const useHotelSelection = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const addHotelToLodging = useCallback(
    (hotelData: any) => {
      const params = new URLSearchParams(searchParams);

      params.set("selectedHotel", JSON.stringify(hotelData));
      params.set("action", "addLodging");

      router.push(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  const clearHotelSelection = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.delete("selectedHotel");
    params.delete("action");
    router.push(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  const getSelectedHotel = useCallback(() => {
    const selectedHotelParam = searchParams.get("selectedHotel");
    const actionParam = searchParams.get("action");

    if (selectedHotelParam && actionParam === "addLodging") {
      try {
        return JSON.parse(selectedHotelParam);
      } catch {
        return null;
      }
    }
    return null;
  }, [searchParams]);

  return {
    addHotelToLodging,
    clearHotelSelection,
    getSelectedHotel,
  };
};
