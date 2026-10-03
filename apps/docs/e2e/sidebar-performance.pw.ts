import { expect, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import { waitForReactHydration } from "./browser-test-helpers";

// Playwright tracing snapshots the large docs DOM on every mouse move, distorting CPU measurements.
test.use({ trace: "off" });

for (const skinId of ["none", "refined", "linear", "mastra"]) {
  test(`sidebar hover stays within a frame budget with ${skinId}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.addInitScript(
      ({ skin, storageKey }) => {
        window.__REACT_GRAB_DISABLED__ = true;
        window.__REACT_SCAN_DISABLED__ = true;
        localStorage.setItem(storageKey, JSON.stringify({ skin }));
      },
      { skin: skinId, storageKey: THEME_EDITOR_STORAGE_KEY },
    );
    await page.goto("/primitives/sidebar");
    await waitForReactHydration(page.getByRole("combobox", { name: "Skin", exact: true }));
    await expect(page.locator("html")).toHaveAttribute("data-skin", skinId);
    const navigation = page.locator("[data-docs-sidebar-navigation]");
    const rows = navigation.getByRole("link").filter({ hasText: /^(Action Bar|Activity|Audio Recorder)$/ });
    await expect(rows).toHaveCount(3);
    await waitForReactHydration(rows.last());
    await page.evaluate(() => document.fonts.ready);
    await page.waitForLoadState("networkidle");
    expect(await page.evaluate(() => matchMedia("(hover: hover)").matches)).toBe(true);
    const points = await rows.evaluateAll((nodes) =>
      nodes.map((node) => {
        const box = node.getBoundingClientRect();
        return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
      }),
    );
    for (const point of points) {
      expect(point.y).toBeGreaterThan(0);
      expect(point.y).toBeLessThan(1000);
    }
    const session = await page.context().newCDPSession(page);
    await session.send("Performance.enable", { timeDomain: "threadTicks" });
    const settle = () =>
      page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    try {
      for (const [index, point] of points.entries()) {
        await page.mouse.move(point.x, point.y);
        await settle();
        expect(await rows.nth(index).evaluate((node) => node.matches(":hover"))).toBe(true);
      }
      const samples = [];
      for (let round = 0; round < 3; round++) {
        const before = await session.send("Performance.getMetrics");
        const hovers = 12;
        for (let hover = 0; hover < hovers; hover++) {
          const point = points[hover % points.length];
          await page.mouse.move(point.x, point.y);
          await settle();
        }
        const after = await session.send("Performance.getMetrics");
        const mainThreadTime = (metrics: typeof before.metrics) => {
          const metric = metrics.find((entry) => entry.name === "TaskDuration");
          if (!metric) throw new Error("Chromium main-thread CPU metric is unavailable");
          return metric.value;
        };
        samples.push(((mainThreadTime(after.metrics) - mainThreadTime(before.metrics)) * 1000) / hovers);
      }
      samples.sort((a, b) => a - b);
      await test.info().attach("hover-rendering-time", {
        body: JSON.stringify({ skin: skinId, mainThreadMillisecondsPerHover: samples }),
        contentType: "application/json",
      });
      // Browser CPU time excludes server compilation, network waits and test-runner scheduling.
      const frameBudgetMs = 1000 / 60;
      expect(samples[1], "Median main-thread CPU time per hover exceeds two 60 Hz frames").toBeLessThan(frameBudgetMs * 2);
    } finally {
      await session.detach();
    }
  });
}
