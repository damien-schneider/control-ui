import { expect, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY, THEME_STORAGE_KEY } from "@/components/theme";
import { waitForReactHydration } from "./browser-test-helpers";

for (const skin of ["refined", "mastra"]) {
  for (const mode of ["light", "dark"] as const) {
    test.describe(`${skin} ${mode}`, () => {
      test.beforeEach(async ({ page, context }) => {
        await context.grantPermissions(["clipboard-read", "clipboard-write"]);
        await page.addInitScript(
          ({ skin: selectedSkin, mode: selectedMode, editorKey, themeKey }) => {
            window.__REACT_GRAB_DISABLED__ = true;
            window.__REACT_SCAN_DISABLED__ = true;
            localStorage.setItem(editorKey, JSON.stringify({ skin: selectedSkin }));
            localStorage.setItem(themeKey, selectedMode);
          },
          { skin, mode, editorKey: THEME_EDITOR_STORAGE_KEY, themeKey: THEME_STORAGE_KEY },
        );
      });

      test("headerless copy remains clear of scrolled source and copies the complete example", async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 900 });
        await page.goto("/components/action-bar");
        await expect(page.locator("html")).toHaveAttribute("data-skin", skin);
        const code = page.locator('#usage [data-control-ui="code"][data-slot="root"]').first();
        const copy = code.getByRole("button", { name: "Copy code", exact: true });
        await waitForReactHydration(copy);
        await copy.scrollIntoViewIfNeeded();
        const viewport = code.locator("[data-scroll-area-viewport]");
        const source = await code.locator('[data-slot="line"] > code').allTextContents();
        for (const scrollLeft of [0, 200]) {
          await viewport.evaluate((element, left) => {
            element.scrollLeft = left;
          }, scrollLeft);
          const buttonBounds = await copy.boundingBox();
          const viewportBounds = await viewport.boundingBox();
          if (!buttonBounds || !viewportBounds) throw new Error("Code bounds unavailable");
          expect(buttonBounds.y + buttonBounds.height).toBeLessThanOrEqual(viewportBounds.y);
          await expect(copy).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
        }
        await copy.click();
        await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(source.join("\n"));
        await expect(code.getByRole("status")).toHaveText("Copied to clipboard");
      });

      test("fields group their labels and hints while documentation keeps readable controls", async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.goto("/primitives/input-group");
        await expect(page.locator("html")).toHaveAttribute("data-skin", skin);
        const field = page.locator('#preview [data-control-ui="field"][data-slot="root"]').first();
        await waitForReactHydration(field);
        const spacing = await field.evaluate((element) => {
          const label = element.querySelector('[data-slot="label"]')?.getBoundingClientRect();
          const control = element.querySelector('[data-control-ui="input-group"][data-slot="root"]')?.getBoundingClientRect();
          const description = element.querySelector('[data-slot="description"]')?.getBoundingClientRect();
          if (!label || !control || !description) throw new Error("Field anatomy missing");
          return { before: control.top - label.bottom, after: description.top - control.bottom };
        });
        expect(spacing.before).toBeGreaterThan(0);
        expect(spacing.before).toBeLessThanOrEqual(8);
        expect(spacing.after).toBeCloseTo(spacing.before, 0);
        const command = page.locator('#install [data-control-ui="code"][data-slot="grid"]');
        expect(await command.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(12);
        const navigation = page.locator("[data-docs-sidebar-navigation]");
        const header = navigation.locator('[data-slot="header"]');
        const inset = await header.evaluate((element) => {
          const parent = element.closest("[data-docs-sidebar-navigation]");
          if (!parent) throw new Error("Sidebar navigation missing");
          return (
            element.getBoundingClientRect().left -
            parent.getBoundingClientRect().left +
            Number.parseFloat(getComputedStyle(element).paddingLeft)
          );
        });
        expect(inset).toBeGreaterThanOrEqual(16);
      });
    });
  }
}
