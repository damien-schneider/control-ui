import { expect, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "@/components/theme";

for (const { name, width, docked } of [
  { name: "below lg", width: 1023, docked: false },
  { name: "at lg", width: 1024, docked: true },
]) {
  test(`docs shell flips sidebar and trigger together ${name}`, async ({ page }) => {
    const height = 900;
    await page.setViewportSize({ width, height });
    await page.goto("/primitives/code-diff", { waitUntil: "networkidle" });

    const dockedSidebar = page.locator('[data-control-ui="sidebar"][data-slot="container"]');
    const resizeHandle = page.getByRole("separator", { name: /Resize sidebar/ });
    const sidebarTrigger = page.getByRole("button", { name: "Toggle Sidebar" });
    const contentPanel = page.locator('[data-control-ui="sidebar-layout"][data-slot="content"]');

    await expect(dockedSidebar).toHaveCount(docked ? 1 : 0);
    await expect(resizeHandle).toHaveCount(docked ? 1 : 0);
    await expect(sidebarTrigger).toBeVisible({ visible: !docked });

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
  const sidebarTrigger = page.locator("[data-docs-sidebar-trigger]").getByRole("button", { name: "Toggle Sidebar" });
  const sidebarInner = page.locator('[data-control-ui="sidebar"][data-slot="inner"]');

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
  await expect(sidebarInner).toHaveAttribute("inert", "");
  await expect(resizeHandle).toHaveAttribute("aria-valuemax", "420");
  await expect(resizeHandle).toHaveAttribute("aria-valuenow", "0");
  await expect(resizeHandle).toHaveAttribute("aria-valuetext", "collapsed");

  const collapsedPanelBox = await contentPanel.boundingBox();
  const triggerBox = await sidebarTrigger.boundingBox();
  if (!collapsedPanelBox || !triggerBox) throw new Error("Collapsed shell geometry is unavailable");
  expect(Math.abs(collapsedPanelBox.x - (width - collapsedPanelBox.x - collapsedPanelBox.width))).toBeLessThan(1);
  expect(Math.abs(triggerBox.x - collapsedPanelBox.x - 8)).toBeLessThan(2);
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
  const footerBox = await sidebar.locator('[data-slot="footer"] > div').boundingBox();
  if (!overviewBox || !footerBox) throw new Error("Sidebar section geometry is unavailable");
  expect(Math.abs(overviewBox.x - footerBox.x)).toBeLessThan(1);
  expect(Math.abs(overviewBox.width - footerBox.width)).toBeLessThan(1);
});
