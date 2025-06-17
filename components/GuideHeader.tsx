import Image from "next/image";
import React from "react";

const GuideHeader = () => {
  return (
    <div className="h-[400px] relative !pt-10">
      <Image alt="image-places" src="/images/ocean.jpg" fill />
      <div
        className="bg-white rounded-[8px] bottom-[-75px] left-[32px]
      ml-auo mr-auto min-h-[160px] p-[16px] absolute right-[32px] shadow-lg flex flex-col justify-between
      "
      >
        Guide header header
      </div>
    </div>
  );
};

export default GuideHeader;
