import { ConversionHistory, ConversionResult, Currency } from "@/types";

const STORAGE_KEY = "currency_converter_history";
const MAX_HISTORY_ITEMS = 10;

// Key for storing favorite currencies
export const FAVORITES_STORAGE_KEY = "currency_favorites";
export const MAX_FAVORITES = 5;

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
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error reading favorite currencies:", error);
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
      JSON.stringify(favorites.slice(0, MAX_FAVORITES))
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

    const history: ConversionHistory = JSON.parse(stored);
    return history.conversions || [];
  } catch (error) {
    console.error("Error reading conversion history:", error);
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
