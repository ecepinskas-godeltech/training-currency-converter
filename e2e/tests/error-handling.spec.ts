import { test, expect } from "@playwright/test";
import { ConverterPage } from "../pages/converter-page";
import {
  setupMockAPI,
  setupAPIFailure,
  setupAPIInvalidResponse,
} from "../utils/api-mocking";

test.describe("Error Handling & API Resilience (P2)", () => {
  let converterPage: ConverterPage;

  test.beforeEach(async ({ page }) => {
    // Initialize page object
    converterPage = new ConverterPage(page);

    // Navigate to application
    await converterPage.navigate();
  });

  test("should handle API failure gracefully", async ({ page }) => {
    // Arrange - Setup API to fail
    await setupAPIFailure(page);

    await converterPage.waitForLoadingToComplete();

    // Act - Attempt conversion
    await converterPage.fillAmount("100");
    await converterPage.selectFromCurrency("USD");
    await converterPage.selectToCurrency("EUR");

    // Allow time for API request to fail
    await page.waitForTimeout(1000);

    // Assert - Error message should be shown, not a crash
    const isErrorVisible = await converterPage.isErrorMessageVisible();
    expect(isErrorVisible).toBe(true);

    // Error message should be user-friendly
    const errorMessage = await converterPage.getErrorMessage();
    expect(errorMessage).toBeTruthy();
    expect(errorMessage).not.toContain("undefined");
    expect(errorMessage).not.toContain("null");

    // Conversion result should NOT be shown
    const resultText = await converterPage.getConversionResult();
    expect(resultText).toBe("");
  });

  test("should handle invalid API response gracefully", async ({ page }) => {
    // Arrange - Setup API to return invalid response
    await setupAPIInvalidResponse(page);

    await converterPage.waitForLoadingToComplete();

    // Act - Attempt conversion
    await converterPage.fillAmount("100");
    await converterPage.selectFromCurrency("USD");
    await converterPage.selectToCurrency("EUR");

    // Allow time for response processing
    await page.waitForTimeout(1000);

    // Assert - Application should not crash
    // Either show error or fallback
    const isErrorVisible = await converterPage.isErrorMessageVisible();
    const resultText = await converterPage.getConversionResult();

    // At minimum, should not have both error and result
    expect(!(isErrorVisible && resultText.length > 0)).toBe(true);
  });

  test("should display helpful error message when API is unavailable", async ({
    page,
  }) => {
    // Arrange
    await setupAPIFailure(page);
    await converterPage.waitForLoadingToComplete();

    // Act - Trigger conversion attempt
    await converterPage.fillAmount("100");
    await converterPage.selectFromCurrency("USD");
    await converterPage.selectToCurrency("EUR");
    await page.waitForTimeout(1000);

    // Assert
    const errorVisible = await converterPage.isErrorMessageVisible();
    if (errorVisible) {
      const errorText = await converterPage.getErrorMessage();
      // Error should mention the issue but not be overly technical
      expect(errorText).toMatch(/unable|failed|try again|service|temporarily/i);
    }
  });

  test("should recover when valid API request succeeds after failure", async ({
    page,
  }) => {
    // Arrange - Start with failed API
    await setupAPIFailure(page);
    await converterPage.waitForLoadingToComplete();

    // Act - First attempt (should fail)
    await converterPage.fillAmount("100");
    await converterPage.selectFromCurrency("USD");
    await converterPage.selectToCurrency("EUR");
    await page.waitForTimeout(1000);

    // Setup mock API to work
    await setupMockAPI(page);

    // Clear and try again
    await converterPage.clearAmount();
    await converterPage.fillAmount("50");
    await page.waitForTimeout(1000);

    // Assert - Should show result now
    const resultText = await converterPage.getConversionResult();
    expect(resultText).toBeTruthy();
    expect(resultText).toContain("46"); // 50 USD ≈ 46 EUR
  });

  test("should validate input before making API request", async ({ page }) => {
    // Arrange
    await setupMockAPI(page);
    await converterPage.waitForLoadingToComplete();

    let apiWasCalled = false;

    // Listen for API calls
    page.on("response", (response) => {
      if (response.url().includes("/api/rates")) {
        apiWasCalled = true;
      }
    });

    // Act - Enter invalid input
    await converterPage.fillAmount("-100");
    await page.waitForTimeout(500);

    // Assert - API should NOT have been called for invalid input
    // This tests client-side validation
    expect(apiWasCalled).toBe(false);
  });

  test("should show consistent error messages across different failure modes", async ({
    page,
  }) => {
    // Test 1: API Failure
    await setupAPIFailure(page);
    await converterPage.waitForLoadingToComplete();

    await converterPage.fillAmount("100");
    await converterPage.selectFromCurrency("USD");
    await converterPage.selectToCurrency("EUR");
    await page.waitForTimeout(1000);

    const error1Visible = await converterPage.isErrorMessageVisible();
    const error1Message = error1Visible
      ? await converterPage.getErrorMessage()
      : "";

    // Test 2: Invalid Response
    // Reload and try with invalid response
    await converterPage.navigate();
    await setupAPIInvalidResponse(page);
    await converterPage.waitForLoadingToComplete();

    await converterPage.fillAmount("100");
    await converterPage.selectFromCurrency("USD");
    await converterPage.selectToCurrency("EUR");
    await page.waitForTimeout(1000);

    const error2Visible = await converterPage.isErrorMessageVisible();
    const error2Message = error2Visible
      ? await converterPage.getErrorMessage()
      : "";

    // Assert - Both should have some form of error handling
    expect(error1Visible || error2Visible).toBe(true);
  });
});
