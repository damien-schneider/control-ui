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

test("builds, previews, saves, reloads, reselects, and exports a local AI theme", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/overview");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await expect(page.getByRole("link", { name: "Build with AI" })).toBeVisible();
  await page.getByRole("link", { name: "Build with AI" }).click();
  await expect(page).toHaveURL(/\/theme-ai-builder$/);
  await page.getByRole("button", { name: "Close theme editor" }).click();

  await page.getByLabel("Theme description").fill("Warm paper surfaces with a moss accent and generous controls");
  const imageInput = page.locator('input[type="file"][accept^="image/png"]');
  await imageInput.setInputFiles({ name: "paper.png", mimeType: "image/png", buffer: Buffer.from("local reference") });
  await expect(page.getByRole("listitem", { name: "paper.png" })).toBeVisible();
  await page.getByRole("button", { name: "Remove paper.png" }).click();
  await expect(page.getByRole("listitem", { name: "paper.png" })).toHaveCount(0);

  await page.getByRole("button", { name: "Copy prompt" }).click();
  await expect(page.getByRole("button", { name: "Prompt copied" })).toBeVisible();

  const artifactInput = page.locator('input[type="file"][accept=".json,application/json"]');
  await artifactInput.setInputFiles({
    name: "browser-paper.control-ui-theme.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(ARTIFACT)),
  });
  await expect(page.getByText("Browser Paper is valid for Refined.")).toBeVisible();

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

  await page.getByRole("button", { name: "Save as custom theme" }).click();
  await expect(page.getByText(/Saved as Browser Paper/)).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--background").trim()))
    .toBe("oklch(0.94 0.05 105)");
  await expect
    .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("control-ui:custom-themes:v1") ?? '{"themes":[]}').themes.length))
    .toBe(1);

  await page.reload();
  await expect(page.getByText("1 custom theme saved on this device")).toBeVisible();
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
  await page.setViewportSize({ width: 390, height: 844 });
  const layout = await page.evaluate(() => {
    const brief = document.querySelector("#brief")?.getBoundingClientRect();
    const previewPanel = document.querySelector("#preview")?.getBoundingClientRect();
    return {
      briefRight: brief?.right,
      previewRight: previewPanel?.right,
      previewBelow: Boolean(brief && previewPanel && previewPanel.top > brief.top),
      viewport: innerWidth,
    };
  });
  expect(layout.briefRight).toBeLessThanOrEqual(layout.viewport);
  expect(layout.previewRight).toBeLessThanOrEqual(layout.viewport);
  expect(layout.previewBelow).toBe(true);
});
