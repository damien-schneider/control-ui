import { expect, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import { waitForReactHydration } from "./browser-test-helpers";
import { disableAnchorSupport, expectHighlightOn } from "./track-highlight-helpers";

for (const positioning of ["anchors", "fallback"]) {
  test.describe(`Refined group hover: ${positioning}`, () => {
    test.use({ viewport: { width: 1440, height: 1100 } });
    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.addInitScript((storageKey) => {
        localStorage.setItem(storageKey, JSON.stringify({ skin: "refined", mode: "light" }));
      }, THEME_EDITOR_STORAGE_KEY);
      if (positioning === "fallback") await disableAnchorSupport(page);
    });

    test("button groups glide over their surfaces, preserve selection and joined edges, and allow opting out", async ({ page }) => {
      await page.goto("/primitives/button-group");
      await expect(page.locator("html")).toHaveAttribute("data-skin", "refined");
      const group = page.getByRole("group", { name: "Text alignment", exact: true });
      const left = group.getByRole("button", { name: "Left", exact: true });
      const center = group.getByRole("button", { name: "Center", exact: true });
      const right = group.getByRole("button", { name: "Right", exact: true });
      const highlight = group.locator('[data-control-family="track-highlight"]');
      await waitForReactHydration(left);
      const idleFill = await left.evaluate((node) => getComputedStyle(node).backgroundColor);
      await left.hover();
      await expectHighlightOn(highlight, left);
      await expect(left).toHaveCSS("background-color", idleFill);
      await expect(left).toHaveCSS("isolation", "auto");
      await expect(highlight).toHaveCSS("z-index", "0");
      await expect(left.locator('[data-slot="content"]')).toHaveCSS("z-index", "1");
      await expect(center).toHaveAttribute("data-active", "true");
      await right.hover();
      await expectHighlightOn(highlight, right);
      await expect(center).toHaveAttribute("data-active", "true");
      await right.click();
      await expect(right).toHaveAttribute("data-active", "true");
      await expect(center).not.toHaveAttribute("data-active");
      await page.keyboard.press("Shift+Tab");
      await expect(center).toBeFocused();
      await expectHighlightOn(highlight, center);
      await expect(left).toHaveCSS("border-top-right-radius", "0px");
      await expect(right).toHaveCSS("border-top-left-radius", "0px");
      expect(await right.evaluate((node) => Number.parseFloat(getComputedStyle(node).borderTopRightRadius))).toBeGreaterThan(0);
      const share = page.getByRole("group", { name: "Share link", exact: true });
      await expect(share.getByText("https://", { exact: true })).toHaveCSS("border-top-right-radius", "0px");
      await expect(page.getByRole("group", { name: "Static actions" }).locator('[data-control-family="track-highlight"]')).toHaveCount(0);
      await expect(page.getByRole("group", { name: "Static actions" }).getByRole("button").first()).not.toHaveAttribute("data-track-item");
    });

    test("vertical groups skip disabled controls and keep the end caps", async ({ page }) => {
      await page.goto("/primitives/button-group");
      const group = page.getByRole("group", { name: "Item actions" });
      const first = group.getByRole("button", { name: "Open", exact: true });
      const last = group.getByRole("button", { name: "Open in new window", exact: true });
      const highlight = group.locator('[data-control-family="track-highlight"]');
      await first.hover();
      await expectHighlightOn(highlight, first);
      await group.getByRole("button", { name: "Duplicate" }).hover({ force: true });
      if (positioning === "anchors") await expect(highlight).toBeHidden();
      else await expect(highlight).toHaveCSS("opacity", "0");
      await last.hover();
      await expectHighlightOn(highlight, last);
      await first.click();
      await page.keyboard.press("Tab");
      await expect(last).toBeFocused();
      await expectHighlightOn(highlight, last);
      await expect(first).toHaveCSS("border-bottom-left-radius", "0px");
      await expect(last).toHaveCSS("border-top-left-radius", "0px");
      expect(await last.evaluate((node) => Number.parseFloat(getComputedStyle(node).borderBottomLeftRadius))).toBeGreaterThan(0);
    });

    test("toggle groups track hover and arrow-key focus without changing other pressed values", async ({ page }) => {
      await page.goto("/primitives/toggle");
      const group = page.getByRole("group", { name: "Text formatting" });
      const bold = group.getByRole("button", { name: "Bold", exact: true });
      const italic = group.getByRole("button", { name: "Italic", exact: true });
      const underline = group.getByRole("button", { name: "Underline", exact: true });
      const highlight = group.locator('[data-control-family="track-highlight"]');
      await waitForReactHydration(italic);
      await italic.hover();
      await expectHighlightOn(highlight, italic);
      await expect(bold).toHaveAttribute("aria-pressed", "true");
      await expect(italic).toHaveAttribute("aria-pressed", "false");
      await italic.click();
      await expect(italic).toHaveAttribute("aria-pressed", "true");
      await expect(bold).toHaveAttribute("aria-pressed", "true");
      await page.keyboard.press("ArrowRight");
      await expect(underline).toBeFocused();
      await expectHighlightOn(highlight, underline);
      await page.keyboard.press("Space");
      await expect(underline).toHaveAttribute("aria-pressed", "true");
      await expect(bold).toHaveAttribute("aria-pressed", "true");
      const views = page.getByRole("group", { name: "View mode" });
      await views.getByRole("button", { name: "Board" }).click();
      await expect(views.getByRole("button", { name: "Board" })).toHaveAttribute("aria-pressed", "true");
      await expect(views.getByRole("button", { name: "Grid" })).toHaveAttribute("aria-pressed", "false");
    });
  });
}

