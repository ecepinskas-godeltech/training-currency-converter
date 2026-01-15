// Type definitions for the currency converter application

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

/**
 * FavoriteCurrency extends Currency and is used for user-marked favorites.
 * Only supported currencies can be marked as favorites.
 */
export interface FavoriteCurrency extends Currency {
  /**
   * Indicates if this currency is currently marked as a favorite by the user.
   */
  isFavorite: true;
}

export interface ExchangeRates {
  base: string;
  rates: {
    [key: string]: number;
  };
  timestamp?: number;
}

export interface ConversionResult {
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
  timestamp: number;
}

export interface ConversionHistory {
  conversions: ConversionResult[];
}

export interface ApiResponse {
  success: boolean;
  data?: ExchangeRates;
  error?: string;
}
