/**
 * Mock exchange rates for Playwright E2E testing.
 * Provides realistic conversion rates for all supported currency pairs.
 */

export interface MockExchangeRates {
  [key: string]: number;
}

/**
 * Realistic mock exchange rates for all currency combinations.
 * Format: "BASE_TARGET": rate (e.g., "USD_EUR": 0.92 means 1 USD = 0.92 EUR)
 */
export const MOCK_EXCHANGE_RATES: MockExchangeRates = {
  // From USD
  USD_EUR: 0.92,
  USD_GBP: 0.79,
  USD_JPY: 149.5,
  USD_AUD: 1.53,
  USD_CAD: 1.36,
  USD_CHF: 0.88,
  USD_CNY: 7.08,
  USD_INR: 83.12,
  USD_MXN: 17.05,
  USD_USD: 1.0,

  // From EUR
  EUR_USD: 1.09,
  EUR_GBP: 0.86,
  EUR_JPY: 162.5,
  EUR_AUD: 1.66,
  EUR_CAD: 1.48,
  EUR_CHF: 0.96,
  EUR_CNY: 7.7,
  EUR_INR: 90.35,
  EUR_MXN: 18.54,
  EUR_EUR: 1.0,

  // From GBP
  GBP_USD: 1.27,
  GBP_EUR: 1.16,
  GBP_JPY: 188.95,
  GBP_AUD: 1.93,
  GBP_CAD: 1.72,
  GBP_CHF: 1.12,
  GBP_CNY: 8.95,
  GBP_INR: 105.0,
  GBP_MXN: 21.55,
  GBP_GBP: 1.0,

  // From JPY
  JPY_USD: 0.0067,
  JPY_EUR: 0.0062,
  JPY_GBP: 0.0053,
  JPY_AUD: 0.0102,
  JPY_CAD: 0.0091,
  JPY_CHF: 0.0059,
  JPY_CNY: 0.0473,
  JPY_INR: 0.556,
  JPY_MXN: 0.1138,
  JPY_JPY: 1.0,

  // From AUD
  AUD_USD: 0.65,
  AUD_EUR: 0.6,
  AUD_GBP: 0.52,
  AUD_JPY: 97.65,
  AUD_CAD: 0.89,
  AUD_CHF: 0.575,
  AUD_CNY: 4.62,
  AUD_INR: 54.45,
  AUD_MXN: 11.13,
  AUD_AUD: 1.0,

  // From CAD
  CAD_USD: 0.735,
  CAD_EUR: 0.676,
  CAD_GBP: 0.581,
  CAD_JPY: 109.85,
  CAD_AUD: 1.124,
  CAD_CHF: 0.647,
  CAD_CNY: 5.2,
  CAD_INR: 61.12,
  CAD_MXN: 12.52,
  CAD_CAD: 1.0,

  // From CHF
  CHF_USD: 1.136,
  CHF_EUR: 1.042,
  CHF_GBP: 0.893,
  CHF_JPY: 169.75,
  CHF_AUD: 1.738,
  CHF_CAD: 1.545,
  CHF_CNY: 8.045,
  CHF_INR: 94.45,
  CHF_MXN: 19.35,
  CHF_CHF: 1.0,

  // From CNY
  CNY_USD: 0.141,
  CNY_EUR: 0.13,
  CNY_GBP: 0.112,
  CNY_JPY: 21.11,
  CNY_AUD: 0.216,
  CNY_CAD: 0.192,
  CNY_CHF: 0.124,
  CNY_INR: 11.74,
  CNY_MXN: 2.41,
  CNY_CNY: 1.0,

  // From INR
  INR_USD: 0.012,
  INR_EUR: 0.0111,
  INR_GBP: 0.0095,
  INR_JPY: 1.797,
  INR_AUD: 0.0184,
  INR_CAD: 0.0164,
  INR_CHF: 0.0106,
  INR_CNY: 0.0851,
  INR_MXN: 0.205,
  INR_INR: 1.0,

  // From MXN
  MXN_USD: 0.059,
  MXN_EUR: 0.054,
  MXN_GBP: 0.046,
  MXN_JPY: 8.77,
  MXN_AUD: 0.09,
  MXN_CAD: 0.08,
  MXN_CHF: 0.052,
  MXN_CNY: 0.415,
  MXN_INR: 4.87,
  MXN_MXN: 1.0,
};

/**
 * Get the exchange rate for a given currency pair.
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @returns The exchange rate
 */
export function getExchangeRate(
  fromCurrency: string,
  toCurrency: string
): number {
  const key = `${fromCurrency}_${toCurrency}`;
  return MOCK_EXCHANGE_RATES[key] || 1;
}

/**
 * Calculate a conversion amount.
 * @param amount - Amount to convert
 * @param rate - Exchange rate
 * @returns Converted amount rounded to 2 decimal places
 */
export function calculateConversion(amount: number, rate: number): number {
  return Math.round(amount * rate * 100) / 100;
}

/**
 * Get mock API response for exchange rates.
 */
export function getMockRatesResponse() {
  return {
    success: true,
    timestamp: new Date().toISOString(),
    base: "USD",
    rates: {
      EUR: 0.92,
      GBP: 0.79,
      JPY: 149.5,
      AUD: 1.53,
      CAD: 1.36,
      CHF: 0.88,
      CNY: 7.08,
      INR: 83.12,
      MXN: 17.05,
    },
  };
}
