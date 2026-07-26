import { expect, test } from "@playwright/test";

test("theme editor toggles on mobile and desktop", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto("/primitives/code-diff", { waitUntil: "networkidle" });

  const editTheme = page.getByRole("button", { name: "Edit theme" });
  const mobileDrawer = page.locator('[data-control-ui="drawer"][data-slot="content"]');

  await expect(editTheme).toBeVisible();
  await expect(mobileDrawer).toHaveCount(0);
  await expect(page.locator("#examples")).not.toHaveAttribute("aria-hidden", "true");

  await editTheme.click();
  await expect(mobileDrawer).toBeVisible();
  await expect(page.getByRole("heading", { name: "Theme editor" })).toBeVisible();

  await page.getByRole("button", { name: "Close editor" }).click();
  await expect(mobileDrawer).toHaveCount(0);

  await page.setViewportSize({ width: 1024, height: 900 });
  await page.reload();

  const closeTheme = page.getByRole("button", { name: "Close theme editor" });
  const desktopPanel = page.locator("aside.theme-editor-desktop-panel");

  await expect(closeTheme).toBeVisible();
  await expect(desktopPanel).toBeVisible();

  await closeTheme.click();
  await expect(editTheme).toBeVisible();
  await expect(desktopPanel).toHaveCount(0);

  await editTheme.click();
  await expect(closeTheme).toBeVisible();
  await expect(desktopPanel).toBeVisible();
});
