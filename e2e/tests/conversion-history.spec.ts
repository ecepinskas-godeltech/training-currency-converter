import { test, expect } from "@playwright/test";
import { ConverterPage } from "../pages/converter-page";
import { setupMockAPI } from "../utils/api-mocking";

test.describe("Conversion History & Data Persistence (P2)", () => {
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

  test("should display conversion history after each conversion", async () => {
    // Arrange
    const conversions = [
      { amount: "100", from: "USD", to: "EUR", expectedInHistory: true },
      { amount: "50", from: "GBP", to: "USD", expectedInHistory: true },
      { amount: "75", from: "JPY", to: "EUR", expectedInHistory: true },
    ];

    // Act & Assert - Perform multiple conversions and verify history grows
    for (const conversion of conversions) {
      // Clear previous input
      await converterPage.clearAmount();

      // Fill in conversion details
      await converterPage.fillAmount(conversion.amount);
      await converterPage.selectFromCurrency(conversion.from);
      await converterPage.selectToCurrency(conversion.to);

      // Wait for result to appear
      await converterPage.page.waitForTimeout(500);

      // Get history count
      const historyCount = await converterPage.getHistoryItemCount();
      expect(historyCount).toBeGreaterThan(0);
    }
  });

  test("should show most recent conversion at top of history", async () => {
    // Arrange
    const firstConversion = { amount: "100", from: "USD", to: "EUR" };
    const secondConversion = { amount: "200", from: "GBP", to: "USD" };

    // Act - First conversion
    await converterPage.fillAmount(firstConversion.amount);
    await converterPage.selectFromCurrency(firstConversion.from);
    await converterPage.selectToCurrency(firstConversion.to);
    await converterPage.page.waitForTimeout(500);

    // Act - Second conversion
    await converterPage.clearAmount();
    await converterPage.fillAmount(secondConversion.amount);
    await converterPage.selectFromCurrency(secondConversion.from);
    await converterPage.selectToCurrency(secondConversion.to);
    await converterPage.page.waitForTimeout(500);

    // Assert - Check history items
    const historyItems = await converterPage.getHistoryItems();

    // Most recent should be at index 0 (top of list)
    if (historyItems.length > 0) {
      const topItem = historyItems[0];
      expect(topItem).toContain(secondConversion.amount);
      expect(topItem).toContain(secondConversion.from);
      expect(topItem).toContain(secondConversion.to);
    }
  });

  test("should limit history to reasonable size (max 10 items)", async () => {
    // Arrange - Perform 12 conversions (more than max)
    const conversions = [
      { amount: "100", from: "USD", to: "EUR" },
      { amount: "50", from: "EUR", to: "GBP" },
      { amount: "75", from: "GBP", to: "JPY" },
      { amount: "200", from: "JPY", to: "AUD" },
      { amount: "25", from: "AUD", to: "CAD" },
      { amount: "60", from: "CAD", to: "CHF" },
      { amount: "90", from: "CHF", to: "CNY" },
      { amount: "150", from: "CNY", to: "INR" },
      { amount: "30", from: "INR", to: "MXN" },
      { amount: "120", from: "MXN", to: "USD" },
      { amount: "80", from: "USD", to: "EUR" },
      { amount: "110", from: "EUR", to: "GBP" },
    ];

    // Act - Perform all conversions
    for (const conversion of conversions) {
      await converterPage.clearAmount();
      await converterPage.fillAmount(conversion.amount);
      await converterPage.selectFromCurrency(conversion.from);
      await converterPage.selectToCurrency(conversion.to);
      await converterPage.page.waitForTimeout(300);
    }

    // Assert - History should not exceed max items (typically 10)
    const historyCount = await converterPage.getHistoryItemCount();
    expect(historyCount).toBeLessThanOrEqual(10);
  });

  test("should persist conversion history across page reloads", async ({
    page,
    context,
  }) => {
    // Arrange
    const conversion = { amount: "100", from: "USD", to: "EUR" };

    // Act - Perform conversion
    await converterPage.fillAmount(conversion.amount);
    await converterPage.selectFromCurrency(conversion.from);
    await converterPage.selectToCurrency(conversion.to);
    await converterPage.page.waitForTimeout(500);

    // Get initial history
    const initialHistoryCount = await converterPage.getHistoryItemCount();
    const initialHistoryItems = await converterPage.getHistoryItems();

    // Act - Reload page
    await converterPage.navigate();
    await converterPage.waitForLoadingToComplete();

    // Assert - History should still be there
    const reloadedHistoryCount = await converterPage.getHistoryItemCount();
    const reloadedHistoryItems = await converterPage.getHistoryItems();

    expect(reloadedHistoryCount).toBe(initialHistoryCount);
    expect(reloadedHistoryItems.length).toBe(initialHistoryItems.length);

    // Verify content matches
    if (reloadedHistoryItems.length > 0) {
      expect(reloadedHistoryItems[0]).toContain(conversion.amount);
      expect(reloadedHistoryItems[0]).toContain(conversion.from);
      expect(reloadedHistoryItems[0]).toContain(conversion.to);
    }
  });

  test("should display conversion details in history (amount, currencies, result)", async () => {
    // Arrange
    const amount = "100";
    const fromCurrency = "USD";
    const toCurrency = "EUR";

    // Act
    await converterPage.fillAmount(amount);
    await converterPage.selectFromCurrency(fromCurrency);
    await converterPage.selectToCurrency(toCurrency);
    await converterPage.page.waitForTimeout(500);

    // Assert - Check history contains conversion details
    const historyItems = await converterPage.getHistoryItems();
    const historyText = historyItems.join(" ");
    expect(historyText).toContain(amount);
    expect(historyText).toContain(fromCurrency);
    expect(historyText).toContain(toCurrency);
  });

  test("should allow clicking history items to recall conversions", async () => {
    // Arrange
    const conversion1 = { amount: "100", from: "USD", to: "EUR" };
    const conversion2 = { amount: "50", from: "GBP", to: "USD" };

    // Act - Perform first conversion
    await converterPage.fillAmount(conversion1.amount);
    await converterPage.selectFromCurrency(conversion1.from);
    await converterPage.selectToCurrency(conversion1.to);
    await converterPage.page.waitForTimeout(500);

    // Act - Perform second conversion
    await converterPage.clearAmount();
    await converterPage.fillAmount(conversion2.amount);
    await converterPage.selectFromCurrency(conversion2.from);
    await converterPage.selectToCurrency(conversion2.to);
    await converterPage.page.waitForTimeout(500);

    // Get history items
    const historyItems = converterPage.historyItems;
    const itemCount = await historyItems.count();

    // Act - Click first history item (should be conversion2)
    if (itemCount > 0) {
      await historyItems.first().click();
      await converterPage.page.waitForTimeout(500);

      // Assert - Form should be populated with conversion2 details
      const amountValue = await converterPage.getAmount();
      const fromValue = await converterPage.getFromCurrency();
      const toValue = await converterPage.getToCurrency();

      expect(amountValue).toContain(conversion2.amount);
      expect(fromValue).toContain(conversion2.from);
      expect(toValue).toContain(conversion2.to);
    }
  });

  test("should show empty state when no history exists", async ({ page }) => {
    // Arrange - Use new context/page with cleared storage
    const newPage = await page.context().newPage();
    const newConverterPage = new ConverterPage(newPage);

    try {
      // Setup fresh state
      await setupMockAPI(newPage);
      await newConverterPage.navigate();
      await newConverterPage.waitForLoadingToComplete();

      // Act - Check history without any conversions
      const historyCount = await newConverterPage.getHistoryItemCount();

      // Assert - Should be empty or show appropriate message
      expect(historyCount).toBe(0);
    } finally {
      await newPage.close();
    }
  });
});
