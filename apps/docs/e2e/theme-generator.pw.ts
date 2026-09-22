import { expect, test } from "@playwright/test";

const CANVAS = "oklch(0.16 0.012 60)";
const PRIMARY = "oklch(0.78 0.17 62)";

// The route is stubbed so the check stays offline and deterministic; what it exercises is the half no
// server test can reach — streamed lines landing on the document as custom properties.
const streamedLines = [
  { type: "reasoning", text: "Amber on near-black reads as a terminal." },
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
      "--font-sans": 'var(--font-jetbrains-mono, "JetBrains Mono"), ui-monospace, monospace',
      "--shadow-color": "oklch(0.22 0.042 62)",
      "--focus-ring-width": "3px",
      "--control-rim-width": "0px",
      "--popover-opacity": "0.9",
      "--scroll-fade-size": "0px",
      "--text-heading-1--line-height": "1.127",
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
    const read = (name: string) => style.getPropertyValue(name).trim();
    return {
      canvas: read("--canvas"),
      primary: read("--primary"),
      radius: read("--radius"),
      duration: read("--duration-base"),
      controlHeight: read("--control-h"),
      // Registered `@property` knobs reject a value they cannot parse, so a wrong unit reads back empty.
      focusRing: read("--focus-ring-width"),
      rim: read("--control-rim-width"),
      popoverOpacity: read("--popover-opacity"),
      scrollFade: read("--scroll-fade-size"),
      headingLineHeight: read("--text-heading-1--line-height"),
      fontIsMono: getComputedStyle(document.body).fontFamily.includes("Mono"),
      shadowHue: read("--shadow-color"),
    };
  });

  expect(applied).toEqual({
    canvas: CANVAS,
    primary: PRIMARY,
    radius: "0rem",
    duration: "120ms",
    controlHeight: "30px",
    focusRing: "3px",
    rim: "0px",
    popoverOpacity: "0.9",
    scrollFade: "0px",
    headingLineHeight: "1.127",
    fontIsMono: true,
    shadowHue: "oklch(0.22 0.042 62)",
  });

  const thinking = page.locator('[data-control-ui="activity"][data-slot="root"]').first();
  await thinking.getByRole("button").first().click();
  await expect(thinking).toContainText("reads as a terminal");
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

// An attached screenshot is a complete brief on its own, and the composer's default rule — send only
// what has text — silently disabled Generate until a mood was typed as well.
test("an attached image alone is enough to generate", async ({ page }) => {
  await page.route("**/api/theme", async (route) => {
    const lines = [
      { type: "reasoning", text: "Reading the image: a cream surface with one terracotta accent.\n\n" },
      { type: "complete", name: "Terracotta Clay", tokens: { "--canvas": CANVAS }, adjustments: [] },
    ];
    await route.fulfill({ status: 200, contentType: "application/x-ndjson", body: lines.map((line) => JSON.stringify(line)).join("\n") });
  });

  const composer = await openGenerator(page);
  await page.locator('input[type="file"]').setInputFiles("e2e/fixtures/brief.png");
  await expect(composer.locator('[data-control-ui="chat-composer-attachment"][data-slot="root"]')).toBeVisible();

  await composer.getByRole("button", { name: "Generate" }).click();

  // The reading the theme was written from is the only account the user gets of why this palette.
  const thinking = page.locator('[data-control-ui="activity"][data-slot="root"]').first();
  await expect(thinking).toContainText("Thinking");
  await thinking.getByRole("button").first().click();
  await expect(thinking).toContainText("terracotta accent");

  await expect(page.locator('[data-control-ui="activity"][data-slot="root"]').last()).toContainText("Terracotta Clay");
});
