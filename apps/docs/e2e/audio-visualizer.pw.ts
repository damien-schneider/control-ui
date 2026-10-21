import { expect, test } from "@playwright/test";
import { waitForReactHydration } from "./browser-test-helpers";

test("audio visualizer knobs reach computed paint from the family root and from the painted slot", async ({ page }) => {
  await page.goto("/kits/audio-visualizer");

  const bars = page.locator('[data-control-ui="audio-visualizer"][data-slot="root"][data-variant="bars"]').first();
  const bar = bars.locator('[data-slot="bar"]').first();
  await expect(bar).toBeVisible();

  const rootOverride = await page.addStyleTag({
    content:
      '[data-control-ui="audio-visualizer"][data-slot="root"][data-variant="bars"] { --cui-audio-visualizer-bar-background: rgb(1 2 3); }',
  });
  await expect.poll(() => bar.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe("rgb(1, 2, 3)");
  await rootOverride.evaluate((element) => element.parentNode?.removeChild(element));

  await page.addStyleTag({
    content: '[data-control-ui="audio-visualizer"][data-slot="bar"] { --cui-audio-visualizer-bar-background: rgb(4 5 6); }',
  });
  await expect.poll(() => bar.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe("rgb(4, 5, 6)");

  const lineVariant = page.getByRole("radio", { name: "Line envelope", exact: true });
  await waitForReactHydration(lineVariant);
  await lineVariant.click();
  const line = page.locator('[data-control-ui="audio-visualizer"][data-slot="root"][data-variant="line"]').first();
  const waveform = line.locator('[data-slot="waveform"]');
  await expect(waveform).toBeVisible();

  await page.addStyleTag({
    content:
      '[data-control-ui="audio-visualizer"][data-slot="root"][data-variant="line"] { --cui-audio-visualizer-line-stroke: rgb(7 8 9); }',
  });
  await expect.poll(() => waveform.evaluate((element) => getComputedStyle(element).stroke)).toBe("rgb(7, 8, 9)");
});

test("the waveform stops at its idle line and resumes on demand", async ({ page }) => {
  await page.goto("/kits/audio-visualizer");
  const waveform = page.getByRole("img", { name: "Voice waveform", exact: true });
  await expect(waveform).toHaveAttribute("data-active", "true");
  const pause = page.getByRole("button", { name: "Pause", exact: true });
  await waitForReactHydration(pause);
  const track = waveform.locator('[data-slot="track"]');
  await expect
    .poll(() =>
      track.evaluate((element) =>
        element
          .getAnimations()
          .some(
            (animation) =>
              animation.effect instanceof KeyframeEffect &&
              animation.effect.getKeyframes().some((frame) => String(frame.transform).includes("translateX")),
          ),
      ),
    )
    .toBe(true);
  await pause.click();
  await expect(waveform).not.toHaveAttribute("data-active");
  await expect
    .poll(() =>
      track.evaluate((element) =>
        element
          .getAnimations()
          .some(
            (animation) =>
              animation.effect instanceof KeyframeEffect &&
              animation.effect.getKeyframes().some((frame) => String(frame.transform).includes("translateX")),
          ),
      ),
    )
    .toBe(false);
  await page.getByRole("button", { name: "Listen", exact: true }).click();
  await expect(waveform).toHaveAttribute("data-active", "true");
});

test("frequency bars align, mirror, and respect reduced motion during loading", async ({ page }) => {
  await page.goto("/kits/audio-visualizer");
  const variant = page.getByRole("radio", { name: "Frequency bars", exact: true });
  await waitForReactHydration(variant);
  await variant.click();
  const trackAlignment = async (name: string) =>
    page.getByRole("img", { name }).evaluate((element) => {
      const track = element.querySelector('[data-slot="track"]');
      if (!track) throw new Error("Frequency track is missing");
      const trackBox = track.getBoundingClientRect();
      const shortestBar = [...track.querySelectorAll('[data-slot="bar"]')]
        .map((bar) => bar.getBoundingClientRect())
        .sort((a, b) => a.height - b.height)[0];
      if (!shortestBar || shortestBar.height >= trackBox.height) throw new Error("Frequency bars need slack to show their alignment");
      return {
        top: shortestBar.top - trackBox.top,
        bottom: trackBox.bottom - shortestBar.bottom,
        center: Math.abs(shortestBar.top + shortestBar.height / 2 - (trackBox.top + trackBox.height / 2)),
      };
    });
  expect((await trackAlignment("center aligned frequency bars")).center).toBeLessThan(1);
  expect((await trackAlignment("start aligned frequency bars")).top).toBeLessThan(1);
  expect((await trackAlignment("end aligned frequency bars")).bottom).toBeLessThan(1);
  await expect(page.getByRole("img", { name: "Mirrored frequency bars" })).toHaveAttribute("data-mirrored", "true");
  const loading = page.getByRole("img", { name: "Connecting audio" });
  await expect(loading).toHaveAttribute("aria-busy", "true");
  const loadingBarAnimations = () =>
    loading
      .locator('[data-slot="bar"]')
      .first()
      .evaluate((element) => element.getAnimations().length);
  await expect.poll(loadingBarAnimations).toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(loadingBarAnimations).toBe(0);
});
