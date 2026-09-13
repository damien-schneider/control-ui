import { expect, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import { waitForReactHydration } from "./browser-test-helpers";

test("macOS enables scroll-edge blur and keyboard focus clears the decoration", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript((storageKey) => {
    localStorage.setItem(storageKey, JSON.stringify({ skin: "modern-apple" }));
  }, THEME_EDITOR_STORAGE_KEY);
  await page.goto("/primitives/scroll-area");
  const viewport = page.getByLabel("Horizontal roadmap", { exact: true });
  const scrollArea = viewport.locator("..");
  const endBlur = scrollArea.locator('[data-control-family="progressive-blur"][data-side="inline-end"]');
  await waitForReactHydration(viewport.getByRole("button").first());
  await expect(endBlur.locator('[data-slot="layer"]').last()).toHaveCSS("opacity", "1");
  await expect(scrollArea.locator('[data-control-family="progressive-blur"][data-side="top"]')).toHaveCount(0);
  await viewport.getByRole("button").first().focus();
  await page.keyboard.press("Tab");
  await expect(endBlur.locator('[data-slot="layer"]').last()).toHaveCSS("visibility", "hidden");
  await expect(viewport.getByRole("button", { name: "Planned", exact: true })).toBeFocused();
  await expect(viewport).toHaveCSS("mask-image", "none");

  await page.goto("/primitives/progressive-blur");
  const blurSwitch = page.getByRole("switch", { name: "Progressive blur", exact: true });
  const places = page.getByLabel("Places to explore", { exact: true }).locator("..");
  await waitForReactHydration(blurSwitch);
  await blurSwitch.click();
  await expect(places.locator('[data-control-family="progressive-blur"]')).toHaveCount(0);
});

test("horizontal content stays in one row and scrolls to focused items", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/primitives/scroll-area");
  const columns = page.getByRole("list", { name: "Roadmap columns" });
  const buttons = columns.getByRole("button");
  await waitForReactHydration(buttons.first());
  const tops = await buttons.evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().top));
  expect(Math.max(...tops) - Math.min(...tops)).toBeLessThan(1);
  const viewport = page.getByLabel("Horizontal roadmap", { exact: true });
  expect(await viewport.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  await buttons.first().focus();
  for (let index = 1; index < (await buttons.count()); index += 1) await page.keyboard.press("Tab");
  await expect(buttons.last()).toBeFocused();
  expect(await viewport.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
