import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests run against a real client dev server. They require Playwright
 * browsers (`npx playwright install`) and, for anything past the landing page, a
 * running API + database (see the README).
 *
 * `webServer` boots the Vite dev server automatically; set E2E_BASE_URL to test
 * an already-running deployment instead.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'line' : 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npm run dev -w client',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
