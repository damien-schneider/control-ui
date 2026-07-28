import { defineConfig, devices } from "@playwright/test";

const browserTestTimeout = 300_000;

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.pw.ts",
  timeout: browserTestTimeout,
  expect: {
    timeout: 30_000,
  },
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:3000",
    navigationTimeout: browserTestTimeout,
    colorScheme: "light",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "bun run dev",
    reuseExistingServer: !process.env.CI,
    url: "http://127.0.0.1:3000/r/registry.json",
    timeout: browserTestTimeout,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
