"use client";

import React from "react";
import { CurrencyDisplay } from "./CurrencyDisplay";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PriceItem {
  label: string;
  amount: number;
  tooltip?: string;
  isTotal?: boolean;
  isDiscount?: boolean;
  isStrikethrough?: boolean;
}

interface PriceBreakdownProps {
  items: PriceItem[];
  currency: string;
  className?: string;
}

const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  items,
  currency,
  className = "",
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {items.map((item, index) => (
        <div
          key={`price-item-${index}`}
          className={`flex justify-between items-center ${item.isTotal ? "font-bold pt-2 border-t mt-1" : ""}`}
        >
          <div className="flex items-center gap-1">
            <span className={item.isDiscount ? "text-green-600" : ""}>
              {item.label}
            </span>
            {item.tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle size={14} className="text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-sm">{item.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className={`${item.isDiscount ? "text-green-600" : ""}`}>
            {item.isStrikethrough ? (
              <span className="line-through text-gray-500">
                <CurrencyDisplay
                  amount={item.amount}
                  currency={currency}
                  colorize={false}
                />
              </span>
            ) : (
              <CurrencyDisplay
                amount={item.amount}
                currency={currency}
                colorize={item.isDiscount}
                variant={item.isTotal ? "large" : "default"}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PriceBreakdown;
