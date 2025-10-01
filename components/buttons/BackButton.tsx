"use client";

import { Button } from "@/components/ui/button";
import { IoMdClose } from "react-icons/io";

export default function BackButton() {
  const handleBack = () => {
    window.history.back();
  };

  return (
    <Button
      size="icon"
      className="rounded-full bg-gray-200"
      variant="ghost"
      onClick={handleBack}
    >
      <IoMdClose />
    </Button>
  );
}
