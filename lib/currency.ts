// lib/currency.ts
export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  decimals: number;
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  vnd: {
    code: "VND",
    symbol: "₫",
    name: "Vietnamese Dong",
    locale: "vi-VN",
    decimals: 0,
  },
  usd: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    locale: "en-US",
    decimals: 2,
  },
  eur: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    locale: "de-DE",
    decimals: 2,
  },
  mad: {
    code: "MAD",
    symbol: "DH",
    name: "Moroccan Dirham",
    locale: "ar-MA",
    decimals: 2,
  },
};

// Format currency amount
export const formatCurrency = (
  amount: number | string,
  currencyCode: string = "vnd",
  options?: {
    showSymbol?: boolean;
    showCode?: boolean;
    compact?: boolean;
    hideDecimals?: boolean;
  }
): string => {
  const {
    showSymbol = true,
    showCode = false,
    compact = false,
    hideDecimals = false,
  } = options || {};

  const numAmount =
    typeof amount === "string" ? parseFloat(amount) || 0 : amount;
  const currency = CURRENCIES[currencyCode.toLowerCase()] || CURRENCIES.vnd;

  // Compact formatting (1.2M, 1.5K, etc.)
  if (compact) {
    return formatCompactCurrency(numAmount, currency, showSymbol);
  }

  // Regular formatting
  const decimals = hideDecimals ? 0 : currency.decimals;

  try {
    const formatted = new Intl.NumberFormat(currency.locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(numAmount);

    // Build result
    let result = formatted;

    if (showSymbol && showCode) {
      result = `${currency.symbol}${formatted} ${currency.code}`;
    } else if (showSymbol) {
      result = `${currency.symbol}${formatted}`;
    } else if (showCode) {
      result = `${formatted} ${currency.code}`;
    }

    return result;
  } catch (error) {
    console.error("Currency formatting error:", error);
    return `${currency.symbol}${numAmount}`;
  }
};

// Compact formatting helper
const formatCompactCurrency = (
  amount: number,
  currency: CurrencyConfig,
  showSymbol: boolean
): string => {
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
  const symbol = showSymbol ? currency.symbol : "";

  return `${sign}${symbol}${formatted}${suffix}`;
};

// Parse currency string back to number
export const parseCurrency = (
  currencyString: string,
  currencyCode: string = "vnd"
): number => {
  if (!currencyString || typeof currencyString !== "string") return 0;

  const currency = CURRENCIES[currencyCode.toLowerCase()] || CURRENCIES.vnd;

  // Remove currency symbols and text
  let cleaned = currencyString
    .replace(new RegExp(`[${currency.symbol}${currency.code}\\s]`, "gi"), "")
    .replace(/[,\s]/g, "");

  // Handle compact suffixes
  const lastChar = cleaned.slice(-1).toLowerCase();
  if (["k", "m", "b"].includes(lastChar)) {
    const baseValue = parseFloat(cleaned.slice(0, -1));
    const multiplier =
      lastChar === "k" ? 1000 : lastChar === "m" ? 1000000 : 1000000000;
    return baseValue * multiplier;
  }

  return parseFloat(cleaned) || 0;
};

// Validate currency amount
export const isValidCurrency = (
  amount: string | number,
  currencyCode: string = "vnd"
): boolean => {
  const num =
    typeof amount === "string" ? parseCurrency(amount, currencyCode) : amount;
  return !isNaN(num) && num >= 0;
};

// Format input while typing
export const formatCurrencyInput = (
  input: string,
  currencyCode: string = "vnd"
): string => {
  const currency = CURRENCIES[currencyCode.toLowerCase()] || CURRENCIES.vnd;

  // Remove non-numeric characters except decimal point
  const cleanInput = input.replace(/[^\d.]/g, "");

  // Handle decimal places
  const parts = cleanInput.split(".");
  if (parts.length > 2) {
    return parts[0] + "." + parts.slice(1).join("");
  }

  // Limit decimal places
  if (parts[1] && parts[1].length > currency.decimals) {
    parts[1] = parts[1].substring(0, currency.decimals);
  }

  const result = parts.join(".");
  return result;
};

// Get currency exchange rates (mock for now)
export const getExchangeRate = async (
  from: string,
  to: string
): Promise<number> => {
  // Mock exchange rates - replace with real API
  const mockRates: Record<string, Record<string, number>> = {
    vnd: { usd: 0.000041, eur: 0.000038, mad: 0.00041 },
    usd: { vnd: 24390, eur: 0.92, mad: 10.1 },
    eur: { vnd: 26510, usd: 1.09, mad: 11.0 },
    mad: { vnd: 2439, usd: 0.099, eur: 0.091 },
  };

  return mockRates[from]?.[to] || 1;
};

// Convert between currencies
export const convertCurrency = async (
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> => {
  if (fromCurrency === toCurrency) return amount;

  const rate = await getExchangeRate(fromCurrency, toCurrency);
  return amount * rate;
};
