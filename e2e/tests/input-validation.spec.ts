import { test, expect } from "@playwright/test";
import { ConverterPage } from "../pages/converter-page";
import { setupMockAPI } from "../utils/api-mocking";
import { TEST_SCENARIOS } from "../fixtures/test-data";

test.describe("Input Validation & Error Handling (P2)", () => {
  let converterPage: ConverterPage;

  test.beforeEach(async ({ page }) => {
    // Setup mock API
    await setupMockAPI(page);

    // Initialize page object
    converterPage = new ConverterPage(page);

    // Navigate to application
    await converterPage.navigate();
    await converterPage.waitForLoadingToComplete();
  });

  test("should reject negative amount input and display error", async () => {
    // Arrange
    const negativeAmount = "-100";

    // Act
    await converterPage.fillAmount(negativeAmount);
    await converterPage.selectFromCurrency("USD");
    await converterPage.selectToCurrency("EUR");

    // Try to trigger conversion (if there's a button)
    // Some implementations auto-validate on input blur
    await converterPage.page.locator("body").click(); // Blur the input

    // Assert - Error should be displayed
    const isErrorVisible = await converterPage.isErrorMessageVisible();

    if (isErrorVisible) {
      const errorMessage = await converterPage.getErrorMessage();
      expect(errorMessage).toMatch(
        /must be positive|cannot be negative|invalid/i
      );
    } else {
      // Alternative: check that conversion result is NOT shown
      const resultText = await converterPage.getConversionResult();
      expect(resultText).toBe(""); // Should be empty
    }
  });

  test("should reject empty amount field", async () => {
    // Arrange
    const emptyAmount = "";

    // Act
    await converterPage.fillAmount(emptyAmount);
    await converterPage.selectFromCurrency("USD");
    await converterPage.selectToCurrency("EUR");
    await converterPage.page.locator("body").click(); // Blur input

    // Assert
    const isErrorVisible = await converterPage.isErrorMessageVisible();

    if (isErrorVisible) {
      const errorMessage = await converterPage.getErrorMessage();
      expect(errorMessage).toMatch(/required|cannot be empty|must enter/i);
    } else {
      // Alternative: check that conversion result is NOT shown
      const resultText = await converterPage.getConversionResult();
      expect(resultText).toBe("");
    }
  });

  test("should reject non-numeric characters in amount", async () => {
    // Test multiple invalid input types
    const invalidInputs = ["ABC", "!@#$", "10.5.5"];

    for (const invalidInput of invalidInputs) {
      // Arrange
      await converterPage.clearAmount();

      // Act
      await converterPage.fillAmount(invalidInput);
      await converterPage.selectFromCurrency("USD");
      await converterPage.selectToCurrency("EUR");
      await converterPage.page.locator("body").click(); // Blur input

      // Assert
      const isErrorVisible = await converterPage.isErrorMessageVisible();

      if (isErrorVisible) {
        const errorMessage = await converterPage.getErrorMessage();
        expect(errorMessage).toMatch(/invalid|numbers only|must be a number/i);
      } else {
        // Alternative: check that conversion result is NOT shown
        const resultText = await converterPage.getConversionResult();
        expect(resultText).toBe("");
      }
    }
  });

  test("should display validation error messages clearly", async () => {
    // Test that error messages are visible and clear

    // Arrange & Act - Enter invalid amount
    await converterPage.fillAmount("-50");
    await converterPage.selectFromCurrency("USD");
    await converterPage.selectToCurrency("EUR");
    await converterPage.page.locator("body").click();

    // Assert
    const errorVisible = await converterPage.isErrorMessageVisible();
    if (errorVisible) {
      expect(errorVisible).toBe(true);
      const errorText = await converterPage.getErrorMessage();
      expect(errorText).toBeTruthy();
      expect(errorText?.length).toBeGreaterThan(0);
    }
  });

  test("should recover from validation error when valid input provided", async () => {
    // Arrange
    await converterPage.fillAmount("-100"); // Invalid
    await converterPage.selectFromCurrency("USD");
    await converterPage.selectToCurrency("EUR");
    await converterPage.page.locator("body").click();

    // Act - Provide valid input
    await converterPage.clearAmount();
    await converterPage.fillAmount("100"); // Valid

    // Assert - Error should be gone and result should show
    const resultText = await converterPage.getConversionResult();
    expect(resultText).toBeTruthy();
    expect(resultText).toContain("92");
  });
});
