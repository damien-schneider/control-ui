import { expect, test } from "@playwright/test";
import { waitForReactHydration } from "./browser-test-helpers";

test("horizontal content stays in one row and scrolls to focused items", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/primitives/scroll-area");
  const columns = page.getByRole("list", { name: "Roadmap columns" });
  const buttons = columns.getByRole("button");
  await waitForReactHydration(buttons.first());
  const tops = await buttons.evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().top));
  expect(Math.max(...tops) - Math.min(...tops)).toBeLessThan(1);
  const viewport = page.getByLabel("Horizontal roadmap", { exact: true });
  expect(await viewport.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  await buttons.first().focus();
  for (let index = 1; index < (await buttons.count()); index += 1) await page.keyboard.press("Tab");
  await expect(buttons.last()).toBeFocused();
  expect(await viewport.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
