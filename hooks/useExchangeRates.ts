import { useState, useEffect, useCallback } from "react";
import { ExchangeRates } from "@/types";

/**
 * Exchange rates hook return type
 */
export interface UseExchangeRatesReturn {
  /** Current exchange rates data, null if not yet loaded */
  exchangeRates: ExchangeRates | null;
  /** Loading state indicator */
  loading: boolean;
  /** Error message if fetch failed, null otherwise */
  error: string | null;
  /** Function to manually refresh exchange rates */
  refreshRates: () => Promise<void>;
  /** Timestamp of last successful refresh (milliseconds since epoch) */
  lastRefreshTime: number;
}

/**
 * Custom hook for fetching and managing exchange rates data.
 *
 * Fetches exchange rates from the API route on mount and provides functionality
 * to manually refresh the data. Implements error handling, loading states, and
 * tracks the last refresh time.
 *
 * @returns {UseExchangeRatesReturn} Object containing exchange rates, loading state, error state, and refresh function
 *
 * @example
 * ```tsx
 * function CurrencyConverter() {
 *   const { exchangeRates, loading, error, refreshRates } = useExchangeRates();
 *
 *   if (loading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage message={error} />;
 *   if (!exchangeRates) return null;
 *
 *   return (
 *     <div>
 *       <p>Base: {exchangeRates.base}</p>
 *       <button onClick={refreshRates}>Refresh Rates</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Using with manual refresh
 * function RatesDisplay() {
 *   const { exchangeRates, refreshRates, lastRefreshTime } = useExchangeRates();
 *
 *   const handleRefresh = async () => {
 *     await refreshRates();
 *     console.log('Rates refreshed at:', new Date(lastRefreshTime));
 *   };
 *
 *   return <button onClick={handleRefresh}>Refresh</button>;
 * }
 * ```
 */
export function useExchangeRates(): UseExchangeRatesReturn {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);

  /**
   * Fetches exchange rates from the API route.
   * Updates state with the fetched data or error message.
   *
   * @private
   * @returns {Promise<void>} Promise that resolves when fetch completes
   */
  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/rates");
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch exchange rates");
      }

      setExchangeRates(data.data);
      setLastRefreshTime(Date.now());
    } catch (err: any) {
      setError(
        err.message ||
          "Failed to fetch exchange rates. Please try again later.",
      );
      console.error("Error fetching rates:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeFetch = async () => {
      await fetchRates();
    };

    initializeFetch();

    return () => {
      isMounted = false;
    };
  }, [fetchRates]);

  /**
   * Manually refresh exchange rates.
   * Can be called by consumer components to update rates on demand.
   *
   * @returns {Promise<void>} Promise that resolves when refresh completes
   *
   * @example
   * ```tsx
   * const { refreshRates } = useExchangeRates();
   *
   * const handleButtonClick = async () => {
   *   await refreshRates();
   *   console.log('Rates updated!');
   * };
   * ```
   */
  const refreshRates = useCallback(() => {
    return fetchRates();
  }, [fetchRates]);

  return { exchangeRates, loading, error, refreshRates, lastRefreshTime };
}
