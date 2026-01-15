# Implementation Tasks: Playwright E2E Testing Setup

**Feature**: `002-playwright-e2e` | **Branch**: `002-playwright-e2e` | **Spec**: [spec.md](spec.md)  
**Plan**: [plan.md](plan.md) | **Status**: Ready for Development

---

## Task Overview

This document breaks down the Playwright E2E testing feature into actionable implementation tasks organized by user story priority. Each task is specific enough for an LLM to complete independently.

**Total Tasks**: 27  
**Setup Phase**: 4 tasks  
**Foundational Phase**: 5 tasks  
**User Story 1 (P1)**: 6 tasks  
**User Story 2 (P2)**: 7 tasks  
**User Story 3 (P3)**: 3 tasks  
**Polish Phase**: 2 tasks

---

## Dependency Graph

```
Setup Phase (T001-T004)
    ↓
Foundational Phase (T005-T009)
    ├→ US1: Conversion Flow (T010-T015)
    ├→ US2: Input Validation (T016-T022)
    └→ US3: History Tests (T023-T025)
        ↓
Polish Phase (T026-T027)
```

**Parallelization**: After Foundational phase completion, all three user story phases can run in parallel.

---

## Phase 1: Setup & Configuration

### Core Infrastructure Setup

- [x] T001 Create Playwright project configuration file `e2e/playwright.config.ts` with Chromium, Firefox, WebKit, reporters, timeout settings, and web server configuration
- [x] T002 [P] Install Playwright dependencies by adding `@playwright/test` to `package.json` and running `npm install`
- [x] T003 Create directory structure: `e2e/pages/`, `e2e/tests/`, `e2e/fixtures/`, `e2e/utils/`, `e2e/reports/`
- [x] T004 Update `package.json` with E2E test scripts: `test:e2e`, `test:e2e:headed`, `test:e2e:debug`, `test:e2e:report`

---

## Phase 2: Foundational Components

### Page Objects & Utilities

- [x] T005 [P] Create `e2e/pages/base-page.ts` with BasePage class, constructor, navigation, and shared helper methods (navigate, waitForLoadingToComplete, getPageTitle)
- [x] T006 [P] Create `e2e/pages/converter-page.ts` with ConverterPage class extending BasePage, locators for amount input, currency selects, swap button, result display, and error message display
- [x] T007 [P] Create `e2e/pages/converter-page.ts` continued with action methods: fillAmount, selectFromCurrency, selectToCurrency, clickSwap, and assertion methods: getConversionResult, getErrorMessage, verifyResultContains, verifyErrorMessageContains
- [x] T008 Create `e2e/fixtures/test-data.ts` with constants: SUPPORTED_CURRENCIES (USD, EUR, GBP, JPY, AUD, CAD, CHF, CNY, INR, MXN), TEST_SCENARIOS object with valid conversions, invalid inputs, and edge cases
- [x] T009 Create `e2e/fixtures/mock-rates.ts` with MOCK_EXCHANGE_RATES object containing realistic conversion rates for all 10 currencies and 90 possible currency pairs (pairs = 10 \* 9)

---

## Phase 3: User Story 1 - Currency Conversion Flow (P1)

### Priority 1: Core Conversion Functionality

- [x] T010 [P] [US1] Create `e2e/tests/conversion-flow.spec.ts` test file with test suite setup, beforeEach hook for mock API setup using `page.route('**/api/rates', ...)`, and ConverterPage initialization
- [x] T011 [P] [US1] Implement test case "should convert USD to EUR with correct amount" that fills amount 100, selects USD→EUR, verifies result contains expected value (around 92) with tolerance for rate variations
- [x] T012 [P] [US1] Implement test case "should convert GBP to USD correctly" with GBP source, USD target, verify result accuracy against mock rates
- [x] T013 [P] [US1] Implement test case "should swap currencies and update result" that enters amount and currencies, clicks swap button, verifies both currencies swap and result recalculates
- [x] T014 [P] [US1] Implement test case "should update result automatically when amount changes" that sets initial conversion, changes amount, verifies result updates without manual recalculation trigger
- [x] T015 [P] [US1] Implement test case "should handle conversion across all supported currency pairs" using parametrized test with TEST_SCENARIOS data to validate conversions for multiple currency combinations (minimum 5 combinations)

