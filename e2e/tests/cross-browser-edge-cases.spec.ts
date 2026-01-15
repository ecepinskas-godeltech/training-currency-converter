import { test, expect, devices } from "@playwright/test";
import { ConverterPage } from "../pages/converter-page";
import { setupMockAPI } from "../utils/api-mocking";

test.describe("Cross-Browser & Edge Cases (P3)", () => {
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

  test("should work correctly on mobile viewport", async ({ page }) => {
    // Arrange
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone size

    await converterPage.navigate();
    await converterPage.waitForLoadingToComplete();

    // Act
    await converterPage.fillAmount("100");
    await converterPage.selectFromCurrency("USD");
    await converterPage.selectToCurrency("EUR");
    await page.waitForTimeout(500);

    // Assert
    const result = await converterPage.getConversionResult();
    expect(result).toBeTruthy();
    expect(result).toContain("92");
  });

  test("should work correctly on tablet viewport", async ({ page }) => {
    // Arrange
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad size

    await converterPage.navigate();
    await converterPage.waitForLoadingToComplete();

    // Act
    await converterPage.fillAmount("50");
    await converterPage.selectFromCurrency("GBP");
    await converterPage.selectToCurrency("USD");
    await page.waitForTimeout(500);

    // Assert
    const result = await converterPage.getConversionResult();
    expect(result).toBeTruthy();
    expect(result).toContain("63");
  });

  test("should work correctly on desktop viewport", async ({ page }) => {
    // Arrange
    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop size

    await converterPage.navigate();
    await converterPage.waitForLoadingToComplete();

    // Act
    await converterPage.fillAmount("75");
    await converterPage.selectFromCurrency("JPY");
    await converterPage.selectToCurrency("EUR");
    await page.waitForTimeout(500);

    // Assert
    const result = await converterPage.getConversionResult();
    expect(result).toBeTruthy();
  });

  test("should handle very large amounts", async () => {
    // Arrange
    const largeAmount = "999999999";

    // Act
    await converterPage.fillAmount(largeAmount);
    await converterPage.selectFromCurrency("USD");
    await converterPage.selectToCurrency("EUR");
    await converterPage.page.waitForTimeout(500);

    // Assert - Should handle gracefully
    const result = await converterPage.getConversionResult();
    // Result should either show calculation or error message
    const hasError = await converterPage.isErrorMessageVisible();
    expect(result || hasError).toBeTruthy();
  });

  test("should handle very small decimal amounts", async () => {
    // Arrange
    const smallAmount = "0.01";

    // Act
    await converterPage.fillAmount(smallAmount);
    await converterPage.selectFromCurrency("USD");
    await converterPage.selectToCurrency("EUR");
    await converterPage.page.waitForTimeout(500);

    // Assert
    const result = await converterPage.getConversionResult();
    expect(result).toBeTruthy();
    // Should show result with proper decimal handling
    expect(result).toMatch(/0\.0\d+/);
  });

  test("should maintain functionality with rapid input changes", async () => {
    // Arrange
    const amounts = ["10", "20", "30", "40", "50"];

    // Act - Rapidly change amounts
    for (const amount of amounts) {
      await converterPage.clearAmount();
      await converterPage.fillAmount(amount);
      // Don't wait - simulate rapid user input
    }

    // Wait for final result
    await converterPage.page.waitForTimeout(1000);

    // Assert
    const finalResult = await converterPage.getConversionResult();
    expect(finalResult).toBeTruthy();
    expect(finalResult).toContain("46"); // Should show result for 50 USD to EUR
  });

  test("should handle all supported currency pairs correctly", async () => {
    // Arrange
    const currencyPairs = [
      { from: "USD", to: "EUR" },
      { from: "EUR", to: "GBP" },
      { from: "GBP", to: "JPY" },
      { from: "JPY", to: "AUD" },
      { from: "AUD", to: "CAD" },
      { from: "CAD", to: "CHF" },
      { from: "CHF", to: "CNY" },
      { from: "CNY", to: "INR" },
      { from: "INR", to: "MXN" },
      { from: "MXN", to: "USD" },
    ];

    // Act & Assert
    for (const pair of currencyPairs) {
      await converterPage.clearAmount();
      await converterPage.fillAmount("100");
      await converterPage.selectFromCurrency(pair.from);
      await converterPage.selectToCurrency(pair.to);
      await converterPage.page.waitForTimeout(300);

      // Should show result for each pair
      const result = await converterPage.getConversionResult();
      expect(!!result && result.trim() !== "").toBeTruthy();
    }
  });

  test("should preserve functionality with browser back/forward buttons", async ({
    page,
  }) => {
    // Arrange
    const conversion1 = { amount: "100", from: "USD", to: "EUR" };
    const conversion2 = { amount: "50", from: "GBP", to: "USD" };

    // Act - Perform first conversion
    await converterPage.fillAmount(conversion1.amount);
    await converterPage.selectFromCurrency(conversion1.from);
    await converterPage.selectToCurrency(conversion1.to);
    await page.waitForTimeout(500);

    // Act - Perform second conversion
    await converterPage.clearAmount();
    await converterPage.fillAmount(conversion2.amount);
    await converterPage.selectFromCurrency(conversion2.from);
    await converterPage.selectToCurrency(conversion2.to);
    await page.waitForTimeout(500);

    // Get result before navigation
    const result2Before = await converterPage.getConversionResult();

    // Act - Navigate back
    await page.goBack();
    await converterPage.waitForLoadingToComplete();
    await page.waitForTimeout(500);

    // Assert - Should show first conversion
    const resultAfterBack = await converterPage.getConversionResult();
    expect(resultAfterBack).toBeTruthy();

    // Act - Navigate forward
    await page.goForward();
    await converterPage.waitForLoadingToComplete();
    await page.waitForTimeout(500);

    // Assert - Should show second conversion
    const resultAfterForward = await converterPage.getConversionResult();
    expect(resultAfterForward).toBeTruthy();
  });

  test("should maintain UI responsiveness with keyboard navigation", async ({
    page,
  }) => {
    // Arrange
    await converterPage.navigate();
    await converterPage.waitForLoadingToComplete();

    // Act - Use Tab key to navigate
    const amountInput = converterPage.amountInput;
    await amountInput.focus();
    await amountInput.type("100");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("ArrowDown"); // Select option

    // Act - Fill in currency and amount
    await converterPage.selectToCurrency("EUR");
    await converterPage.page.waitForTimeout(500);

    // Assert - Should work with keyboard navigation
    const result = await converterPage.getConversionResult();
    // Just verify the app is still functional
    expect(result).toBeTruthy();
  });
});
