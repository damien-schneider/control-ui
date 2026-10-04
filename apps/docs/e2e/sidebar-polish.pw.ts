import { expect, type Locator, type Page, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import { skinMetas } from "../app/(features)/catalog/skins";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => Object.assign(window, { __REACT_GRAB_DISABLED__: true, __REACT_SCAN_DISABLED__: true }));
});

async function waitForExampleNavigation(example: Locator) {
  await expect
    .poll(
      async () => {
        await example.getByRole("button", { name: "Workflows", exact: true }).click();
        return example.getByRole("heading", { name: "Workflows", exact: true }).isVisible();
      },
      { timeout: 120_000 },
    )
    .toBe(true);
  await example.getByRole("button", { name: "Agents", exact: true }).click();
  await expect(example.getByRole("heading", { name: "Agents", exact: true })).toBeVisible();
}

async function leadingCenters(menuButtons: Locator) {
  return menuButtons.evaluateAll((buttons) =>
    buttons
      .filter((button) => button.checkVisibility())
      .map((button) => {
        const leading = button.firstElementChild;
        if (!leading) throw new Error("Sidebar row has no leading content");
        const icon = leading.getBoundingClientRect();
        const row = button.getBoundingClientRect();
        return { icon: icon.x + icon.width / 2, row: row.x + row.width / 2, iconWidth: icon.width, rowWidth: row.width };
      }),
  );
}

