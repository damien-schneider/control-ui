import { expect, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import { waitForReactHydration } from "./browser-test-helpers";
import { expectHighlightOn } from "./track-highlight-helpers";

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.addInitScript((storageKey) => {
    localStorage.setItem(storageKey, JSON.stringify({ skin: "refined" }));
  }, THEME_EDITOR_STORAGE_KEY);
});

test("nested tracks preserve their own selection, hover, and press paint", async ({ page }) => {
  await page.goto("/primitives/track-highlight");
  const group = page.getByRole("group", { name: "Hover and focus", exact: true });
  const track = group.locator('[data-track="hover"]');
  const selected = group.getByRole("button", { name: "Overview", exact: true });
  const unselected = group.getByRole("button", { name: "Activity", exact: true });
  const highlight = track.locator('[data-control-family="track-highlight"]');
  await waitForReactHydration(selected);
  const selectedFill = await selected.evaluate((node) => getComputedStyle(node).backgroundColor);
  const idleFill = await unselected.evaluate((node) => getComputedStyle(node).backgroundColor);
  expect(selectedFill).not.toBe(idleFill);

  await group.evaluate((node) => node.setAttribute("data-track", "slide"));
  await expect(selected).toHaveCSS("background-color", selectedFill);
  await unselected.hover();
  await expectHighlightOn(highlight, unselected);
  await expect(unselected).toHaveCSS("background-color", idleFill);
  await expect(selected).toHaveCSS("background-color", selectedFill);
  await page.mouse.down();
  await expect(unselected).not.toHaveCSS("background-color", idleFill);
  await page.mouse.move(0, 0);
  await page.mouse.up();

  await track.evaluate((node) => node.setAttribute("data-track", "none"));
  await selected.hover();
  await expect(selected).toHaveCSS("background-color", selectedFill);
  await unselected.hover();
  await expect(unselected).not.toHaveCSS("background-color", idleFill);
});

test("sidebar highlights inherit the sidebar and menu radius overrides", async ({ page }) => {
  await page.goto("/primitives/sidebar");
  const group = page.getByRole("group", { name: "Sidebar", exact: true });
  const menuHighlight = group.getByRole("combobox", { name: "Menu highlight" });
  await waitForReactHydration(menuHighlight);
  await menuHighlight.selectOption("hover");
  const sidebar = group.locator('[data-control-family="sidebar"][data-slot="root"]');
  const track = group.locator('[data-slot="menu-track"]').first();
  const workflows = group.getByRole("button", { name: "Workflows", exact: true });
  const highlight = track.locator('[data-control-family="track-highlight"]');
  await waitForReactHydration(workflows);
  await sidebar.evaluate((node) => node.style.setProperty("--cui-sidebar-menu-button-radius", "12px"));
  await workflows.hover();
  await expectHighlightOn(highlight, workflows);
  await expect(workflows).toHaveCSS("border-radius", "12px");
  await expect(highlight).toHaveCSS("border-radius", "12px");
  await track.evaluate((node) => node.style.setProperty("--cui-sidebar-menu-button-radius", "3px"));
  await expect(workflows).toHaveCSS("border-radius", "3px");
  await expect(highlight).toHaveCSS("border-radius", "3px");
});

test("XP button highlights share the control radius floor and follow larger overrides", async ({ page }) => {
  await page.goto("/primitives/track-highlight");
  const skinPicker = page.getByRole("combobox", { name: "Skin", exact: true });
  await waitForReactHydration(skinPicker);
  await skinPicker.click();
  await page.getByRole("option", { name: "Windows XP", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-skin", "xp");
  const group = page.getByRole("group", { name: "Hover and focus", exact: true });
  const button = group.getByRole("button", { name: "Activity", exact: true });
  const highlight = group.locator('[data-control-family="track-highlight"]');
  await button.hover();
  await expect(button).toHaveCSS("border-radius", "3px");
  await expect(highlight).toHaveCSS("border-radius", "3px");
  await group.evaluate((node) => node.style.setProperty("--radius-control", "12px"));
  await expect(button).toHaveCSS("border-radius", "12px");
  await expect(highlight).toHaveCSS("border-radius", "12px");
});

test("sliding trees apply root knobs to both rows and their highlight", async ({ page }) => {
  await page.goto("/primitives/tree");
  const tree = page.getByRole("tree", { name: "Project files" });
  const surface = tree.locator("..");
  const item = tree.locator('[data-slot="item-trigger"]').filter({ hasText: "app.tsx" });
  const highlight = surface.locator('[data-control-family="track-highlight"]');
  await waitForReactHydration(item);
  await surface.evaluate((node) => node.style.setProperty("--cui-tree-item-trigger-radius", "12px"));
  await item.hover();
  await expectHighlightOn(highlight, item);
  await expect(item).toHaveCSS("border-radius", "12px");
  await expect(highlight).toHaveCSS("border-radius", "12px");
  await tree.getByRole("treeitem", { name: "README.md", exact: true }).click();
  await page.mouse.move(0, 0);
  await expectHighlightOn(highlight, tree.locator('[data-slot="item-trigger"]').filter({ hasText: "README.md" }));
});

test("table of contents keeps scroll tracking and inherits highlight knobs without layout styles", async ({ page }) => {
  await page.goto("/primitives/table-of-contents");
  const navigation = page.getByRole("navigation", { name: "Background", exact: true });
  const highlight = navigation.locator('[data-control-family="track-highlight"]');
  await waitForReactHydration(navigation);
  await navigation.evaluate((node) => {
    node.style.width = "280px";
    node.style.setProperty("--cui-table-of-contents-padding", "24px");
    node.style.setProperty("--cui-table-of-contents-highlight-radius", "12px");
    node.style.setProperty("--duration-base", "240ms");
  });
  await expect(highlight).toHaveCSS("border-radius", "12px");
  await expect(navigation).toHaveCSS("padding-left", "24px");
  await expect(highlight).toHaveCSS("padding-left", "0px");
  await expect(highlight).toHaveCSS("transition-duration", "0.24s");
  await expect(navigation.locator('[data-slot="rail"]')).toHaveCSS("width", "1px");
  const release = navigation.getByRole("link", { name: "Release notes", exact: true });
  await release.click();
  await expect(release).toHaveAttribute("aria-current", "location");
  await expect(highlight).toHaveCSS("opacity", "1");
});
