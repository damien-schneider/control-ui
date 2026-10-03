import { expect, type Page, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import { waitForReactHydration } from "./browser-test-helpers";

test.use({ trace: "off", viewport: { width: 1440, height: 1000 } });

async function settleSearch(page: Page) {
  await page.evaluate(async () => {
    for (let frame = 0; frame < 4; frame++) await new Promise(requestAnimationFrame);
    const dialog = document.querySelector('[role="dialog"]');
    await Promise.all(dialog?.getAnimations({ subtree: true }).map((animation) => animation.finished.catch(() => {})) ?? []);
    for (let frame = 0; frame < 2; frame++) await new Promise(requestAnimationFrame);
  });
}

for (const skin of ["none", "mastra"]) {
  test(`Cmd+K opens and searches the complete catalog within its CPU budget with ${skin}`, async ({ page }) => {
    await page.addInitScript(
      ({ selectedSkin, storageKey }) => {
        window.__REACT_GRAB_DISABLED__ = true;
        window.__REACT_SCAN_DISABLED__ = true;
        localStorage.setItem(storageKey, JSON.stringify({ skin: selectedSkin }));
      },
      { selectedSkin: skin, storageKey: THEME_EDITOR_STORAGE_KEY },
    );
    await page.goto("/primitives/sidebar");
    await waitForReactHydration(page.getByRole("button", { name: "Search documentation", exact: true }));
    await expect(page.locator("html")).toHaveAttribute("data-skin", skin);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForLoadState("networkidle");
    const dialog = page.getByRole("dialog", { name: "Search documentation", exact: true });
    const input = dialog.getByRole("combobox");
    const session = await page.context().newCDPSession(page);
    await session.send("Performance.enable", { timeDomain: "threadTicks" });
    const samples: { round: number; action: string; cpuMs: number; styleMs: number; scriptMs: number }[] = [];
    async function enterQuery(query: string) {
      await page.keyboard.press("ControlOrMeta+a");
      if (query) await page.keyboard.insertText(query);
      else await page.keyboard.press("Backspace");
    }
    async function measure(round: number, action: string, perform: () => Promise<unknown>) {
      const before = await session.send("Performance.getMetrics");
      await perform();
      await settleSearch(page);
      const after = await session.send("Performance.getMetrics");
      const delta = (name: string) => {
        const first = before.metrics.find((metric) => metric.name === name);
        const last = after.metrics.find((metric) => metric.name === name);
        if (!first || !last) throw new Error(`Chromium metric ${name} is unavailable`);
        return (last.value - first.value) * 1000;
      };
      samples.push({
        round,
        action,
        cpuMs: delta("TaskDuration"),
        styleMs: delta("RecalcStyleDuration"),
        scriptMs: delta("ScriptDuration"),
      });
    }
    try {
      for (let round = 0; round < 4; round++) {
        await measure(round, "open", () => page.keyboard.press("ControlOrMeta+k"));
        await expect(input).toBeFocused();
        await expect(input).toHaveValue("");
        expect(await dialog.getByRole("option").count()).toBeGreaterThan(180);
        await measure(round, "broad search", () => enterQuery("s"));
        expect(await dialog.getByRole("option").count()).toBeGreaterThan(180);
        await measure(round, "refine search", () => enterQuery("si"));
        await measure(round, "specific search", () => enterQuery("sidebar"));
        await expect(dialog.getByRole("option").first()).toContainText("Sidebar");
        await input.fill("zzzx");
        await expect(dialog.getByText("No matches for “zzzx”", { exact: true })).toBeVisible();
        await expect(dialog.getByRole("option")).toHaveCount(0);
        await measure(round, "clear search", () => enterQuery(""));
        expect(await dialog.getByRole("option").count()).toBeGreaterThan(180);
        await input.press("End");
        await expect(dialog.getByRole("option").last()).toHaveAttribute("aria-selected", "true");
        await expect.poll(() => dialog.locator("[data-scroll-area-viewport]").evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
        await input.fill("sidebar");
        await expect(dialog.getByRole("option").first()).toHaveAttribute("aria-selected", "true");
        await expect.poll(() => dialog.locator("[data-scroll-area-viewport]").evaluate((element) => element.scrollTop)).toBe(0);
        await page.keyboard.press("ControlOrMeta+k");
        await expect(input).toHaveValue("sidebar");
        await measure(round, "close filtered search", () => page.keyboard.press("Escape"));
        await expect(dialog).toBeHidden();
      }
      await test.info().attach("search-cpu", { body: JSON.stringify({ skin, samples }), contentType: "application/json" });
      for (const [action, budget] of [
        ["open", 500],
        ["broad search", 220],
        ["refine search", 140],
        ["clear search", 280],
        ["close filtered search", 140],
      ] as const) {
        const warmed = samples
          .filter((sample) => sample.round > 0 && sample.action === action)
          .map((sample) => sample.cpuMs)
          .sort((a, b) => a - b);
        expect(warmed[1], `${action} exceeds ${budget} ms of main-thread CPU`).toBeLessThan(budget);
      }
      const searchStyle = samples
        .filter((sample) => sample.round > 0 && sample.action === "broad search")
        .map((sample) => sample.styleMs)
        .sort((a, b) => a - b);
      expect(searchStyle[1], "Search list sizing restyles its results").toBeLessThan(65);
    } finally {
      await session.detach();
    }
  });
}
