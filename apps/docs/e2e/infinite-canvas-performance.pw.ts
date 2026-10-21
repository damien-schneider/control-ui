import { expect, test } from "@playwright/test";
import { serveFixture } from "./fixtures/serve-fixture";

test.use({ trace: "off", viewport: { width: 1280, height: 900 } });

test("moving the camera commits once per frame and never rerenders canvas items", async ({ page }) => {
  await serveFixture(page, "infinite-canvas", { style: "body{font-family:system-ui}" });
  const canvas = page.getByRole("application", { name: "Performance canvas" });
  await expect(canvas.locator('[data-slot="item"]')).toHaveCount(300);
  await page.evaluate(() => performance.clearMarks());

  const burst = await canvas.evaluate(async (root) => {
    const content = root.querySelector<HTMLElement>('[data-slot="content"]');
    if (!content) throw new Error("Canvas content is missing");
    let transformWrites = 0;
    const observer = new MutationObserver((records) => {
      transformWrites += records.length;
    });
    observer.observe(content, { attributes: true, attributeFilter: ["style"] });
    const bounds = root.getBoundingClientRect();
    for (let event = 0; event < 20; event += 1) {
      root.dispatchEvent(
        new WheelEvent("wheel", {
          bubbles: true,
          cancelable: true,
          clientX: bounds.left + 500,
          clientY: bounds.top + 300,
          deltaX: 5,
          deltaY: 3,
        }),
      );
    }
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    observer.disconnect();
    return {
      transformWrites,
      transform: content.style.transform,
      transformChanges: performance.getEntriesByName("canvas-transform-change").length,
    };
  });
  expect(burst).toEqual({ transformWrites: 1, transform: "translate(-100px, -60px) scale(1)", transformChanges: 1 });

  const box = await canvas.boundingBox();
  if (!box) throw new Error("Expected canvas bounds.");
  await page.mouse.move(box.x + 500, box.y + 300);
  await page.mouse.down({ button: "middle" });
  await page.mouse.move(box.x + 300, box.y + 200, { steps: 20 });
  await page.mouse.up({ button: "middle" });
  await page.keyboard.down("Control");
  for (let notch = 0; notch < 5; notch += 1) await page.mouse.wheel(0, -30);
  await page.keyboard.up("Control");
  await canvas.getByRole("button", { name: "Zoom in" }).click();

  await expect(canvas.locator('[data-slot="content"]')).not.toHaveAttribute("data-scale", "1");
  const marks = await page.evaluate(() => ({
    itemRenders: performance.getEntriesByName("canvas-item-render").length,
    transformChanges: performance.getEntriesByName("canvas-transform-change").length,
  }));
  expect(marks.transformChanges).toBeGreaterThan(5);
  expect(marks.itemRenders).toBe(0);
});
