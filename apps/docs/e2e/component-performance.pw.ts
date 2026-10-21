import { expect, type Page, test } from "@playwright/test";
import { serveFixture } from "./fixtures/serve-fixture";

test.use({ trace: "off", viewport: { width: 1440, height: 1000 } });

async function expectPanelState(page: Page, kind: string, expanding: boolean) {
  if (kind === "viewport" || expanding) await expect(page.getByRole("article")).toHaveCount(400);
  if (kind === "viewport") {
    await expect(page.locator('[data-slot="viewport"]')).toHaveCSS("height", expanding ? "480px" : "240px");
  } else {
    await expect(page.getByRole("button", { name: "Show entries", exact: true })).toHaveAttribute("aria-expanded", String(expanding));
    if (expanding) {
      const lastEntryFits = await page
        .getByRole("article")
        .last()
        .evaluate((entry) => {
          const panel = entry.closest('[data-slot="panel"], [data-slot="content"]');
          if (!panel) throw new Error("Expanded panel is missing");
          return entry.getBoundingClientRect().bottom <= panel.getBoundingClientRect().bottom + 1;
        });
      expect(lastEntryFits, "The measured height must show the complete panel contents").toBe(true);
    }
  }
}

for (const skin of ["none", "mastra"]) {
  for (const kind of ["accordion", "collapsible", "viewport"]) {
    test(`${kind} changes size without restyling its large contents with ${skin}`, async ({ page }) => {
      await serveFixture(page, "component-performance", {
        search: `?kind=${kind}`,
        skin,
        style: "body{font-family:system-ui} article{height:48px;border-bottom:1px solid var(--border)}",
      });
      const trigger = page.getByRole("button", { name: kind === "viewport" ? "Resize content" : "Show entries", exact: true });
      await expect(trigger).toBeVisible();
      const session = await page.context().newCDPSession(page);
      await session.send("Performance.enable", { timeDomain: "threadTicks" });
      const samples = [];
      try {
        for (let round = 0; round < 4; round++) {
          for (const expanding of [true, false]) {
            const box = await trigger.boundingBox();
            if (!box) throw new Error("Panel trigger is missing");
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            const before = await session.send("Performance.getMetrics");
            await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
            await page.evaluate(async () => {
              for (let frame = 0; frame < 4; frame++) await new Promise(requestAnimationFrame);
              await Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => {})));
              for (let frame = 0; frame < 2; frame++) await new Promise(requestAnimationFrame);
            });
            const after = await session.send("Performance.getMetrics");
            const metric = (metrics: typeof before.metrics, name: string) => {
              const entry = metrics.find((candidate) => candidate.name === name);
              if (!entry) throw new Error(`Chromium metric ${name} is unavailable`);
              return entry.value;
            };
            samples.push({
              round,
              expanding,
              cpuMs: (metric(after.metrics, "TaskDuration") - metric(before.metrics, "TaskDuration")) * 1000,
              styleMs: (metric(after.metrics, "RecalcStyleDuration") - metric(before.metrics, "RecalcStyleDuration")) * 1000,
            });
            await expectPanelState(page, kind, expanding);
          }
        }
        await test
          .info()
          .attach("populated-component-cpu", { body: JSON.stringify({ kind, skin, samples }), contentType: "application/json" });
        const warmed = samples.filter((sample) => sample.round > 0 && sample.expanding);
        const median = (key: "cpuMs" | "styleMs") => warmed.map((sample) => sample[key]).sort((a, b) => a - b)[1];
        expect(median("cpuMs"), "Expanding the populated panel exceeds 100 ms of main-thread CPU").toBeLessThan(100);
        expect(median("styleMs"), "Container sizing invalidates styles throughout the populated panel").toBeLessThan(
          kind === "viewport" ? 5 : 25,
        );
      } finally {
        await session.detach();
      }
    });
  }
}
