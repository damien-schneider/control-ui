import { expect, test } from "@playwright/test";
import { waitForReactHydration } from "./browser-test-helpers";

test("menu choices persist, link items compose, and submenus work from the keyboard", async ({ page }) => {
  await page.goto("/primitives/dropdown-menu");
  const example = page.getByRole("group", { name: "Workspace options", exact: true });
  const trigger = example.getByRole("button", { name: "Options" });
  await waitForReactHydration(trigger);
  await trigger.press("Enter");
  const menu = page.getByRole("menu").first();
  await expect(menu).toHaveAttribute("data-side", /^(right|left)$/);
  await expect(menu).toHaveAttribute("data-align", "end");
  const notifications = page.getByRole("menuitemcheckbox", { name: "Notifications" });
  await expect(notifications).toHaveAttribute("aria-checked", "true");
  await notifications.press("Space");
  await expect(notifications).toHaveAttribute("aria-checked", "false");
  await page.keyboard.press("ArrowDown");
  const policy = page.getByRole("menuitemcheckbox", { name: "Organization policy" });
  await expect(policy).toBeFocused();
  await page.keyboard.press("Space");
  await expect(policy).toHaveAttribute("aria-checked", "false");
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menuitemradio", { name: "Team only" })).toBeFocused();
  await expect(page.getByRole("menuitemcheckbox", { name: "Organization policy" })).toHaveAttribute("aria-disabled", "true");
  await page.getByRole("menuitemradio", { name: "Everyone" }).click();
  await expect(page.getByRole("menuitemradio", { name: "Everyone" })).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("Escape");
  await expect(menu).not.toBeVisible();
  await trigger.press("Enter");
  await expect(page.getByRole("menuitemradio", { name: "Everyone" })).toHaveAttribute("aria-checked", "true");
  await expect(notifications).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("menuitem", { name: /Settings/ })).toHaveAttribute("href", "#workspace-settings");
  const share = page.getByRole("menuitem", { name: "Share", exact: true });
  await share.focus();
  await page.keyboard.press("ArrowRight");
  const copy = page.getByRole("menuitem", { name: "Copy workspace link" });
  await expect(copy).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(example.getByRole("status")).toHaveText("Last action: Copy workspace link");
  await expect(trigger).toBeFocused();
});

test.describe("touch sidebar actions", () => {
  test.use({ hasTouch: true, viewport: { width: 1440, height: 1000 } });

  test("remain visible with a centered 44px touch target", async ({ page }) => {
    await page.goto("/primitives/sidebar");
    const sidebar = page.getByRole("group", { name: "Sidebar", exact: true });
    const action = sidebar.getByRole("button", { name: "Agents actions" });
    await waitForReactHydration(action);
    await expect(action).toHaveCSS("opacity", "1");
    const actionBounds = await action.boundingBox();
    const rowBounds = await sidebar.getByRole("button", { name: "Agents", exact: true }).boundingBox();
    if (!actionBounds || !rowBounds) throw new Error("Touch sidebar actions are not laid out");
    expect(actionBounds.width).toBeGreaterThanOrEqual(44);
    expect(actionBounds.height).toBeGreaterThanOrEqual(44);
    expect(Math.abs(actionBounds.y + actionBounds.height / 2 - rowBounds.y - rowBounds.height / 2)).toBeLessThan(2);
    await action.tap();
    await expect(page.getByRole("menuitem", { name: "Settings for Agents" })).toBeVisible();
  });
});

test("custom combobox filtering matches repository aliases and recovers from no matches", async ({ page }) => {
  await page.goto("/primitives/combobox");
  const input = page.getByRole("combobox", { name: "Repository", exact: true });
  await waitForReactHydration(input);
  await input.fill("no-such-repository");
  await expect(page.getByText("No repository found.")).toBeVisible();
  await input.fill("ACME/CTRL");
  await expect(page.getByRole("option", { name: "Control UI", exact: true })).toBeVisible();
  await expect(page.getByRole("option", { name: "Reflet", exact: true })).not.toBeVisible();
  await input.press("Enter");
  await expect(input).toHaveValue("Control UI");
  await expect(page.getByRole("status")).toHaveText("Selected repository: Control UI");
});

test("sidebar row actions reveal on focus, keep menus open, and hide during icon collapse", async ({ page }) => {
  await page.goto("/primitives/sidebar");
  const sidebar = page.getByRole("group", { name: "Sidebar", exact: true });
  const action = sidebar.getByRole("button", { name: "Agents actions" });
  await waitForReactHydration(action);
  const rowButton = sidebar.getByRole("button", { name: "Agents", exact: true });
  const rowBounds = await rowButton.boundingBox();
  const actionBounds = await action.boundingBox();
  if (!rowBounds || !actionBounds) throw new Error("Sidebar row actions are not laid out");
  expect(Math.abs(actionBounds.y + actionBounds.height / 2 - rowBounds.y - rowBounds.height / 2)).toBeLessThan(2);
  expect(actionBounds.x + actionBounds.width).toBeLessThanOrEqual(rowBounds.x + rowBounds.width);
  await page.mouse.move(0, 0);
  await expect(action).toHaveCSS("opacity", "0");
  await sidebar.getByRole("button", { name: "Agents", exact: true }).focus();
  await page.keyboard.press("Tab");
  await expect(action).toBeFocused();
  await expect(action).toHaveCSS("opacity", "1");
  await action.press("Enter");
  const settings = page.getByRole("menuitem", { name: "Settings for Agents" });
  await expect(settings).toBeVisible();
  await expect(action).toHaveCSS("opacity", "1");
  await page.keyboard.press("Escape");
  await expect(action).toBeFocused();
  await sidebar.getByRole("button", { name: "Toggle Sidebar" }).last().click();
  await expect(action).toBeHidden();
});
