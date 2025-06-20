import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const formatVND = (
  amount: number | string,
  options?: {
    showCurrency?: boolean;
    showSymbol?: boolean;
    compact?: boolean;
    decimal?: number;
  }
): string => {
  const {
    showCurrency = true,
    showSymbol = false,
    compact = false,
    decimal = 0,
  } = options || {};

  // Convert string to number if needed
  const numAmount =
    typeof amount === "string" ? parseFloat(amount) || 0 : amount;

  // Handle compact format (1.2M, 1.5K, etc.)
  if (compact) {
    return formatCompactVND(numAmount, showSymbol);
  }

  // Format with thousand separators
  const formatted = new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: decimal,
    maximumFractionDigits: decimal,
  }).format(numAmount);

  // Add currency symbol/text
  if (showSymbol) {
    return `₫${formatted}`;
  } else if (showCurrency) {
    return `${formatted} VND`;
  } else {
    return formatted;
  }
};

// Compact format helper
const formatCompactVND = (amount: number, showSymbol: boolean): string => {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  let value: number;
  let suffix: string;

  if (absAmount >= 1_000_000_000) {
    value = absAmount / 1_000_000_000;
    suffix = "B";
  } else if (absAmount >= 1_000_000) {
    value = absAmount / 1_000_000;
    suffix = "M";
  } else if (absAmount >= 1_000) {
    value = absAmount / 1_000;
    suffix = "K";
  } else {
    value = absAmount;
    suffix = "";
  }

  const formatted = value % 1 === 0 ? value.toString() : value.toFixed(1);
  const currencySymbol = showSymbol ? "₫" : " VND";

  return `${sign}${showSymbol ? "₫" : ""}${formatted}${suffix}${!showSymbol ? " VND" : ""}`;
};

// Parse VND string back to number
export const parseVND = (vndString: string): number => {
  if (!vndString || typeof vndString !== "string") return 0;

  // Remove currency symbols and text
  const cleaned = vndString
    .replace(/[₫VND\s]/g, "")
    .replace(/[,\.]/g, (match) => (match === "." ? "." : ""));

  return parseFloat(cleaned) || 0;
};

// Validate VND amount
export const isValidVND = (amount: string | number): boolean => {
  const num = typeof amount === "string" ? parseVND(amount) : amount;
  return !isNaN(num) && num >= 0;
};
