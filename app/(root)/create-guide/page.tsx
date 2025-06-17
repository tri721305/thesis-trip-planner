"use client";

import TitleCard from "@/components/cards/TitleCard";
import GuideContent from "@/components/GuideContent";
import GuideHeader from "@/components/GuideHeader";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { InputFile } from "@/components/upload/UploadImg";
import React from "react";

const page = () => {
  return (
    <div className="overflow-y-auto px-6 border-none">
      <GuideHeader />
      <GuideContent />
      <Separator className="my-4" />
    </div>
  );
};

export default page;
