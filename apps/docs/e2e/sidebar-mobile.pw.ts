import { expect, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import { waitForReactHydration } from "./browser-test-helpers";

const drawerSelector = '[data-popup-kind="drawer"][data-popup-part="surface"]:has([data-mobile])';

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });
test.setTimeout(60_000);

test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => {
    Object.assign(window, { __REACT_GRAB_DISABLED__: true, __REACT_SCAN_DISABLED__: true });
    localStorage.setItem(key, JSON.stringify({ skin: "refined", mode: "light" }));
  }, THEME_EDITOR_STORAGE_KEY);
});

test("primary destinations and the complete menu share selection and disabled state", async ({ page }) => {
  await page.goto("/primitives/sidebar");
  const workspace = page.getByRole("group", { name: "Bottom navigation", exact: true });
  const nav = workspace.getByRole("navigation", { name: "Workspace mobile navigation" });
  const menu = nav.getByRole("button", { name: "Menu", exact: true });
  await waitForReactHydration(menu);
  await menu.scrollIntoViewIfNeeded();
  await expect(nav.getByRole("button")).toHaveCount(5);
  await expect(nav.getByRole("button", { name: "Dashboard", exact: true })).toBeDisabled();
  await nav.getByRole("button", { name: "Workflows", exact: true }).tap();
  await expect(workspace.getByRole("heading", { name: "Workflows", exact: true })).toBeVisible();
  await expect(nav.getByRole("button", { name: "Workflows", exact: true })).toHaveAttribute("aria-current", "page");
  await menu.tap();
  const drawer = page.locator(drawerSelector);
  await expect(drawer).toHaveAttribute("data-side", "bottom");
  await expect(drawer.getByRole("button", { name: "Workflows", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(drawer.getByRole("button", { name: "Dashboard", exact: true })).toBeDisabled();
  await drawer.getByRole("button", { name: "Settings", exact: true }).tap();
  await expect(drawer).toHaveCount(0);
  await expect(workspace.getByRole("heading", { name: "Settings", exact: true })).toBeVisible();
  await expect(nav.locator('[aria-current="page"]')).toHaveCount(0);
  await nav.getByRole("button", { name: "Agents", exact: true }).tap();
  await expect(workspace.getByRole("heading", { name: "Agents", exact: true })).toBeVisible();
});

test("the drawer returns focus to its actual opener and resets when switching to desktop", async ({ page }) => {
  await page.goto("/primitives/sidebar");
  const workspace = page.getByRole("group", { name: "Bottom navigation", exact: true });
  const menu = workspace.getByRole("button", { name: "Menu", exact: true });
  const headerTrigger = workspace.getByRole("button", { name: "Toggle sidebar", exact: true });
  await waitForReactHydration(menu);
  for (const trigger of [menu, headerTrigger, menu]) {
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    const drawer = page.locator(drawerSelector);
    await expect(drawer).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(drawer).toHaveCount(0);
    await expect(trigger).toBeFocused();
  }
  await menu.click();
  await expect(page.locator(drawerSelector)).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.locator(drawerSelector)).toHaveCount(0);
  await expect(menu).toBeHidden();
  await expect(workspace.getByRole("button", { name: "Settings", exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(menu).toBeVisible();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator(drawerSelector)).toHaveCount(0);
});

test("contained navigation reserves space, keeps touch targets, and follows its own workspace", async ({ page }) => {
  await page.goto("/primitives/sidebar");
  const workspace = page.getByRole("group", { name: "Bottom navigation", exact: true });
  const nav = workspace.getByRole("navigation", { name: "Workspace mobile navigation" });
  await waitForReactHydration(nav.getByRole("button", { name: "Menu", exact: true }));
  await nav.scrollIntoViewIfNeeded();
  for (const button of await nav.getByRole("button").all()) {
    const box = await button.boundingBox();
    if (!box) throw new Error("Mobile navigation item is not laid out");
    expect(box.height).toBeGreaterThanOrEqual(48);
    expect(box.width).toBeGreaterThanOrEqual(48);
  }
  const bounds = await workspace.evaluate((element) => {
    const navElement = element.querySelector('[data-slot="mobile-nav"]');
    const inset = element.querySelector('[data-slot="inset"]');
    const wrapper = element.querySelector('[data-slot="wrapper"]');
    if (!navElement || !inset || !wrapper) throw new Error("Workspace layout missing");
    return {
      nav: navElement.getBoundingClientRect().toJSON(),
      inset: inset.getBoundingClientRect().toJSON(),
      wrapper: wrapper.getBoundingClientRect().toJSON(),
    };
  });
  expect(bounds.inset.bottom).toBeLessThanOrEqual(bounds.nav.top + 1);
  expect(bounds.nav.bottom).toBeCloseTo(bounds.wrapper.bottom, 0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("floating menus open from the bottom and close with their visible close button", async ({ page }) => {
  await page.goto("/primitives/sidebar");
  const workspace = page.getByRole("group", { name: "Floating mobile menu", exact: true });
  const menu = workspace.getByRole("button", { name: "Menu", exact: true });
  await waitForReactHydration(menu);
  await menu.scrollIntoViewIfNeeded();
  await menu.tap();
  const drawer = page.locator(drawerSelector);
  await expect(drawer).toBeVisible();
  await drawer.getByRole("button", { name: "Close menu", exact: true }).tap();
  await expect(drawer).toHaveCount(0);
  await expect(menu).toBeFocused();
});

test("the docs floating menu stays reachable after scrolling and navigates with router links", async ({ page }) => {
  await page.goto("/primitives/button");
  const nav = page.getByRole("navigation", { name: "Documentation mobile navigation" });
  const menu = nav.getByRole("button", { name: "Menu", exact: true });
  await waitForReactHydration(menu);
  await page.mouse.move(200, 400);
  await page.mouse.wheel(0, 700);
  await expect(menu).toBeInViewport();
  await menu.tap();
  const drawer = page.locator(drawerSelector);
  await drawer.getByRole("link", { name: "Tabs", exact: true }).tap();
  await expect(page).toHaveURL(/\/primitives\/tabs$/);
  await expect(drawer).toHaveCount(0);
  await expect(menu).toBeInViewport();
});
