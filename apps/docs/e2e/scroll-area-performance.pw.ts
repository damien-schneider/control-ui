import { expect, type Page, test, webkit } from "@playwright/test";
import { serveFixture } from "./fixtures/serve-fixture";

test.use({ trace: "off", viewport: { width: 1200, height: 900 } });

async function styleCost(page: Page, action: () => Promise<unknown>) {
  const session = await page.context().newCDPSession(page);
  await session.send("Performance.enable", { timeDomain: "threadTicks" });
  const styleSeconds = async () => {
    const { metrics } = await session.send("Performance.getMetrics");
    const entry = metrics.find((candidate) => candidate.name === "RecalcStyleDuration");
    if (!entry) throw new Error("Chromium metric RecalcStyleDuration is unavailable");
    return entry.value;
  };
  try {
    const before = await styleSeconds();
    await action();
    await page.evaluate(async () => {
      for (let frame = 0; frame < 3; frame++) await new Promise(requestAnimationFrame);
    });
    return ((await styleSeconds()) - before) * 1000;
  } finally {
    await session.detach();
  }
}

for (const skin of ["none", "refined"]) {
  test(`a long sidebar tree crosses its scroll edges without restyling every row with ${skin}`, async ({ page }) => {
    await serveFixture(page, "sidebar-tree", { skin });
    const viewport = page.locator("[data-scroll-area-viewport]").first();
    await expect(page.getByRole("treeitem")).toHaveCount(1040);
    const box = await viewport.boundingBox();
    if (!box) throw new Error("Sidebar viewport is missing");
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    const leavingTop = await styleCost(page, () => page.mouse.wheel(0, 120));
    await expect(viewport).toHaveAttribute("data-overflow-y-start", "");

    await viewport.evaluate((element) => {
      element.scrollTop = element.scrollHeight - element.clientHeight - 60;
    });
    await expect(viewport).toHaveAttribute("data-overflow-y-end", "");
    const reachingBottom = await styleCost(page, () => page.mouse.wheel(0, 120));
    await expect(viewport).not.toHaveAttribute("data-overflow-y-end");

    await test.info().attach("scroll-edge-style-cost", {
      body: JSON.stringify({ skin, leavingTop, reachingBottom }),
      contentType: "application/json",
    });
    expect(leavingTop, "Leaving the top edge restyles the whole scrolled tree").toBeLessThan(25);
    expect(reachingBottom, "Reaching the bottom edge restyles the whole scrolled tree").toBeLessThan(25);
  });
}

test("a long sidebar tree scrolls at frame rate in WebKit, the engine Tauri apps ship", async () => {
  const browser = await webkit.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
    await serveFixture(page, "sidebar-tree", { skin: "refined" });
    await expect(page.getByRole("treeitem")).toHaveCount(1040);
    const viewport = page.locator("[data-scroll-area-viewport]").first();
    const box = await viewport.boundingBox();
    if (!box) throw new Error("Sidebar viewport is missing");
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    await page.evaluate(() => {
      const frames: number[] = [];
      Object.assign(window, { frames });
      let last = performance.now();
      const tick = (now: number) => {
        frames.push(now - last);
        last = now;
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    for (let step = 0; step < 20; step++) {
      await page.mouse.wheel(0, 80);
      await page.waitForTimeout(16);
    }
    await page.waitForTimeout(300);
    const frames = await page.evaluate(() => (window as unknown as { frames: number[] }).frames);
    const longest = Math.max(...frames);

    await test.info().attach("webkit-scroll-frames", { body: JSON.stringify({ longest, frames }), contentType: "application/json" });
    expect(longest, "A scroll frame stalled while every row restyled").toBeLessThan(100);
  } finally {
    await browser.close();
  }
});
