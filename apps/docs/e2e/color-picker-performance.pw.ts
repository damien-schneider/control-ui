import { expect, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import { waitForReactHydration } from "./browser-test-helpers";

test.use({ trace: "off", viewport: { width: 1440, height: 1000 } });

for (const skin of ["none", "mastra"]) {
  test.describe(`color dragging with ${skin}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(
        ({ selectedSkin, storageKey }) => {
          window.__REACT_GRAB_DISABLED__ = true;
          window.__REACT_SCAN_DISABLED__ = true;
          localStorage.setItem(storageKey, JSON.stringify({ skin: selectedSkin }));
        },
        { selectedSkin: skin, storageKey: THEME_EDITOR_STORAGE_KEY },
      );
    });

    test("color gestures stay within their CPU budget and preserve selection and keyboard behavior", async ({ page }) => {
      await page.goto("/primitives/color-picker");
      const example = page.locator("#example-inline-panel");
      const area = example.locator('[data-slot="area"]');
      await waitForReactHydration(area);
      await expect(page.locator("html")).toHaveAttribute("data-skin", skin);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForLoadState("networkidle");
      await area.scrollIntoViewIfNeeded();
      const box = await area.boundingBox();
      if (!box) throw new Error("Color area is missing");
      const saturation = area.getByRole("slider", { name: "Saturation", exact: true });
      const session = await page.context().newCDPSession(page);
      await session.send("Performance.enable", { timeDomain: "threadTicks" });
      const samples: { cpuMs: number; styleMs: number }[] = [];
      try {
        for (let round = 0; round < 4; round++) {
          const destination = round % 2 ? 0.2 : 0.8;
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
          const before = await session.send("Performance.getMetrics");
          await page.mouse.down();
          await page.mouse.move(box.x + destination * box.width, box.y + box.height / 2, { steps: 12 });
          await page.mouse.up();
          await page.evaluate(async () => {
            for (let frame = 0; frame < 6; frame++) await new Promise(requestAnimationFrame);
          });
          const after = await session.send("Performance.getMetrics");
          const metric = (metrics: typeof before.metrics, name: string) => {
            const entry = metrics.find((candidate) => candidate.name === name);
            if (!entry) throw new Error(`Chromium metric ${name} is unavailable`);
            return entry.value;
          };
          samples.push({
            cpuMs: (metric(after.metrics, "TaskDuration") - metric(before.metrics, "TaskDuration")) * 1000,
            styleMs: (metric(after.metrics, "RecalcStyleDuration") - metric(before.metrics, "RecalcStyleDuration")) * 1000,
          });
          expect(Math.abs(Number(await saturation.inputValue()) - destination * 100)).toBeLessThanOrEqual(1);
        }
        await test.info().attach("color-drag-cpu", { body: JSON.stringify({ skin, samples }), contentType: "application/json" });
      } finally {
        await session.detach();
      }

      const label = example.getByText("Inline panel", { exact: true });
      await label.dblclick();
      expect(await page.evaluate(() => window.getSelection()?.toString())).not.toBe("");
      await page.evaluate(() => window.getSelection()?.removeAllRanges());
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await label.hover();
      await page.mouse.move(box.x + box.width + 40, box.y - 40, { steps: 12 });
      await page.mouse.up();
      expect(await page.evaluate(() => window.getSelection()?.toString())).toBe("");
      await expect(saturation).toHaveValue("100");
      await saturation.focus();
      await page.keyboard.press("ArrowLeft");
      await expect(saturation).toHaveValue("99");
      await page.keyboard.press("Shift+ArrowLeft");
      await expect(saturation).toHaveValue("89");

      const median = (key: "cpuMs" | "styleMs") =>
        samples
          .slice(1)
          .map((sample) => sample[key])
          .sort((a, b) => a - b)[1];
      expect(median("cpuMs"), "A 12-step drag exceeds 160 ms of main-thread CPU").toBeLessThan(160);
      expect(median("styleMs"), "Dragging invalidates styles across the page").toBeLessThan(35);
    });

    test("gradient stops drag without selecting text and retain keyboard control", async ({ page }) => {
      await page.goto("/primitives/color-picker");
      const preview = page.locator("#example-gradient-editor");
      const stop = preview.getByRole("slider", { name: "Gradient stop 1", exact: true });
      await waitForReactHydration(stop);
      await stop.scrollIntoViewIfNeeded();
      const handle = await stop.boundingBox();
      const track = await preview.locator('[data-slot="track"]').boundingBox();
      if (!handle || !track) throw new Error("Gradient track or stop is missing");
      await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
      await page.mouse.down();
      await page.mouse.move(track.x + track.width * 0.65, track.y - 40, { steps: 12 });
      await page.mouse.up();
      await expect(stop).toHaveAttribute("aria-valuenow", "65");
      expect(await page.evaluate(() => window.getSelection()?.toString())).toBe("");
      await stop.press("Shift+ArrowLeft");
      await expect(stop).toHaveAttribute("aria-valuenow", "55");
      await stop.press("End");
      await expect(stop).toHaveAttribute("aria-valuenow", "100");
    });
  });
}
