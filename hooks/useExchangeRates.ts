import { useState, useEffect, useCallback } from "react";
import { ExchangeRates } from "@/types";

export function useExchangeRates() {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);

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
        err.message || "Failed to fetch exchange rates. Please try again later."
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

  const refreshRates = useCallback(() => {
    return fetchRates();
  }, [fetchRates]);

  return { exchangeRates, loading, error, refreshRates, lastRefreshTime };
}
