# Phase 1 Design: Data Model & Test Architecture

**Status**: Design Complete  
**Feature**: [spec.md](../spec.md)  
**Research**: [research.md](research.md)

## Overview

This document defines the test data model, test scenario structure, and architectural components for the Playwright E2E test suite.

---

## Test Scenario Model

### Test Hierarchy

```
Test Suite
├── User Story 1: Conversion Flow Tests
│   ├── Test: Basic USD to EUR conversion
│   ├── Test: Swap currencies functionality
│   └── Test: Auto-update on input change
├── User Story 2: Input Validation & Error Handling Tests
│   ├── Test: Reject negative amounts
│   ├── Test: Reject empty amounts
│   ├── Test: API failure handling
│   └── Test: Non-numeric input rejection
├── User Story 3: Conversion History Tests
│   ├── Test: Conversion persists in history
│   ├── Test: Maximum 10 items enforcement
│   ├── Test: Oldest item removal
│   └── Test: History survives page reload
└── Edge Cases & Cross-Browser Validation
    └── Applied to all browser configurations
```

### Test Scenario Mapping

| Spec Requirement              | Test File                  | Test Name                      | Success Criteria                          |
| ----------------------------- | -------------------------- | ------------------------------ | ----------------------------------------- |
| FR-001: Playwright setup      | N/A                        | Configuration validation       | `playwright.config.ts` defines 3 browsers |
| FR-002: Conversion flow       | `conversion-flow.spec.ts`  | basic-conversion-flow          | Result displays correct amount            |
| FR-003: Exchange rate display | `conversion-flow.spec.ts`  | verify-exchange-rate-accuracy  | Rate matches API response                 |
| FR-004: Swap functionality    | `conversion-flow.spec.ts`  | swap-currencies-flow           | Currencies swap; result updates           |
| FR-005: Input validation      | `input-validation.spec.ts` | reject-negative-amounts        | Error message displays                    |
| FR-005: Input validation      | `input-validation.spec.ts` | reject-empty-amounts           | Conversion prevented                      |
| FR-005: Input validation      | `input-validation.spec.ts` | reject-non-numeric-input       | Error message displays                    |
| FR-006: Error scenarios       | `error-handling.spec.ts`   | api-failure-handling           | User-friendly error displays              |
| FR-007: History persistence   | `history.spec.ts`          | conversion-persists-in-history | Conversion visible in list                |
| FR-007: Max items             | `history.spec.ts`          | enforce-max-10-items           | Oldest item removed                       |
| FR-008: Headless/headed       | `playwright.config.ts`     | Configuration option           | CLI flag or env var                       |
| FR-009: Test reports          | `playwright.config.ts`     | Reporter config                | HTML + JUnit output                       |
| FR-010: CI/CD                 | `playwright.config.ts`     | CI detection                   | Works without modification                |

---

## Test Data Model

### Supported Currencies

```typescript
const SUPPORTED_CURRENCIES = [
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
```

### Mock Exchange Rates Fixture

```typescript
interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  timestamp: string;
}

// Example mock data structure
const MOCK_EXCHANGE_RATES = {
  USD_EUR: 0.92,
  USD_GBP: 0.79,
  EUR_USD: 1.09,
  GBP_USD: 1.27,
  // ... all supported currency pairs
};
```

### Test Data Scenarios

```typescript
interface TestScenario {
  name: string;
  fromCurrency: string;
  toCurrency: string;
  inputAmount: string;
  expectedResult?: string;
  expectError?: boolean;
  errorPattern?: RegExp;
}

const TEST_SCENARIOS = {
  validConversions: [
    {
      name: "Basic USD to EUR",
      fromCurrency: "USD",
      toCurrency: "EUR",
      inputAmount: "100",
      expectedResult: "92.00", // 100 * 0.92
    },
    // ... more scenarios
  ],

  invalidInputs: [
    {
      name: "Negative amount",
      inputAmount: "-100",
      expectError: true,
      errorPattern: /must be positive|cannot be negative/i,
    },
    {
      name: "Empty amount",
      inputAmount: "",
      expectError: true,
      errorPattern: /required|cannot be empty/i,
    },
    // ... more scenarios
  ],

  edgeCases: [
    {
      name: "Very large amount",
      inputAmount: "999999999",
      fromCurrency: "USD",
      toCurrency: "EUR",
      expectedResult: "920000000", // Approximately
    },
    {
      name: "Same source and target currency",
      inputAmount: "100",
      fromCurrency: "USD",
      toCurrency: "USD",
      expectedResult: "100.00",
    },
    // ... more scenarios
  ],
};
```

