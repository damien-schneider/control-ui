import { expect, test } from "@playwright/test";

test("sidebar keyboard resize updates and persists the wrapper width", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/primitives/code-diff");
  await page.evaluate(() => localStorage.removeItem("control-ui-docs:sidebar-width"));
  await page.reload();

  const resizeHandle = page.getByRole("separator", { name: /Resize sidebar/ });
  const wrapper = page.locator('[data-control-ui="sidebar"][data-slot="wrapper"]');
  await resizeHandle.focus();
  await resizeHandle.press("End");

  await expect(resizeHandle).toHaveAttribute("aria-valuenow", "420");
  await expect(wrapper).toHaveCSS("--sidebar-width", "420px");

  await page.reload();
  await expect(wrapper).toHaveCSS("--sidebar-width", "420px");
});
