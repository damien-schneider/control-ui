import { expect, test } from "@playwright/test";

const ARTIFACT = {
  format: "control-ui-theme/v1",
  name: "Browser Paper",
  baseSkin: "refined",
  reduceMotion: false,
  tokens: {
    shared: { "--radius-control": "18px" },
    light: {
      "--background": "oklch(0.94 0.05 105)",
      "--primary": "oklch(0.48 0.16 145)",
    },
    dark: {
      "--background": "oklch(0.18 0.03 145)",
      "--primary": "oklch(0.75 0.17 145)",
    },
  },
};

test("copies an agent prompt, imports its theme, previews, applies, reloads, and exports it", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/overview");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await expect(page.getByRole("link", { name: "Build with AI" })).toBeVisible();
  await page.getByRole("link", { name: "Build with AI" }).click();
  await expect(page).toHaveURL(/\/theme-ai-builder$/);
  await expect(page.getByRole("heading", { name: "Create with your coding agent" })).toBeVisible();
  await expect(page.getByText("Claude Code · Codex · Mastra Code")).toBeVisible();
  await expect(page.getByLabel("Theme JSON")).toHaveCount(0);

  await page.getByRole("button", { name: "Copy agent prompt", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Import and test" })).toBeVisible();
  await expect(page.getByLabel("Theme JSON")).toBeHidden();
  const copiedPrompt = await page.evaluate(() => navigator.clipboard.readText());
  expect(copiedPrompt).toContain("ask me to describe the visual direction");
  expect(copiedPrompt).toContain("attach one or more reference images");
  expect(copiedPrompt).toContain("Write exactly one file named <short-name>.control-ui-theme.json");
  expect(copiedPrompt).toContain("Embedded canonical contract fallback");

  const artifactInput = page.locator('input[type="file"][accept=".json,application/json"]');
  await artifactInput.setInputFiles({
    name: "browser-paper.control-ui-theme.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(ARTIFACT)),
  });
  await expect(page.getByText("Browser Paper is ready to test.")).toBeVisible();

  const preview = page.getByTestId("theme-ai-preview");
  await expect.poll(() => preview.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe("oklch(0.94 0.05 105)");
  await expect
    .poll(() =>
      preview
        .locator('[data-control-ui="button"]')
        .first()
        .evaluate((element) => getComputedStyle(element).borderRadius),
    )
    .toBe("18px");

  await page.getByRole("button", { name: "Apply to docs" }).click();
  await expect(page.getByText("Browser Paper is active across the docs.")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--background").trim()))
    .toBe("oklch(0.94 0.05 105)");
  await expect
    .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("control-ui:custom-themes:v1") ?? '{"themes":[]}').themes.length))
    .toBe(1);

  await page.reload();
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--background").trim()))
    .toBe("oklch(0.94 0.05 105)");

  await page
    .getByRole("button", { name: /Refined/ })
    .first()
    .click();
  await page
    .getByRole("button", { name: /Browser Paper/ })
    .first()
    .click();
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--background").trim()))
    .toBe("oklch(0.94 0.05 105)");

  await page.getByRole("button", { name: "Actions for Browser Paper" }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "Export JSON" }).click();
  await expect((await download).suggestedFilename()).toBe("browser-paper.control-ui-theme.json");

  await page.getByRole("button", { name: "Close theme editor" }).click();
  await page.getByRole("button", { name: "Import and test" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  const layout = await page.evaluate(() => {
    const testStep = document.querySelector("#test")?.getBoundingClientRect();
    const previewPanel = document.querySelector("#preview")?.getBoundingClientRect();
    return {
      testRight: testStep?.right,
      previewRight: previewPanel?.right,
      previewBelow: Boolean(testStep && previewPanel && previewPanel.top > testStep.top),
      viewport: innerWidth,
    };
  });
  expect(layout.testRight).toBeLessThanOrEqual(layout.viewport);
  expect(layout.previewRight).toBeLessThanOrEqual(layout.viewport);
  expect(layout.previewBelow).toBe(true);
});