---

## Phase 4: User Story 2 - Input Validation & Error Handling (P2)

### Priority 2: Robustness & Error Handling

- [x] T016 [P] [US2] Create `e2e/tests/input-validation.spec.ts` test file with test suite setup and beforeEach hook for mock API initialization
- [x] T017 [P] [US2] Implement test case "should reject negative amount input and display error" that enters "-100" in amount field, verifies error message displays with pattern "must be positive|cannot be negative"
- [x] T018 [P] [US2] Implement test case "should reject empty amount field" that attempts conversion with empty amount, verifies error message displays with pattern "required|cannot be empty" and conversion is prevented
- [x] T019 [P] [US2] Implement test case "should reject non-numeric characters in amount" that enters "ABC", "!@#", "10.5.5", verifies error messages display appropriately for each invalid input type
- [x] T020 Create `e2e/tests/error-handling.spec.ts` test file with test suite setup and beforeEach hook for mock API failure configuration
- [x] T021 [P] [US2] Implement test case "should display error message when API fails" that aborts API route with `route.abort('failed')`, performs conversion action, verifies user-friendly error message displays
- [x] T022 [P] [US2] Implement test case "should handle API returning invalid JSON response" that returns malformed JSON from mocked API, verifies graceful error handling with appropriate error message, no crashes

---

## Phase 5: User Story 3 - Conversion History (P3)

### Priority 3: Conversion History Persistence

- [x] T023 [P] [US3] Create `e2e/tests/conversion-history.spec.ts` test file with test suite setup, beforeEach hook for mock API, ConverterPage initialization, and history list locator definition
- [x] T024 [P] [US3] Implement test case "should add conversion to history after successful conversion" that performs USD→EUR conversion with amount 100, verifies conversion appears in history list with all details (amount, currencies, result)
- [x] T025 [P] [US3] Implement test case "should maintain maximum 10 conversion history items" that performs 12 conversions sequentially, verifies history count never exceeds 10, verifies oldest 2 items are removed

---

## Phase 6: Cross-Browser & Edge Cases

### Edge Case Coverage (Applied to Phases 3-5)

- [x] T026 [P] Execute all P1 tests across Chromium, Firefox, WebKit with `npx playwright test --project=chromium`, `--project=firefox`, `--project=webkit`, verify 100% pass rate across browsers
- [x] T027 [P] Implement edge case validation: test with very large amount (999999999), same currency for source and target (USD→USD expecting 1:1), rapid consecutive conversions (5 in sequence), verify all handle correctly

---

## Phase 7: Polish & Verification

### Final Integration & Documentation

- [x] T028 Generate HTML test report with `npx playwright show-report`, verify report displays all test results, screenshots for failures, and video recordings
- [x] T029 Create CI/CD configuration: add `.github/workflows/e2e-tests.yml` with GitHub Actions workflow that installs dependencies, runs Playwright tests, uploads HTML report as artifact, succeeds only when all tests pass

---

## Task Allocation & Parallelization Strategy

### Parallel Execution Example - After Foundation Complete:

**Parallel Group 1 (User Stories 1-3 simultaneous)**:

- Developer A: Tasks T010-T015 (US1 Conversion Flow)
- Developer B: Tasks T016-T022 (US2 Validation & Errors)
- Developer C: Tasks T023-T025 (US3 History)

**Sequential Tasks per Developer**:

- T001 → T002 → T003 → T004 (setup, must be sequential)
- T005 → T006 → T007 (page objects, T006-T007 can parallel after T005 starts)
- T008 → T009 (fixtures, can parallel)

### Execution Path (Sequential):

