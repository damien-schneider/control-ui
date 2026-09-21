import { expect, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import { waitForReactHydration } from "./browser-test-helpers";

test.beforeEach(async ({ page }) => {
  await page.addInitScript((storageKey) => {
    localStorage.setItem(storageKey, JSON.stringify({ skin: "refined", mode: "light" }));
  }, THEME_EDITOR_STORAGE_KEY);
});

test("page layout scrolls the document while navigation and controls remain reachable", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/primitives/button");
  const rail = page.getByRole("separator", { name: "Resize sidebar", exact: true });
  await expect(rail).toHaveAttribute("data-resize-ready", "");
  const sidebar = page.locator('[data-docs-shell] > [data-control-family="sidebar"][data-slot="root"]');
  const container = sidebar.locator('[data-slot="container"]');
  const initialTop = await container.evaluate((element) => element.getBoundingClientRect().top);
  const heading = page.getByRole("heading", { name: "Button", level: 1, exact: true });
  expect(await heading.evaluate((element) => element.closest('[data-control-ui="scroll-area"]') === null)).toBe(true);
  await page.mouse.move(950, 700);
  await page.mouse.wheel(0, 650);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(400);
  expect(await container.evaluate((element) => element.getBoundingClientRect().top)).toBe(initialTop);
  await expect(page.getByRole("combobox", { name: "Skin", exact: true })).toBeInViewport();
  await rail.focus();
  await page.keyboard.press("ControlOrMeta+b");
  await expect(sidebar).toHaveAttribute("data-state", "collapsed");
  const trigger = page.getByRole("button", { name: "Toggle Sidebar", exact: true });
  await expect(trigger).toBeInViewport();
  await trigger.click();
  await expect(sidebar).toHaveAttribute("data-state", "expanded");
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300);
});

test("the page layout frame reaches the first paint, before any hydration", async ({ page }) => {
  await page.route("**/*", (route) => (route.request().resourceType() === "script" ? route.abort() : route.continue()));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/primitives/button");

  await expect(page.locator("html")).toHaveAttribute("data-docs-layout", "page");
  const content = page.locator("[data-docs-content]");
  await expect(content).toHaveCSS("margin-top", "0px");
  await expect(content).toHaveCSS("border-top-width", "0px");
  await expect(content).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
});

test("mobile page scrolling resumes after closing the navigation sheet", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/primitives/button");
  const trigger = page.getByRole("button", { name: "Toggle Sidebar", exact: true });
  await waitForReactHydration(trigger);
  await page.mouse.move(280, 600);
  await page.mouse.wheel(0, 600);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300);
  await expect(trigger).toBeInViewport();
  await trigger.click();
  const sheet = page.locator('[data-popup-kind="sheet"][data-popup-part="surface"]');
  await expect(sheet).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(sheet).toHaveCount(0);
  await expect(trigger).toBeFocused();
  const scrollBeforeWheel = await page.evaluate(() => window.scrollY);
  await page.mouse.move(280, 600);
  await page.mouse.wheel(0, 300);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(scrollBeforeWheel);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("switching skins changes scroll ownership without leaving the page locked", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/primitives/button");
  const skinPicker = page.getByRole("combobox", { name: "Skin", exact: true });
  await waitForReactHydration(skinPicker);
  await page.mouse.move(950, 700);
  await page.mouse.wheel(0, 550);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300);
  await skinPicker.click();
  await page.getByRole("option", { name: "Linear", exact: true }).click();
  await expect(page.locator("[data-docs-layout]")).toHaveAttribute("data-docs-layout", "contained");
  const viewport = page.locator('[data-docs-content] [data-control-ui="scroll-area"] [data-slot="viewport"]').first();
  await page.mouse.move(950, 700);
  await page.mouse.wheel(0, 550);
  await expect.poll(() => viewport.evaluate((element) => element.scrollTop)).toBeGreaterThan(300);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await skinPicker.click();
  await page.getByRole("option", { name: "Refined", exact: true }).click();
  await expect(page.locator("[data-docs-layout]")).toHaveAttribute("data-docs-layout", "page");
  await page.mouse.move(950, 700);
  await page.mouse.wheel(0, 550);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300);
});
