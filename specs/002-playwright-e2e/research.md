# Phase 0 Research: Playwright E2E Testing Setup

**Status**: Complete  
**Feature**: [spec.md](spec.md)  
**Plan**: [plan.md](plan.md)

## Overview

This document consolidates research findings needed to proceed with Phase 1 design of the Playwright E2E testing implementation. All unknowns from the specification have been resolved.

---

## Technical Decisions

### 1. Playwright Framework & Version

**Decision**: Use Playwright `@latest` (1.40+) with TypeScript support

**Rationale**:

- Playwright is mature, widely adopted, and officially supports TypeScript
- Latest versions include improved stability, better error reporting, and enhanced CI/CD integration
- TypeScript support aligns with existing project standards
- Multi-browser support (Chromium, Firefox, WebKit) is native without plugins

**Alternatives Considered**:

- Cypress: Limited to Chromium/Firefox; poorer multi-browser support
- Selenium: More verbose, requires additional libraries for assertions
- Puppeteer: Chrome-only, less suitable for cross-browser testing
- WebdriverIO: More complex setup; Playwright is lighter weight

**Recommendation**: Implement with `npm install -D @playwright/test` in existing project

---

### 2. Test Organization Structure

**Decision**: Use Page Object Model (POM) pattern with fixtures directory

**Rationale**:

- Page Objects improve test maintainability by centralizing UI selectors
- Fixtures enable reusable test data and mock configurations
- Organization by user story area (conversion-flow, input-validation, etc.) aligns with feature spec
- TypeScript interfaces enable type-safe test code

**Alternatives Considered**:

- Direct selector usage: Less maintainable; selector changes require updates in multiple tests
- Single monolithic test file: Difficult to navigate and maintain as test suite grows
- Shared test utilities only: Works but lacks structure for complex applications

**Recommendation**: Implement POM pattern with `/e2e/pages/` and `/e2e/fixtures/` directories

---

### 3. Browser Configuration

**Decision**: Configure all three browsers (Chromium, Firefox, WebKit) with headless execution default

**Rationale**:

- Covers 95%+ of user browser usage with these three engines
- Headless mode enables CI/CD automation; headed mode available for debugging
- Playwright manages browser binary downloads automatically
- Parallel execution across browsers can run simultaneously (4 workers by default)

**Alternatives Considered**:

- Chrome/Edge only: Insufficient for cross-browser validation
- Serial execution: Slower; parallel is faster without additional complexity
- Manual browser selection: Less flexible; configuration should be dynamic

**Recommendation**: Default to headless; enable headed mode via CLI flag or config override

---

### 4. Test Data & Mocking Strategy

**Decision**: Use Playwright request interception (Route API) to mock exchange rate APIs

**Rationale**:

- Eliminates test flakiness from real API dependency
- Enables testing error scenarios (API failures) deterministically
- Fixtures can define multiple mock response scenarios
- No modification to application code needed

**Alternatives Considered**:

- Real API calls: Causes test flakiness and environmental dependency
- Mocking at application level: Requires code modifications (violates spec)
- Environment variables: Less flexible; doesn't support dynamic response variations

**Recommendation**: Use `page.route()` to intercept API calls and return mock data from fixtures

---

### 5. CI/CD Integration

**Decision**: Configure Playwright with GitHub Actions compatibility via `playwright.config.ts`

**Rationale**:

- Built-in CI detection (CI environment variables)
- Automatic artifact generation (test reports, screenshots, videos)
- Retry mechanism for flaky tests (optional 2 retries)
- Structured reporter output for CI systems

**Alternatives Considered**:

- Manual CI script: Requires custom shell scripting; less maintainable
- No CI support: Manual test execution only; not scalable

**Recommendation**: Use Playwright's built-in CI configuration with GitHub Actions as primary CI target

---

### 6. Assertion & Validation Library

**Decision**: Use Playwright's built-in assertions (`expect()`) with TypeScript

**Rationale**:

- No additional dependency; built into `@playwright/test`
- Auto-wait capability: Assertions wait for conditions to be true (reduces flakiness)
- Excellent error messages with visual diffs for failed assertions
- Full TypeScript support with IntelliSense

**Alternatives Considered**:

- Chai/Assert: Requires additional package; lacks auto-wait
- Jest matchers: Overkill for E2E tests; Playwright's are simpler

