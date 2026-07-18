import { expect, test } from "@playwright/test";

test("theme editor starts closed on mobile and open on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto("/primitives/code-diff");

  await expect(page.getByRole("button", { name: "Edit theme" })).toBeVisible();
  await expect(page.locator('[data-control-ui="drawer"][data-slot="content"]')).toHaveCount(0);
  await expect(page.locator("#examples")).not.toHaveAttribute("aria-hidden", "true");

  await page.setViewportSize({ width: 1024, height: 900 });

  await expect(page.getByRole("button", { name: "Close theme editor" })).toBeVisible();
  await expect(page.locator("aside.theme-editor-desktop-panel")).toBeVisible();
});
