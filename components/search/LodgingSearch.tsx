"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "../ui/input";
import { getHotels } from "@/lib/actions/hotel.action";
import { FaMapMarkerAlt } from "react-icons/fa";
import TruncateText from "../typography/TruncateText";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useHotelSelection } from "@/hooks/useHotelSelection";

const LodgingSearch = ({ onSelectHotel, value, onSearchChange, size }: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value || "");
  const [result, setResult] = useState([]);
  const searchContainerRef = useRef(null);

  const { addHotelToLodging } = useHotelSelection();

  // Sync with external value
  useEffect(() => {
    if (value !== undefined && value !== search) {
      setSearch(value);
    }
  }, [value]);

  // Handle hotel selection

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        // @ts-expect-error Property 'contains' does not exist on type 'EventTarget | null'.
        !searchContainerRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
        // Only clear search if no external value is provided
        if (!value) {
          setSearch("");
        }
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [value]);

  useEffect(() => {
    setResult([]);
    setIsLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      console.log("run Debounce", search);

      if (search) {
        const hotels: any = await getHotels({
          page: 1,
          pageSize: 3,
          query: search,
          // filter: "",
        });
        if (hotels?.success) {
          setResult(hotels?.data?.hotels);
        }
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  return (
    <div className="relative w-full  max-lg:hidden" ref={searchContainerRef}>
      <Input
        type="text"
        value={search}
        placeholder="Search by name or address"
        // className="bg-[#f3f4f5] h-[56px] border-none outline-none no-focus"
        className={`${size == "large" ? "!min-h-[56px]" : "!min-h-[36px]"} border-none paragraph-regular background-form-input light-border-2 text-dark300_light700 no-focus rounded-1.5 border`}
        onChange={(e) => {
          setSearch(e.target.value);
          onSearchChange?.(e.target.value); // Notify parent of search changes
          if (!isOpen) setIsOpen(true);
          if (e.target.value === "" && isOpen) setIsOpen(false);
        }}
      />
      {isOpen &&
        (isLoading ? (
          <div className="flex-center flex-col px-5">
            <ReloadIcon className="my-2 h-10 w-10 animate-spin text-primary-500" />
            <p className="text-dark200_light800 body-regular">
              Browsing the whole database..
            </p>
          </div>
        ) : (
          <div className="absolute top-full z-10 mt-3 w-full rounded-xl bg-light-800 py-5 shadow-sm dark:bg-dark-400">
            <div className="space-y-5 p-2">
              {result?.map((hotel: any) => (
                <div
                  key={hotel?.lodging?.name}
                  className="cursor-pointer hover:bg-slate-200 flex items-center gap-2 rounded-md p-2"
                  onClick={() => {
                    onSelectHotel(hotel);
                    setIsOpen(false);
                    // Don't clear search here, let parent handle it
                    // setSearch("");
                  }}
                >
                  <FaMapMarkerAlt size={20} />
                  <div className="flex-1">
                    <h2>{hotel?.lodging?.name}</h2>
                    <TruncateText
                      text={hotel?.lodging?.address}
                      className="text-[8px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
};

export default LodgingSearch;
