// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import { Input } from "../ui/input";
// import { getHotels } from "@/lib/actions/hotel.action";
// import { FaMapMarkerAlt } from "react-icons/fa";
// import TruncateText from "../typography/TruncateText";
// import { ReloadIcon } from "@radix-ui/react-icons";

// const HotelSearch = () => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [isOpen, setIsOpen] = useState(false);
//   const [search, setSearch] = useState("");
//   const [result, setResult] = useState([]);
//   const searchContainerRef = useRef(null);
//   useEffect(() => {
//     const handleOutsideClick = (event: MouseEvent) => {
//       if (
//         searchContainerRef.current &&
//         // @ts-expect-error Property 'contains' does not exist on type 'EventTarget | null'.
//         !searchContainerRef.current?.contains(event.target)
//       ) {
//         setIsOpen(false);
//         setSearch("");
//       }
//     };

//     document.addEventListener("click", handleOutsideClick);

//     return () => {
//       document.removeEventListener("click", handleOutsideClick);
//     };
//   }, []);

//   useEffect(() => {
//     setResult([]);
//     setIsLoading(true);
//     const delayDebounceFn = setTimeout(async () => {
//       console.log("run Debounce", search);

//       if (search) {
//         const hotels: any = await getHotels({
//           page: 1,
//           pageSize: 3,
//           query: search,
//           filter: "",
//         });
//         if (hotels?.success) {
//           setResult(hotels?.data?.hotels);
//         }
//         setIsLoading(false);
//       }
//     }, 300);

//     return () => clearTimeout(delayDebounceFn);
//   }, [search]);

//   return (
//     <div
//       className="relative w-full max-w-[600px] max-lg:hidden"
//       ref={searchContainerRef}
//     >
//       <Input
//         type="text"
//         value={search}
//         placeholder="Search by name or address"
//         className="bg-[#f3f4f5] h-[56px] border-none outline-none no-focus"
//         onChange={(e) => {
//           setSearch(e.target.value);
//           if (!isOpen) setIsOpen(true);
//           if (e.target.value === "" && isOpen) setIsOpen(false);
//         }}
//       />
//       {isOpen &&
//         (isLoading ? (
//           <div className="flex-center flex-col px-5">
//             <ReloadIcon className="my-2 h-10 w-10 animate-spin text-primary-500" />
//             <p className="text-dark200_light800 body-regular">
//               Browsing the whole database..
//             </p>
//           </div>
//         ) : (
//           <div className="absolute top-full z-10 mt-3 w-full rounded-xl bg-light-800 py-5 shadow-sm dark:bg-dark-400">
//             {/* <div className="my-5 h-[1px] bg-light-700/50 dark:bg-dark-500/50" /> */}

//             <div className="space-y-5 p-2">
//               {result?.map((hotel: any) => (
//                 <div
//                   key={hotel?.lodging?.name}
//                   className="cursor-pointer hover:bg-slate-200 flex items-center gap-2  rounded-md p-2"
//                   onClick={() => {
//                     console.log("item", hotel);
//                   }}
//                 >
//                   <FaMapMarkerAlt size={20} />
//                   <div className="flex-1">
//                     <h2>{hotel?.lodging?.name}</h2>
//                     {/* <p className="text-[8px]">{hotel?.lodging?.address}</p> */}
//                     <TruncateText
//                       text={hotel?.lodging?.address}
//                       className="text-[8px]"
//                     />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         ))}
//     </div>
//   );
// };

// export default HotelSearch;

// ======================================================

// components/search/HotelSearch.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "../ui/input";
import { getHotels } from "@/lib/actions/hotel.action";
import { FaMapMarkerAlt } from "react-icons/fa";
import TruncateText from "../typography/TruncateText";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useHotelSelection } from "@/hooks/useHotelSelection";

const HotelSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [result, setResult] = useState([]);
  const searchContainerRef = useRef(null);

  const { addHotelToLodging } = useHotelSelection();

  // Handle hotel selection
  const handleHotelSelect = (hotel: any) => {
    console.log("Selected hotel:", hotel);
    const hotelData = {
      name: hotel?.lodging?.name || "",
      address: hotel?.lodging?.address || "",
      checkin: "",
      checkout: "",
      note: "",
      confirmation: "",
      cost: {
        type: "VND",
        number: hotel?.priceRate?.amount,
      },
      // Include additional data that might be useful
      coordinates: hotel?.lodging?.coordinates,
      hotelId: hotel?._id,
    };

    addHotelToLodging(hotelData);
    setIsOpen(false);
    setSearch("");

    console.log("Hotel selected:", hotelData);
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
    setResult([]);
    setIsLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      console.log("run Debounce", search);

      if (search) {
        const hotels: any = await getHotels({
          page: 1,
          pageSize: 3,
          query: search,
          filter: "",
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
    <div
      className="relative w-full max-w-[600px] max-lg:hidden"
      ref={searchContainerRef}
    >
      <Input
        type="text"
        value={search}
        placeholder="Search by name or address"
        className="bg-[#f3f4f5] h-[56px] border-none outline-none no-focus"
        onChange={(e) => {
          setSearch(e.target.value);
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
                  onClick={() => handleHotelSelect(hotel)}
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

export default HotelSearch;
