/**
 * Test data constants for Playwright E2E tests.
 * Contains supported currencies and test scenarios.
 */

export const SUPPORTED_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "AUD",
  "CAD",
  "CHF",
  "CNY",
  "INR",
  "MXN",
];

export interface TestScenario {
  name: string;
  fromCurrency: string;
  toCurrency: string;
  inputAmount: string;
  expectedResult?: string;
  expectError?: boolean;
  errorPattern?: RegExp;
}

export const TEST_SCENARIOS = {
  validConversions: [
    {
      name: "Basic USD to EUR",
      fromCurrency: "USD",
      toCurrency: "EUR",
      inputAmount: "100",
      expectedResult: "92", // 100 * 0.92
    },
    {
      name: "GBP to USD",
      fromCurrency: "GBP",
      toCurrency: "USD",
      inputAmount: "100",
      expectedResult: "127", // 100 * 1.27
    },
    {
      name: "EUR to GBP",
      fromCurrency: "EUR",
      toCurrency: "GBP",
      inputAmount: "100",
      expectedResult: "86", // 100 * 0.86
    },
    {
      name: "JPY conversion",
      fromCurrency: "USD",
      toCurrency: "JPY",
      inputAmount: "1",
      expectedResult: "149", // 1 * 149.50
    },
    {
      name: "Small amount conversion",
      fromCurrency: "USD",
      toCurrency: "EUR",
      inputAmount: "0.01",
      expectedResult: "0.009", // 0.01 * 0.92
    },
  ],

  invalidInputs: [
    {
      name: "Negative amount",
      inputAmount: "-100",
      expectError: true,
      errorPattern: /must be positive|cannot be negative|invalid/i,
    },
    {
      name: "Empty amount",
      inputAmount: "",
      expectError: true,
      errorPattern: /required|cannot be empty|must enter/i,
    },
    {
      name: "Non-numeric input",
      inputAmount: "ABC",
      expectError: true,
      errorPattern: /must be a number|numeric|invalid/i,
    },
    {
      name: "Special characters",
      inputAmount: "!@#$",
      expectError: true,
      errorPattern: /invalid|numbers only/i,
    },
  ],

  edgeCases: [
    {
      name: "Very large amount",
      fromCurrency: "USD",
      toCurrency: "EUR",
      inputAmount: "999999999",
      expectedResult: "920", // Approximate, will be 999999999 * 0.92
    },
    {
      name: "Same currency conversion",
      fromCurrency: "USD",
      toCurrency: "USD",
      inputAmount: "100",
      expectedResult: "100", // 1:1 conversion
    },
    {
      name: "Decimal amount",
      fromCurrency: "USD",
      toCurrency: "EUR",
      inputAmount: "123.45",
      expectedResult: "113.6", // 123.45 * 0.92
    },
  ],
};
