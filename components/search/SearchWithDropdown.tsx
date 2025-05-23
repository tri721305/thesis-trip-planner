"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useRef, useState } from "react";
import { Input } from "../ui/input";
import GlobalResult from "../GlobalResult";
import { FaMapMarkerAlt, FaMarker } from "react-icons/fa";

interface Props {
  placeholder?: string;
  icon?: React.ReactNode;
}

const SearchWithDropdown = (props: Props) => {
  const { placeholder, icon } = props;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = searchParams.get("global");

  const [search, setSearch] = useState(query || "");
  const [isOpen, setIsOpen] = useState(query || false);
  const searchContainerRef = useRef(null);

  return (
    <div
      className="relative w-full max-w-[600px] max-lg:hidden"
      ref={searchContainerRef}
    >
      <div className="background-light800_darkgradient relative flex min-h-[56px] grow items-center gap-1 rounded-xl px-4">
        {icon ? (
          icon
        ) : (
          <FaMapMarkerAlt size={24} className="cursor-pointer text-[#7c8fc8]" />
        )}
        <Input
          type="text"
          //   placeholder="Search anything globally..."
          placeholder={placeholder || "Search ..."}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
            if (e.target.value === "" && isOpen) setIsOpen(false);
          }}
          className="paragraph-regular no-focus placeholder text-dark400_light700 border-none shadow-none outline-none"
        />
      </div>
      {isOpen && <GlobalResult />}
    </div>
  );
};

export default SearchWithDropdown;
