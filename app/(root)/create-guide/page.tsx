"use client";

import TitleCard from "@/components/cards/TitleCard";
import GuideContent from "@/components/GuideContent";
import GuideHeader from "@/components/GuideHeader";
import Map from "@/components/Map";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { InputFile } from "@/components/upload/UploadImg";
import React from "react";

const page = () => {
  return (
    <div className="overflow-y-auto flex px-6 border-none">
      <div className="flex-1">
        <GuideHeader />
        <GuideContent />
        <Separator className="my-4" />
      </div>
      <div className="flex-1">{/* <Map /> */}</div>
    </div>
  );
};

export default page;
