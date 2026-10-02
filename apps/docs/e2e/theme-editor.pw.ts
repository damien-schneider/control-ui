import { expect, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "@/components/theme";

for (const { name, width, height, reducedMotion } of [
  { name: "mobile", width: 360, height: 900, reducedMotion: "no-preference" },
  { name: "desktop", width: 1280, height: 900, reducedMotion: "no-preference" },
  { name: "reduced motion", width: 1280, height: 900, reducedMotion: "reduce" },
] as const) {
  test(`theme editor is a navigable page on ${name}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion });
    await page.goto("/primitives/code-diff", { waitUntil: "networkidle" });

    const toolbar = page.getByRole("group", { name: "Documentation controls" });
    const editTheme = toolbar.getByRole("link", { name: "Edit theme" });
    const openSidebarOnNarrowViewports = async () => {
      if (width >= 1024) return;
      if (await editTheme.isVisible()) return;
      const trigger = page.locator("[data-docs-sidebar-trigger]").getByRole("button", { name: "Toggle Sidebar" });
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
      await trigger.click();
      await expect(editTheme).toBeVisible();
    };

    await openSidebarOnNarrowViewports();
    await expect(editTheme).toHaveAttribute("href", "/theme-editor");
    await toolbar.getByRole("combobox", { name: "Skin", exact: true }).click();
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.keyboard.press("Escape");
    await editTheme.press("Enter");

    await expect(page).toHaveURL(/\/theme-editor$/);
    await expect(page.getByRole("heading", { name: "Theme editor", level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Theme editor", level: 1 })).toBeFocused();
    await expect(page.getByRole("region", { name: "Skin workspace", exact: true })).toBeVisible();
    await expect(page.getByRole("tablist", { name: "Skin views" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Components", exact: true })).toBeVisible();
    await openSidebarOnNarrowViewports();
    await expect(editTheme).toHaveAttribute("aria-current", "page");
    await expect(toolbar.getByRole("combobox", { name: "Skin", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: /^Radius & corners/ })).toBeVisible();
    await expect
      .poll(() =>
        page
          .locator('[data-control-family="page-layout"][data-slot="body"]')
          .evaluate((element) => element.scrollWidth - element.clientWidth),
      )
      .toBeLessThanOrEqual(1);
    await page.screenshot({ path: testInfo.outputPath(`theme-editor-${name}.png`) });

    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/\/theme-editor$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/primitives\/code-diff$/);
    await expect(page.getByRole("heading", { name: "Code Diff", exact: true })).toBeVisible();
    await page.goForward();
    await expect(page.getByRole("heading", { name: "Theme editor", level: 1 })).toBeVisible();
  });
}

test("theme edits survive navigation, direct loads, and refresh", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/theme-editor", { waitUntil: "networkidle" });
  await page.getByRole("combobox", { name: "Skin", exact: true }).click();
  await page.getByRole("option", { name: "Refined", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-skin", "refined");

  const radius = page.getByRole("slider", { name: "--radius-control", exact: true });
  const openRadiusCategory = async () => {
    await page.getByRole("link", { name: /^Radius & corners/ }).click();
    await expect(page).toHaveURL(/\/theme-editor\/radius$/);
  };
  const openRadiusTokens = async () => {
    await openRadiusCategory();
    if (!(await radius.isVisible())) await page.getByRole("button", { name: /Advanced/ }).click();
    await expect(radius).toBeVisible();
  };

  await openRadiusCategory();
  await page.getByRole("switch", { name: "Caption every control with its CSS variable name" }).check();
  await page.getByRole("button", { name: /Advanced/ }).click();
  await expect(radius).toBeVisible();
  await radius.focus();
  await radius.press("Home");
  await radius.press("ArrowRight");
  await expect(radius).toHaveAttribute("aria-valuenow", "1");
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--radius-control").trim()))
    .toBe("1px");

  await page.getByRole("button", { name: "Copy CSS variables", exact: true }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain("--radius-control: 1px");
  await page.getByRole("link", { name: "Accessibility audit" }).click();
  await expect(page).toHaveURL(/\/theme-accessibility$/);
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--radius-control").trim()))
    .toBe("1px");
  await page.getByRole("link", { name: "Edit theme", exact: true }).first().click();
  await expect(page).toHaveURL(/\/theme-editor$/);
  await openRadiusTokens();
  await expect(radius).toHaveAttribute("aria-valuenow", "1");
  await page.reload();
  await openRadiusTokens();
  await expect(radius).toHaveAttribute("aria-valuenow", "1");
});

test("skin source tab recovers from a failed request", async ({ page }) => {
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

  await page.addInitScript((storageKey) => {
    localStorage.setItem(storageKey, JSON.stringify({ skin: "refined" }));
  }, THEME_EDITOR_STORAGE_KEY);
  await page.goto("/theme-editor");
  await page.getByRole("tablist", { name: "Skin views" }).getByRole("tab", { name: "Source", exact: true }).click();

  await expect(page.getByText("The Refined source could not be loaded.")).toBeVisible();
  shouldFail = false;
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByText("Loading Refined source")).toBeVisible();

  await retryStarted;
  releaseRetry?.();
  await expect(page.locator("#theme-skin").getByText("oklch(1 0 0)")).toBeVisible();
});

for (const width of [360, 1280]) {
  test(`skin source uses the page width and links to documentation at ${width}px`, async ({ page, context }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/theme-editor?skin=sketch", { waitUntil: "networkidle" });

    const workspace = page.getByRole("region", { name: "Skin workspace", exact: true });
    const views = workspace.getByRole("tablist", { name: "Skin views" });
    await expect(views.getByRole("tab", { name: "Preview", exact: true })).toHaveAttribute("aria-selected", "true");
    await views.getByRole("tab", { name: "Source", exact: true }).click();
    await expect(page).toHaveURL(/skin=sketch&view=source$/);
    await page.reload({ waitUntil: "networkidle" });
    await expect(views.getByRole("tab", { name: "Source", exact: true })).toHaveAttribute("aria-selected", "true");

    const source = page.getByRole("region", { name: "Sketch source", exact: true });
    await source.getByRole("tab", { name: "skin.css", exact: true }).click();
    await expect(source.getByRole("tabpanel", { name: "skin.css", exact: true })).toBeVisible();
    await expect
      .poll(() => source.evaluate((element) => element.clientWidth / (element.closest('[aria-label="Skin workspace"]')?.clientWidth ?? 1)))
      .toBeGreaterThan(0.95);
    await expect
      .poll(() =>
        page
          .locator('[data-control-family="page-layout"][data-slot="body"]')
          .evaluate((element) => element.scrollWidth - element.clientWidth),
      )
      .toBeLessThanOrEqual(1);
    await expect
      .poll(() =>
        source
          .getByRole("region", { name: "css code", exact: true })
          .locator('[data-slot="line"] code')
          .first()
          .evaluate((element) => getComputedStyle(element).whiteSpace),
      )
      .toBe("pre");
    await source.getByRole("button", { name: "Copy code", exact: true }).click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain("--sketch-outline-width");

    await source.getByRole("tab", { name: "skin.config.tsx", exact: true }).focus();
    await page.keyboard.press("Enter");
    await expect(source.getByRole("tabpanel", { name: "skin.config.tsx", exact: true })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath(`skin-source-${width}.png`) });

    await workspace.getByRole("link", { name: "Skin documentation" }).click();
    await expect(page).toHaveURL(/\/skins\/sketch#source$/);
    const docsSource = page.locator("#source");
    await expect(docsSource.getByRole("tab", { name: "theme.css", exact: true })).toBeVisible();
    await docsSource.getByRole("tab", { name: "sketch-stroke-runtime.tsx", exact: true }).click();
    await expect(docsSource.getByRole("tabpanel", { name: "sketch-stroke-runtime.tsx", exact: true })).toBeVisible();
    await expect
      .poll(() =>
        page
          .locator('[data-control-family="page-layout"][data-slot="body"]')
          .evaluate((element) => element.scrollWidth - element.clientWidth),
      )
      .toBeLessThanOrEqual(1);
    await page.getByRole("link", { name: "Preview Sketch", exact: true }).click();
    await expect(page).toHaveURL(/\/theme-editor\?skin=sketch$/);
    await expect(page.locator("html")).toHaveAttribute("data-skin", "sketch");
    await expect(page.getByRole("tablist", { name: "Skin views" }).getByRole("tab", { name: "Preview", exact: true })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
}

test("copy failure stays actionable without reporting success", async ({ page }) => {
  await page.goto("/theme-editor", { waitUntil: "networkidle" });
  await page.evaluate(() => {
    navigator.clipboard.writeText = async () => {
      throw new DOMException("Clipboard access denied", "NotAllowedError");
    };
    document.execCommand = () => false;
  });
  await page.getByRole("button", { name: "Copy CSS variables", exact: true }).click();
  const copyStatus = page
    .locator('[data-control-family="page-layout"][data-slot="body"]')
    .getByRole("alert")
    .filter({ hasText: "Could not copy CSS variables" });
  await expect(copyStatus).toHaveText("Could not copy CSS variables. Try again or allow clipboard access.");
  await expect(page.getByRole("button", { name: "Copy CSS variables", exact: true })).toBeEnabled();
});
