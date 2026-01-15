import { Page } from "@playwright/test";

/**
 * BasePage provides core functionality for all page objects.
 * Handles navigation, loading states, and common page interactions.
 */
export class BasePage {
  readonly page: Page;
  readonly url: string = "";

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to the page URL
   */
  async navigate(): Promise<void> {
    if (this.url) {
      await this.page.goto(this.url);
    }
  }

  /**
   * Wait for the page to fully load
   */
  async waitForLoadingToComplete(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Get the page title
   */
  async getPageTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Take a screenshot (useful for debugging)
   */
  async screenshot(name: string): Promise<Buffer | void> {
    return this.page.screenshot({ path: `e2e/reports/${name}.png` });
  }
}
