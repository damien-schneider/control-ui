import { expect, test } from "@playwright/test";
import { waitForReactHydration } from "./browser-test-helpers";

test("a row that opens without expanding leaves expanding to its chevron and the arrow keys", async ({ page }) => {
  await page.goto("/components/tree");

  const tree = page.getByRole("tree", { name: "Handbook pages" });
  const onboarding = tree.getByRole("treeitem", { name: "Onboarding" });
  const engineering = tree.getByRole("treeitem", { name: "Engineering" });
  await waitForReactHydration(engineering);

  await engineering.getByText("Engineering", { exact: true }).click();
  await expect(engineering).toHaveAttribute("aria-selected", "true");
  await expect(engineering).toHaveAttribute("aria-expanded", "false");

  await onboarding.locator('[data-slot="item-indicator"]').first().click();
  await expect(onboarding).toHaveAttribute("aria-expanded", "true");
  await expect(onboarding).toHaveAttribute("aria-selected", "false");
  await expect(engineering).toHaveAttribute("aria-selected", "true");

  await onboarding.locator('[data-slot="item-indicator"]').first().click();
  await expect(onboarding).toHaveAttribute("aria-expanded", "false");

  await engineering.press("ArrowUp");
  await expect(onboarding).toBeFocused();
  await onboarding.press("Enter");
  await expect(onboarding).toHaveAttribute("aria-selected", "true");
  await expect(onboarding).toHaveAttribute("aria-expanded", "false");

  await onboarding.press("ArrowRight");
  await expect(onboarding).toHaveAttribute("aria-expanded", "true");
});
