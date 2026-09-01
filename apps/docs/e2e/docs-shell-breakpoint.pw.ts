import { expect, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "@/components/theme";

for (const { name, width, docked } of [
  { name: "below lg", width: 1023, docked: false },
  { name: "at lg", width: 1024, docked: true },
]) {
  test(`docs shell flips sidebar, trigger and toolbar edge together ${name}`, async ({ page }) => {
    const height = 900;
    await page.setViewportSize({ width, height });
    await page.goto("/primitives/code-diff", { waitUntil: "networkidle" });

    const dockedSidebar = page.locator('[data-control-ui="sidebar"][data-slot="container"]');
    const resizeHandle = page.getByRole("separator", { name: /Resize sidebar/ });
    const sidebarTrigger = page.getByRole("button", { name: "Toggle Sidebar" });
    const panel = page.locator("[data-docs-floating-panel]");
    const contentPanel = page.locator('[data-control-ui="sidebar-layout"][data-slot="content"]');

    await expect(dockedSidebar).toHaveCount(docked ? 1 : 0);
    await expect(resizeHandle).toHaveCount(docked ? 1 : 0);
    await expect(sidebarTrigger).toBeVisible({ visible: !docked });

    const panelBox = await panel.boundingBox();
    expect(panelBox).not.toBeNull();
    if (docked) {
      expect(panelBox?.y ?? Number.POSITIVE_INFINITY).toBeLessThan(height / 4);
    } else {
      expect((panelBox?.y ?? 0) + (panelBox?.height ?? 0)).toBeGreaterThan(height * 0.75);
    }

    const contentBox = await contentPanel.boundingBox();
    expect(contentBox).not.toBeNull();
    const leftGutter = contentBox?.x ?? 0;
    const rightGutter = width - ((contentBox?.x ?? 0) + (contentBox?.width ?? 0));
    if (docked) {
      expect(leftGutter).toBeGreaterThan(rightGutter);
    } else {
      expect(Math.abs(leftGutter - rightGutter)).toBeLessThan(1);
    }
  });
}

test("desktop shell keeps equal panel gutters and reopens from the top left", async ({ page }) => {
  const width = 1280;
  await page.setViewportSize({ width, height: 900 });
  await page.goto("/primitives/code-diff", { waitUntil: "networkidle" });

  const sidebarRoot = page.locator('[data-control-ui="sidebar"][data-slot="root"].peer');
  const sidebarGap = page.locator('[data-control-ui="sidebar"][data-slot="gap"]');
  const resizeHandle = page.getByRole("separator", { name: /Resize sidebar/ });
  const contentPanel = page.locator('[data-control-ui="sidebar-layout"][data-slot="content"]');
  const pageGrid = page.locator("[data-docs-page-grid]");
  const sidebarTrigger = page.locator("[data-docs-sidebar-trigger]").getByRole("button", { name: "Toggle Sidebar" });
  const sidebarNavigation = page.locator("[data-docs-sidebar-navigation]");

  const expandedGapBox = await sidebarGap.boundingBox();
  const expandedPanelBox = await contentPanel.boundingBox();
  if (!expandedGapBox || !expandedPanelBox) throw new Error("Expanded shell geometry is unavailable");
  expect(
    Math.abs(expandedPanelBox.x - expandedGapBox.x - expandedGapBox.width - (width - expandedPanelBox.x - expandedPanelBox.width)),
  ).toBeLessThan(1);

  await resizeHandle.focus();
  await resizeHandle.press("Enter");
  await expect(sidebarRoot).toHaveAttribute("data-state", "collapsed");
  await expect(sidebarGap).toHaveCSS("width", "0px");
  await expect(sidebarTrigger).toBeVisible();
  await expect(sidebarTrigger).toHaveAttribute("data-variant", "ghost");
  await expect(resizeHandle).toBeFocused();
  await expect(sidebarNavigation).toHaveAttribute("inert", "");
  await expect(resizeHandle).toHaveAttribute("aria-valuemin", "224");
  await expect(resizeHandle).toHaveAttribute("aria-valuemax", "420");
  await expect(resizeHandle).toHaveAttribute("aria-valuenow", "224");

  const collapsedPanelBox = await contentPanel.boundingBox();
  const pageGridBox = await pageGrid.boundingBox();
  const triggerBox = await sidebarTrigger.boundingBox();
  if (!collapsedPanelBox || !pageGridBox || !triggerBox) throw new Error("Collapsed shell geometry is unavailable");
  expect(Math.abs(collapsedPanelBox.x - (width - collapsedPanelBox.x - collapsedPanelBox.width))).toBeLessThan(1);
  expect(Math.abs(triggerBox.x - pageGridBox.x - 8)).toBeLessThan(2);
  await sidebarTrigger.click();
  await expect(sidebarRoot).toHaveAttribute("data-state", "expanded");
  await expect(sidebarTrigger).toBeHidden();
  await expect(resizeHandle).toBeFocused();
});

test("Cuicui inherits shell spacing and aligns sidebar sections", async ({ page }) => {
  await page.addInitScript((storageKey) => {
    localStorage.setItem(storageKey, JSON.stringify({ skin: "cuicui" }));
  }, THEME_EDITOR_STORAGE_KEY);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/overview", { waitUntil: "networkidle" });

  await expect(page.locator("html")).toHaveAttribute("data-skin", "cuicui");
  const resizeHandle = page.getByRole("separator", { name: /Resize sidebar/ });
  await expect(resizeHandle).toHaveAttribute("aria-valuenow", "320");
  await resizeHandle.focus();
  await resizeHandle.press("ArrowLeft");
  await expect(resizeHandle).toHaveAttribute("aria-valuenow", "310");
  const contentPanel = page.locator('[data-control-ui="sidebar-layout"][data-slot="content"]');
  await expect(contentPanel).toHaveCSS("margin-top", "8px");
  await expect(contentPanel).toHaveCSS("margin-right", "8px");
  await expect(contentPanel).toHaveCSS("margin-bottom", "8px");
  await expect(contentPanel).toHaveCSS("margin-left", "8px");

  const sidebar = page.locator('[data-control-ui="sidebar"][data-slot="container"]');
  await expect(sidebar).toHaveCSS("width", "310px");
  const overviewBox = await sidebar.getByRole("link", { name: "Overview" }).boundingBox();
  const githubBox = await sidebar.getByRole("link", { name: /Control UI on GitHub/ }).boundingBox();
  if (!overviewBox || !githubBox) throw new Error("Sidebar section geometry is unavailable");
  expect(Math.abs(overviewBox.x - githubBox.x)).toBeLessThan(1);
  expect(Math.abs(overviewBox.width - githubBox.width)).toBeLessThan(1);
});
