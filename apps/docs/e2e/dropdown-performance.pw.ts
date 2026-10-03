import { expect, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import { waitForReactHydration } from "./browser-test-helpers";

// DOM snapshots from tracing would count the test recorder's work as application CPU time.
test.use({ trace: "off" });

for (const skinId of ["none", "mastra"]) {
  for (const control of ["skin", "menu", "sidebar-action"] as const) {
    test(`${control} dropdown opens within its CPU budget with ${skinId}`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.addInitScript(
        ({ skin, storageKey }) => {
          window.__REACT_GRAB_DISABLED__ = true;
          window.__REACT_SCAN_DISABLED__ = true;
          localStorage.setItem(storageKey, JSON.stringify({ skin }));
        },
        { skin: skinId, storageKey: THEME_EDITOR_STORAGE_KEY },
      );
      await page.goto(control === "menu" ? "/primitives/dropdown-menu" : "/primitives/sidebar");
      const triggers = {
        skin: page.getByRole("combobox", { name: "Skin", exact: true }),
        menu: page.getByRole("group", { name: "Dropdown menu", exact: true }).getByRole("button", { name: "Actions", exact: true }),
        "sidebar-action": page
          .getByRole("group", { name: "Sidebar", exact: true })
          .getByRole("button", { name: "Workflows actions", exact: true }),
      };
      const trigger = triggers[control];
      await waitForReactHydration(trigger);
      await expect(page.locator("html")).toHaveAttribute("data-skin", skinId);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForLoadState("networkidle");
      await trigger.hover();
      const popup = page.locator('[data-control-family="popup"][data-popup-part="list-surface"]:visible');
      const session = await page.context().newCDPSession(page);
      await session.send("Performance.enable", { timeDomain: "threadTicks" });
      const samples = [];
      try {
        for (let round = 0; round < 4; round++) {
          const bounds = await trigger.boundingBox();
          if (!bounds) throw new Error("Dropdown trigger is not rendered");
          await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
          await trigger.evaluate((element) => {
            performance.clearMarks("dropdown-pointerdown");
            performance.clearMeasures("dropdown-first-visible-frame");
            element.addEventListener(
              "pointerdown",
              () => {
                performance.mark("dropdown-pointerdown");
                const sampleFrame = () => {
                  const surface = document.querySelector(
                    '[data-control-family="popup"][data-popup-part="list-surface"]:not([data-ending-style])',
                  );
                  if (surface instanceof HTMLElement && surface.checkVisibility() && Number(getComputedStyle(surface).opacity) > 0.02) {
                    performance.measure("dropdown-first-visible-frame", "dropdown-pointerdown");
                  } else {
                    requestAnimationFrame(sampleFrame);
                  }
                };
                requestAnimationFrame(sampleFrame);
              },
              { once: true, capture: true },
            );
          });
          const before = await session.send("Performance.getMetrics");
          // Locate before timing so Playwright's actionability scans are not application CPU work.
          await page.mouse.down();
          await page.mouse.up();
          await page.waitForFunction(() => {
            const surface = document.querySelector(
              '[data-control-family="popup"][data-popup-part="list-surface"]:not([data-ending-style])',
            );
            return surface instanceof HTMLElement && surface.checkVisibility() && getComputedStyle(surface).opacity === "1";
          });
          const after = await session.send("Performance.getMetrics");
          const firstVisibleFrameMs = await page.evaluate(
            () => performance.getEntriesByName("dropdown-first-visible-frame").at(-1)?.duration,
          );
          if (firstVisibleFrameMs === undefined) throw new Error("Dropdown did not reach a visible animation frame");
          const metric = (metrics: typeof before.metrics, name: string) => {
            const entry = metrics.find((candidate) => candidate.name === name);
            if (!entry) throw new Error(`Chromium performance metric ${name} is unavailable`);
            return entry.value;
          };
          // The first open warms component code and caches; keep its timing in the report.
          samples.push({
            mainThreadMs: (metric(after.metrics, "TaskDuration") - metric(before.metrics, "TaskDuration")) * 1000,
            styleMs: (metric(after.metrics, "RecalcStyleDuration") - metric(before.metrics, "RecalcStyleDuration")) * 1000,
            scriptMs: (metric(after.metrics, "ScriptDuration") - metric(before.metrics, "ScriptDuration")) * 1000,
            firstVisibleFrameMs,
          });
          await expect(popup).toBeVisible();
          await page.keyboard.press("Escape");
          await expect(popup).toHaveCount(0);
          await expect(trigger).toBeFocused();
        }
        await test.info().attach("dropdown-opening-cpu", {
          body: JSON.stringify({ control, skin: skinId, samples }),
          contentType: "application/json",
        });
        const warmedCpu = samples
          .slice(1)
          .map((sample) => sample.mainThreadMs)
          .sort((a, b) => a - b);
        // 100 ms is the maximum CPU budget for an interaction to feel immediately responsive.
        // Idle time during the skin's entrance animation is excluded by the browser's CPU counter.
        expect(warmedCpu[1], "Median main-thread CPU time per dropdown opening exceeds 100 ms").toBeLessThan(100);
        const warmedFrames = samples
          .slice(1)
          .map((sample) => sample.firstVisibleFrameMs)
          .sort((a, b) => a - b);
        // Catch idle opening delays as well as CPU regressions, allowing for display-frame scheduling.
        expect(warmedFrames[1], "Median time to the first visible dropdown frame exceeds 150 ms").toBeLessThan(150);
      } finally {
        await session.detach();
      }
    });
  }
}
