import HomeFilter from "@/components/filters/HomeFilter";
import LocalSearch from "@/components/search/LocalSearch";
import { InputFile } from "@/components/upload/UploadImg";
import { handleError } from "@/lib/handler/error";
import { NotFoundError, ValidationError } from "@/lib/http-errors";
import React from "react";

const plans = [
  {
    _id: 1,
    name: "Đà Lạt 072025",
    description: "Đà Lạt 4 ngày 3 đêm từ Sài Gòn ",
    img: "",
    tags: [
      {
        _id: 1,
        name: "Đà Lạt",
      },
      {
        _id: 2,
        name: "Sài Gòn",
      },
    ],
    author: { _id: 1, name: "Đặng Hoàng Minh Trí" },
    views: 500,
    upvote: 100,
    downvote: 5,
    createAt: new Date(),
  },
  {
    _id: 2,
    name: "Vũng Tàu 072025",
    description: "Vùng Tàu 4 ngày 3 đêm từ Sài Gòn ",
    img: "",
    tags: [
      {
        _id: 3,
        name: "Vũng Tàu",
      },
      {
        _id: 2,
        name: "Sài Gòn",
      },
    ],
    author: { _id: 1, name: "Đặng Hoàng Minh Trí" },
    views: 500,
    upvote: 100,
    downvote: 5,
    createAt: new Date(),
  },
];

interface SearchParams {
  searchParams: Promise<{ [key: string]: string }>;
}

const Page = async ({ searchParams }: SearchParams) => {
  const { query = "", filter = "" } = await searchParams;

  const filteredQuestions = plans.filter((plan) => {
    const matchesQuery = plan.name.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter
      ? plan.tags.some((tag) => tag.name.toLowerCase() === filter.toLowerCase())
      : true;

    return matchesQuery && matchesFilter;
  });
  console.log("query", query, "filter", filter);
  return (
    <div className="px-8">
      {filteredQuestions.map((plan) => plan.name)}
      <LocalSearch
        imgSrc="/icons/search.svg"
        placeholder="Search planners..."
        otherClasses="flex-1"
        route="/planners"
      />
      <HomeFilter />
      <InputFile />
    </div>
  );
};

export default Page;
