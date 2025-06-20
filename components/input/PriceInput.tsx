// components/input/PriceInput.tsx
"use client";

import { useState, useEffect, forwardRef } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, parseCurrency, CURRENCIES } from "@/lib/currency";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "../ui/input";

const currencies = [
  { value: "vnd", label: "VND", icon: "🇻🇳", symbol: "₫" },
  { value: "usd", label: "USD", icon: "🇺🇸", symbol: "$" },
  { value: "eur", label: "EUR", icon: "🇪🇺", symbol: "€" },
  { value: "mad", label: "MAD", icon: "🇲🇦", symbol: "DH" },
];

interface PriceInputProps {
  value?: { type: string; number: string } | string | number;
  onChange?: (value: { type: string; number: string }) => void;
  onValueChange?: (amount: number, currency: string) => void;
  defaultCurrency?: string;
  allowCurrencyChange?: boolean;
  compact?: boolean;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  displayFormatted?: boolean; // New prop to control formatting display
  showSymbolInInput?: boolean; // Show currency symbol inside input
}

const PriceInput = forwardRef<HTMLInputElement, PriceInputProps>(
  (
    {
      value,
      onChange,
      onValueChange,
      defaultCurrency = "vnd",
      allowCurrencyChange = true,
      compact = false,
      displayFormatted = true, // Default to true for formatted display
      showSymbolInInput = true,
      className,
      placeholder = "0",
      disabled = false,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const [currency, setCurrency] = useState(defaultCurrency);
    const [rawValue, setRawValue] = useState(""); // Store raw numeric value
    const [displayValue, setDisplayValue] = useState(""); // Store formatted display value
    const [isFocused, setIsFocused] = useState(false);

    const selectedCurrency = currencies.find((c) => c.value === currency);

    // Initialize values from props
    useEffect(() => {
      if (value) {
        let numericValue = 0;
        let currencyType = currency;

        if (typeof value === "object" && value.type && value.number) {
          currencyType = value.type;
          numericValue = parseFloat(value.number) || 0;
        } else if (typeof value === "string") {
          numericValue = parseCurrency(value, currency);
        } else if (typeof value === "number") {
          numericValue = value;
        }

        setCurrency(currencyType);
        setRawValue(numericValue.toString());

        // Set display value based on focus state and displayFormatted setting
        if (displayFormatted && !isFocused && numericValue > 0) {
          const formatted = formatCurrency(numericValue, currencyType, {
            showSymbol: false,
            compact,
          });
          setDisplayValue(formatted);
        } else {
          setDisplayValue(numericValue > 0 ? numericValue.toString() : "");
        }
      }
    }, [value, currency, compact, displayFormatted, isFocused]);

    // Format number with thousand separators while typing
    const formatWhileTyping = (inputValue: string) => {
      // Remove all non-digit characters except decimal point
      const cleanValue = inputValue.replace(/[^\d.]/g, "");

      // Split by decimal point
      const parts = cleanValue.split(".");

      // Add thousand separators to integer part
      if (parts[0]) {
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }

      // Rejoin with decimal point if exists
      return parts.join(".");
    };

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Remove currency symbols and get clean number
      const cleanValue = inputValue.replace(/[^\d.,]/g, "");
      const numericValue = parseCurrency(cleanValue, currency);

      // Store raw value
      setRawValue(numericValue.toString());

      // Set display value based on focus state and displayFormatted setting
      if (isFocused && displayFormatted) {
        // Show formatted number while typing (with thousand separators)
        setDisplayValue(formatWhileTyping(cleanValue));
      } else {
        setDisplayValue(cleanValue);
      }

      // Callbacks
      if (onChange) {
        onChange({
          type: currency,
          number: numericValue.toString(),
        });
      }

      if (onValueChange) {
        onValueChange(numericValue, currency);
      }
    };

    // Handle currency change
    const handleCurrencyChange = (newCurrency: string) => {
      setCurrency(newCurrency);
      setOpen(false);

      const numericValue = parseFloat(rawValue) || 0;

      if (onChange) {
        onChange({
          type: newCurrency,
          number: numericValue.toString(),
        });
      }

      if (onValueChange) {
        onValueChange(numericValue, newCurrency);
      }
    };

    // Handle focus
    const handleFocus = () => {
      setIsFocused(true);

      // Show raw number or formatted number while typing
      const numericValue = parseFloat(rawValue) || 0;
      if (displayFormatted && numericValue > 0) {
        setDisplayValue(formatWhileTyping(numericValue.toString()));
      } else {
        setDisplayValue(rawValue);
      }
    };

    // Handle blur
    const handleBlur = () => {
      setIsFocused(false);

      // Show fully formatted value when not focused
      const numericValue = parseFloat(rawValue) || 0;
      if (displayFormatted && numericValue > 0) {
        const formatted = formatCurrency(numericValue, currency, {
          showSymbol: false,
          compact,
        });
        setDisplayValue(formatted);
      } else {
        setDisplayValue(numericValue > 0 ? numericValue.toString() : "");
      }
    };

    // Get the value to display in input
    const getInputDisplayValue = () => {
      if (!displayValue) return "";

      if (showSymbolInInput && selectedCurrency && displayValue) {
        return `${selectedCurrency.symbol}${displayValue}`;
      }

      return displayValue;
    };

    return (
      <div className="space-y-1">
        <div
          className={cn(
            "flex items-center bg-background text-sm shadow-sm ring-offset-background transition-colors",
            "focus-within:ring-2 focus-within:ring-ring/20",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
        >
          {/* Currency Symbol (if not shown in input) */}
          {!showSymbolInInput && selectedCurrency && (
            <div className="flex-center h-[36px] w-[36px]">
              <span className="pl-3 pr-1 text-muted-foreground">
                {selectedCurrency.symbol}
              </span>
            </div>
          )}

          {/* Amount Input */}
          <Input
            ref={ref}
            type="text"
            inputMode="decimal"
            placeholder={
              showSymbolInInput && selectedCurrency
                ? `${selectedCurrency.symbol}${placeholder}`
                : placeholder
            }
            value={getInputDisplayValue()}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            className={cn(
              "border-none shadow-none bg-transparent outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
              showSymbolInInput ? "text-left" : "text-right"
            )}
            {...props}
          />

          {/* Separator */}
          {allowCurrencyChange && (
            <>
              <div className="h-5 w-px bg-border mx-1" />

              {/* Currency Selector */}
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger className="border-l" asChild>
                  <button
                    type="button"
                    disabled={disabled}
                    className="flex h-9 items-center gap-2 px-3 text-sm focus:outline-none disabled:cursor-not-allowed"
                  >
                    <span className="flex items-center gap-2">
                      <span>{selectedCurrency?.icon}</span>
                      {selectedCurrency?.label}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[180px] p-0">
                  <Command>
                    <CommandInput placeholder="Search currency..." />
                    <CommandList>
                      <CommandEmpty>No currency found.</CommandEmpty>
                      <CommandGroup>
                        {currencies.map((c) => (
                          <CommandItem
                            key={c.value}
                            value={c.value}
                            onSelect={handleCurrencyChange}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                currency === c.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <span className="mr-2">{c.icon}</span>
                            {c.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </>
          )}
        </div>

        {/* Formatted Preview (when not showing symbol in input) */}
        {!showSymbolInInput && !isFocused && parseFloat(rawValue) > 0 && (
          <div className="text-xs text-muted-foreground pl-2">
            {formatCurrency(parseFloat(rawValue), currency, {
              showSymbol: true,
              compact,
            })}
          </div>
        )}
      </div>
    );
  }
);

PriceInput.displayName = "PriceInput";

export default PriceInput;
