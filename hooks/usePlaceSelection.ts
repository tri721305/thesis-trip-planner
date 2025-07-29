"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback } from "react";

export const usePlaceSelection = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const addPlaceToItinerary = useCallback(
    (placeData: any) => {
      const params = new URLSearchParams(searchParams);

      params.set("selectedPlace", JSON.stringify(placeData));
      params.set("action", "addAttraction");

      router.push(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  const clearPlaceSelection = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.delete("selectedPlace");
    params.delete("action");
    router.push(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  const getSelectedPlace = useCallback(() => {
    const selectedPlaceParam = searchParams.get("selectedPlace");
    const actionParam = searchParams.get("action");

    if (selectedPlaceParam && actionParam === "addAttraction") {
      try {
        return JSON.parse(selectedPlaceParam);
      } catch {
        return null;
      }
    }
    return null;
  }, [searchParams]);

  return {
    addPlaceToItinerary,
    clearPlaceSelection,
    getSelectedPlace,
  };
};
