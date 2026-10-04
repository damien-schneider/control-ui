import { expect, test } from "@playwright/test";
import { waitForReactHydration } from "./browser-test-helpers";

test("item header and footer take full rows above and below the content", async ({ page }) => {
  await page.goto("/primitives/item");
  const item = page.locator("main [data-control-family='item'][data-slot='root']").filter({ hasText: "Production build finished" });
  await waitForReactHydration(item);

  const box = async (slot: string) => {
    const rect = await item.locator(`[data-slot='${slot}']`).first().boundingBox();
    if (!rect) throw new Error(`Item ${slot} is not rendered`);
    return rect;
  };
  const header = await box("header");
  const content = await box("content");
  const actions = await box("actions");
  const footer = await box("footer");

  expect(header.y + header.height).toBeLessThanOrEqual(content.y);
  expect(footer.y).toBeGreaterThanOrEqual(content.y + content.height);
  expect(Math.abs(actions.y + actions.height / 2 - (content.y + content.height / 2))).toBeLessThan(content.height);
  expect(header.width).toBeGreaterThan(content.width + actions.width);
  expect(footer.width).toBeCloseTo(header.width, 0);
});
