"use client";

import Image from "next/image";
import { Input } from "../ui/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/url";

interface Props {
  route: string;
  imgSrc: string;
  placeholder: string;
  otherClasses?: string;
}

const LocalSearchInput = ({
  route,
  imgSrc,
  placeholder,
  otherClasses,
}: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  const [searchQuery, setSearchQuery] = useState(query);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery) {
        const newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "query",
          value: searchQuery,
        });
        console.log("newUrl", newUrl);
        router.push(newUrl, {
          scroll: false,
        });
      } else {
        if (pathname === route) {
          const newUrl = removeKeysFromQuery({
            params: searchParams.toString(),
            keysToRemove: ["query"],
          });

          router.push(newUrl, {
            scroll: false,
          });
        }
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, router, route, searchParams]);

  console.log("searchQuery", searchQuery);
  return (
    <div
      className={`background-light800_darkgradient
  flex min-h-[56px] items-center gap-4 rounded-[10px] px-4 ${otherClasses}`}
    >
      <Image
        src={imgSrc}
        width={24}
        height={24}
        className="cursor-pointer"
        alt="Search"
      />
      <Input
        type="text"
        placeholder={placeholder || "Search ..."}
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
        }}
        className="paragraph-regular no-focus placeholder:text-dark400_light700 border-none shadow-none outline-none"
      />
    </div>
  );
};

export default LocalSearchInput;
