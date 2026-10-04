import { expect, test } from "@playwright/test";
import { waitForReactHydration } from "./browser-test-helpers";

test("audio visualizer knobs reach computed paint from the family root and from the painted slot", async ({ page }) => {
  await page.goto("/components/audio-visualizer");

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
  await page.goto("/components/audio-visualizer");
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
  await page.goto("/components/audio-visualizer");
  const variant = page.getByRole("radio", { name: "Frequency bars", exact: true });
  await waitForReactHydration(variant);
  await variant.click();
  await expect(page.locator("#usage")).toContainText("@/components/control-ui/audio-visualizer-bar");
  const centered = page.getByRole("img", { name: "center aligned frequency bars" });
  const top = page.getByRole("img", { name: "start aligned frequency bars" });
  const bottom = page.getByRole("img", { name: "end aligned frequency bars" });
  await expect(centered.locator('[data-slot="track"]')).toHaveCSS("align-items", "center");
  await expect(top.locator('[data-slot="track"]')).toHaveCSS("align-items", "flex-start");
  await expect(bottom.locator('[data-slot="track"]')).toHaveCSS("align-items", "flex-end");
  await expect(page.getByRole("img", { name: "Mirrored frequency bars" })).toHaveAttribute("data-mirrored", "true");
  const loading = page.getByRole("img", { name: "Connecting audio" });
  await expect(loading).toHaveAttribute("aria-busy", "true");
  await expect(loading.locator('[data-slot="bar"]').first()).toHaveCSS("animation-name", "cui-audio-bar-pulse");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(loading.locator('[data-slot="bar"]').first()).toHaveCSS("animation-name", "none");
});
