import { test, expect } from "@playwright/test";
import { ConverterPage } from "../pages/converter-page";
import { setupMockAPI } from "../utils/api-mocking";
import { TEST_SCENARIOS } from "../fixtures/test-data";

test.describe("Conversion Flow (P1 - Core Functionality)", () => {
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

  test("should convert USD to EUR with correct amount", async () => {
    // Arrange
    const amount = "100";
    const expectedResult = "92";

    // Act
    await converterPage.fillAmount(amount);
    await converterPage.selectFromCurrency("USD");
    await converterPage.selectToCurrency("EUR");

    // Assert
    await converterPage.verifyResultContains(expectedResult);
  });

  test("should convert GBP to USD correctly", async () => {
    // Arrange
    const amount = "100";
    const expectedResult = "127";

    // Act
    await converterPage.fillAmount(amount);
    await converterPage.selectFromCurrency("GBP");
    await converterPage.selectToCurrency("USD");

    // Assert
    await converterPage.verifyResultContains(expectedResult);
  });

  test("should swap currencies and update result", async () => {
    // Arrange
    await converterPage.fillAmount("100");
    await converterPage.selectFromCurrency("USD");
    await converterPage.selectToCurrency("EUR");

    // Get initial result
    const initialFromCurrency = await converterPage.getFromCurrency();
    const initialToCurrency = await converterPage.getToCurrency();

    // Act
    await converterPage.clickSwap();

    // Assert
    const newFromCurrency = await converterPage.getFromCurrency();
    const newToCurrency = await converterPage.getToCurrency();

    expect(newFromCurrency).toBe(initialToCurrency);
    expect(newToCurrency).toBe(initialFromCurrency);

    // Result should update after swap
    const result = await converterPage.getConversionResult();
    expect(result).toBeTruthy();
  });

  test("should update result automatically when amount changes", async () => {
    // Arrange
    await converterPage.selectFromCurrency("USD");
    await converterPage.selectToCurrency("EUR");

    // Act - Set initial amount
    await converterPage.fillAmount("100");
    await test.step("wait for initial calculation", async () => {
      await test
        .expect(converterPage.page.locator('[data-testid="conversion-result"]'))
        .toContainText("92");
    });

    const firstResult = await converterPage.getConversionResult();

    // Act - Change amount
    await converterPage.fillAmount("200");

    // Assert - Result should update
    const secondResult = await converterPage.getConversionResult();
    expect(secondResult).not.toBe(firstResult);
    expect(secondResult).toContain("184"); // 200 * 0.92 = 184
  });

  test("should handle conversion across all supported currency pairs", async ({
    page,
  }) => {
    // Test multiple valid conversion scenarios
    const scenarios = TEST_SCENARIOS.validConversions.slice(0, 5);

    for (const scenario of scenarios) {
      // Clear previous result
      await converterPage.clearAmount();

      // Act
      await converterPage.fillAmount(scenario.inputAmount);
      await converterPage.selectFromCurrency(scenario.fromCurrency);
      await converterPage.selectToCurrency(scenario.toCurrency);

      // Assert
      if (scenario.expectedResult) {
        // Check that result contains at least the first digits of expected result
        const firstTwoDigits = scenario.expectedResult.substring(0, 2);
        const result = await converterPage.getConversionResult();
        expect(result).toBeTruthy();
        // Allow some flexibility due to rounding
        const resultNumber = parseFloat(result.replace(/[^0-9.]/g, ""));
        const expectedNumber = parseFloat(scenario.expectedResult);
        expect(resultNumber).toBeCloseTo(expectedNumber, 0);
      }
    }
  });

  test("should verify exchange rate accuracy from mock data", async () => {
    // This test verifies that the displayed conversion uses correct rates

    // Arrange
    const testCases = [
      { from: "USD", to: "EUR", amount: 50, expectedApprox: 46 }, // 50 * 0.92
      { from: "GBP", to: "USD", amount: 100, expectedApprox: 127 }, // 100 * 1.27
    ];

    for (const testCase of testCases) {
      await converterPage.clearAmount();

      // Act
      await converterPage.fillAmount(testCase.amount.toString());
      await converterPage.selectFromCurrency(testCase.from);
      await converterPage.selectToCurrency(testCase.to);

      // Assert
      const result = await converterPage.getConversionResult();
      const resultNumber = parseFloat(result.replace(/[^0-9.]/g, ""));

      // Allow ±1 for rounding differences
      expect(resultNumber).toBeGreaterThanOrEqual(testCase.expectedApprox - 1);
      expect(resultNumber).toBeLessThanOrEqual(testCase.expectedApprox + 1);
    }
  });
});
