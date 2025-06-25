import React, { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FaChevronDown, FaChevronRight } from "react-icons/fa6";
import { Button } from "./ui/button";
const Collaps = ({
  itemTrigger,
  itemExpand,
  titleFeature,
}: {
  itemTrigger?: React.ReactNode;
  itemExpand: React.ReactNode;
  titleFeature: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  console.log("isOpen", isOpen);
  return (
    <Collapsible
      className="flex w-full flex-col gap-2"
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <div className="flex items-center  gap-4 px-4">
        <CollapsibleTrigger asChild={true}>
          <Button variant="ghost" size="icon" className="size-8 font-medium">
            {itemTrigger ? (
              itemTrigger
            ) : !isOpen ? (
              <FaChevronRight />
            ) : (
              <FaChevronDown />
            )}
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
        {titleFeature}
      </div>
      <CollapsibleContent className="">{itemExpand}</CollapsibleContent>
    </Collapsible>
  );
};

export default Collaps;
