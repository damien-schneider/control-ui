import { expect, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import { waitForReactHydration } from "./browser-test-helpers";

test("keyboard focus reveals the viewport scrollbar without pointer hover", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript((storageKey) => {
    localStorage.setItem(storageKey, JSON.stringify({ skin: "refined" }));
  }, THEME_EDITOR_STORAGE_KEY);
  await page.goto("/primitives/scroll-area");
  const viewport = page.getByLabel("Horizontal roadmap", { exact: true });
  await waitForReactHydration(viewport.getByRole("button").first());
  await viewport.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const scrollbar = viewport.locator("..").locator('[data-slot="scrollbar"][data-orientation="horizontal"]');
  await expect(scrollbar).toHaveCSS("opacity", "0");
  await page.keyboard.press("Tab");
  await viewport.focus();
  await expect(viewport).toBeFocused();
  await expect(scrollbar).toHaveCSS("opacity", "1");
  await expect(viewport).toHaveCSS("mask-image", "none");
  await viewport.evaluate((element) => element.blur());
  await expect(scrollbar).toHaveCSS("opacity", "0");
});

test("Windows XP keeps its sidebar scrollbar visible beside the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript((storageKey) => {
    localStorage.setItem(storageKey, JSON.stringify({ skin: "xp" }));
  }, THEME_EDITOR_STORAGE_KEY);
  await page.goto("/primitives/scroll-area");
  const navigation = page.locator("[data-docs-sidebar-navigation]");
  const viewport = navigation.locator("[data-scroll-area-viewport]");
  const scrollArea = viewport.locator("..");
  const scrollbar = scrollArea.locator('[data-slot="scrollbar"][data-orientation="vertical"]');
  await expect(scrollArea).toHaveAttribute("data-scrollbar-gutter", "stable");
  await expect(scrollbar).toHaveCSS("opacity", "1");
  await expect(scrollbar).toHaveCSS("width", "16px");
  await expect(scrollArea.locator('[data-slot="scrollbar"][data-orientation="horizontal"]')).toHaveCount(0);
  const viewportBounds = await viewport.boundingBox();
  const scrollbarBounds = await scrollbar.boundingBox();
  if (!viewportBounds || !scrollbarBounds) throw new Error("Missing sidebar scroll bounds");
  expect(viewportBounds.x + viewportBounds.width).toBeLessThanOrEqual(scrollbarBounds.x);
  await viewport.evaluate((element) => {
    element.scrollTop = 300;
  });
  await expect(scrollArea).toHaveAttribute("data-overflow-y-start", "");
  await page.mouse.move(1000, 100);
  await expect(scrollbar).toHaveCSS("opacity", "1");

  const roadmap = page.getByLabel("Horizontal roadmap", { exact: true }).locator("..");
  await expect(roadmap.locator('[data-slot="scrollbar"][data-orientation="vertical"]')).toHaveCount(0);
  const horizontal = roadmap.locator('[data-slot="scrollbar"][data-orientation="horizontal"]');
  await expect(horizontal).toHaveCSS("opacity", "1");
  const roadmapBounds = await roadmap.locator("[data-scroll-area-viewport]").boundingBox();
  const horizontalBounds = await horizontal.boundingBox();
  if (!roadmapBounds || !horizontalBounds) throw new Error("Missing horizontal scroll bounds");
  expect(roadmapBounds.y + roadmapBounds.height).toBeLessThanOrEqual(horizontalBounds.y);
});

for (const direction of ["ltr", "rtl"] as const) {
  test(`stable gutters keep their size when overflow changes in ${direction}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/primitives/scroll-area");
    const viewport = page.getByRole("region", { name: "Stable scrollbar gutter", exact: true });
    const scrollArea = viewport.locator("..");
    const toggle = page.getByRole("button", { name: "Overflow content", exact: true });
    await waitForReactHydration(toggle);
    await toggle.scrollIntoViewIfNeeded();
    await scrollArea.evaluate((element, dir) => element.setAttribute("dir", dir), direction);
    await expect(scrollArea).toHaveAttribute("data-has-overflow-x", "");
    await expect(scrollArea).toHaveAttribute("data-has-overflow-y", "");
    const vertical = scrollArea.locator('[data-slot="scrollbar"][data-orientation="vertical"]');
    const horizontal = scrollArea.locator('[data-slot="scrollbar"][data-orientation="horizontal"]');
    const viewportBounds = await viewport.boundingBox();
    const verticalBounds = await vertical.boundingBox();
    const horizontalBounds = await horizontal.boundingBox();
    if (!viewportBounds || !verticalBounds || !horizontalBounds) throw new Error("Missing gutter bounds");
    if (direction === "rtl") expect(verticalBounds.x + verticalBounds.width).toBeLessThanOrEqual(viewportBounds.x);
    else expect(viewportBounds.x + viewportBounds.width).toBeLessThanOrEqual(verticalBounds.x);
    expect(viewportBounds.y + viewportBounds.height).toBeLessThanOrEqual(horizontalBounds.y);
    await expect(scrollArea.locator('[data-slot="corner"]')).toBeVisible();
    await toggle.click();
    await expect(scrollArea).not.toHaveAttribute("data-has-overflow-x");
    await expect(scrollArea).not.toHaveAttribute("data-has-overflow-y");
    await expect(vertical).toHaveCSS("opacity", "1");
    await expect(horizontal).toHaveCSS("opacity", "1");
    await expect(vertical.locator('[data-slot="thumb"]')).toBeHidden();
    await expect(horizontal.locator('[data-slot="thumb"]')).toBeHidden();
    expect(await viewport.boundingBox()).toEqual(viewportBounds);
    await toggle.click();
    await expect(scrollArea).toHaveAttribute("data-has-overflow-x", "");
    await expect(scrollArea).toHaveAttribute("data-has-overflow-y", "");
    await expect(vertical.locator('[data-slot="thumb"]')).toBeVisible();
    expect(await viewport.boundingBox()).toEqual(viewportBounds);
  });
}

test("macOS preserves its corner shape and fades overflow until keyboard focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript((storageKey) => {
    localStorage.setItem(storageKey, JSON.stringify({ skin: "modern-apple" }));
  }, THEME_EDITOR_STORAGE_KEY);
  await page.goto("/primitives/scroll-area");
  const viewport = page.getByLabel("Horizontal roadmap", { exact: true });
  const scrollArea = viewport.locator("..");
  const endBlur = scrollArea.locator('[data-control-family="progressive-blur"][data-side="inline-end"]');
  await waitForReactHydration(viewport.getByRole("button").first());
  await expect(scrollArea).toHaveCSS("corner-shape", "superellipse(1.25)");
  await expect(endBlur).toHaveCSS("display", "none");
  await expect(viewport).not.toHaveCSS("mask-image", "none");
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
