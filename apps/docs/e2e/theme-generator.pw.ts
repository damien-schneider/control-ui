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
    tokens: {
      "--canvas": CANVAS,
      "--card": "oklch(0.24 0.016 60)",
      "--primary": PRIMARY,
      "--radius": "0rem",
      "--duration-base": "120ms",
      "--control-h": "30px",
    },
    adjustments: [],
  },
];

async function openGenerator(page: import("@playwright/test").Page) {
  await page.goto("/theme-editor");
  await page.getByRole("button", { name: "Generate a theme" }).click();
  return page.locator('[data-control-ui="chat-composer"][data-slot="root"]');
}

test("a generated palette streams onto the page and settles as complete", async ({ page }) => {
  await page.route("**/api/theme", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/x-ndjson",
      body: streamedLines.map((line) => JSON.stringify(line)).join("\n"),
    });
  });

  const composer = await openGenerator(page);
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
      duration: style.getPropertyValue("--duration-base").trim(),
      controlHeight: style.getPropertyValue("--control-h").trim(),
    };
  });

  expect(applied).toEqual({ canvas: CANVAS, primary: PRIMARY, radius: "0rem", duration: "120ms", controlHeight: "30px" });
});

// Base UI dismisses a non-modal drawer on any outside press, which would unmount the generator and take a
// running generation with it — the one failure the streaming tests above cannot see.
test("stays open while the editor behind it is used", async ({ page }) => {
  const composer = await openGenerator(page);
  await expect(composer).toBeVisible();

  // A preview tab, not a toolbar control: the drawer covers the right edge of the toolbar.
  const applicationTab = page.getByRole("tab", { name: "Application" });
  await applicationTab.click();
  await expect(applicationTab).toHaveAttribute("aria-selected", "true");

  // Base UI dismisses on the press that follows, not during it, so a bare assertion would pass either way.
  await page.waitForTimeout(500);
  await expect(composer).toBeVisible();
});

test("a refused generation settles as failed instead of spinning", async ({ page }) => {
  await page.route("**/api/theme", async (route) => {
    await route.fulfill({ status: 429, contentType: "application/json", body: JSON.stringify({ error: "No more." }) });
  });

  const composer = await openGenerator(page);
  await composer.getByRole("textbox", { name: "Message" }).fill("calm clinical dashboard");
  await composer.getByRole("button", { name: "Generate" }).click();

  const activity = page.locator('[data-control-ui="activity"][data-slot="root"]').last();
  await expect(activity).toContainText("Failed");
  await expect(composer.getByRole("button", { name: "Generate" })).toBeVisible();
});
