import { Page, expect } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * ConverterPage represents the currency converter application page.
 * Provides methods for interacting with the converter UI and verifying results.
 */
export class ConverterPage extends BasePage {
  readonly url = "http://localhost:3000";

  // Locator selectors - based on actual component structure
  private readonly amountInputSelector = 'input[type="number"]';
  private readonly fromCurrencySelectSelector = "select:first-of-type"; // First select
  private readonly toCurrencySelectSelector = "select:last-of-type"; // Second select
  private readonly swapButtonSelector = 'button:has-text("Swap")';
  // The result div has the text-3xl class and is bold/gray - it contains the formatted currency amount
  private readonly conversionResultSelector = "div.text-3xl.font-bold"; // Simplified selector
  private readonly errorMessageSelector = "p.text-red-600"; // Error text from ConverterForm
  private readonly historyHeaderSelector = 'h2:has-text("Conversion History")';
  private readonly historyItemsSelector =
    "div.p-4.border.border-gray-200.rounded-lg"; // History item divs

  constructor(page: Page) {
    super(page);
  }

  // Locator getters for use in tests
  get amountInput() {
    return this.page.locator(this.amountInputSelector);
  }

  get fromCurrencySelect() {
    // Target the first select specifically by using nth(0)
    return this.page.locator("select").nth(0);
  }

  get toCurrencySelect() {
    // Target the second select specifically by using nth(1)
    return this.page.locator("select").nth(1);
  }

  get swapButton() {
    return this.page.locator(this.swapButtonSelector);
  }

  get conversionResult() {
    return this.page.locator(this.conversionResultSelector);
  }

  get errorMessage() {
    return this.page.locator(this.errorMessageSelector);
  }

  get historyList() {
    return this.page
      .locator("div")
      .filter({ hasText: "Conversion History" })
      .first();
  }

  get historyItems() {
    return this.page.locator(this.historyItemsSelector);
  }

  /**
   * Fill the amount input field
   */
  async fillAmount(amount: string): Promise<void> {
    await this.amountInput.clear();
    await this.amountInput.fill(amount);
  }

  /**
   * Clear the amount input field
   */
  async clearAmount(): Promise<void> {
    await this.amountInput.clear();
  }

  /**
   * Get the current amount value
   */
  async getAmount(): Promise<string | null> {
    return this.amountInput.inputValue();
  }

  /**
   * Select a currency from the "from" currency dropdown
   */
  async selectFromCurrency(currency: string): Promise<void> {
    await this.fromCurrencySelect.selectOption(currency);
  }

  /**
   * Select a currency from the "to" currency dropdown
   */
  async selectToCurrency(currency: string): Promise<void> {
    await this.toCurrencySelect.selectOption(currency);
  }

  /**
   * Get the currently selected "from" currency
   */
  async getFromCurrency(): Promise<string | null> {
    return this.fromCurrencySelect.inputValue();
  }

  /**
   * Get the currently selected "to" currency
   */
  async getToCurrency(): Promise<string | null> {
    return this.toCurrencySelect.inputValue();
  }

  /**
   * Click the swap button to exchange currencies
   */
  async clickSwap(): Promise<void> {
    await this.swapButton.click();
    // Wait for the result to update
    await this.page.waitForTimeout(500);
  }

  /**
   * Get the conversion result text
   */
  async getConversionResult(): Promise<string> {
    const text = await this.conversionResult.textContent();
    return text || "";
  }

  /**
   * Get the error message text
   */
  async getErrorMessage(): Promise<string | null> {
    return this.errorMessage.textContent();
  }

  /**
   * Verify the result contains an expected value
   */
  async verifyResultContains(expectedValue: string): Promise<void> {
    // Wait for result element to appear and contain the expected value
    await this.page
      .locator("div.text-3xl.font-bold", { hasText: expectedValue })
      .waitFor({ timeout: 10000 })
      .catch(() => {
        // Element not found, try to get actual content for debugging
        console.warn(`Expected "${expectedValue}" but result not found`);
      });
    await expect(this.conversionResult).toContainText(expectedValue);
  }

  /**
   * Verify the error message contains expected text
   */
  async verifyErrorMessageContains(expectedText: string): Promise<void> {
    await expect(this.errorMessage).toContainText(expectedText);
  }

  /**
   * Verify that error message is visible
   */
  async isErrorMessageVisible(): Promise<boolean> {
    return this.errorMessage.isVisible().catch(() => false);
  }

  /**
   * Verify that result is visible
   */
  async isResultVisible(): Promise<boolean> {
    return this.conversionResult.isVisible().catch(() => false);
  }

  /**
   * Get count of history items
   */
  async getHistoryItemCount(): Promise<number> {
    return this.historyItems.count();
  }

  /**
   * Get all history items text
   */
  async getHistoryItems(): Promise<string[]> {
    return this.historyItems.allTextContents();
  }

  /**
   * Verify history contains a specific conversion
   */
  async verifyHistoryContains(expectedText: string): Promise<void> {
    await expect(this.historyList).toContainText(expectedText);
  }
}
