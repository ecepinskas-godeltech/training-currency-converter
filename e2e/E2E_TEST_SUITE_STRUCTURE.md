# E2E Test Suite Structure & Coverage Map

## Test Suite Organization

```
002-playwright-e2e/
│
├── playwright.config.ts                 # Multi-browser, CI/CD config
├── package.json                         # Updated with E2E scripts
│
├── e2e/
│   ├── pages/
│   │   ├── base-page.ts                 # BasePage - core navigation & helpers
│   │   └── converter-page.ts            # ConverterPage - all UI interactions
│   │
│   ├── tests/
│   │   ├── conversion-flow.spec.ts      # US1 - P1 (6 tests)
│   │   ├── input-validation.spec.ts     # US2 - P2 (5 tests)
│   │   ├── error-handling.spec.ts       # US2 - P2 (6 tests)
│   │   ├── conversion-history.spec.ts   # US3 - P3 (7 tests)
│   │   ├── cross-browser-edge-cases.spec.ts  # P3 (8 tests)
│   │   └── accessibility.spec.ts        # P3 (11 tests)
│   │
│   ├── fixtures/
│   │   ├── test-data.ts                 # Constants & test scenarios
│   │   └── mock-rates.ts                # Exchange rate data
│   │
│   ├── utils/
│   │   └── api-mocking.ts               # Mock API helpers
│   │
│   └── reports/
│       └── (auto-generated HTML reports)
```

---

## Test Specification Breakdown

### Phase 1: Conversion Flow (US1 - Priority 1)
**File**: `conversion-flow.spec.ts` | **Tests**: 6 | **Time**: ~30s

```
✅ Test 1: Basic USD → EUR conversion
   - Fill amount: 100
   - Select currencies: USD → EUR
   - Assert result: ~92 EUR

✅ Test 2: GBP → USD conversion
   - Fill amount: 100
   - Select currencies: GBP → USD
   - Assert result: ~127 USD

✅ Test 3: Swap currencies functionality
   - Enter: 100 USD → EUR
   - Click swap button
   - Assert: 100 EUR → USD with recalculated result

✅ Test 4: Reactive updates on amount change
   - Initial conversion: 100 USD → EUR = 92 EUR
   - Change amount to 200
   - Assert result updates to ~184 EUR automatically

✅ Test 5: Parametrized multi-pair testing
   - Test 5 different currency combinations
   - USD→EUR, EUR→GBP, GBP→JPY, JPY→AUD, AUD→CAD
   - Assert all conversions work correctly

✅ Test 6: Exchange rate accuracy verification
   - Verify calculations match mock rates
   - Tolerance: ±1 for rounding differences
   - Assert consistent conversion logic
```

### Phase 2: Input Validation (US2 - Priority 2)
**File**: `input-validation.spec.ts` | **Tests**: 5 | **Time**: ~25s

```
✅ Test 1: Reject negative amounts
   - Input: -100
   - Assert error: "must be positive|cannot be negative"
   - Assert no conversion shown

✅ Test 2: Reject empty amounts
   - Input: "" (empty field)
   - Assert error: "required|cannot be empty"
   - Assert conversion blocked

✅ Test 3: Reject non-numeric characters
   - Input: "ABC", "!@#$", "10.5.5"
   - Assert error for each invalid input
   - Pattern: "invalid|numbers only|must be a number"

✅ Test 4: Display validation errors clearly
   - Verify error messages are visible
   - Assert non-empty error text
   - Assert clear, user-friendly messaging

✅ Test 5: Recover from validation error
   - Start with invalid input (-50)
   - Clear and enter valid amount (100)
   - Assert error disappears and result shows
```

### Phase 2: Error Handling (US2 - Priority 2)
**File**: `error-handling.spec.ts` | **Tests**: 6 | **Time**: ~35s

```
✅ Test 1: Handle API failure gracefully
   - Setup: route.abort('failed')
   - Act: Attempt conversion
   - Assert: User-friendly error shown, no crash

✅ Test 2: Handle invalid API response
   - Setup: Return malformed JSON
   - Act: Attempt conversion
   - Assert: Graceful degradation, no crash

✅ Test 3: Display helpful error messages
   - Setup: API fails
   - Act: Trigger conversion attempt
   - Assert: Message contains "unavailable|failed|try again"

✅ Test 4: Recovery when API succeeds after failure
   - Setup: API fails initially
   - Act: Setup working mock API
   - Act: Retry conversion
   - Assert: Conversion succeeds with result

✅ Test 5: Validate input before API call
   - Setup: Listen for API requests
   - Act: Enter invalid amount (-100)
   - Assert: API not called (client-side validation)

✅ Test 6: Consistent error handling
   - Test API failure + invalid response
   - Assert both handled gracefully
   - Assert consistent error messaging
```

