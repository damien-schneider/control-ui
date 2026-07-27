import { expect, type Locator, test } from "@playwright/test";

function settled(locator: Locator) {
  return locator.evaluate(async (element) => {
    await Promise.all(element.getAnimations().map((animation) => animation.finished));
  });
}

test("context trigger reveals progressively and the inspector dismisses accessibly", async ({ page }) => {
  await page.goto("/ai/context");
  await page.waitForLoadState("networkidle");

  const root = page.locator('[data-control-ui="context"][data-slot="root"]');
  const trigger = root.getByRole("button", { name: /Context window:/ });
  const label = root.locator('[data-control-ui="context"][data-slot="trigger-label"]');
  const popup = page.locator('[data-control-ui="popover"][data-slot="content"]');

  await expect(root).toHaveCount(1);
  await expect(root.getByRole("button")).toHaveCount(1);
  await expect(trigger).toBeVisible();
  await expect(label).toBeHidden();
  await expect(popup).toHaveCount(0);

  await trigger.hover();
  await expect(label).toBeVisible();
  await expect(label).toHaveText("50% context");
  await expect(popup).toHaveCount(0);

  await page.mouse.move(0, 0);
  await trigger.focus();
  await expect(trigger).toBeFocused();
  await expect(label).toBeVisible();
  await expect(popup).toHaveCount(0);

  await trigger.click();
  await expect(popup).toHaveCount(1);
  await expect(popup).toBeVisible();
  await page.mouse.move(0, 0);
  await settled(label);
  await expect(label).toHaveCSS("opacity", "1");
  await expect(label).toBeVisible();
  await expect(label).toHaveText("50% context");
  await expect(popup.getByText("100,000 / 200,000 tokens", { exact: true })).toBeVisible();
  await expect(popup.locator('[data-control-ui="context"][data-slot="segment"]')).toHaveCount(5);
  const legendRows = popup.locator('[data-control-ui="context"][data-slot="legend-item"]');
  await expect(legendRows).toHaveCount(6);
  await expect(legendRows.filter({ hasNotText: /Available|Over limit|Limit unavailable/ })).toHaveCount(5);
  await expect(popup.getByText("100,000 tokens · 50%", { exact: true })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(popup).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await trigger.press("Enter");
  await expect(popup).toHaveCount(1);
  await expect(root.getByRole("button")).toHaveCount(1);
  await page.mouse.click(8, 8);
  await expect(popup).toHaveCount(0);
});

test("context inspector stays bounded and scrollable on narrow viewports", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/ai/context");
  await page.waitForLoadState("networkidle");

  const root = page.locator('[data-control-ui="context"][data-slot="root"]');
  const trigger = root.getByRole("button", { name: /Context window:/ });
  const popup = page.locator('[data-control-ui="popover"][data-slot="content"]');

  await trigger.focus();
  await trigger.press("Enter");
  await expect(popup).toHaveCount(1);
  const popupBox = await popup.boundingBox();
  expect(popupBox).not.toBeNull();
  expect(popupBox?.x ?? 0).toBeGreaterThanOrEqual(16);
  expect((popupBox?.x ?? 0) + (popupBox?.width ?? 0)).toBeLessThanOrEqual(304);
  expect(await popup.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);

  await page.setViewportSize({ width: 320, height: 320 });
  const viewport = popup.locator('[data-control-ui="scroll-area"][data-slot="root"] > div').first();
  await expect(viewport).toBeVisible();
  await expect.poll(() => viewport.evaluate((element) => element.scrollHeight - element.clientHeight)).toBeGreaterThan(0);
  const scrollTop = await viewport.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
    return element.scrollTop;
  });
  expect(scrollTop).toBeGreaterThan(0);
  expect(await popup.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  await expect(root.getByRole("button")).toHaveCount(1);
  await expect(popup).toHaveCount(1);
});
