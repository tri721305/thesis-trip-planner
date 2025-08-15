"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "../ui/input";
import { getPlaces } from "@/lib/actions/place.action";
import { FaMapMarkerAlt, FaStar } from "react-icons/fa";
import TruncateText from "../typography/TruncateText";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useRouter, useSearchParams } from "next/navigation";

interface PlaceSearchProps {
  onPlaceSelect?: (place: any) => void;
  placeholder?: string;
  maxResults?: number;
}

const PlaceSearch = ({
  onPlaceSelect,
  placeholder = "Search attractions by name or location",
  maxResults = 5,
}: PlaceSearchProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [result, setResult] = useState([]);
  const searchContainerRef = useRef(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle place selection
  const handlePlaceSelect = (place: any) => {
    const placeData = {
      id: place._id,
      name: place.name || "",
      address: place.address?.fullAddress || "",
      description: place.description || place.generatedDescription || "",
      categories: place.categories || [],
      rating: place.rating || 0,
      numRatings: place.numRatings || 0,
      location: place.location,
      website: place.website || "",
      phone: place.internationalPhoneNumber || "",
      attractionId: place.attractionId,
      imageKeys: place.imageKeys || [],
      openingPeriods: place.openingPeriods || [],
      priceLevel: place.priceLevel,
    };
    console.log("handlePlaceSelect", placeData);
    // Call parent callback if provided
    if (onPlaceSelect) {
      onPlaceSelect(placeData);
    } else {
      // Default behavior: store in URL for other components to pick up
      const params = new URLSearchParams(searchParams);
      params.set("selectedPlace", JSON.stringify(placeData));
      params.set("action", "addAttraction");
      router.push(`?${params.toString()}`, { scroll: false });
    }

    // Close search
    setIsOpen(false);
    setSearch("");

    console.log("Place selected:", placeData);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        // @ts-expect-error Property 'contains' does not exist on type 'EventTarget | null'.
        !searchContainerRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setResult([]);
      setIsLoading(false);
      return;
    }

    setResult([]);
    setIsLoading(true);

    const delayDebounceFn = setTimeout(async () => {
      console.log("Searching places for:", search);

      try {
        const places: any = await getPlaces({
          page: 1,
          pageSize: maxResults,
          query: search,
          filter: JSON.stringify({
            sort: "rating", // Sort by rating for better results
          }),
        });

        if (places?.success && places?.data?.places) {
          setResult(places.data.places);
        } else {
          setResult([]);
        }
      } catch (error) {
        console.error("Error searching places:", error);
        setResult([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, maxResults]);

  const renderPlaceItem = (place: any) => (
    <div
      key={place._id || place.attractionId}
      className="cursor-pointer hover:bg-slate-200 flex items-start gap-3 rounded-md p-3 transition-colors"
      onClick={() => handlePlaceSelect(place)}
    >
      <FaMapMarkerAlt size={16} className="mt-1 text-blue-600 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm text-gray-900 truncate">
          {place.name}
        </h3>

        {place.address?.fullAddress && (
          <TruncateText
            text={place.address.fullAddress}
            className="text-xs text-gray-600 mt-1"
            maxLength={80}
          />
        )}

        <div className="flex items-center gap-2 mt-2">
          {place.rating && (
            <div className="flex items-center gap-1">
              <FaStar size={12} className="text-yellow-500" />
              <span className="text-xs text-gray-700">
                {place.rating.toFixed(1)}
                {place.numRatings && (
                  <span className="text-gray-500 ml-1">
                    ({place.numRatings.toLocaleString()})
                  </span>
                )}
              </span>
            </div>
          )}

          {place.categories && place.categories.length > 0 && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {place.categories[0]}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative w-full max-w-[600px]" ref={searchContainerRef}>
      <Input
        type="text"
        value={search}
        placeholder={placeholder}
        className="bg-[#f3f4f5] text-black  h-[56px] border-none outline-none no-focus pr-10"
        onChange={(e) => {
          setSearch(e.target.value);
          if (!isOpen && e.target.value.trim()) setIsOpen(true);
          if (e.target.value === "" && isOpen) setIsOpen(false);
        }}
      />

      {/* Search icon */}
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
        <FaMapMarkerAlt size={18} className="text-gray-400" />
      </div>

      {isOpen && search.trim() && (
        <div className="absolute top-full z-10 mt-3 w-full rounded-xl bg-white py-2 shadow-lg border border-gray-200 dark:bg-dark-400 dark:border-dark-300">
          {isLoading ? (
            <div className="flex-center flex-col px-5 py-8">
              <ReloadIcon className="my-2 h-8 w-8 animate-spin text-blue-500" />
              <p className="text-gray-600 text-sm">Searching attractions...</p>
            </div>
          ) : result.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Found {result.length} attraction
                  {result.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="py-1">{result.map(renderPlaceItem)}</div>
            </div>
          ) : (
            <div className="px-5 py-8 text-center">
              <FaMapMarkerAlt
                size={24}
                className="mx-auto text-gray-300 mb-2"
              />
              <p className="text-gray-500 text-sm">
                No attractions found for "{search}"
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Try searching for landmarks, museums, or tourist attractions
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlaceSearch;
