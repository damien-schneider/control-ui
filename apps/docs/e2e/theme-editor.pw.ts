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

    const toolbar = page.getByRole("toolbar", { name: "Documentation controls" });
    const editTheme = toolbar.getByRole("link", { name: "Edit theme" });
    await expect(editTheme).toHaveAttribute("href", "/theme-editor");
    await editTheme.focus();
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(/\/theme-editor$/);
    await expect(page.getByRole("heading", { name: "Theme editor", level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Theme editor", level: 1 })).toBeFocused();
    await expect(editTheme).toHaveAttribute("aria-current", "page");
    await expect(toolbar.getByRole("combobox", { name: "Skin", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Close editor" })).toHaveCount(0);
    await expect(page.locator("[data-docs-page-grid]")).toContainText("Choose a skin");
    await expect
      .poll(() => page.locator("[data-docs-page-grid]").evaluate((element) => element.scrollWidth - element.clientWidth))
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
  await page.getByRole("region", { name: "Choose a skin" }).getByRole("button", { name: "Refined", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-skin", "refined");
  await page.getByRole("switch", { name: "Caption every control with its CSS variable name" }).check();
  const radius = page.getByRole("slider", { name: "--radius-control", exact: true });
  await radius.focus();
  await radius.press("Home");
  await radius.press("ArrowRight");
  await expect(radius).toHaveAttribute("aria-valuenow", "1");
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--radius-control").trim()))
    .toBe("1px");

  await page.getByRole("button", { name: "Copy CSS variables", exact: true }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain("--radius-control: 1px");
  await page.getByRole("link", { name: "Open full accessibility audit" }).click();
  await expect(page).toHaveURL(/\/theme-accessibility$/);
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--radius-control").trim()))
    .toBe("1px");
  await page.getByRole("link", { name: "Edit theme", exact: true }).first().click();
  await expect(page).toHaveURL(/\/theme-editor$/);
  await expect(radius).toHaveAttribute("aria-valuenow", "1");
  await page.reload();
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

  await expect(page.getByText("The Refined source could not be loaded.")).toBeVisible();
  shouldFail = false;
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByText("Loading Refined source")).toBeVisible();

  await retryStarted;
  releaseRetry?.();
  await expect(page.locator("#theme-skin").getByText("oklch(1 0 0)")).toBeVisible();
});

test("copy failure stays actionable without reporting success", async ({ page }) => {
  await page.goto("/theme-editor", { waitUntil: "networkidle" });
  await page.evaluate(() => {
    navigator.clipboard.writeText = async () => {
      throw new DOMException("Clipboard access denied", "NotAllowedError");
    };
    document.execCommand = () => false;
  });
  await page.getByRole("button", { name: "Copy CSS variables", exact: true }).click();
  await expect(page.locator("[data-docs-page-grid]").getByRole("alert")).toHaveText(
    "Could not copy CSS variables. Try again or allow clipboard access.",
  );
  await expect(page.getByRole("button", { name: "Copy CSS variables", exact: true })).toBeEnabled();
});
