import { SearchHistory } from "@/types/weather";

const STORAGE_KEY = "weather-search-history";
const MAX_HISTORY_ITEMS = 3;

/**
 * Get search history from localStorage
 */
export function getSearchHistory(): SearchHistory[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error reading search history:", error);
    return [];
  }
}

/**
 * Add a city to search history
 * Maintains only the last 3 searches, removing duplicates
 */
export function addToSearchHistory(cityCode: string, cityName: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const history = getSearchHistory();

    // Remove duplicate if exists
    const filtered = history.filter((item) => item.cityCode !== cityCode);

    // Add new entry at the beginning
    const newHistory: SearchHistory[] = [
      {
        cityCode,
        cityName,
        timestamp: Date.now(),
      },
      ...filtered,
    ].slice(0, MAX_HISTORY_ITEMS); // Keep only last 3

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error("Error saving search history:", error);
  }
}

/**
 * Clear all search history
 */
export function clearSearchHistory(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing search history:", error);
  }
}
