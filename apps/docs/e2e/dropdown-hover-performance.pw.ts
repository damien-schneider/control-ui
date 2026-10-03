import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "@playwright/test";
import tailwind from "@tailwindcss/postcss";
import postcss from "postcss";

test.use({ trace: "off", viewport: { width: 1440, height: 1000 } });
const buildDirectory = mkdtempSync(path.join(tmpdir(), "control-ui-hover-perf-"));
let script: string;
let stylesheet: string;
test.beforeAll(async () => {
  execFileSync("bun", ["build", "e2e/fixtures/dropdown-hover.tsx", "--outdir", buildDirectory, "--target", "browser"]);
  script = readFileSync(path.join(buildDirectory, "dropdown-hover.js"), "utf8");
  stylesheet = (
    await postcss([tailwind()]).process('@import "../app/globals.css"; @source "./fixtures/dropdown-hover.tsx";', {
      from: path.resolve("e2e/dropdown-hover.css"),
    })
  ).css;
});
test.afterAll(() => rmSync(buildDirectory, { recursive: true, force: true }));

for (const skin of ["none", "mastra"]) {
  for (const kind of ["select", "menu", "context-menu"] as const) {
    test(`${kind} hover moves directly between populated items within a frame with ${skin}`, async ({ page }) => {
      await page.route("http://hover.test/**", (route) => {
        if (new URL(route.request().url()).pathname === "/fixture.js")
          return route.fulfill({ contentType: "text/javascript", body: script });
        return route.fulfill({
          contentType: "text/html",
          body: `<!doctype html><html data-skin="${skin}"><head><style>${stylesheet}\nbody{font-family:system-ui}</style></head><body><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>`,
        });
      });
      await page.goto(`http://hover.test/?kind=${kind}`);
      const trigger = page.getByRole(kind === "select" ? "combobox" : "button", { name: "Entries", exact: true });
      await trigger.click({ button: kind === "context-menu" ? "right" : "left" });
      const list = page.getByRole(kind === "select" ? "listbox" : "menu");
      const items = list.getByRole(kind === "select" ? "option" : "menuitem");
      await expect(items).toHaveCount(200);
      await page.evaluate(async () => {
        for (let i = 0; i < 4; i++) await new Promise(requestAnimationFrame);
        await Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {})));
      });
      const points = await items.evaluateAll((nodes) =>
        nodes.slice(0, 3).map((node) => {
          const bounds = node.querySelector("span")?.getBoundingClientRect();
          if (!bounds) throw new Error("Nested item text is missing");
          return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
        }),
      );
      const settle = () =>
        page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
      for (const [index, point] of points.entries()) {
        await page.mouse.move(point.x, point.y);
        await settle();
        await expect(items.nth(index)).toBeFocused();
      }
      await page.evaluate(() =>
        document.addEventListener("focusin", (event) => {
          if (event.target instanceof HTMLElement) performance.mark("popup-item-focus", { detail: event.target.getAttribute("role") });
        }),
      );
      const session = await page.context().newCDPSession(page);
      await session.send("Performance.enable", { timeDomain: "threadTicks" });
      const samples = [];
      try {
        for (let round = 0; round < 3; round++) {
          await page.evaluate(() => {
            performance.clearMarks("popup-item-focus");
            performance.clearMarks("popup-render");
            performance.clearMarks("consumer-pointer-leave");
          });
          const before = await session.send("Performance.getMetrics");
          for (let hover = 0; hover < 12; hover++) {
            const point = points[hover % points.length];
            await page.mouse.move(point.x, point.y);
            await settle();
          }
          const after = await session.send("Performance.getMetrics");
          const delta = (name: string) => {
            const first = before.metrics.find((metric) => metric.name === name);
            const last = after.metrics.find((metric) => metric.name === name);
            if (!first || !last) throw new Error(`Chromium metric ${name} is unavailable`);
            return ((last.value - first.value) * 1000) / 12;
          };
          samples.push({
            cpuMs: delta("TaskDuration"),
            styleMs: delta("RecalcStyleDuration"),
            focusChanges: await page.evaluate(() => performance.getEntriesByName("popup-item-focus").length),
            commits: await page.evaluate(() => performance.getEntriesByName("popup-render").length),
          });
          await expect(items.nth(2)).toBeFocused();
          expect(await page.evaluate(() => performance.getEntriesByName("consumer-pointer-leave").length)).toBe(12);
        }
        await test.info().attach("dropdown-hover-cpu", { body: JSON.stringify({ kind, skin, samples }), contentType: "application/json" });
        expect(samples.map((sample) => sample.cpuMs).sort((a, b) => a - b)[1], "Item hover exceeds one 60 Hz frame of CPU").toBeLessThan(
          1000 / 60,
        );
        expect(
          samples.map((sample) => sample.styleMs).sort((a, b) => a - b)[1],
          "Item hover performs excessive style recalculation",
        ).toBeLessThan(6);
        for (const sample of samples) {
          expect(sample.commits, "Hover should need at most one React commit per item change").toBeLessThanOrEqual(12);
        }
        expect(
          samples.map((sample) => sample.focusChanges),
          "Focus should move once to each hovered item without a detour through the popup",
        ).toEqual([12, 12, 12]);
      } finally {
        await session.detach();
      }
      await page.evaluate(() => {
        performance.clearMarks("popup-render");
        performance.clearMarks("popup-item-focus");
      });
      for (const offset of [-3, 3, 0]) {
        await page.mouse.move(points[2].x + offset, points[2].y);
        await settle();
      }
      expect(
        await page.evaluate(() => performance.getEntriesByName("popup-render").length),
        "Moving within one item should not rerender the menu",
      ).toBe(0);
      expect(await page.evaluate(() => performance.getEntriesByName("popup-item-focus").length)).toBe(0);
      await page.keyboard.press("ArrowDown");
      await expect(items.nth(3)).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(list).toBeVisible();
      await page.keyboard.press("ArrowDown");
      await expect(items.nth(4)).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("status", { name: "Selected entry" })).toHaveText("Entry 5");
      await expect(trigger).toBeFocused();
      await trigger.click({ button: kind === "context-menu" ? "right" : "left" });
      await items.nth(1).locator("span").first().click();
      await expect(page.getByRole("status", { name: "Selected entry" })).toHaveText("Entry 2");
    });
  }
}
