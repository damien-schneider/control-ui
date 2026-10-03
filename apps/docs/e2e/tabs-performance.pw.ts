import { expect, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import { waitForReactHydration } from "./browser-test-helpers";

test.use({ trace: "off" });

test("Preview and Code retain example state and source scroll position after a visit", async ({ page }) => {
  await page.addInitScript(() => {
    window.__REACT_GRAB_DISABLED__ = true;
    window.__REACT_SCAN_DISABLED__ = true;
  });
  await page.goto("/primitives/sidebar");
  const tabs = page.locator('#preview > [data-control-family="tabs"][data-slot="root"]');
  await waitForReactHydration(tabs.getByRole("tab", { name: "Code", exact: true }));
  const source = tabs.getByRole("region", { name: "tsx code", includeHidden: true });
  await expect(source).toHaveCount(0);
  await tabs.getByRole("button", { name: "Workflows", exact: true }).click();
  await tabs.getByRole("tab", { name: "Code", exact: true }).click();
  await expect(source).toBeVisible();
  await source.evaluate(async (element) => {
    for (let frame = 0; frame < 4; frame++) await new Promise(requestAnimationFrame);
    await Promise.all(
      element
        .closest('[data-slide="scope"]')
        ?.getAnimations({ subtree: true })
        .map((animation) => animation.finished.catch(() => {})) ?? [],
    );
    element.scrollTop = 200;
  });
  await expect.poll(() => source.evaluate((element) => element.scrollTop)).toBe(200);
  await tabs.getByRole("tab", { name: "Preview", exact: true }).click();
  await expect(tabs.getByRole("heading", { name: "Workflows", exact: true })).toBeVisible();
  await tabs.getByRole("tab", { name: "Code", exact: true }).click();
  await expect(source).toBeVisible();
  await expect.poll(() => source.evaluate((element) => element.scrollTop)).toBe(200);
});

for (const skin of ["none", "mastra"]) {
  test(`populated Preview and Code tabs stay within their CPU budget with ${skin}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.addInitScript(
      ({ skin: selectedSkin, storageKey }) => {
        window.__REACT_GRAB_DISABLED__ = true;
        window.__REACT_SCAN_DISABLED__ = true;
        localStorage.setItem(storageKey, JSON.stringify({ skin: selectedSkin }));
      },
      { skin, storageKey: THEME_EDITOR_STORAGE_KEY },
    );
    await page.goto("/primitives/sidebar");
    const tabs = page.locator('#preview > [data-control-family="tabs"][data-slot="root"]');
    await waitForReactHydration(tabs.getByRole("tab", { name: "Code", exact: true }));
    await expect(page.locator("html")).toHaveAttribute("data-skin", skin);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForLoadState("networkidle");
    const session = await page.context().newCDPSession(page);
    await session.send("Performance.enable", { timeDomain: "threadTicks" });
    const samples = [];
    try {
      for (let round = 0; round < 4; round++) {
        for (const name of ["Code", "Preview"]) {
          const trigger = tabs.getByRole("tab", { name, exact: true });
          await trigger.scrollIntoViewIfNeeded();
          const box = await trigger.boundingBox();
          if (!box) throw new Error("Tab trigger is not rendered");
          const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
          await page.mouse.move(point.x, point.y);
          const before = await session.send("Performance.getMetrics");
          await page.mouse.click(point.x, point.y);
          await tabs.evaluate(async (root) => {
            for (let frame = 0; frame < 4; frame++) await new Promise(requestAnimationFrame);
            await Promise.all(root.getAnimations({ subtree: true }).map((animation) => animation.finished.catch(() => {})));
            for (let frame = 0; frame < 2; frame++) await new Promise(requestAnimationFrame);
          });
          const after = await session.send("Performance.getMetrics");
          const metric = (metrics: typeof before.metrics, metricName: string) => {
            const result = metrics.find((entry) => entry.name === metricName);
            if (!result) throw new Error(`Chromium metric ${metricName} is unavailable`);
            return result.value;
          };
          samples.push({
            name,
            round,
            mainThreadMs: (metric(after.metrics, "TaskDuration") - metric(before.metrics, "TaskDuration")) * 1000,
            styleMs: (metric(after.metrics, "RecalcStyleDuration") - metric(before.metrics, "RecalcStyleDuration")) * 1000,
            layoutMs: (metric(after.metrics, "LayoutDuration") - metric(before.metrics, "LayoutDuration")) * 1000,
            scriptMs: (metric(after.metrics, "ScriptDuration") - metric(before.metrics, "ScriptDuration")) * 1000,
          });
          await expect(trigger).toHaveAttribute("aria-selected", "true");
          const panel = tabs.getByRole("tabpanel", { name, exact: true });
          await expect(panel).toBeVisible();
          if (name === "Code") await expect(panel.getByRole("region", { name: "tsx code" })).toContainText("SidebarProvider");
          else await expect(panel.getByRole("button", { name: "Agents", exact: true })).toBeVisible();
        }
      }
      await test.info().attach("populated-tab-cpu", { body: JSON.stringify({ skin, samples }), contentType: "application/json" });
      for (const name of ["Code", "Preview"]) {
        const warmed = samples
          .filter((sample) => sample.name === name && sample.round > 0)
          .map((sample) => sample.mainThreadMs)
          .sort((a, b) => a - b);
        expect(warmed[1], `${name} switch median exceeds 250 ms of CPU, excluding idle animation time`).toBeLessThan(250);
      }
    } finally {
      await session.detach();
    }
  });
}