---

## Page Object Model Architecture

### Base Page Class

```typescript
class BasePage {
  readonly page: Page;
  readonly url: string;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.url);
  }

  async waitForLoadingToComplete(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
  }

  async getPageTitle(): Promise<string> {
    return this.page.title();
  }
}
```

### Converter Page Object

```typescript
class ConverterPage extends BasePage {
  readonly url = "http://localhost:3000";

  // Locators
  readonly amountInput = 'input[data-testid="amount-input"]';
  readonly fromCurrencySelect = 'select[data-testid="from-currency"]';
  readonly toCurrencySelect = 'select[data-testid="to-currency"]';
  readonly swapButton = 'button[data-testid="swap-button"]';
  readonly conversionResult = '[data-testid="conversion-result"]';
  readonly errorMessage = '[data-testid="error-message"]';
  readonly historyList = '[data-testid="history-list"]';

  // Actions
  async fillAmount(amount: string): Promise<void> {
    await this.page.fill(this.amountInput, amount);
  }

  async selectFromCurrency(currency: string): Promise<void> {
    await this.page.selectOption(this.fromCurrencySelect, currency);
  }

  async selectToCurrency(currency: string): Promise<void> {
    await this.page.selectOption(this.toCurrencySelect, currency);
  }

  async clickSwap(): Promise<void> {
    await this.page.click(this.swapButton);
  }

  // Assertions
  async getConversionResult(): Promise<string> {
    return this.page.textContent(this.conversionResult);
  }

  async getErrorMessage(): Promise<string | null> {
    return this.page.textContent(this.errorMessage);
  }

  async verifyResultContains(expectedValue: string): Promise<void> {
    await expect(this.page.locator(this.conversionResult)).toContainText(
      expectedValue
    );
  }

  async verifyErrorMessageContains(expectedText: string): Promise<void> {
    await expect(this.page.locator(this.errorMessage)).toContainText(
      expectedText
    );
  }
}
```

### History Page Object (if separated)

```typescript
class HistoryPage extends BasePage {
  readonly historyItems = '[data-testid="history-item"]';
  readonly clearHistoryButton = 'button[data-testid="clear-history"]';

  async getHistoryItemCount(): Promise<number> {
    return this.page.locator(this.historyItems).count();
  }

  async getHistoryItems(): Promise<string[]> {
    return this.page.locator(this.historyItems).allTextContents();
  }

  async verifyMaxHistoryItems(maxCount: number): Promise<void> {
    const count = await this.getHistoryItemCount();
    expect(count).toBeLessThanOrEqual(maxCount);
  }
}
```

---

## Test File Organization

### conversion-flow.spec.ts

**Purpose**: Test P1 user story - main currency conversion functionality

```typescript
// Fixtures for this test file
const VALID_CONVERSION_SCENARIOS = [
  { amount: '100', from: 'USD', to: 'EUR', expectedPattern: /92/ },
  { amount: '1000', from: 'GBP', to: 'USD', expectedPattern: /1270/ },
  // ... more scenarios
];

// Test cases
test('should convert USD to EUR correctly', async () => { ... });
test('should swap currencies and update result', async () => { ... });
test('should update result when amount changes', async () => { ... });
test('should work across all supported currencies', async () => { ... });
```

### input-validation.spec.ts

**Purpose**: Test P2 user story - input validation and error handling

