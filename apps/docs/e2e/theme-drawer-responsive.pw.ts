import { expect, test } from "@playwright/test";

// The theme editor is the floating toolbar, morphed: same surface, expanded to (near) the whole viewport on every breakpoint.
// The pill hangs from the bottom edge below lg and from the top edge from lg, and the morph grows away from whichever edge holds it.
for (const { name, width, height, dock } of [
  { name: "mobile", width: 360, height: 900, dock: "bottom" },
  { name: "desktop", width: 1280, height: 900, dock: "top" },
]) {
  test(`theme editor morphs out of the floating toolbar on ${name}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/primitives/code-diff", { waitUntil: "networkidle" });

    const panel = page.locator("[data-docs-floating-panel]");
    const toolbar = page.locator("[data-docs-floating-toolbar]");
    const editTheme = page.getByRole("button", { name: "Edit theme" });
    const heading = page.getByRole("heading", { name: "Theme editor" });

    // Closed: a pill hugging its docked edge, editor unmounted.
    await expect(panel).toHaveAttribute("data-state", "closed");
    await expect(heading).toHaveCount(0);
    const collapsedBox = await panel.boundingBox();
    expect(collapsedBox?.height ?? Number.POSITIVE_INFINITY).toBeLessThan(80);
    if (dock === "top") {
      expect(collapsedBox?.y ?? Number.POSITIVE_INFINITY).toBeLessThan(height / 4);
    } else {
      expect((collapsedBox?.y ?? 0) + (collapsedBox?.height ?? 0)).toBeGreaterThan(height * 0.75);
    }

    await editTheme.click();
    await expect(panel).toHaveAttribute("data-state", "open");
    await expect(heading).toBeVisible();
    await expect(toolbar).toHaveAttribute("inert", "");

    // Poll both axes: the morph eases width and height together, so a plain read lands mid-transition.
    await expect
      .poll(async () => {
        const box = await panel.boundingBox();
        return box ? Math.round(Math.min(box.width / width, box.height / height) * 100) : 0;
      })
      .toBeGreaterThan(94);

    await page.getByRole("button", { name: "Close editor" }).click();
    await expect(panel).toHaveAttribute("data-state", "closed");
    await expect(heading).toHaveCount(0);
    await expect(editTheme).toBeVisible();
    await expect(toolbar).not.toHaveAttribute("inert", "");
  });
}

test("Escape closes the theme editor", async ({ page }) => {
  await page.goto("/primitives/code-diff", { waitUntil: "networkidle" });

  const panel = page.locator("[data-docs-floating-panel]");
  await page.getByRole("button", { name: "Edit theme" }).click();
  await expect(panel).toHaveAttribute("data-state", "open");

  await page.keyboard.press("Escape");
  await expect(panel).toHaveAttribute("data-state", "closed");
});

test("skin source retry replaces the error with loading state", async ({ page }) => {
  let shouldFail = true;
  let releaseRetry: (() => void) | undefined;
  let markRetryStarted: (() => void) | undefined;
  const retryStarted = new Promise<void>((resolve) => {
    markRetryStarted = resolve;
  });
  const retryGate = new Promise<void>((resolve) => {
    releaseRetry = resolve;
  });
  await page.route("**/api/registry/refined", async (route) => {
    if (shouldFail) {
      await route.fulfill({ status: 500 });
      return;
    }

    markRetryStarted?.();
    await retryGate;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        type: "item",
        data: {
          files: [
            {
              label: "Theme",
              path: "src/registry/skin-packs/refined/theme.css",
              code: '[data-skin="refined"] { --background: oklch(1 0 0); }',
              slot: "theme",
            },
          ],
        },
      }),
    });
  });

  await page.goto("/primitives/code-diff", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Edit theme" }).click();
  await page.getByRole("button", { name: "View Refined source" }).click();

  await expect(page.getByText("The skin source could not be loaded.")).toBeVisible();
  shouldFail = false;
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByText("Loading source")).toBeVisible();

  await retryStarted;
  releaseRetry?.();
  await expect(page.getByText("theme.css", { exact: true })).toBeVisible();
});
