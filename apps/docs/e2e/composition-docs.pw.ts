import { expect, test } from "@playwright/test";
import { waitForReactHydration } from "./browser-test-helpers";

test("Context keeps its hierarchy after loading and navigating between docs", async ({ page }) => {
  await page.goto("/kits/activity");
  const activity = page.locator("#composition:visible");
  await expect(activity.getByRole("heading", { name: "Static activity" })).toBeVisible();
  await expect(activity.getByRole("heading", { name: "Collapsible activity" })).toBeVisible();
  const staticTree = activity.getByRole("region", { name: "Composition tree" }).first();
  await expect(staticTree).toContainText("ActivityRow");
  await expect(staticTree).not.toContainText("ActivityTrigger");

  await page.locator('a[href="/kits/context"]').first().click();
  await expect(page).toHaveURL(/\/kits\/context$/);
  const composition = page.locator("#composition:visible");
  await expect(composition).toHaveCount(1);
  await expect(composition.getByRole("heading", { name: "Context inspector" })).toBeVisible();
  const header = composition.locator("li").filter({ has: page.locator(':scope > [data-tag="open"]', { hasText: "<ContextHeader>" }) });
  await expect(header.locator(":scope > ul > li > [data-tag='open']")).toHaveText([
    "<ContextTitle />",
    "<ContextDescription />",
    "<ContextClose />",
  ]);
  await page.reload();
  await expect(composition.getByRole("heading", { name: "Context inspector" })).toBeVisible();
  await expect(header.locator(":scope > ul > li")).toHaveCount(3);
});

test("long composition names scroll by keyboard without overflowing a narrow page", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/kits/dynamic-notification");
  const composition = page.locator("#composition:visible");
  const tree = composition.getByRole("region", { name: "Composition tree" }).first();
  await waitForReactHydration(tree);
  await tree.scrollIntoViewIfNeeded();
  await tree.focus();
  await expect(tree).toBeFocused();
  await tree.press("ArrowRight");
  await expect.poll(() => tree.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
