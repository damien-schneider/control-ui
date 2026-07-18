import { expect, type Locator, test } from "@playwright/test";

async function expectSize(locator: Locator, width: number, height: number) {
  await expect
    .poll(async () => {
      return locator.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return { width: Math.round(rect.width), height: Math.round(rect.height) };
      });
    })
    .toEqual({ width, height });
}

test("morphing panel keeps one trigger while moving through declared sizes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/primitives/morphing-panel");

  const panel = page.locator('[data-control-ui="morphing-panel"][data-slot="root"]');
  const trigger = panel.locator('[data-control-ui="morphing-panel"][data-slot="trigger"]');
  const content = panel.locator('[data-control-ui="morphing-panel"][data-slot="content"]');

  await expectSize(panel, 132, 52);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  await expect(panel).toHaveAttribute("data-state", "open");
  await expect(panel).toHaveAttribute("data-last-open-reason", "trigger-press");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expectSize(panel, 320, 240);
  await expect(trigger).toBeFocused();
  await expect(content).toBeVisible();

  await page.getByRole("tab", { name: "Aspect ratio" }).click();
  await expectSize(panel, 320, 188);
  await expect(page.getByRole("button", { name: "Apply" })).toBeInViewport();

  await page.getByRole("tab", { name: "Prompt" }).click();
  await expectSize(panel, 320, 240);

  await trigger.click();
  await expectSize(panel, 132, 52);
  await expect(content).toBeAttached();
  await expect(content).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("morphing panel clamps width and respects reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 300, height: 700 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/primitives/morphing-panel");

  const panel = page.locator('[data-control-ui="morphing-panel"][data-slot="root"]');
  const trigger = panel.locator('[data-control-ui="morphing-panel"][data-slot="trigger"]');
  await trigger.click();

  const geometry = await panel.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      width: element.getBoundingClientRect().width,
      parentWidth: element.parentElement?.getBoundingClientRect().width ?? 0,
      transitionDuration: styles.transitionDuration,
    };
  });

  expect(geometry.width).toBeLessThan(320);
  expect(geometry.width).toBeLessThanOrEqual(geometry.parentWidth);
  expect(geometry.transitionDuration.split(",").every((duration) => Number.parseFloat(duration) === 0)).toBe(true);
});
