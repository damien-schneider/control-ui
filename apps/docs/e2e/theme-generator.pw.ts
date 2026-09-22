import { readFileSync } from "node:fs";

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
    skin: "none",
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

async function mockGeneration(page: import("@playwright/test").Page, lines: unknown[]) {
  await page.route("**/api/theme", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/x-ndjson",
      body: lines.map((line) => JSON.stringify(line)).join("\n"),
    });
  });
}

test("a generated palette streams onto the page and settles as complete", async ({ page }) => {
  await mockGeneration(page, streamedLines);

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
      { type: "complete", skin: "none", name: "Terracotta Clay", tokens: { "--canvas": CANVAS }, adjustments: [] },
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

// The generator reads screenshots, and the fastest way to hand it one is a paste into the prompt. It used
// to own a bare file input, so a pasted or dropped image never reached it.
test("a screenshot pasted into the prompt is the image the generator reads", async ({ page }) => {
  let sentImage: unknown = null;
  await page.route("**/api/theme", async (route) => {
    sentImage = route.request().postDataJSON().image ?? null;
    const lines = [{ type: "complete", skin: "none", name: "Pasted Clay", tokens: { "--canvas": CANVAS }, adjustments: [] }];
    await route.fulfill({ status: 200, contentType: "application/x-ndjson", body: lines.map((line) => JSON.stringify(line)).join("\n") });
  });

  const composer = await openGenerator(page);
  const prompt = composer.getByRole("textbox", { name: "Message" });
  const png = [...readFileSync("e2e/fixtures/brief.png")];

  const claimed = await prompt.evaluate((element, bytes) => {
    const clipboard = new DataTransfer();
    clipboard.items.add(new File([new Uint8Array(bytes)], "screenshot.png", { type: "image/png" }));
    return !element.dispatchEvent(new ClipboardEvent("paste", { clipboardData: clipboard, bubbles: true, cancelable: true }));
  }, png);
  expect(claimed).toBe(true);

  const attachment = composer.getByRole("listitem", { name: "screenshot.png" });
  await expect(attachment.locator("img")).toHaveAttribute("src", /^data:image\/jpeg/);

  await composer.getByRole("button", { name: "Generate" }).click();
  await expect(page.locator('[data-control-ui="activity"][data-slot="root"]').last()).toContainText("Pasted Clay");
  expect(sentImage).toMatchObject({ mediaType: "image/jpeg" });
  await expect(attachment).toHaveCount(0);
});

test("a pasted file the generator cannot read shows why and can be dismissed", async ({ page }) => {
  const composer = await openGenerator(page);
  const prompt = composer.getByRole("textbox", { name: "Message" });

  await prompt.evaluate((element) => {
    const clipboard = new DataTransfer();
    clipboard.items.add(new File(["%PDF-1.7"], "brief.pdf", { type: "application/pdf" }));
    element.dispatchEvent(new ClipboardEvent("paste", { clipboardData: clipboard, bubbles: true, cancelable: true }));
  });

  const rejected = composer.getByRole("listitem", { name: "brief.pdf" });
  await expect(rejected).toHaveAttribute("data-state", "error");
  await expect(rejected).toContainText("File type is not accepted.");
  await expect(composer.getByRole("button", { name: "Generate" })).toBeDisabled();

  await rejected.getByRole("button", { name: "Remove brief.pdf" }).click();
  await expect(rejected).toHaveCount(0);
});

// A generation clears the active mode before repainting it, so a stream that dies mid-object used to
// leave a theme that was neither the old one nor a new one, with no way back.
test("a stream that dies mid-object puts the previous theme back", async ({ page }) => {
  await page.goto("/theme-editor");

  const before = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--canvas").trim());

  await page.route("**/api/theme", async (route) => {
    const truncated = [
      { type: "tokens", tokens: { "--canvas": CANVAS, "--card": "oklch(0.24 0.016 60)" } },
      { type: "error", error: "Structured output validation failed." },
    ];
    await route.fulfill({
      status: 200,
      contentType: "application/x-ndjson",
      body: truncated.map((line) => JSON.stringify(line)).join("\n"),
    });
  });

  const composer = await openGenerator(page);
  await composer.getByRole("textbox", { name: "Message" }).fill("warm brutalist terminal");
  await composer.getByRole("button", { name: "Generate" }).click();

  await expect(page.locator('[data-control-ui="activity"][data-slot="root"]').last()).toContainText("Failed");

  const after = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--canvas").trim());
  expect(after).toBe(before);
  expect(after).not.toBe(CANVAS);
});

// Knobs stream behind the finished palette. A connection that dies there used to put the previous theme
// back and mark a palette the user was already looking at as failed.
test("a failure after the palette completes keeps the finished theme", async ({ page }) => {
  await mockGeneration(page, [
    { type: "complete", skin: "none", name: "Kept Ember", tokens: { "--canvas": CANVAS }, adjustments: [] },
    { type: "error", error: "Knob pass timed out." },
  ]);

  const composer = await openGenerator(page);
  await composer.getByRole("textbox", { name: "Message" }).fill("amber terminal");
  await composer.getByRole("button", { name: "Generate" }).click();

  const activity = page.locator('[data-control-ui="activity"][data-slot="root"]').last();
  await expect(activity).toContainText("Kept Ember");
  await expect(activity).toContainText("Complete");
  await expect(composer.getByRole("button", { name: "Generate" })).toBeVisible();
  const canvas = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--canvas").trim());
  expect(canvas).toBe(CANVAS);
});

// Gradients, live backdrop blur and rims live in skin CSS, so a theme that only writes tokens can never
// reach a glass look however it tunes them.
test("a generated theme selects the skin that carries its depth", async ({ page }) => {
  await mockGeneration(page, [
    { type: "complete", skin: "modern-apple", name: "Glass Desk", tokens: { "--canvas": CANVAS }, adjustments: [] },
  ]);

  const composer = await openGenerator(page);
  await composer.getByRole("textbox", { name: "Message" }).fill("glassy dashboard");
  await composer.getByRole("button", { name: "Generate" }).click();

  await expect(page.locator('[data-control-ui="activity"][data-slot="root"]').last()).toContainText("Glass Desk");
  await expect(page.locator("[data-skin]").first()).toHaveAttribute("data-skin", "modern-apple");

  // The skin only earns its place if it paints something tokens cannot: a gradient canvas.
  const gradient = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--canvas-gradient").trim());
  expect(gradient).toContain("gradient");
});

// A skin that scrolls the page instead of an inset viewport rebuilds the tree under PageLayout, which
// remounts the drawer and everything in it. The generation log has to come back with it.
test("a skin that relayouts the page keeps the generation on screen", async ({ page }) => {
  await mockGeneration(page, [{ type: "complete", skin: "refined", name: "Paper Desk", tokens: { "--canvas": CANVAS }, adjustments: [] }]);

  const composer = await openGenerator(page);
  await composer.getByRole("textbox", { name: "Message" }).fill("quiet paper");
  await composer.getByRole("button", { name: "Generate" }).click();

  await expect(page.locator("[data-skin]").first()).toHaveAttribute("data-skin", "refined");
  await expect(page.locator('[data-control-ui="activity"][data-slot="root"]').last()).toContainText("Paper Desk");
  await expect(composer).toBeVisible();
});

// A theme names a family the page does not have, and a knob the token layer cannot express. Both only
// become visible through the document: a stylesheet link for the font, a scoped rule for the knob.
test("a generated theme loads the family it names and writes the knobs it chose", async ({ page }) => {
  const buttonRule = ':where([data-control-family="button"][data-control="true"])';
  await mockGeneration(page, [
    {
      type: "complete",
      skin: "none",
      name: "Ember Terminal",
      tokens: { "--canvas": CANVAS, "--font-sans": '"Space Grotesk", ui-sans-serif, system-ui, sans-serif' },
      adjustments: [],
      font: { family: "Space Grotesk", url: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" },
    },
    { type: "knobs", rules: [{ selector: buttonRule, tokens: { "--cui-button-shadow": "4px 4px 0 0 var(--foreground)" } }] },
  ]);

  const composer = await openGenerator(page);
  await composer.getByRole("textbox", { name: "Message" }).fill("brutalist amber terminal");
  await composer.getByRole("button", { name: "Generate" }).click();

  const activity = page.locator('[data-control-ui="activity"][data-slot="root"]').last();
  await expect(activity).toContainText("Ember Terminal");
  await expect(page.locator("#control-ui-editor-font")).toHaveAttribute("href", /family=Space\+Grotesk/);

  // The recipe declares this knob in a zero-specificity :where(), so the generated rule only wins while it
  // carries the skin scope in front of it. The var() is gone from the computed value because the knob
  // resolved against the theme's own foreground rather than a colour the generation invented.
  await expect
    .poll(() =>
      page.evaluate(() => {
        const button = document.querySelector('[data-control-family="button"][data-control="true"]');
        return button ? getComputedStyle(button).getPropertyValue("--cui-button-shadow").trim() : "no button on the page";
      }),
    )
    .toMatch(/^4px 4px 0 0 (?!var\()\S/);

  await activity.getByRole("button").first().click();
  await expect(activity).toContainText("Space Grotesk");
  await expect(activity).toContainText("--cui-button-shadow");
});