1. Complete Setup Phase (T001-T004): ~1 hour
2. Complete Foundational Phase (T005-T009): ~2 hours
3. Parallel User Stories (T010-T025): ~4 hours (3 developers in parallel)
4. Cross-Browser & Polish (T026-T029): ~2 hours

**Total Estimated Duration**: 9 hours of work (can be 3 hours with 3 developers in parallel phases)

---

## Requirements Mapping

| Requirement                   | Task                         | Status        |
| ----------------------------- | ---------------------------- | ------------- |
| FR-001: Playwright setup      | T001, T002, T003, T004       | Foundational  |
| FR-002: Conversion flow tests | T011, T012, T013, T014, T015 | US1           |
| FR-003: Exchange rate display | T011, T012                   | US1           |
| FR-004: Swap functionality    | T013                         | US1           |
| FR-005: Input validation      | T017, T018, T019             | US2           |
| FR-006: Error handling        | T021, T022                   | US2           |
| FR-007: History persistence   | T024, T025                   | US3           |
| FR-008: Headed/headless modes | T001 (config), CLI flags     | Configuration |
| FR-009: Test reports          | T028                         | Polish        |
| FR-010: CI/CD integration     | T029                         | Polish        |

---

## Success Criteria (Per Task Group)

### Setup Phase (T001-T004)

- ✅ Playwright installed and configured for 3 browsers
- ✅ Directory structure created and npm scripts available
- ✅ Configuration supports headless and headed modes

### Foundational Phase (T005-T009)

- ✅ Page Objects provide typed interface for all UI interactions
- ✅ Test data includes all supported currencies and scenarios
- ✅ Mock rates cover all 10×9=90 currency pairs

### US1 Phase (T010-T015)

- ✅ All 3 P1 acceptance scenarios implemented and passing
- ✅ 5+ currency pair combinations tested
- ✅ Result accuracy verified within reasonable tolerance

### US2 Phase (T016-T022)

- ✅ 3 invalid input types rejected with appropriate errors
- ✅ API failure handled gracefully with user-friendly message
- ✅ Invalid JSON response handled without crashes

### US3 Phase (T023-T025)

- ✅ Conversions persist in history list
- ✅ Maximum 10 items enforced (oldest removed)
- ✅ History includes complete conversion details

### Cross-Browser (T026-T027)

- ✅ All P1 tests pass on Chromium, Firefox, WebKit
- ✅ Edge cases (large amounts, same currency, rapid conversions) work
- ✅ Total suite execution under 2 minutes

### Polish (T028-T029)

- ✅ HTML report generated with full test details
- ✅ CI/CD workflow runs tests automatically on push/PR
- ✅ Test artifacts preserved (screenshots, videos, reports)

---

## Implementation Notes

### Code Quality Standards (Per Constitution)

- All test files use TypeScript with strict mode
- Page Objects have JSDoc comments on all public methods
- Test names are descriptive and follow naming convention: `should [expected behavior]`
- Helper functions extracted to `e2e/utils/` for reusability

### Test Independence

- Each test is independently executable via `npx playwright test -g "test name"`
- Setup is isolated per test with `beforeEach` hook
- Mock API is reset for each test to prevent state leakage

### Maintainability

- Selectors centralized in page objects, not scattered in tests
- Test data in fixtures directory, easy to update rates/currencies
- Page object methods abstract UI implementation details from tests
- Assertion errors include helpful context (expected vs actual)

### CI/CD Considerations

- Configuration detects CI environment via `process.env.CI`
- Tests run in serial mode on CI (1 worker) for reliability
- Tests run in parallel locally (4 workers) for speed
- Artifacts (reports, screenshots, videos) uploaded automatically

---

## References

- [Specification](spec.md) - Feature requirements and acceptance criteria
- [Plan](plan.md) - Technical architecture and design decisions
- [Data Model](data-model.md) - Test structure and page object design
- [Research](research.md) - Technical research and framework selection
- [Quickstart](quickstart.md) - Setup and execution guide
