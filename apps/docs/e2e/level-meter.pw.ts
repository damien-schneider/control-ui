import { expect, type Locator, test } from "@playwright/test";
import { waitForReactHydration } from "./browser-test-helpers";

async function boxOf(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("Expected a rendered element.");
  return box;
}

test("the dB scale sits beside the meter with 0 dB toward the loud end", async ({ page }) => {
  await page.goto("/components/level-meter");
  const vertical = page.getByRole("meter", { name: "Program level" }).first();
  await waitForReactHydration(vertical);
  const verticalTrack = await boxOf(vertical.locator('[data-slot="track"]'));
  const verticalScale = await boxOf(vertical.locator('[data-slot="scale"]'));
  expect(verticalScale.x).toBeGreaterThanOrEqual(verticalTrack.x + verticalTrack.width);
  const loudTick = await boxOf(vertical.locator('[data-slot="tick"]', { hasText: /^0$/ }));
  const quietTick = await boxOf(vertical.locator('[data-slot="tick"]', { hasText: "\u221260" }));
  expect(loudTick.y).toBeLessThan(quietTick.y);
  await expect(vertical).not.toHaveCSS("--_range-level", "0");

  const horizontal = page.getByRole("meter", { name: "Microphone" }).first();
  const horizontalTrack = await boxOf(horizontal.locator('[data-slot="track"]'));
  const horizontalScale = await boxOf(horizontal.locator('[data-slot="scale"]'));
  expect(horizontalScale.y).toBeGreaterThanOrEqual(horizontalTrack.y + horizontalTrack.height);
  const rightTick = await boxOf(horizontal.locator('[data-slot="tick"]', { hasText: /^0$/ }));
  const leftTick = await boxOf(horizontal.locator('[data-slot="tick"]', { hasText: "\u221260" }));
  expect(rightTick.x).toBeGreaterThan(leftTick.x);
});

test("channel strip rows line up across the mixer even when a strip has no actions", async ({ page }) => {
  await page.goto("/components/channel-strip");
  const mixer = page.locator('main [data-control-family="channel-strip"][data-slot="mixer"]').first();
  await waitForReactHydration(mixer);
  const strips = mixer.locator('[data-control-family="channel-strip"][data-slot="root"]');
  await expect(strips).toHaveCount(3);
  await expect(mixer.getByRole("group", { name: "Master" })).toBeVisible();
  for (const slot of ["body", "value", "controls"]) {
    const parts = mixer.locator(`[data-control-family="channel-strip"][data-slot="${slot}"]`);
    const tops = await parts.evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().top));
    expect(new Set(tops).size, `${slot} rows`).toBe(1);
  }
  await mixer.getByRole("button", { name: "Remove Shure MV7+" }).click();
  await expect(strips).toHaveCount(2);
});
