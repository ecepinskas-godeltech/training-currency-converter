import { ConversionHistory, ConversionResult, Currency } from "@/types";

const STORAGE_KEY = "currency_converter_history";
const MAX_HISTORY_ITEMS = 10;

// Key for storing favorite currencies
export const FAVORITES_STORAGE_KEY = "currency_favorites";
export const MAX_FAVORITES = 5;

/**
 * Validates if a value is a valid conversion result
 */
function isValidConversionResult(entry: any): entry is ConversionResult {
  return (
    entry &&
    typeof entry === "object" &&
    typeof entry.from === "string" &&
    typeof entry.to === "string" &&
    typeof entry.amount === "number" &&
    typeof entry.result === "number" &&
    typeof entry.rate === "number" &&
    typeof entry.timestamp === "number" &&
    !isNaN(entry.amount) &&
    !isNaN(entry.result) &&
    !isNaN(entry.rate) &&
    entry.amount > 0 &&
    entry.result > 0 &&
    entry.rate > 0 &&
    entry.from.length === 3 &&
    entry.to.length === 3 &&
    /^[A-Z]{3}$/.test(entry.from) &&
    /^[A-Z]{3}$/.test(entry.to) &&
    entry.timestamp > 0 &&
    entry.timestamp <= Date.now()
  );
}

/**
 * Validates if a value is a valid currency code
 */
function isValidCurrencyCode(code: any): code is string {
  return (
    typeof code === "string" && code.length === 3 && /^[A-Z]{3}$/.test(code)
  );
}

/**
 * Get favorite currencies from localStorage
 */
export function getFavoriteCurrencies(): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);

    // Validate array structure
    if (!Array.isArray(parsed)) {
      console.warn("Invalid favorites format in localStorage");
      localStorage.removeItem(FAVORITES_STORAGE_KEY);
      return [];
    }

    // Filter and validate each entry
    const validated = parsed
      .filter(isValidCurrencyCode)
      .slice(0, MAX_FAVORITES);

    // If validation removed entries, update storage
    if (validated.length !== parsed.length) {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(validated));
    }

    return validated;
  } catch (error) {
    console.error("Error reading favorite currencies:", error);
    localStorage.removeItem(FAVORITES_STORAGE_KEY);
    return [];
  }
}

/**
 * Save favorite currencies to localStorage
 */
export function saveFavoriteCurrencies(favorites: string[]): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(favorites.slice(0, MAX_FAVORITES)),
    );
  } catch (error) {
    console.error("Error saving favorite currencies:", error);
  }
}

/**
 * Get conversion history from localStorage
 */
export function getConversionHistory(): ConversionResult[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    // Validate structure
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !Array.isArray(parsed.conversions)
    ) {
      console.warn("Invalid history format in localStorage");
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }

    // Filter and validate each conversion entry
    const validated = parsed.conversions
      .filter(isValidConversionResult)
      .slice(0, MAX_HISTORY_ITEMS);

    // If validation removed entries, update storage
    if (validated.length !== parsed.conversions.length) {
      const cleanedHistory: ConversionHistory = { conversions: validated };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedHistory));
    }

    return validated;
  } catch (error) {
    console.error("Error reading conversion history:", error);
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

/**
 * Save conversion to history
 */
export function saveConversion(conversion: ConversionResult): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const history = getConversionHistory();

    // Add new conversion at the beginning
    const updatedHistory = [conversion, ...history];

    // Keep only the last MAX_HISTORY_ITEMS items
    const trimmedHistory = updatedHistory.slice(0, MAX_HISTORY_ITEMS);

    const historyData: ConversionHistory = {
      conversions: trimmedHistory,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(historyData));
  } catch (error) {
    console.error("Error saving conversion history:", error);
  }
}

/**
 * Clear all conversion history
 */
export function clearConversionHistory(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing conversion history:", error);
  }
}
