import { expect, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import { waitForReactHydration } from "./browser-test-helpers";

const sidebarPopup = '[data-popup-kind="sheet"][data-popup-part="surface"]';

test.beforeEach(async ({ page }) => {
  await page.addInitScript((storageKey) => {
    localStorage.setItem(storageKey, JSON.stringify({ skin: "refined", mode: "light" }));
  }, THEME_EDITOR_STORAGE_KEY);
});

test("mobile docs sidebar slides, restores focus, and respects reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/primitives/button");
  const trigger = page.getByRole("button", { name: "Toggle Sidebar", exact: true, includeHidden: true });
  await waitForReactHydration(trigger);
  await trigger.focus();
  await trigger.press("Enter");
  const popup = page.locator(sidebarPopup);
  await expect(popup).toBeVisible();
  await expect(popup).toHaveCSS("transition-property", "translate");
  expect(await popup.evaluate((element) => Number.parseFloat(getComputedStyle(element).transitionDuration))).toBeGreaterThan(0);
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(popup).toHaveCount(0);
  await expect(trigger).toBeFocused();

  const entering = await trigger.evaluate(async (element, popupSelector) => {
    if (!(element instanceof HTMLButtonElement)) throw new Error("Sidebar trigger missing");
    element.click();
    const positions: number[] = [];
    let width = 0;
    for (let frame = 0; frame < 15; frame++) {
      await new Promise(requestAnimationFrame);
      const surface = document.querySelector(popupSelector);
      if (!surface) continue;
      const bounds = surface.getBoundingClientRect();
      width = bounds.width;
      positions.push(bounds.x);
    }
    return { positions, width };
  }, sidebarPopup);
  expect(entering.positions.some((x) => x < -1 && x > -entering.width + 1)).toBe(true);
  await page.keyboard.press("Escape");
  await expect(popup).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await trigger.click();
  await expect(popup).toBeVisible();
  await expect(popup).toHaveCSS("transition-duration", "0s");
  await popup.getByRole("link", { name: "Tabs", exact: true }).click();
  await expect(page).toHaveURL(/\/primitives\/tabs$/);
  await expect(popup).toHaveCount(0);
});

test("docs categories collapse from the keyboard and preserve the active page", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/primitives/button");
  const navigation = page.locator("[data-docs-sidebar-navigation]");
  const activeLink = navigation.getByRole("link", { name: "Button", exact: true });
  const category = navigation.locator('[data-slot="group"]').filter({ has: page.getByRole("link", { name: "Button", exact: true }) });
  const categoryName = await category.getByRole("button").first().innerText();
  const trigger = navigation.getByRole("button", { name: categoryName.trim(), exact: true });
  await waitForReactHydration(trigger);
  await expect(activeLink).toHaveAttribute("aria-current", "page");
  await trigger.focus();
  await trigger.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(activeLink).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.press("Space");
  await expect(activeLink).toBeVisible();
  await expect(activeLink).toHaveAttribute("aria-current", "page");
});

test("nested pages navigate and remain selected after folding their parent", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/primitives/sidebar");
  const example = page.getByRole("group", { name: "Nested navigation", exact: true });
  const projects = example.getByRole("button", { name: "Projects", exact: true });
  const design = example.getByRole("button", { name: "Design system", exact: true });
  await waitForReactHydration(projects);
  await expect(design).toHaveAttribute("aria-current", "page");
  await projects.focus();
  await projects.press("Enter");
  await expect(design).toBeHidden();
  await expect(projects).toBeFocused();
  await projects.press("Space");
  await page.keyboard.press("Tab");
  const overview = example.getByRole("button", { name: "Overview", exact: true });
  await expect(overview).toBeFocused();
  await overview.press("Enter");
  await expect(example.getByRole("heading", { name: "Overview", exact: true })).toBeVisible();
  await expect(overview).toHaveAttribute("aria-current", "page");
  const cookiesBeforeCollapse = await page.context().cookies();
  await example.getByRole("button", { name: "Toggle Sidebar", exact: true }).click();
  await expect(overview).toBeHidden();
  await expect(example.getByRole("button", { name: "Resources", exact: true })).toBeHidden();
  expect(await page.context().cookies()).toEqual(cookiesBeforeCollapse);
  await example.getByRole("button", { name: "Toggle Sidebar", exact: true }).click();
  await expect(overview).toBeVisible();
  await expect(overview).toHaveAttribute("aria-current", "page");
  await expect
    .poll(async () => {
      const overviewBounds = await overview.boundingBox();
      const sidebarBounds = await example.locator('[data-slot="container"]').boundingBox();
      if (!overviewBounds || !sidebarBounds) throw new Error("Nested navigation is not laid out");
      return overviewBounds.x + overviewBounds.width - sidebarBounds.x - sidebarBounds.width;
    })
    .toBeLessThanOrEqual(0);
});

test("each sidebar preview is one responsive workspace", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/primitives/sidebar");
  const example = page.getByRole("group", { name: "Sidebar", exact: true });
  const trigger = example.getByRole("button", { name: "Toggle Sidebar", exact: true });
  await waitForReactHydration(trigger);
  await expect(example.locator('[data-slot="wrapper"]')).toHaveCount(1);
  await trigger.click();
  const popup = page.locator(sidebarPopup);
  await popup.getByRole("button", { name: "Workflows", exact: true }).click();
  await expect(popup).toHaveCount(0);
  await expect(example.getByRole("heading", { name: "Workflows", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test.describe("touch navigation", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("mobile categories and links have usable touch targets", async ({ page }) => {
    await page.goto("/primitives/button");
    const trigger = page.getByRole("button", { name: "Toggle Sidebar", exact: true });
    await waitForReactHydration(trigger);
    await trigger.tap();
    const popup = page.locator(sidebarPopup);
    for (const control of [
      popup.getByRole("button", { name: "Actions", exact: true }),
      popup.getByRole("link", { name: "Button", exact: true }),
    ]) {
      const bounds = await control.boundingBox();
      if (!bounds) throw new Error("Mobile navigation control is not laid out");
      expect(bounds.height).toBeGreaterThanOrEqual(44);
    }
    await page.locator('[data-popup-kind="sheet"][data-slot="backdrop"]').tap({ position: { x: 350, y: 400 } });
    await expect(popup).toHaveCount(0);
  });
});
