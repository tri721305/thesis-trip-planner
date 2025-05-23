import LocalSearch from "@/components/search/LocalSearch";
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
  const { query = "" } = await searchParams;

  const filteredQuestions = plans.filter((plan) =>
    plan.name.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <div className="px-8">
      {filteredQuestions.map((plan) => plan.name)}
      <LocalSearch
        imgSrc="/icons/search.svg"
        placeholder="Search planners..."
        otherClasses="flex-1"
        route="/planners"
      />
    </div>
  );
};

export default Page;