test("switching skins applies the group defaults while explicit indicators keep their choice", async ({ page }) => {
  await page.addInitScript((storageKey) => {
    localStorage.setItem(storageKey, JSON.stringify({ skin: "flat" }));
  }, THEME_EDITOR_STORAGE_KEY);
  await page.goto("/primitives/button-group");
  const group = page.getByRole("group", { name: "Text alignment" });
  await expect(group).toHaveAttribute("data-track", "none");
  await page.getByRole("combobox", { name: "Skin", exact: true }).click();
  await page.getByRole("option", { name: "Refined", exact: true }).click();
  await expect(group).toHaveAttribute("data-track", "hover");
  await expect(page.getByRole("group", { name: "Static actions" })).toHaveAttribute("data-track", "none");
  await group.getByRole("button", { name: "Left", exact: true }).hover();
  await expectHighlightOn(
    group.locator('[data-control-family="track-highlight"]'),
    group.getByRole("button", { name: "Left", exact: true }),
  );
  await page.getByRole("combobox", { name: "Skin", exact: true }).click();
  await page.getByRole("option", { name: "Flat", exact: true }).click();
  await expect(group).toHaveAttribute("data-track", "none");
  await expect(group.locator('[data-control-family="track-highlight"]')).toHaveCount(0);
});

test("Refined enables fluid sidebar and checkbox navigation without per-instance props", async ({ page }) => {
  await page.addInitScript((storageKey) => {
    localStorage.setItem(storageKey, JSON.stringify({ skin: "refined" }));
  }, THEME_EDITOR_STORAGE_KEY);
  await page.goto("/primitives/sidebar");
  const sidebar = page.getByRole("group", { name: "Sidebar", exact: true });
  const menu = sidebar.locator('[data-slot="menu-track"]').first();
  await expect(menu).toHaveAttribute("data-track", "hover");
  const workflows = menu.getByRole("button", { name: "Workflows", exact: true });
  await workflows.hover();
  await expectHighlightOn(menu.locator('[data-control-family="track-highlight"]'), workflows);
  await expect(menu.getByRole("button", { name: "Agents", exact: true })).toHaveAttribute("data-active", "true");
  await page.goto("/primitives/checkbox-group");
  const checkboxes = page.getByRole("group", { name: "Notification channels" });
  await expect(checkboxes).toHaveAttribute("data-track", "hover");
  await checkboxes.getByText("Critical alerts only", { exact: true }).hover();
  await expectHighlightOn(checkboxes.locator('[data-control-family="track-highlight"]'), checkboxes.locator('label[for="channel-sms"]'));
});

for (const skin of ["refined", "flat"]) {
  test(`website sidebar enables fluid navigation with the ${skin} skin`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.addInitScript(
      ({ storageKey, skin: initialSkin }) => {
        localStorage.setItem(storageKey, JSON.stringify({ skin: initialSkin }));
      },
      { storageKey: THEME_EDITOR_STORAGE_KEY, skin },
    );
    await page.goto("/primitives/button-group");
    const navigation = page.locator("[data-docs-sidebar-navigation]");
    const current = navigation.getByRole("link", { name: "Button group", exact: true });
    const first = navigation.getByRole("link", { name: "Button", exact: true });
    const last = navigation.getByRole("link", { name: "Dropdown Menu", exact: true });
    const menu = navigation
      .locator('[data-slot="menu-track"]')
      .filter({ has: page.getByRole("link", { name: "Button group", exact: true }) });
    const highlight = menu.locator('[data-control-family="track-highlight"]');
    await waitForReactHydration(first);
    await expect(menu).toHaveAttribute("data-track", "hover");
    await first.hover();
    await expectHighlightOn(highlight, first);
    await expect(highlight).toHaveCSS("opacity", "1");
    const firstBox = await first.boundingBox();
    const adjacentBox = await current.boundingBox();
    const lastBox = await last.boundingBox();
    if (!firstBox || !adjacentBox || !lastBox) throw new Error("Website navigation links are not laid out");
    for (let pointerY = firstBox.y + firstBox.height - 2; pointerY <= adjacentBox.y + 2; pointerY++) {
      await page.mouse.move(firstBox.x + firstBox.width / 2, pointerY);
      expect(await highlight.isVisible()).toBe(true);
      await expect(highlight).toHaveCSS("opacity", "1", { timeout: 100 });
    }
    await first.hover();
    await expectHighlightOn(highlight, first);
    await last.hover();
    const positions = await highlight.evaluate(async (node) => {
      const framePositions: number[] = [];
      for (let frame = 0; frame < 12; frame++) {
        await new Promise(requestAnimationFrame);
        framePositions.push(node.getBoundingClientRect().y);
      }
      return framePositions;
    });
    expect(positions.some((top) => top > firstBox.y + 1 && top < lastBox.y - 1)).toBe(true);
    await expectHighlightOn(highlight, last);
    await expect(current).toHaveAttribute("data-active", "true");
    await first.click();
    await expect(page).toHaveURL(/\/primitives\/button$/);
    await expect(navigation.getByRole("link", { name: "Button", exact: true })).toHaveAttribute("data-active", "true");
  });
}
