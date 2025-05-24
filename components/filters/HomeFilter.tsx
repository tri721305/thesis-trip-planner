"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/url";

const filters = [
  { name: "Newest", value: "newest" },
  {
    name: "Popular",
    value: "popular",
  },
  {
    name: "Recommended",
    value: "recommended",
  },
  {
    name: "Đà Lạt",
    value: "Đà Lạt",
  },
];

const HomeFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterParams = searchParams.get("filter");

  const [active, setActive] = useState(filterParams || "");

  const handleTypeClick = (filter: string) => {
    let newUrl = "";
    if (filter !== active) {
      setActive(filter);

      newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "filter",
        value: filter,
      });
    } else {
      setActive("");

      newUrl = removeKeysFromQuery({
        params: searchParams.toString(),
        keysToRemove: ["filter"],
      });
    }

    router.push(newUrl, { scroll: false });
  };
  return (
    <div className="mt-4 hidden flex-wrap gap-2 sm:flex">
      {filters.map((filter) => (
        <Button
          className={cn(
            `body-medium capitalize shadow-none`,
            active === filter.value
              ? "bg-primary-100 text-primary-500 hover:bg-primary-100 dark:bg-dark-400 dark:text-primary-500 dark:hover:bg-dark-400"
              : "bg-light-800 text-light-500 hover:bg-light-800 dark:bg-dark-300 dark:text-light-500 dark:hover:bg-dark-300"
          )}
          key={filter.name}
          onClick={() => {
            handleTypeClick(filter.value);
          }}
        >
          {filter.name}
        </Button>
      ))}
    </div>
  );
};

export default HomeFilter;
