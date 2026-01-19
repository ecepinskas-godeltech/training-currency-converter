import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CURRENCIES, validateAmount, convertCurrency } from "@/utils/currency";
import {
  saveConversion,
  getConversionHistory,
  clearConversionHistory as clearStorage,
  getFavoriteCurrencies,
  saveFavoriteCurrencies,
  MAX_FAVORITES,
} from "@/utils/storage";
import { ConversionResult, ExchangeRates } from "@/types";

export function useConverter(exchangeRates: ExchangeRates | null) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [amount, setAmount] = useState<string>("1");
  const [fromCurrency, setFromCurrency] = useState<string>("USD");
  const [toCurrency, setToCurrency] = useState<string>("EUR");
  const [result, setResult] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [history, setHistory] = useState<ConversionResult[]>([]);

  // Favorite currencies state
  const [favoriteCurrencies, setFavoriteCurrencies] = useState<string[]>([]);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);

  // Initialize from URL parameters
  useEffect(() => {
    const urlAmount = searchParams.get("amount");
    const urlFrom = searchParams.get("from");
    const urlTo = searchParams.get("to");

    // Validate and set amount from URL
    if (urlAmount) {
      const parsed = parseFloat(urlAmount);
      if (!isNaN(parsed) && parsed > 0 && parsed <= 1000000000) {
        setAmount(urlAmount);
      } else {
        console.warn('Invalid amount in URL parameters:', urlAmount);
      }
    }
    
    // Validate and set from currency
    if (urlFrom) {
      const sanitized = urlFrom.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
      if (sanitized.length === 3 && CURRENCIES.find((c) => c.code === sanitized)) {
        setFromCurrency(sanitized);
      } else {
        console.warn('Invalid from currency in URL parameters:', urlFrom);
      }
    }
    
    // Validate and set to currency
    if (urlTo) {
      const sanitized = urlTo.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
      if (sanitized.length === 3 && CURRENCIES.find((c) => c.code === sanitized)) {
        setToCurrency(sanitized);
      } else {
        console.warn('Invalid to currency in URL parameters:', urlTo);
      }
    }

    setHistory(getConversionHistory());

    // Restore favorites from localStorage
    setFavoriteCurrencies(getFavoriteCurrencies());
  }, [searchParams]);

  // Update URL parameters
  const updateURL = useCallback(
    (amt: string, from: string, to: string) => {
      const params = new URLSearchParams();
      params.set("amount", amt);
      params.set("from", from);
      params.set("to", to);
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  // Handle from currency change with auto-swap if equal to toCurrency
  const handleFromCurrencyChange = useCallback(
    (newFromCurrency: string) => {
      if (newFromCurrency === toCurrency) {
        // Auto-swap: set from to old to, and to to new from
        setToCurrency(fromCurrency);
        setFromCurrency(newFromCurrency);
      } else {
        setFromCurrency(newFromCurrency);
      }
    },
    [fromCurrency, toCurrency]
  );

  // Handle to currency change with auto-swap if equal to fromCurrency
  const handleToCurrencyChange = useCallback(
    (newToCurrency: string) => {
      if (newToCurrency === fromCurrency) {
        // Auto-swap: set to to old from, and from to new to
        setFromCurrency(toCurrency);
        setToCurrency(newToCurrency);
      } else {
        setToCurrency(newToCurrency);
      }
    },
    [fromCurrency, toCurrency]
  );

  // Perform conversion
  const performConversion = useCallback(() => {
    const validation = validateAmount(amount);
    if (!validation.isValid) {
      setValidationError(validation.error || null);
      setResult(null);
      return;
    }

    // Only clear error if we actually have rates to convert with
    if (!exchangeRates) {
      return;
    }

    setValidationError(null);

    try {
      const amountNum = parseFloat(amount);
      const fromRate = exchangeRates.rates[fromCurrency];
      const toRate = exchangeRates.rates[toCurrency];

      if (!fromRate || !toRate) {
        return;
      }

      const convertedAmount = convertCurrency(amountNum, fromRate, toRate);
      setResult(convertedAmount);

      const conversion: ConversionResult = {
        from: fromCurrency,
        to: toCurrency,
        amount: amountNum,
        result: convertedAmount,
        rate: toRate / fromRate,
        timestamp: Date.now(),
      };

      saveConversion(conversion);
      setHistory(getConversionHistory());

      updateURL(amount, fromCurrency, toCurrency);
    } catch (err: any) {
      console.error("Conversion error:", err);
    }
  }, [amount, fromCurrency, toCurrency, exchangeRates, updateURL]);

  // Auto-convert on input change
  useEffect(() => {
    // Always validate the amount, even if rates aren't loaded yet
    const validation = validateAmount(amount);
    if (!validation.isValid) {
      setValidationError(validation.error || null);
      setResult(null);
      return;
    }

    // Only perform conversion if we have all required data
    if (fromCurrency && toCurrency && exchangeRates) {
      performConversion();
    }
  }, [amount, fromCurrency, toCurrency, exchangeRates, performConversion]);

  const handleSwap = useCallback(() => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  }, [fromCurrency, toCurrency]);

  const loadFromHistory = useCallback((conversion: ConversionResult) => {
    setAmount(conversion.amount.toString());
    setFromCurrency(conversion.from);
    setToCurrency(conversion.to);
  }, []);

  const clearConversionHistory = useCallback(() => {
    clearStorage();
    setHistory([]);
  }, []);

  // Add or remove a currency from favorites
  const toggleFavoriteCurrency = useCallback((currencyCode: string) => {
    setFavoriteError(null);
    setFavoriteCurrencies((prev) => {
      if (prev.includes(currencyCode)) {
        // Remove from favorites
        const updated = prev.filter((c) => c !== currencyCode);
        saveFavoriteCurrencies(updated);
        return updated;
      } else {
        // Add to favorites
        if (prev.length >= MAX_FAVORITES) {
          setFavoriteError(
            `You can only select up to ${MAX_FAVORITES} favorite currencies.`
          );
          return prev;
        }
        const updated = [...prev, currencyCode];
        saveFavoriteCurrencies(updated);
        return updated;
      }
    });
  }, []);

  // Clear favorites
  const clearFavorites = useCallback(() => {
    setFavoriteCurrencies([]);
    saveFavoriteCurrencies([]);
    setFavoriteError(null);
  }, []);

  return {
    amount,
    fromCurrency,
    toCurrency,
    result,
    validationError,
    history,
    favoriteCurrencies,
    favoriteError,
    setAmount,
    setFromCurrency: handleFromCurrencyChange,
    setToCurrency: handleToCurrencyChange,
    handleSwap,
    loadFromHistory,
    clearConversionHistory,
    toggleFavoriteCurrency,
    clearFavorites,
  };
}
