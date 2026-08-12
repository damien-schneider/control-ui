import { expect, type Locator, test } from "@playwright/test";

async function waitForSidebarHydration(resizeHandle: Locator) {
  await expect(resizeHandle).toHaveAttribute("data-resize-ready", "");
}

test("sidebar keyboard resize updates and persists the wrapper width", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/primitives/code-diff");
  await page.evaluate(() => localStorage.removeItem("control-ui-docs:sidebar-width"));
  await page.reload();

  const resizeHandle = page.getByRole("separator", { name: /Resize sidebar/ });
  const wrapper = page.locator('[data-control-ui="sidebar"][data-slot="wrapper"]');
  await waitForSidebarHydration(resizeHandle);
  await resizeHandle.focus();
  await resizeHandle.press("End");

  await expect(resizeHandle).toHaveAttribute("aria-valuenow", "420");
  await expect(wrapper).toHaveCSS("--sidebar-width", "420px");

  await page.reload();
  await expect(wrapper).toHaveCSS("--sidebar-width", "420px");
});

test("collapsed state survives reload", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/primitives/code-diff");

  const sidebarRoot = page.locator('[data-control-ui="sidebar"][data-slot="root"].peer');
  const resizeHandle = page.getByRole("separator", { name: /Resize sidebar/ });
  await waitForSidebarHydration(resizeHandle);
  await resizeHandle.focus();
  await resizeHandle.press("Enter");
  await expect(sidebarRoot).toHaveAttribute("data-state", "collapsed");
  await expect.poll(async () => (await page.context().cookies()).find((cookie) => cookie.name === "sidebar_state")?.value).toBe("false");

  await page.reload();
  await expect(sidebarRoot).toHaveAttribute("data-state", "collapsed");
  await expect(page.locator("[data-docs-sidebar-navigation]")).toHaveAttribute("inert", "");
});

test("drag collapse restores the committed width and drag expand tracks the pointer", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/primitives/code-diff");

  const sidebarRoot = page.locator('[data-control-ui="sidebar"][data-slot="root"].peer');
  const resizeHandle = page.getByRole("separator", { name: /Resize sidebar/ });
  const wrapper = page.locator('[data-control-ui="sidebar"][data-slot="wrapper"]');
  const sidebarContainer = page.locator('[data-control-ui="sidebar"][data-slot="container"]');
  await waitForSidebarHydration(resizeHandle);
  await resizeHandle.focus();
  await resizeHandle.press("End");
  await expect(sidebarContainer).toHaveCSS("width", "420px");

  await resizeHandle.hover();
  await page.mouse.down();
  await page.mouse.move(100, 450);
  await expect(resizeHandle).toHaveAttribute("data-resizing", "true");
  await expect(sidebarRoot).toHaveAttribute("data-state", "collapsed");
  await page.mouse.up();
  await expect(sidebarRoot).toHaveAttribute("data-state", "collapsed");

  await resizeHandle.press("Enter");
  await expect(sidebarRoot).toHaveAttribute("data-state", "expanded");
  await expect(wrapper).toHaveCSS("--sidebar-width", "420px");
  await expect(resizeHandle).toHaveAttribute("aria-valuenow", "420");

  await resizeHandle.press("Enter");
  await expect(sidebarRoot).toHaveAttribute("data-state", "collapsed");
  await expect(sidebarContainer).toHaveCSS("left", "-420px");
  await resizeHandle.hover();
  await page.mouse.down();
  await page.mouse.move(300, 450);
  await page.mouse.up();

  await expect(sidebarRoot).toHaveAttribute("data-state", "expanded");
  await expect(wrapper).toHaveCSS("--sidebar-width", "300px");
  await expect(resizeHandle).toHaveAttribute("aria-valuenow", "300");
});

test("switching to the mobile sidebar aborts an active resize gesture", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/primitives/code-diff");

  const resizeHandle = page.getByRole("separator", { name: /Resize sidebar/ });
  const wrapper = page.locator('[data-control-ui="sidebar"][data-slot="wrapper"]');
  await waitForSidebarHydration(resizeHandle);

  await resizeHandle.hover();
  await page.mouse.down();
  await page.mouse.move(300, 450);
  await expect(wrapper).toHaveAttribute("data-resizing", "true");

  await page.setViewportSize({ width: 800, height: 900 });
  await expect(resizeHandle).toHaveCount(0);
  await expect(wrapper).not.toHaveAttribute("data-resizing");
  await expect
    .poll(() => page.evaluate(() => ({ cursor: document.body.style.cursor, userSelect: document.body.style.userSelect })))
    .toEqual({ cursor: "", userSelect: "" });
  await page.mouse.up();
});

test("sidebar shortcut moves focus out of collapsed navigation", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/primitives/code-diff");

  const activeLink = page.getByRole("link", { name: "Create app", exact: true });
  const resizeHandle = page.getByRole("separator", { name: /Resize sidebar/ });
  const sidebarRoot = page.locator('[data-control-ui="sidebar"][data-slot="root"].peer');
  await waitForSidebarHydration(resizeHandle);
  await activeLink.focus();
  await page.keyboard.press("Control+b");

  await expect(sidebarRoot).toHaveAttribute("data-state", "collapsed");
  await expect(resizeHandle).toBeFocused();
});

test("collapsed state and committed width survive a skin remount", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/primitives/code-diff");

  const sidebarRoot = page.locator('[data-control-ui="sidebar"][data-slot="root"].peer');
  const resizeHandle = page.getByRole("separator", { name: /Resize sidebar/ });
  const wrapper = page.locator('[data-control-ui="sidebar"][data-slot="wrapper"]');
  await waitForSidebarHydration(resizeHandle);
  await resizeHandle.focus();
  await resizeHandle.press("End");
  await resizeHandle.press("Enter");
  await expect(sidebarRoot).toHaveAttribute("data-state", "collapsed");

  await page.getByRole("button", { name: "Edit theme" }).click();
  await page.getByLabel("Choose a skin").getByRole("button", { name: "Cuicui", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(page.locator("html")).toHaveAttribute("data-skin", "cuicui");
  await expect(sidebarRoot).toHaveAttribute("data-state", "collapsed");

  await page.locator("[data-docs-sidebar-trigger]").getByRole("button", { name: "Toggle Sidebar" }).click();
  await expect(sidebarRoot).toHaveAttribute("data-state", "expanded");
  await expect(wrapper).toHaveCSS("--sidebar-width", "420px");
  await expect(resizeHandle).toHaveAttribute("aria-valuenow", "420");
});

test("persisted desktop collapse leaves the mobile sheet interactive", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/primitives/code-diff");
  const resizeHandle = page.getByRole("separator", { name: /Resize sidebar/ });
  await waitForSidebarHydration(resizeHandle);
  await resizeHandle.focus();
  await resizeHandle.press("Enter");

  await page.setViewportSize({ width: 800, height: 900 });
  await page.reload();
  await page.getByRole("button", { name: "Toggle Sidebar" }).click();

  const sidebarNavigation = page.locator("[data-docs-sidebar-navigation]");
  await expect(sidebarNavigation).not.toHaveAttribute("inert");
  await expect(sidebarNavigation.getByRole("link", { name: "Create app", exact: true })).toBeEnabled();
});
