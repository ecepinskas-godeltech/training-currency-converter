import { Page } from "@playwright/test";
import { getMockRatesResponse } from "../fixtures/mock-rates";

/**
 * Sets up mock API for exchange rates.
 * Intercepts API calls and returns mock data.
 */
export async function setupMockAPI(page: Page): Promise<void> {
  await page.route("**/api/rates", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(getMockRatesResponse()),
    });
  });
}

/**
 * Sets up API to fail (for error scenario testing).
 */
export async function setupAPIFailure(page: Page): Promise<void> {
  await page.route("**/api/rates", (route) => {
    route.abort("failed");
  });
}

/**
 * Sets up API to return invalid JSON (for error scenario testing).
 */
export async function setupAPIInvalidResponse(page: Page): Promise<void> {
  await page.route("**/api/rates", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "invalid json {",
    });
  });
}

/**
 * Clears all route handlers.
 */
export async function clearMockAPI(page: Page): Promise<void> {
  await page.unroute("**/api/rates");
}
