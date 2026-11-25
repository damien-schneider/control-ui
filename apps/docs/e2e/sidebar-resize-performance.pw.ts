import { chromium, expect, type Page, test, webkit } from "@playwright/test";
import { serveFixture } from "./fixtures/serve-fixture";

const viewport = { width: 1400, height: 900 };
const fixture = { skin: "refined", search: "?paragraphs=400" };

async function railCenter(page: Page) {
  await expect(page.getByRole("treeitem")).toHaveCount(1040);
  const box = await page.getByRole("separator", { name: /Resize sidebar/ }).boundingBox();
  if (!box) throw new Error("Sidebar rail is missing");
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

async function dragRail(page: Page, steps: number, whileDragging: (move: () => Promise<void>) => Promise<void> = (move) => move()) {
  const { x, y } = await railCenter(page);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await whileDragging(async () => {
    for (let step = 1; step <= steps; step++) {
      await page.mouse.move(x + step * 8, y);
      await page.evaluate(() => new Promise(requestAnimationFrame));
    }
  });
  await page.mouse.up();
  await page.evaluate(() => new Promise(requestAnimationFrame));
}

test("dragging the sidebar rail beside a long tree restyles only the sidebar frame on each move", async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport });
    await serveFixture(page, "sidebar-tree", fixture);
    await railCenter(page);
    const session = await page.context().newCDPSession(page);
    await session.send("Performance.enable", { timeDomain: "threadTicks" });
    const styleSeconds = async () => {
      const { metrics } = await session.send("Performance.getMetrics");
      const entry = metrics.find((candidate) => candidate.name === "RecalcStyleDuration");
      if (!entry) throw new Error("Chromium metric RecalcStyleDuration is unavailable");
      return entry.value;
    };
    let style = 0;
    await dragRail(page, 12, async (move) => {
      const before = await styleSeconds();
      await move();
      style = ((await styleSeconds()) - before) * 1000;
    });

    await test.info().attach("sidebar-drag-style-cost", { body: JSON.stringify({ style }), contentType: "application/json" });
    expect(style, "Rail drag frames restyled the tree or the document").toBeLessThan(40);
  } finally {
    await browser.close();
  }
});

test("the sidebar rail drags at frame rate beside a long tree in WebKit, the engine Tauri apps ship", async () => {
  const browser = await webkit.launch();
  try {
    const page = await browser.newPage({ viewport });
    await serveFixture(page, "sidebar-tree", fixture);
    await railCenter(page);
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
    await dragRail(page, 12);
    await page.waitForTimeout(200);
    const frames = await page.evaluate(() => (window as unknown as { frames: number[] }).frames);
    const longest = Math.max(...frames);

    await test.info().attach("webkit-sidebar-drag-frames", { body: JSON.stringify({ longest, frames }), contentType: "application/json" });
    expect(longest, "A drag frame stalled while the tree restyled").toBeLessThan(100);
  } finally {
    await browser.close();
  }
});

for (const engine of [chromium, webkit]) {
  test(`the sidebar animates again once a rail drag lets go in ${engine.name()}`, async () => {
    const browser = await engine.launch();
    try {
      const page = await browser.newPage({ viewport });
      await serveFixture(page, "sidebar-tree", { skin: "refined", search: "?paragraphs=20" });
      const container = page.locator('[data-control-family="sidebar"][data-slot="container"]');
      const duration = () => container.evaluate((node) => getComputedStyle(node).transitionDuration);
      const resting = await duration();
      expect(resting).not.toMatch(/^0s/);
      await dragRail(page, 2, async (move) => {
        await move();
        expect(await duration()).toMatch(/^0s/);
      });
      await expect.poll(duration).toBe(resting);
    } finally {
      await browser.close();
    }
  });
}
