import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for E2E testing of the currency converter application.
 * Supports Chromium, Firefox, and WebKit browsers with multi-environment setup.
 */
export default defineConfig({
  testDir: "./e2e/tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,

  reporter: [
    ["html", { outputFolder: "e2e/reports/html" }],
    ["junit", { outputFile: "e2e/reports/junit.xml" }],
    ["list"],
  ],

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
});