async function verifySidebarAlignment({
  page,
  example,
  capturePaths,
}: {
  page: Page;
  example: Locator;
  capturePaths?: { expanded: string; collapsed: string };
}) {
  const root = example.locator('[data-slot="root"].peer');
  const buttons = example.locator('[data-slot="menu-button"]');
  const navigation = example.locator('[data-slot="group"] [data-slot="menu-button"]');
  const expanded = await leadingCenters(navigation);
  expect(Math.max(...expanded.map((item) => item.icon)) - Math.min(...expanded.map((item) => item.icon))).toBeLessThan(0.6);
  if (capturePaths) {
    await example.screenshot({ path: capturePaths.expanded, animations: "disabled" });
  }
  await example.getByRole("button", { name: "Toggle sidebar", exact: true }).click();
  await expect(root).toHaveAttribute("data-state", "collapsed");
  const collapsed = await leadingCenters(buttons);
  for (const item of collapsed) {
    expect(Math.abs(item.icon - item.row)).toBeLessThan(0.6);
    expect(item.iconWidth).toBeLessThanOrEqual(item.rowWidth);
  }
  expect(Math.max(...collapsed.map((item) => item.icon)) - Math.min(...collapsed.map((item) => item.icon))).toBeLessThan(1.1);
  await expect(example.getByRole("button", { name: "Workflows", exact: true })).toBeVisible();
  await expect(example.getByRole("button", { name: "Tools", exact: true })).toBeDisabled();
  if (capturePaths) {
    await example.getByRole("button", { name: "Jamie Davis", exact: true }).click();
    await expect(page.getByRole("menuitem", { name: "Profile", exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(example.getByRole("button", { name: "Jamie Davis", exact: true })).toBeFocused();
    await page.mouse.move(0, 0);
    await example.screenshot({ path: capturePaths.collapsed, animations: "disabled" });
  }
  await example.getByRole("button", { name: "Toggle sidebar", exact: true }).click();
  await expect(root).toHaveAttribute("data-state", "expanded");
}

for (const mode of ["light", "dark"]) {
  test(`${mode}: all skins and layouts align open and collapsed rows`, async ({ page }, testInfo) => {
    await page.addInitScript(
      ({ storageKey, themeMode }) => localStorage.setItem(storageKey, JSON.stringify({ skin: "refined", mode: themeMode })),
      { storageKey: THEME_EDITOR_STORAGE_KEY, themeMode: mode },
    );
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/primitives/sidebar", { waitUntil: "domcontentloaded" });
    const example = page.getByRole("group", { name: "Sidebar", exact: true });
    await waitForExampleNavigation(example);
    const skinPicker = page.getByRole("combobox", { name: "Skin", exact: true });
    for (const skin of skinMetas) {
      await test.step(skin.label, async () => {
        await skinPicker.click();
        await page.getByRole("option", { name: skin.label, exact: true }).click();
        await expect(page.locator("html")).toHaveAttribute("data-skin", skin.id);
        await waitForExampleNavigation(example);
        await example.getByLabel("Collapse", { exact: true }).selectOption("icon");
        for (const variant of ["sidebar", "floating", "inset", "page"]) {
          await example.getByLabel("Layout", { exact: true }).selectOption(variant);
          for (const side of ["left", "right"]) {
            await example.getByLabel("Side", { exact: true }).selectOption(side);
            await verifySidebarAlignment({
              page,
              example,
              capturePaths:
                side === "left" && variant === "sidebar"
                  ? {
                      expanded: testInfo.outputPath(`${skin.id}-${mode}-expanded.png`),
                      collapsed: testInfo.outputPath(`${skin.id}-${mode}-collapsed.png`),
                    }
                  : undefined,
            });
          }
        }
        await example.getByLabel("Collapse", { exact: true }).selectOption("none");
        await expect(example.getByRole("button", { name: "Toggle sidebar", exact: true })).toHaveCount(0);
        await expect(example.getByRole("button", { name: "Agents", exact: true })).toBeVisible();
      });
    }
  });
}

test("automatic label tooltips only open for icon rails", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/primitives/sidebar", { waitUntil: "domcontentloaded" });
  const example = page.getByRole("group", { name: "Sidebar", exact: true });
  await waitForExampleNavigation(example);
  await page.clock.install();
  await example.getByRole("button", { name: "Toggle sidebar", exact: true }).click();
  await example.getByLabel("Collapse", { exact: true }).selectOption("none");
  await example.getByRole("button", { name: "Agents", exact: true }).hover();
  await page.clock.runFor(1000);
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await example.getByLabel("Collapse", { exact: true }).selectOption("icon");
  await example.getByRole("button", { name: "Agents", exact: true }).hover();
  await page.clock.runFor(1000);
  await expect(page.getByRole("tooltip")).toContainText("Agents");
});

test("switching from icon navigation to mobile closes hidden tooltips before Escape", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/primitives/sidebar", { waitUntil: "domcontentloaded" });
  const example = page.getByRole("group", { name: "Sidebar", exact: true });
  const trigger = example.getByRole("button", { name: "Toggle sidebar", exact: true });
  await waitForExampleNavigation(example);
  await trigger.click();
  await example.getByRole("button", { name: "Jamie Davis", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(example.getByRole("button", { name: "Jamie Davis", exact: true })).toBeFocused();
  await trigger.click();
  await page.setViewportSize({ width: 390, height: 844 });
  await trigger.click();
  const sheet = page.locator('[data-popup-kind="sheet"][data-popup-part="surface"]');
  await expect(sheet.getByRole("button", { name: "Agents", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(sheet).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("icon collapse keeps the navigation column steady throughout its transition", async ({ page }) => {
  await page.addInitScript((storageKey) => localStorage.setItem(storageKey, JSON.stringify({ skin: "refined" })), THEME_EDITOR_STORAGE_KEY);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/primitives/sidebar", { waitUntil: "domcontentloaded" });
  const example = page.getByRole("group", { name: "Sidebar", exact: true });
  const trigger = example.getByRole("button", { name: "Toggle sidebar", exact: true });
  await waitForExampleNavigation(example);
  const positions = await trigger.evaluate(async (button) => {
    if (!(button instanceof HTMLButtonElement)) throw new Error("Sidebar toggle missing");
    const icon = button.closest("fieldset")?.querySelector('[data-slot="group"] [data-slot="menu-button"] > svg');
    if (!icon) throw new Error("Sidebar navigation icon missing");
    const centers = [icon.getBoundingClientRect().x];
    button.click();
    for (let frame = 0; frame < 25; frame++) {
      await new Promise(requestAnimationFrame);
      centers.push(icon.getBoundingClientRect().x);
    }
    return centers;
  });
  expect(Math.max(...positions) - Math.min(...positions)).toBeLessThan(1);
});

test("RTL icon rails keep their alignment for every selection indicator", async ({ page }) => {
  await page.addInitScript((storageKey) => localStorage.setItem(storageKey, JSON.stringify({ skin: "refined" })), THEME_EDITOR_STORAGE_KEY);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/primitives/sidebar", { waitUntil: "domcontentloaded" });
  const example = page.getByRole("group", { name: "Sidebar", exact: true });
  await waitForExampleNavigation(example);
  await page.locator("html").evaluate((html) => html.setAttribute("dir", "rtl"));
  for (const side of ["left", "right"]) {
    await example.getByLabel("Side", { exact: true }).selectOption(side);
    for (const indicator of ["skin", "none", "slide", "hover"]) {
      await example.getByLabel("Menu highlight", { exact: true }).selectOption(indicator);
      await example.getByRole("button", { name: "Toggle sidebar", exact: true }).click();
      await example.getByRole("button", { name: "Workflows", exact: true }).hover();
      const collapsed = await leadingCenters(example.locator('[data-slot="menu-button"]'));
      expect(Math.max(...collapsed.map((item) => item.icon)) - Math.min(...collapsed.map((item) => item.icon))).toBeLessThan(1.1);
      await example.getByRole("button", { name: "Toggle sidebar", exact: true }).click();
    }
  }
});

for (const direction of ["ltr", "rtl"]) {
  for (const side of ["left", "right"]) {
    test(`${direction} ${side}: off-canvas motion reverses smoothly and respects reduced motion`, async ({ page }) => {
      await page.addInitScript(
        (storageKey) => localStorage.setItem(storageKey, JSON.stringify({ skin: "refined" })),
        THEME_EDITOR_STORAGE_KEY,
      );
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto("/primitives/sidebar", { waitUntil: "domcontentloaded" });
      const example = page.getByRole("group", { name: "Sidebar", exact: true });
      await waitForExampleNavigation(example);
      await page.locator("html").evaluate((html, textDirection) => html.setAttribute("dir", textDirection), direction);
      await example.getByLabel("Side", { exact: true }).selectOption(side);
      await example.getByLabel("Collapse", { exact: true }).selectOption("offcanvas");
      const trigger = example.getByRole("button", { name: "Toggle sidebar", exact: true });
      const motion = await trigger.evaluate(async (button) => {
        if (!(button instanceof HTMLButtonElement)) throw new Error("Sidebar toggle missing");
        const preview = button.closest("fieldset");
        const container = preview?.querySelector('[data-slot="container"]');
        if (!container) throw new Error("Sidebar container missing");
        button.click();
        const positions: number[] = [];
        for (let frame = 0; frame < 5; frame++) {
          await new Promise(requestAnimationFrame);
          positions.push(Number.parseFloat(getComputedStyle(container).translate));
        }
        button.click();
        for (let frame = 0; frame < 25; frame++) await new Promise(requestAnimationFrame);
        return { positions, translate: getComputedStyle(container).translate };
      });
      expect(motion.positions.some((position) => Math.abs(position) > 1 && Math.abs(position) < 99)).toBe(true);
      expect(Number.parseFloat(motion.translate)).toBe(0);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await trigger.click();
      await expect(example.locator('[data-slot="inner"]')).toHaveAttribute("inert", "");
      await expect(example.locator('[data-slot="container"]')).toHaveCSS("transition-duration", "0s");
      const container = await example.locator('[data-slot="container"]').boundingBox();
      const wrapper = await example.locator('[data-slot="wrapper"]').boundingBox();
      if (!(container && wrapper)) throw new Error("Sidebar bounds unavailable");
      const physicalLeft = (side === "left") === (direction === "ltr");
      if (physicalLeft) expect(container.x + container.width).toBeLessThanOrEqual(wrapper.x + 1);
      else expect(container.x).toBeGreaterThanOrEqual(wrapper.x + wrapper.width - 1);
    });
  }
}
