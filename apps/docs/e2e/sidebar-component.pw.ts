import { expect, test } from "@playwright/test";

for (const side of ["left", "right"] as const) {
  test(`${side} sidebar resizes and restores its width without docs handlers`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/primitives/sidebar");
    const preview = page.getByRole("group", { name: side === "left" ? "Resizable" : "Right sidebar", exact: true });
    const rail = preview.getByRole("separator", { name: "Resize sidebar", exact: true });
    const wrapper = preview.locator('[data-control-ui="sidebar"][data-slot="wrapper"]');
    const root = preview.locator('[data-control-ui="sidebar"][data-slot="root"].peer');
    await expect(rail).toHaveAttribute("data-resize-ready", "");
    await rail.scrollIntoViewIfNeeded();
    await rail.focus();
    await rail.press("End");
    await expect(rail).toHaveAttribute("aria-valuenow", "420");
    await rail.press(side === "left" ? "ArrowLeft" : "ArrowRight");
    await expect(rail).toHaveAttribute("aria-valuenow", "410");
    const bounds = await wrapper.boundingBox();
    if (!bounds) throw new Error("Sidebar preview is not rendered");
    const expandedX = side === "left" ? bounds.x + 300 : bounds.x + bounds.width - 300;
    const collapsedX = side === "left" ? bounds.x + 100 : bounds.x + bounds.width - 100;
    await rail.hover();
    await page.mouse.down();
    await page.mouse.move(expandedX, bounds.y + 200);
    await page.mouse.up();
    await expect(wrapper).toHaveCSS("--sidebar-width", "300px");
    await expect(rail).toHaveAttribute("aria-valuenow", "300");
    await rail.hover();
    await page.mouse.down();
    await page.mouse.move(collapsedX, bounds.y + 200);
    await page.mouse.up();
    await expect(root).toHaveAttribute("data-state", "collapsed");
    await expect(preview.locator('[data-slot="inner"]')).toHaveAttribute("inert", "");
    await preview.getByRole("button", { name: "Agents", exact: true }).evaluate((button) => button.focus());
    await expect(rail).toBeFocused();
    await expect(rail).toBeVisible();
    await rail.press("Enter");
    await expect(root).toHaveAttribute("data-state", "expanded");
    await expect(wrapper).toHaveCSS("--sidebar-width", "300px");
    await expect(rail).toHaveAttribute("aria-valuenow", "300");
    await expect(preview.getByRole("button", { name: "Agents", exact: true })).toBeVisible();
  });
}

test("Escape cancels a drag collapse and restores document interaction", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/primitives/sidebar");
  const preview = page.getByRole("group", { name: "Resizable", exact: true });
  const rail = preview.getByRole("separator", { name: "Resize sidebar", exact: true });
  const wrapper = preview.locator('[data-control-ui="sidebar"][data-slot="wrapper"]');
  const root = preview.locator('[data-control-ui="sidebar"][data-slot="root"].peer');
  await expect(rail).toHaveAttribute("data-resize-ready", "");
  await rail.scrollIntoViewIfNeeded();
  await rail.press("End");
  const bounds = await wrapper.boundingBox();
  if (!bounds) throw new Error("Sidebar preview is not rendered");
  await rail.hover();
  await page.mouse.down();
  await page.mouse.move(bounds.x + 100, bounds.y + 200);
  await expect(root).toHaveAttribute("data-state", "collapsed");
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await expect(root).toHaveAttribute("data-state", "expanded");
  await expect(wrapper).toHaveCSS("--sidebar-width", "420px");
  await expect(wrapper).not.toHaveAttribute("data-resizing");
  await expect(rail).toBeFocused();
  await expect.poll(() => page.evaluate(() => [document.body.style.cursor, document.body.style.userSelect])).toEqual(["", ""]);
});

test("collapsed navigation stays outside keyboard navigation and respects reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/primitives/sidebar");
  const preview = page.getByRole("group", { name: "Resizable", exact: true });
  const rail = preview.getByRole("separator", { name: "Resize sidebar", exact: true });
  const container = preview.locator('[data-slot="container"]');
  await expect(rail).toHaveAttribute("data-resize-ready", "");
  await rail.press("Enter");
  await expect(container).toHaveCSS("transition-duration", "0s");
  await rail.press("Tab");
  await expect(preview.getByRole("button", { name: "Toggle Sidebar", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(rail).toBeFocused();
  await expect(preview.getByRole("button", { name: "Agents", exact: true })).toBeVisible();
  const overflow = await preview.locator('[data-slot="inset"]').evaluate((element) => {
    const parent = element.parentElement;
    if (!parent) throw new Error("Sidebar preview container missing");
    return element.getBoundingClientRect().right > parent.getBoundingClientRect().right;
  });
  expect(overflow).toBe(false);
});
