import React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SelectCus = (params: any) => {
  return (
    <Select value={params?.value} onValueChange={params?.onChange}>
      <SelectTrigger className="w-fit border-none shadow-none">
        <SelectValue placeholder="All" />
      </SelectTrigger>
      <SelectContent>
        {params?.items?.map((item: any) => (
          <SelectItem key={item?.value} value={item?.value}>
            {item?.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SelectCus;