### Phase 3: Conversion History (US3 - Priority 3)
**File**: `conversion-history.spec.ts` | **Tests**: 7 | **Time**: ~40s

```
✅ Test 1: Display history after conversions
   - Perform 3 conversions
   - Assert history count increases after each
   - Assert history items visible

✅ Test 2: Most recent at top
   - Conversion 1: 100 USD → EUR
   - Conversion 2: 200 GBP → USD
   - Assert: Conversion 2 at index 0 (top)
   - Assert: Contains GBP, USD, 200

✅ Test 3: Enforce maximum 10 items
   - Perform 12 conversions
   - Assert history count ≤ 10
   - Assert oldest items removed first

✅ Test 4: Persist across page reloads
   - Perform conversion
   - Get history state
   - Reload page
   - Assert history still present with same items

✅ Test 5: Show conversion details
   - Perform 100 USD → EUR
   - Assert history contains:
     - Amount: 100
     - From: USD
     - To: EUR
     - Result value

✅ Test 6: Clickable history items
   - Perform 2 conversions
   - Click first history item
   - Assert form populated with that conversion

✅ Test 7: Empty state
   - Fresh page with cleared storage
   - Assert history count = 0
   - Assert no history items shown
```

### Phase 3: Cross-Browser & Edge Cases (Priority 3)
**File**: `cross-browser-edge-cases.spec.ts` | **Tests**: 8 | **Time**: ~45s

```
✅ Test 1: Mobile viewport (375×667)
   - Set mobile viewport
   - Perform USD → EUR conversion
   - Assert result accurate and visible

✅ Test 2: Tablet viewport (768×1024)
   - Set tablet viewport
   - Perform GBP → USD conversion
   - Assert result accurate and visible

✅ Test 3: Desktop viewport (1920×1080)
   - Set desktop viewport
   - Perform JPY → EUR conversion
   - Assert result accurate and visible

✅ Test 4: Very large amounts
   - Input: 999999999
   - Assert either calculation succeeds or error shown gracefully
   - Assert no crash

✅ Test 5: Very small decimal amounts
   - Input: 0.01
   - Assert result shows with proper decimal formatting
   - Assert pattern: /0\.0\d+/

✅ Test 6: Rapid input changes
   - Rapidly type amounts: 10, 20, 30, 40, 50
   - Assert final result for 50 is correct
   - Assert no state corruption

✅ Test 7: All currency pairs
   - Test 10 currency pairs in loop
   - Assert each pair converts successfully
   - Assert no missing pairs

✅ Test 8: Browser navigation
   - Perform conversion 1, then conversion 2
   - Click back button
   - Assert previous conversion shown
   - Click forward button
   - Assert current conversion shown
```

### Phase 3: Accessibility & Responsive (Priority 3)
**File**: `accessibility.spec.ts` | **Tests**: 11 | **Time**: ~50s

```
✅ Test 1: Heading hierarchy
   - Assert exactly one H1 element
   - Assert H1 has descriptive text

✅ Test 2: Descriptive form labels
   - Check for aria-label or placeholder on inputs
   - Assert all inputs have labels
   - Assert labels describe purpose

✅ Test 3: Keyboard navigation
   - Tab focus through form elements
   - Assert can reach all interactive elements
   - Assert focus visible

✅ Test 4: Color contrast
   - Verify page renders text clearly
   - Assert content readable
   - (Full audit requires axe-core)

✅ Test 5: Screen reader support
   - Check for role="alert" or aria-live regions
   - Assert error announcements available
   - Assert accessible error feedback

✅ Test 6: Result formatting clarity
   - Perform conversion
   - Assert result text is visible
   - Assert contains numeric values with proper formatting

✅ Test 7: Small screen responsiveness (320px)
   - Set viewport to 320×568
   - Assert all elements visible
   - Assert no horizontal scrolling needed

✅ Test 8: Large screen scaling (2560px)
   - Set viewport to 2560×1440
   - Assert form still usable
   - Assert can complete conversions

✅ Test 9: High zoom handling (150%)
   - Apply 150% zoom
   - Assert elements still accessible
   - Assert focus can be managed

✅ Test 10: ARIA labels
   - Check swap button for aria-label/title
   - Check history items for labels
   - Assert interactive elements labeled

✅ Test 11: User action feedback
   - Perform conversion, verify result shown
   - Click swap, verify currencies change
   - Assert all actions provide visual feedback
```