```typescript
test('should reject negative amounts', async () => { ... });
test('should reject empty amount field', async () => { ... });
test('should reject non-numeric characters', async () => { ... });
test('should display validation error messages', async () => { ... });
```

### error-handling.spec.ts

**Purpose**: Test P2 user story - API failure scenarios

```typescript
test('should display error when exchange rate API fails', async () => { ... });
test('should fallback gracefully when API returns invalid data', async () => { ... });
test('should show retry option or fallback message', async () => { ... });
```

### history.spec.ts

**Purpose**: Test P3 user story - conversion history persistence

```typescript
test('should add conversion to history after successful conversion', async () => { ... });
test('should maintain maximum 10 history items', async () => { ... });
test('should remove oldest item when limit exceeded', async () => { ... });
test('should persist history across page reload', async () => { ... });
test('should include all conversion details in history', async () => { ... });
```

---

## Test Configuration Model

### Playwright Configuration Structure

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: "./e2e/tests",
  testMatch: "**/*.spec.ts",

  // Web server configuration
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },

  // Retry configuration
  retries: process.env.CI ? 2 : 0,

  // Timeout configuration
  timeout: 30000,
  expect: { timeout: 5000 },

  // Parallel execution
  workers: process.env.CI ? 1 : 4,

  // Reporters
  reporter: [
    ["html", { outputFolder: "e2e/reports/html" }],
    ["junit", { outputFile: "e2e/reports/junit.xml" }],
    ["list"],
  ],

  // Projects (browsers)
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
});
```

---

## Mock API Strategy

### Route Interception Pattern

```typescript
// In test setup/beforeEach:
async function setupMockAPI(page: Page, rates: ExchangeRate[]): Promise<void> {
  await page.route("**/api/rates", async (route) => {
    // Return mocked exchange rates
    await route.abort();
    await route.continue(); // Or respond with mock data
  });
}

// For error scenarios:
async function setupAPIFailure(page: Page): Promise<void> {
  await page.route("**/api/rates", (route) => {
    route.abort("failed"); // Simulate network error
  });
}
```

---

## Validation & Assertion Strategy

### Standard Assertions

| Scenario        | Assertion                       | Method                              |
| --------------- | ------------------------------- | ----------------------------------- |
| Result displays | Text contains expected value    | `toContainText()`                   |
| Result accuracy | Exact match to calculated value | `toHaveText()`                      |
| Error message   | Visible and correct text        | `toBeVisible()` + `toContainText()` |
| History item    | Present in DOM                  | `toHaveCount()`                     |
| Element state   | Enabled/disabled/visible        | `toBeEnabled()`, `toBeVisible()`    |

### Wait Strategies

- **Auto-wait for assertions**: Playwright automatically waits up to 5s for assertions to pass
- **Explicit waits**: Use `waitForSelector()`, `waitForFunction()` only when needed
- **Network idle**: Use `waitForLoadState('networkidle')` after conversions

---

## Edge Case Coverage

| Edge Case                         | Test Location             | Validation                            |
| --------------------------------- | ------------------------- | ------------------------------------- |
| Very large amounts (999,999,999)  | `conversion-flow.spec.ts` | Result displays without error         |
| Same currency for source & target | `conversion-flow.spec.ts` | Result equals input amount            |
| Rapid consecutive conversions     | `conversion-flow.spec.ts` | All results correct and in sequence   |
| Network timeout                   | `error-handling.spec.ts`  | Error message displays                |
| API returns invalid JSON          | `error-handling.spec.ts`  | Graceful error handling               |
| LocalStorage unavailable          | `history.spec.ts`         | Tests skip or use alternative storage |

---

## Success Metrics (Phase 1 Design)

- ✅ Test data model defined with all scenarios
- ✅ Page Object Model architecture designed with type safety
- ✅ Test file organization and naming convention established
- ✅ Configuration strategy for multi-browser execution documented
- ✅ Mock API interception approach specified
- ✅ Assertion and validation patterns defined
- ✅ Edge cases mapped to test files

**Status**: Ready for Phase 2 (tasks.md generation)
