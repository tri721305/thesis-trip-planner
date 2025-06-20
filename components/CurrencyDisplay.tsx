// components/ui/CurrencyDisplay.tsx
import React from "react";
import { formatCurrency, CURRENCIES } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface CurrencyDisplayProps {
  amount: number | string;
  currency?: string;
  variant?: "default" | "compact" | "large" | "minimal";
  showSymbol?: boolean;
  showCode?: boolean;
  className?: string;
  colorize?: boolean;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  currency = "vnd",
  variant = "default",
  showSymbol = true,
  showCode = false,
  className,
  colorize = true,
}) => {
  const numAmount =
    typeof amount === "string" ? parseFloat(amount) || 0 : amount;

  if (numAmount === 0) {
    return <span className={cn("text-gray-400", className)}>-</span>;
  }

  const formatOptions = {
    showSymbol,
    showCode,
    compact: variant === "compact",
    hideDecimals: variant === "minimal",
  };

  const formatted = formatCurrency(numAmount, currency, formatOptions);

  const getVariantStyles = () => {
    switch (variant) {
      case "compact":
        return "text-sm font-medium";
      case "large":
        return "text-lg font-bold";
      case "minimal":
        return "text-sm";
      default:
        return "text-base font-medium";
    }
  };

  const getColorStyles = () => {
    if (!colorize) return "";
    return numAmount > 0 ? "text-green-600" : "text-red-600";
  };

  return (
    <span className={cn(getVariantStyles(), getColorStyles(), className)}>
      {formatted}
    </span>
  );
};
