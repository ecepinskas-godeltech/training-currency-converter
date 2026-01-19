import { Currency } from "@/types";

// Validation constants
export const VALIDATION_LIMITS = {
  MIN_AMOUNT: 0,
  MAX_AMOUNT: 1000000000,
  DEFAULT_DECIMALS: 2,
} as const;

// Validation result type for better type safety
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// List of supported currencies with their details
export const CURRENCIES: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "MXN", name: "Mexican Peso", symbol: "$" },
];

/**
 * Get currency by code
 * @param code - Currency code (e.g., 'USD', 'EUR')
 * @returns Currency object if found, undefined otherwise
 */
export function getCurrencyByCode(code: string): Currency | undefined {
  return CURRENCIES.find((currency) => currency.code === code);
}

/**
 * Check if a currency code is valid
 * @param code - Currency code to validate
 * @returns True if the currency code exists in supported currencies
 */
export function isValidCurrencyCode(code: string): boolean {
  return CURRENCIES.some((currency) => currency.code === code);
}

/**
 * Sanitize currency code to prevent injection
 * @param code - Currency code to sanitize
 * @returns Sanitized currency code
 * @throws Error if code format is invalid
 */
export function sanitizeCurrencyCode(code: string): string {
  if (typeof code !== "string") {
    throw new Error("Currency code must be a string");
  }

  // Only allow 3 uppercase letters
  const sanitized = code
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 3);

  if (sanitized.length !== 3) {
    throw new Error("Invalid currency code format");
  }

  // Verify it's a supported currency
  if (!isValidCurrencyCode(sanitized)) {
    throw new Error(`Unsupported currency code: ${sanitized}`);
  }

  return sanitized;
}

/**
 * Format amount with proper decimal places
 * @param amount - The numeric amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted amount as string
 */
export function formatAmount(
  amount: number,
  decimals: number = VALIDATION_LIMITS.DEFAULT_DECIMALS,
): string {
  return amount.toFixed(decimals);
}

/**
 * Parse string input to number safely
 * @param value - String value to parse
 * @returns Parsed number or NaN if invalid
 */
export function parseAmountSafely(value: string): number {
  const trimmed = value.trim();
  return trimmed === "" ? NaN : parseFloat(trimmed);
}

/**
 * Convert amount from one currency to another
 * @param amount - Amount to convert
 * @param fromRate - Exchange rate of the source currency
 * @param toRate - Exchange rate of the target currency
 * @returns Converted amount
 */
export function convertCurrency(
  amount: number,
  fromRate: number,
  toRate: number,
): number {
  // Convert to base currency first, then to target currency
  const baseAmount = amount / fromRate;
  return baseAmount * toRate;
}

/**
 * Calculate exchange rate between two currencies
 * @param fromRate - Exchange rate of the source currency
 * @param toRate - Exchange rate of the target currency
 * @returns Direct exchange rate from source to target
 */
export function calculateExchangeRate(
  fromRate: number,
  toRate: number,
): number {
  return toRate / fromRate;
}

/**
 * Format currency display with symbol or code
 * @param amount - Amount to format
 * @param currencyCode - Currency code (e.g., 'USD')
 * @returns Formatted string with currency symbol and amount
 */
export function formatCurrencyDisplay(
  amount: number,
  currencyCode: string,
): string {
  const currency = getCurrencyByCode(currencyCode);
  const formattedAmount = formatAmount(amount);

  if (currency) {
    return `${currency.symbol}${formattedAmount}`;
  }

  return `${currencyCode} ${formattedAmount}`;
}

/**
 * Get currency symbol for a given currency code
 * @param currencyCode - Currency code (e.g., 'USD')
 * @returns Currency symbol or the code itself if not found
 */
export function getCurrencySymbol(currencyCode: string): string {
  const currency = getCurrencyByCode(currencyCode);
  return currency ? currency.symbol : currencyCode;
}

/**
 * Check if amount is within valid range
 * @param amount - Numeric amount to check
 * @returns True if amount is within valid range
 */
export function isAmountInRange(amount: number): boolean {
  return (
    amount > VALIDATION_LIMITS.MIN_AMOUNT &&
    amount <= VALIDATION_LIMITS.MAX_AMOUNT
  );
}

/**
 * Validate amount input
 * @param value - String value to validate
 * @returns Validation result with error message if invalid
 */
export function validateAmount(value: string): ValidationResult {
  if (!value || value.trim() === "") {
    return { isValid: false, error: "Please enter an amount" };
  }

  const numValue = parseAmountSafely(value);

  if (isNaN(numValue)) {
    return { isValid: false, error: "Please enter a valid number" };
  }

  if (numValue <= VALIDATION_LIMITS.MIN_AMOUNT) {
    return { isValid: false, error: "Amount must be greater than zero" };
  }

  if (numValue > VALIDATION_LIMITS.MAX_AMOUNT) {
    return { isValid: false, error: "Amount is too large" };
  }

  return { isValid: true };
}