---

## Test Data Coverage

### Supported Currencies (10)
```
USD - US Dollar
EUR - Euro
GBP - British Pound
JPY - Japanese Yen
AUD - Australian Dollar
CAD - Canadian Dollar
CHF - Swiss Franc
CNY - Chinese Yuan
INR - Indian Rupee
MXN - Mexican Peso
```

### Exchange Rate Pairs (90)
```
10 × 9 = 90 possible currency pairs
Examples:
- USD → EUR: 0.92
- EUR → GBP: 0.85
- GBP → USD: 1.27
- JPY → AUD: 0.0084
- ... (90 total pairs in mock-rates.ts)
```

### Test Scenarios (12)
```
Valid Conversions (5):
  - USD 100 → EUR (92)
  - GBP 100 → USD (127)
  - JPY 100 → EUR (0.69)
  - AUD 100 → CAD (88)
  - CNY 100 → INR (1160)

Invalid Inputs (4):
  - Negative: -100
  - Empty: ""
  - Non-numeric: ABC, !@#$, 10.5.5

Edge Cases (3):
  - Very large: 999999999
  - Decimal: 0.01
  - Same currency: USD → USD (1:1)
```

---

## Execution Modes

### Local Development
```bash
# Run all tests (headless, fast)
npm run test:e2e

# Run with visible browser
npm run test:e2e:headed

# Debug mode (step through)
npm run test:e2e:debug

# View HTML report
npm run test:e2e:report
```

### By Browser
```bash
npx playwright test --project=chromium    # Fastest
npx playwright test --project=firefox     # Compatibility
npx playwright test --project=webkit      # Safari compat
```

### By Category
```bash
npx playwright test conversion-flow       # US1 only
npx playwright test input-validation      # US2 validation
npx playwright test error-handling        # US2 errors
npx playwright test conversion-history    # US3 history
```

### By Test Name
```bash
npx playwright test -g "should convert USD to EUR"
npx playwright test -g "should reject negative"
npx playwright test -g "mobile viewport"
```

---

## Coverage Matrix

| Feature | Unit | US1 | US2 | US3 | Cross | A11y | Status |
|---------|------|-----|-----|-----|-------|------|--------|
| Convert currency | ✅ | ✅ | - | - | ✅ | - | Complete |
| Display rates | ✅ | ✅ | - | - | ✅ | - | Complete |
| Swap currencies | ✅ | ✅ | - | - | ✅ | - | Complete |
| Validate input | - | - | ✅ | - | - | - | Complete |
| Error handling | - | - | ✅ | - | - | - | Complete |
| History display | - | - | - | ✅ | - | - | Complete |
| History persist | - | - | - | ✅ | - | - | Complete |
| Mobile support | - | - | - | - | ✅ | ✅ | Complete |
| Keyboard nav | - | - | - | - | - | ✅ | Complete |
| Screen reader | - | - | - | - | - | ✅ | Complete |

---

## Metrics Summary

| Metric | Value |
|--------|-------|
| **Total Tests** | 43 |
| **Test Files** | 6 |
| **Page Objects** | 2 |
| **Browsers** | 3 |
| **Viewports** | 5 |
| **Currency Pairs** | 90 |
| **Test Scenarios** | 12 |
| **Lines of Code** | ~1,400 |
| **Est. Duration** | 2-3 min |
| **Pass Rate** | Target 100% |

---

## Quick Reference

### File Locations
```
Configuration     → playwright.config.ts
Page Objects      → e2e/pages/
Test Files        → e2e/tests/
Test Data         → e2e/fixtures/
Utilities         → e2e/utils/
Reports           → e2e/reports/
```

### Key Commands
```
Install           → npm install
Run tests         → npm run test:e2e
Headed mode       → npm run test:e2e:headed
Debug             → npm run test:e2e:debug
Report            → npm run test:e2e:report
```

### Test Categories by Priority
```
P1 (Critical)     → conversion-flow.spec.ts (6 tests)
P2 (Important)    → input-validation.spec.ts (5) + error-handling.spec.ts (6)
P3 (Enhancement)  → history, cross-browser, accessibility (26 tests)
```

---

## Next Steps

1. **Run Tests Locally**: Verify all 43 tests pass
2. **Review Reports**: Check HTML report for coverage
3. **CI/CD Integration**: Add GitHub Actions workflow
4. **Merge to Main**: Integrate test suite into repository
5. **Maintenance**: Update as features evolve

---

**Implementation Status**: ✅ **COMPLETE AND READY FOR EXECUTION**
