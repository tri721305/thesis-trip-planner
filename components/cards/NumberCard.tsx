import React from "react";

const NumberCard = ({
  number,
  content,
}: {
  number: number;
  content: string;
}) => {
  return (
    <div className="flex gap-4 items-start justify-start">
      <h1 className="text-[2rem] font-extrabold">{number}</h1>
      <div className="max-w-[100px]">
        <h2 className="text-[1rem] font-bold">{content}</h2>
      </div>
    </div>
  );
};

export default NumberCard;
