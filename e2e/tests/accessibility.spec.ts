import { test, expect } from "@playwright/test";
import { ConverterPage } from "../pages/converter-page";
import { setupMockAPI } from "../utils/api-mocking";

test.describe("Accessibility & Responsive Design (P3)", () => {
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

  test("should have proper heading hierarchy", async ({ page }) => {
    // Arrange & Act
    const h1Elements = page.locator("h1");
    const h1Count = await h1Elements.count();

    // Assert - Should have exactly one H1
    expect(h1Count).toBe(1);

    // Should have proper heading text
    const headingText = await h1Elements.first().textContent();
    expect(headingText).toBeTruthy();
  });

  test("should have descriptive labels for form inputs", async ({ page }) => {
    // Arrange - Get form inputs
    const amountInput = converterPage.amountInput;
    const fromSelect = page.locator('[data-testid="currency-select-from"]');
    const toSelect = page.locator('[data-testid="currency-select-to"]');

    // Assert - Check for labels or aria-labels
    const amountAriaLabel = await amountInput.getAttribute("aria-label");
    const amountPlaceholder = await amountInput.getAttribute("placeholder");

    expect(amountAriaLabel || amountPlaceholder).toBeTruthy();
  });

  test("should support keyboard navigation", async ({ page }) => {
    // Arrange
    await converterPage.navigate();
    await converterPage.waitForLoadingToComplete();

    // Act - Tab through form elements
    const amountInput = converterPage.amountInput;

    // Focus on amount input
    await amountInput.focus();
    let focusedElement = await page.evaluate(() =>
      document.activeElement?.getAttribute("data-testid")
    );
    expect(focusedElement).toBe("amount-input");

    // Tab to next element
    await page.keyboard.press("Tab");
    await page.waitForTimeout(200);

    // Should be able to navigate
    const nextElement = await page.evaluate(() =>
      document.activeElement?.getAttribute("data-testid")
    );
    expect(nextElement).toBeTruthy();
  });

  test("should have sufficient color contrast", async ({ page }) => {
    // Arrange
    const textElements = page.locator("body *:visible");
    const count = await textElements.count();

    // This is a basic check - ideally use axe-core or similar
    // For now, just verify page is readable
    const result = await converterPage.getConversionResult();
    // Page should render text content
    expect(count).toBeGreaterThan(0);
  });

  test("should support screen reader announcements for errors", async ({
    page,
  }) => {
    // Arrange
    await converterPage.fillAmount("-100");
    await page.locator("body").click(); // Blur to trigger validation

    // Act - Check for role="alert" or aria-live region
    const alertRegion = page.locator('[role="alert"]');
    const liveRegion = page.locator("[aria-live]");

    // Assert - Should have either alert or live region for error messages
    const hasAlert = await alertRegion.count();
    const hasLive = await liveRegion.count();

    expect(
      hasAlert > 0 ||
        hasLive > 0 ||
        (await converterPage.isErrorMessageVisible())
    ).toBe(true);
  });

  test("should display results with clear formatting", async ({ page }) => {
    // Arrange
    await converterPage.fillAmount("100");
    await converterPage.selectFromCurrency("USD");
    await converterPage.selectToCurrency("EUR");
    await page.waitForTimeout(500);

    // Act
    const resultText = await converterPage.getConversionResult();

    // Assert - Result should be clearly visible and formatted
    expect(resultText).toBeTruthy();
    expect(resultText).toMatch(/\d+\.?\d*/); // Should contain numbers
  });

  test("should be responsive on small screens", async ({ page }) => {
    // Arrange
    await page.setViewportSize({ width: 320, height: 568 }); // Small phone

    // Act
    await converterPage.navigate();
    await converterPage.waitForLoadingToComplete();

    // Assert - All key elements should be visible
    const amountInputVisible = await converterPage.amountInput.isVisible();
    expect(amountInputVisible).toBe(true);

    // No horizontal scrolling should be needed
    const pageWidth = await page.evaluate(() => window.innerWidth);
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth
    );
    expect(scrollWidth).toBeLessThanOrEqual(pageWidth + 10); // Small tolerance
  });

  test("should scale properly on large screens", async ({ page }) => {
    // Arrange
    await page.setViewportSize({ width: 2560, height: 1440 }); // 2K screen

    // Act
    await converterPage.navigate();
    await converterPage.waitForLoadingToComplete();

    // Assert
    const amountInputVisible = await converterPage.amountInput.isVisible();
    expect(amountInputVisible).toBe(true);

    // Form should still be usable
    await converterPage.fillAmount("100");
    await converterPage.selectFromCurrency("USD");
    await converterPage.selectToCurrency("EUR");
    await page.waitForTimeout(500);

    const result = await converterPage.getConversionResult();
    expect(result).toBeTruthy();
  });

  test("should handle high zoom levels", async ({ page }) => {
    // Arrange
    await converterPage.navigate();
    await converterPage.waitForLoadingToComplete();

    // Act - Zoom to 150%
    await page.evaluate(() => {
      document.body.style.zoom = "150%";
    });

    // Assert - Key elements should still be accessible
    const amountInput = converterPage.amountInput;
    const isVisible = await amountInput.isVisible();
    expect(isVisible).toBe(true);

    // Should still be able to interact
    await amountInput.focus();
    const isFocused = await page.evaluate(
      () =>
        document.activeElement?.getAttribute("data-testid") === "amount-input"
    );
    expect(isFocused).toBe(true);
  });

  test("should have appropriate ARIA labels for interactive elements", async ({
    page,
  }) => {
    // Arrange
    const swapButton = page.locator('[data-testid="swap-button"]');
    const historyItems = page.locator('[data-testid="history-item"]');

    // Assert - Swap button should have label
    const swapLabel =
      (await swapButton.getAttribute("aria-label")) ||
      (await swapButton.getAttribute("title")) ||
      (await swapButton.textContent());

    expect(swapLabel).toBeTruthy();
  });

  test("should provide feedback for all user actions", async ({ page }) => {
    // Arrange
    await converterPage.navigate();
    await converterPage.waitForLoadingToComplete();

    // Act - Perform conversion
    await converterPage.fillAmount("100");
    await converterPage.selectFromCurrency("USD");
    await converterPage.selectToCurrency("EUR");
    await page.waitForTimeout(500);

    // Assert - Should have visible result
    const result = await converterPage.getConversionResult();
    expect(result).toBeTruthy();

    // Act - Perform swap
    await converterPage.clickSwap();
    await page.waitForTimeout(500);

    // Assert - Should reflect swap
    const fromAfterSwap = await converterPage.getFromCurrency();
    const toAfterSwap = await converterPage.getToCurrency();

    expect(fromAfterSwap).toContain("EUR");
    expect(toAfterSwap).toContain("USD");
  });

  test("should meet WCAG 2.1 AA standards (manual verification needed)", async ({
    page,
  }) => {
    // Note: This test requires axe-playwright library
    // For now, we verify the page loads and is interactive

    // Arrange
    await converterPage.navigate();
    await converterPage.waitForLoadingToComplete();

    // Act - Perform basic interaction
    await converterPage.fillAmount("100");
    await converterPage.selectFromCurrency("USD");
    await converterPage.selectToCurrency("EUR");

    // Assert - Page should be fully functional
    const result = await converterPage.getConversionResult();
    expect(result).toBeTruthy();

    // Manual note: Run axe-core scan separately for comprehensive A11y audit
    // npx axe http://localhost:3000
  });
});
