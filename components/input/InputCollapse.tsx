import React from "react";
import { FaChevronRight, FaChevronDown } from "react-icons/fa6";

import { FaPen } from "react-icons/fa";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import InputWithIcon from "./InputIcon";
const InputCollapse = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="flex w-full  flex-col gap-2"
    >
      <div className="flex items-center justify-between gap-4 px-4">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            {!isOpen ? <FaChevronRight /> : <FaChevronDown />}
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
        <InputWithIcon
          //   className="text-[20px] border-none shadow-none"
          icon={<FaPen className="text-gray-600" size={14} />}
          placeholder="Test"
          className="paragraph-regular no-focus placeholder text-dark400_light700 border-none shadow-none !font-bold outline-none"
        />
      </div>

      <CollapsibleContent className="flex flex-col gap-2">
        <Input
          className=" border-none paragraph-regular background-light800_dark300 light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border"
          placeholder="Write or paste anything here: how to get around, tips and tricks"
        />
      </CollapsibleContent>
    </Collapsible>
  );
};

export default InputCollapse;
