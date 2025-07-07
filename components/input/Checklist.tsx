import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { LucideDot, Plus, X } from "lucide-react";
import { MdChecklist } from "react-icons/md";
import InputWithIcon from "./InputIcon";
import { Separator } from "../ui/separator";
import { PiBagFill } from "react-icons/pi";
interface ChecklistComponentProps {
  items: string[];
  onChange: (items: string[]) => void;
  onRemove: () => void;
  className?: string;
}
const Checklist: React.FC<ChecklistComponentProps> = ({
  items,
  onChange,
  onRemove,
  className,
}) => {
  const [newItem, setNewItem] = useState("");

  const addItem = () => {
    if (newItem.trim()) {
      const updatedItems = [...items, newItem.trim()];
      onChange(updatedItems);
      setNewItem("");
    }
  };

  const removeItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    onChange(updatedItems);
  };

  const updateItem = (index: number, value: string) => {
    const updatedItems = [...items];
    updatedItems[index] = value;
    onChange(updatedItems);
  };
  return (
    <div className={`background-form rounded-xl py-4 ${className}`}>
      <div className="flex items-center justify-between px-4 mb-3">
        <div className="flex items-center gap-2">
          <span className="font-bold">Checklist ( {items.length} )</span>
        </div>
      </div>

      {/* Existing Items */}
      <div className="space-y-2 px-4 mb-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {/* <div className="w-4 h-4 border border-gray-300 rounded"></div> */}
            <LucideDot />
            <Input
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              className="flex-1 !border-none !shadow-none  bg-transparent no-focus"
              //   className="!min-h-[36px] border-none paragraph-regular light-border-2 text-dark300_light700 no-focus rounded-1.5 border background-form-input"
              placeholder="Checklist item"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeItem(index)}
              className="text-light800_dark300"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add New Item */}
      <div className="flex  items-center pr-4">
        {/* <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <MdChecklist />
          </div> */}
        <InputWithIcon
          //   icon={<MdChecklist />}
          value={newItem}
          className="background-form-input no-focus"
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add checklist item here"
          onKeyPress={(e: any) => e.key === "Enter" && addItem()}
        />
        <Button onClick={addItem} disabled={!newItem.trim()}>
          <Plus className="" />
        </Button>
      </div>
      <div className="flex items-start justify-center px-4 flex-col">
        <Separator className="my-4 " />
        <Button>
          <PiBagFill /> Pre-made lists
        </Button>
      </div>
    </div>
  );
};

export default Checklist;
