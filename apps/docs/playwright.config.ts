import { defineConfig, devices } from "@playwright/test";

const auditSpecs = ["**/*-performance.pw.ts", "**/tabs-transition.pw.ts", "**/contrast-sweep.pw.ts", "**/sidebar-controls-contrast.pw.ts"];

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.pw.ts",
  globalSetup: "./e2e/fixtures/build-directory.ts",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: true,
  workers: "25%",
  use: {
    baseURL: "http://127.0.0.1:3000",
    actionTimeout: 10_000,
    navigationTimeout: 60_000,
    colorScheme: "light",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "bun run dev",
    reuseExistingServer: true,
    url: "http://127.0.0.1:3000/r/registry.json",
    timeout: 300_000,
  },
  projects: [
    { name: "browser", testIgnore: auditSpecs, use: { ...devices["Desktop Chrome"] } },
    {
      name: "audits",
      testMatch: auditSpecs,
      workers: 1,
      fullyParallel: false,
      timeout: 600_000,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