**Recommendation**: Use `expect()` from `@playwright/test` exclusively

---

### 7. Fixture & Mock Data Management

**Decision**: Create TypeScript files with mock data constants and helper functions

**Rationale**:

- Type-safe test data with full IDE autocomplete
- Reusable across all test files
- Easy to update when rates change or new currencies added
- Fixtures directory becomes single source of truth for test data

**Alternatives Considered**:

- JSON files: Less type-safe; requires parsing
- Hardcoded values: Scattered throughout tests; difficult to maintain
- API mocking library: Unnecessary complexity for deterministic mock data

**Recommendation**: Use TypeScript `export const` for mock data and helper functions

---

### 8. Test Report Generation

**Decision**: Use Playwright's HTML Reporter with optional JUnit reporter for CI systems

**Rationale**:

- HTML reporter provides interactive UI for reviewing test results
- JUnit XML format compatible with most CI systems and dashboards
- Videos and screenshots automatically attached to failed tests
- No additional dependencies required

**Alternatives Considered**:

- Allure reports: More complex setup; HTML reporter sufficient
- Plain text logs: Less useful for debugging failed tests

**Recommendation**: Enable both HTML and JUnit reporters in `playwright.config.ts`

---

### 9. Page Object Model Pattern Details

**Decision**: Use typed Page Objects with helper methods for common actions

**Rationale**:

- Centralizes UI selectors (amount input, currency selects, buttons, results)
- Provides strongly-typed methods like `fillAmount()`, `selectCurrency()`, `verifyResult()`
- Reduces test code duplication
- Makes tests more readable and maintainable

**Structure**:

```typescript
class ConverterPage {
  constructor(page: Page) { ... }
  async fillAmount(amount: string): Promise<void> { ... }
  async selectFromCurrency(currency: string): Promise<void> { ... }
  async selectToCurrency(currency: string): Promise<void> { ... }
  async clickSwap(): Promise<void> { ... }
  async getConversionResult(): Promise<string> { ... }
  async verifyErrorMessage(message: string): Promise<void> { ... }
}
```

---

### 10. Performance & Timeout Configuration

**Decision**: Use standard Playwright timeouts (30s default, 5s for UI actions) with custom timeout for API calls

**Rationale**:

- 30s global timeout prevents infinite waits on failures
- 5s UI action timeouts catch slow interactions
- Mock API responses return instantly (no real API delays)
- Aligns with <2 minute total suite execution requirement

**Alternatives Considered**:

- Long timeouts: Masks performance issues; tests take longer
- Very short timeouts: Causes false failures on slower systems
- No timeout: Can hang indefinitely

**Recommendation**: Keep Playwright defaults; no custom adjustment needed

---

## Key Findings Summary

| Category       | Finding                               | Impact                                          |
| -------------- | ------------------------------------- | ----------------------------------------------- |
| **Framework**  | Playwright 1.40+ with TypeScript      | Best-in-class E2E testing; native multi-browser |
| **Structure**  | POM pattern with fixtures             | Maintainable, scalable test code                |
| **Browsers**   | Chromium, Firefox, WebKit (all three) | Comprehensive cross-browser coverage            |
| **Mocking**    | Route API for API interception        | Deterministic, flake-free tests                 |
| **CI/CD**      | Built-in GitHub Actions support       | Seamless automation integration                 |
| **Assertions** | Playwright `expect()` only            | No external dependencies; auto-wait             |
| **Data**       | TypeScript fixtures directory         | Type-safe, reusable test data                   |
| **Reporting**  | HTML + JUnit reporters                | Rich debugging + CI integration                 |

---

## Dependencies Confirmed

- ✅ `@playwright/test` (npm install target)
- ✅ TypeScript 5.x (already in project)
- ✅ Node.js 18+ (assumed from project setup)
- ✅ No external assertion libraries needed
- ✅ No database or backend service modifications required

---

## Next Steps (Phase 1)

1. **Data Model**: Define test scenarios, fixture structure, and test data organization
2. **API Contracts**: Document mock API response formats for exchange rates
3. **Quickstart**: Provide setup and execution instructions for developers
4. **Code Skeleton**: Generate `playwright.config.ts`, page objects, and fixture structure
