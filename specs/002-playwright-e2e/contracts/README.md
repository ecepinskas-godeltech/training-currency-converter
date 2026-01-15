# API Contracts for Test Fixtures

## Overview

This directory contains API contract definitions used by the E2E test suite for mocking exchange rate API responses.

### Files

- **exchange-rates.json** - Mock exchange rate responses for all supported currency pairs
- **error-responses.json** - Error response formats for API failure scenarios

## Exchange Rate Response Format

```json
{
  "success": true,
  "timestamp": "2026-01-15T12:00:00Z",
  "base": "USD",
  "rates": {
    "EUR": 0.92,
    "GBP": 0.79,
    "JPY": 149.5,
    "AUD": 1.53,
    "CAD": 1.36,
    "CHF": 0.88,
    "CNY": 7.08,
    "INR": 83.12,
    "MXN": 17.05
  }
}
```

## Currency Pair Matrix

All 10 supported currencies with mock conversion rates:

| Base Currency | Target Rates                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| USD           | EUR: 0.92, GBP: 0.79, JPY: 149.50, AUD: 1.53, CAD: 1.36, CHF: 0.88, CNY: 7.08, INR: 83.12, MXN: 17.05  |
| EUR           | USD: 1.09, GBP: 0.86, JPY: 162.50, AUD: 1.66, CAD: 1.48, CHF: 0.96, CNY: 7.70, INR: 90.35, MXN: 18.54  |
| GBP           | USD: 1.27, EUR: 1.16, JPY: 188.95, AUD: 1.93, CAD: 1.72, CHF: 1.12, CNY: 8.95, INR: 105.00, MXN: 21.55 |

## Error Response Formats

### API Failure Response

```json
{
  "success": false,
  "error": "API temporarily unavailable",
  "timestamp": "2026-01-15T12:00:00Z"
}
```

### Invalid Data Response

```json
{
  "success": true,
  "rates": null
}
```

### Network Timeout

Abort connection - no response body

## Test Usage

Tests use `page.route()` to intercept API calls and return mock data:

```typescript
await page.route("**/api/rates", async (route) => {
  const mockData = require("./contracts/exchange-rates.json");
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify(mockData),
  });
});
```

For error scenarios:

```typescript
await page.route("**/api/rates", (route) => {
  route.abort("failed"); // Network error
});
```

## Contract Validation

- ✅ All 10 currencies represented
- ✅ All currency pair combinations defined
- ✅ Rates are realistic and consistent
- ✅ Error responses follow standard format
- ✅ Timestamps are ISO 8601 formatted
