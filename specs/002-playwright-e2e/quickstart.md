# Quickstart Guide: Playwright E2E Testing

**Status**: Implementation Guide  
**Last Updated**: January 15, 2026  
**Feature**: [spec.md](spec.md)

## Overview

This guide provides quick setup and execution instructions for the Playwright E2E test suite.

---

## Prerequisites

- Node.js 18+ (already in project)
- npm or yarn package manager
- The currency converter application running locally or deployed

---

## Installation

### 1. Install Playwright Dependencies

```bash
npm install -D @playwright/test
```

This installs:

- `@playwright/test` - Test runner and assertion library
- Browser binaries for Chromium, Firefox, WebKit (automatic download)

### 2. Verify Installation

```bash
npx playwright --version
```

Expected output:

```
Version X.XX.X (with Chromium XXX, Firefox XXX, WebKit XXX)
```

---

## Project Structure Setup

Create the following directory structure at your repository root:

```bash
mkdir -p e2e/tests e2e/pages e2e/fixtures e2e/utils e2e/reports
```

Copy the generated files from the spec directory into your project:

- `playwright.config.ts` → root of repository
- Page objects → `e2e/pages/`
- Fixtures → `e2e/fixtures/`
- Test files → `e2e/tests/`

---

## Configuration

### playwright.config.ts

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e/tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  reporter: [
    ["html", { outputFolder: "e2e/reports/html" }],
    ["junit", { outputFile: "e2e/reports/junit.xml" }],
    ["list"],
  ],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
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

### TypeScript Configuration (tsconfig.json)

Ensure your `tsconfig.json` includes TypeScript support for Playwright:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  },
  "include": ["e2e/**/*.ts", "app/**/*.ts", "components/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Running Tests

### All Tests (Headless Mode - Default)

```bash
npx playwright test
```

Runs all tests across all three browsers (Chromium, Firefox, WebKit) in parallel.

### Specific Test File

```bash
npx playwright test e2e/tests/conversion-flow.spec.ts
```

### Specific Test by Name

```bash
npx playwright test -g "should convert USD to EUR"
```

### Headed Mode (Browser Visible)

```bash
npx playwright test --headed
```

Opens browser windows showing test execution in real-time (useful for debugging).

### Single Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Debug Mode (Interactive)

```bash
npx playwright test --debug
```

Opens Playwright Inspector for stepping through tests.

### Generate Test Report

```bash
npx playwright test
npx playwright show-report
```

Opens interactive HTML report in your browser with details on passed/failed tests, screenshots, and videos.

---

## Test Execution Flow

1. **Setup Phase**:

   - Application starts automatically (via webServer config)
   - Browser launches
   - API routes are mocked

2. **Test Phase**:

   - Navigate to application
   - Perform user actions (fill inputs, click buttons)
   - Make assertions on expected outcomes

3. **Cleanup Phase**:

   - Browser closes
   - Test artifacts (screenshots, videos) saved if failed

4. **Reporting Phase**:
   - Test results aggregated
   - HTML report generated

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: e2e/reports/html/
```

Add to `package.json`:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report"
  }
}
```

---

## Common Issues & Solutions

### Issue: Tests fail with "Application not found"

**Solution**: Ensure the application is running on `http://localhost:3000`. Either:

1. Start it manually: `npm run dev`
2. Or rely on webServer config to start it automatically

### Issue: Tests timeout on selectors

**Solution**: Verify selectors match your UI elements:

```bash
npx playwright codegen http://localhost:3000
```

This opens an interactive tool to record selectors by clicking elements.

### Issue: Mock API not intercepting

**Solution**: Check API endpoint URL matches the route pattern. For example:

```typescript
// Ensure this matches your actual API call
await page.route('**/api/rates', route => { ... });
```

### Issue: Flaky tests (sometimes pass, sometimes fail)

**Solution**:

1. Add explicit waits for elements:
   ```typescript
   await page.waitForSelector('[data-testid="result"]');
   ```
2. Increase timeout for slow machines:
   ```typescript
   await expect(locator).toBeVisible({ timeout: 10000 });
   ```

---

## Test File Template

```typescript
import { test, expect, Page } from "@playwright/test";
import { ConverterPage } from "../pages/converter-page";
import { MOCK_RATES } from "../fixtures/mock-rates";

test.describe("Conversion Flow", () => {
  let converterPage: ConverterPage;

  test.beforeEach(async ({ page }) => {
    converterPage = new ConverterPage(page);

    // Setup mock API
    await page.route("**/api/rates", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_RATES),
      });
    });

    // Navigate to app
    await converterPage.navigate();
  });

  test("should convert USD to EUR", async ({ page }) => {
    // Act
    await converterPage.fillAmount("100");
    await converterPage.selectFromCurrency("USD");
    await converterPage.selectToCurrency("EUR");

    // Assert
    await converterPage.verifyResultContains("92");
  });
});
```

---

## Best Practices

1. **Use Page Objects**: Centralize selectors and actions in page object classes
2. **Reuse Fixtures**: Extract common test data into fixture files
3. **Meaningful Names**: Use descriptive test names that explain what's being tested
4. **Keep Tests Independent**: Each test should be runnable on its own
5. **Mock External APIs**: Use route interception to avoid API dependencies
6. **Assert Behavior**: Verify user-visible outcomes, not internal state
7. **Use Realistic Data**: Test with realistic amounts and currency combinations
8. **Add Retries**: CI builds can use retries to handle flakiness

---

## Next Steps

1. ✅ Complete installation and configuration
2. ✅ Create page objects for your UI
3. ✅ Write your first test file
4. ✅ Run tests locally with `npm run test:e2e`
5. ✅ View report with `npm run test:e2e:report`
6. ✅ Add to CI/CD pipeline
7. ✅ Monitor test results over time

---

## Documentation References

- [Playwright Official Docs](https://playwright.dev)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Locators & Selectors](https://playwright.dev/docs/locators)
- [Assertions](https://playwright.dev/docs/test-assertions)
- [Debugging Tests](https://playwright.dev/docs/debug)

---

## Support & Troubleshooting

For issues not covered here:

1. Check test output for specific error messages
2. Use debug mode: `npx playwright test --debug`
3. Review generated screenshots/videos in `e2e/reports/`
4. Consult Playwright documentation
5. Open an issue in the project repository
