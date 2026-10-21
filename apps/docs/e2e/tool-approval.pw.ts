import { expect, test } from "@playwright/test";
import { waitForReactHydration } from "./browser-test-helpers";

test("approval shortcuts act only while focus is inside the card", async ({ page }) => {
  await page.goto("/kits/tool-approval");
  const card = page.locator('[data-control-ui="tool-approval"][data-slot="root"]').first();
  const reset = page.getByRole("button", { name: "Reset", exact: true });

  await waitForReactHydration(card);
  await card.locator('[data-slot="description"]').click();
  await page.keyboard.press("ControlOrMeta+Enter");
  await expect(card.getByText("Approved", { exact: true })).toBeVisible();
  await expect(card.getByRole("button", { name: "Approve" })).toHaveCount(0);

  await reset.click();
  await card.focus();
  await page.keyboard.press("Escape");
  await expect(card.getByText("Denied", { exact: true })).toBeVisible();

  await reset.click();
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  });
  await page.keyboard.press("Escape");
  await expect(card).toHaveAttribute("data-state", "pending");
});
