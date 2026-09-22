import { expect, test } from "@playwright/test";

const CANVAS = "oklch(0.16 0.012 60)";
const PRIMARY = "oklch(0.78 0.17 62)";

// The route is stubbed so the check stays offline and deterministic; what it exercises is the half no
// server test can reach — streamed lines landing on the document as custom properties.
const streamedLines = [
  { type: "tokens", tokens: { "--canvas": CANVAS } },
  { type: "tokens", tokens: { "--canvas": CANVAS, "--card": "oklch(0.24 0.016 60)" } },
  {
    type: "complete",
    name: "Ember Terminal",
    tokens: { "--canvas": CANVAS, "--card": "oklch(0.24 0.016 60)", "--primary": PRIMARY, "--radius": "0rem" },
    adjustments: [],
  },
];

test("a generated palette streams onto the page and settles as complete", async ({ page }) => {
  await page.route("**/api/theme", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/x-ndjson",
      body: streamedLines.map((line) => JSON.stringify(line)).join("\n"),
    });
  });

  await page.goto("/theme-editor/color");

  const composer = page.locator('[data-control-ui="chat-composer"][data-slot="root"]');
  await composer.getByRole("textbox", { name: "Message" }).fill("warm brutalist terminal");
  await composer.getByRole("button", { name: "Generate" }).click();

  const activity = page.locator('[data-control-ui="activity"][data-slot="root"]').last();
  await expect(activity).toContainText("Ember Terminal");
  await expect(activity).toContainText("Complete");

  const applied = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return {
      canvas: style.getPropertyValue("--canvas").trim(),
      primary: style.getPropertyValue("--primary").trim(),
      radius: style.getPropertyValue("--radius").trim(),
    };
  });

  expect(applied).toEqual({ canvas: CANVAS, primary: PRIMARY, radius: "0rem" });
});

test("a refused generation settles as failed instead of spinning", async ({ page }) => {
  await page.route("**/api/theme", async (route) => {
    await route.fulfill({ status: 429, contentType: "application/json", body: JSON.stringify({ error: "No more." }) });
  });

  await page.goto("/theme-editor/color");

  const composer = page.locator('[data-control-ui="chat-composer"][data-slot="root"]');
  await composer.getByRole("textbox", { name: "Message" }).fill("calm clinical dashboard");
  await composer.getByRole("button", { name: "Generate" }).click();

  const activity = page.locator('[data-control-ui="activity"][data-slot="root"]').last();
  await expect(activity).toContainText("Failed");
  await expect(composer.getByRole("button", { name: "Generate" })).toBeVisible();
});
