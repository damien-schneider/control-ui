import { expect, test } from "@playwright/test";

test("audio visualizer knobs reach computed paint from the family root and from the painted slot", async ({ page }) => {
  await page.goto("/ai/audio-visualizer");

  const bars = page.locator('[data-control-ui="audio-visualizer"][data-slot="root"][data-variant="bars"]').first();
  const bar = bars.locator('[data-slot="bar"]').first();
  await expect(bar).toBeVisible();

  const rootOverride = await page.addStyleTag({
    content:
      '[data-control-ui="audio-visualizer"][data-slot="root"][data-variant="bars"] { --audio-visualizer-bar-background: rgb(1 2 3); }',
  });
  await expect.poll(() => bar.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe("rgb(1, 2, 3)");
  await rootOverride.evaluate((element) => element.parentNode?.removeChild(element));

  await page.addStyleTag({
    content: '[data-control-ui="audio-visualizer"][data-slot="bar"] { --audio-visualizer-bar-background: rgb(4 5 6); }',
  });
  await expect.poll(() => bar.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe("rgb(4, 5, 6)");

  await page.getByRole("button", { name: "Line", exact: true }).click();
  const line = page.locator('[data-control-ui="audio-visualizer"][data-slot="root"][data-variant="line"]').first();
  const waveform = line.locator('[data-slot="waveform"]');
  await expect(waveform).toBeVisible();

  await page.addStyleTag({
    content: '[data-control-ui="audio-visualizer"][data-slot="root"][data-variant="line"] { --audio-visualizer-line-stroke: rgb(7 8 9); }',
  });
  await expect.poll(() => waveform.evaluate((element) => getComputedStyle(element).stroke)).toBe("rgb(7, 8, 9)");
});
