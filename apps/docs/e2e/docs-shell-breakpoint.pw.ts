import { expect, test } from "@playwright/test";

// One switch for the whole shell: the docked sidebar, its resize handle, the toolbar's sidebar trigger and the edge the
// toolbar hangs from all flip at lg (1024px). Sampling 1023/1024 catches any of them drifting back to md.
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
    const toolbar = page.locator("[data-docs-floating-toolbar]");
    const sidebarTrigger = toolbar.getByRole("button", { name: "Toggle Sidebar" });
    const panel = page.locator("[data-docs-floating-panel]");
    const contentPanel = page.locator('[data-control-ui="sidebar-layout"][data-slot="content"]');

    // Docked rail and its resize handle exist only from lg; below that the sidebar is a closed sheet.
    await expect(dockedSidebar).toHaveCount(docked ? 1 : 0);
    await expect(resizeHandle).toHaveCount(docked ? 1 : 0);
    // The trigger is the only way into the sheet, so it survives exactly where the rail doesn't.
    await expect(sidebarTrigger).toBeVisible({ visible: !docked });

    const panelBox = await panel.boundingBox();
    expect(panelBox).not.toBeNull();
    if (docked) {
      expect(panelBox?.y ?? Number.POSITIVE_INFINITY).toBeLessThan(height / 4);
    } else {
      expect((panelBox?.y ?? 0) + (panelBox?.height ?? 0)).toBeGreaterThan(height * 0.75);
    }

    // No docked sidebar to the left means no gutter from it either: the panel pays its own, symmetrically.
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
