import { expect, test } from "@playwright/test";

test("pans and zooms without moving the page viewport", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/primitives/infinite-canvas");

  const canvas = page.getByRole("application", { name: "Infinite canvas" });
  const content = canvas.locator('[data-control-ui="infinite-canvas"][data-slot="content"]');
  await expect(canvas).toBeVisible();
  await expect(content).toHaveAttribute("data-scale", "1");

  await canvas.focus();
  await canvas.press("ArrowRight");
  await expect(content).toHaveCSS("transform", /matrix\(1, 0, 0, 1, 128, 72\)/);

  await canvas.getByRole("button", { name: "Zoom in" }).click();
  await expect(content).toHaveAttribute("data-scale", "1.2");

  const wheelPrevented = await canvas.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const event = new WheelEvent("wheel", {
      bubbles: true,
      cancelable: true,
      clientX: bounds.left + bounds.width / 2,
      clientY: bounds.top + bounds.height / 2,
      ctrlKey: true,
      deltaY: -40,
    });
    return !element.dispatchEvent(event);
  });
  expect(wheelPrevented).toBe(true);
  await expect(content).not.toHaveAttribute("data-scale", "1.2");

  const beforePan = await content.getAttribute("style");
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) throw new Error("Expected Infinite Canvas bounds.");
  await page.mouse.move(box.x + 24, box.y + box.height - 24);
  await page.mouse.down();
  await page.mouse.move(box.x + 84, box.y + box.height - 4, { steps: 5 });
  await page.mouse.up();
  await expect.poll(() => content.getAttribute("style")).not.toBe(beforePan);
});

test("uses two-finger wheel movement to pan without scrolling the page", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/primitives/infinite-canvas");

  const canvas = page.getByRole("application", { name: "Infinite canvas" });
  const content = canvas.locator('[data-control-ui="infinite-canvas"][data-slot="content"]');
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) throw new Error("Expected Infinite Canvas bounds.");

  const beforeTrackpadPan = await content.getAttribute("style");
  const pageScrollBeforeTrackpadPan = await page.evaluate(() => scrollY);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(48, 36);

  await expect.poll(() => content.getAttribute("style")).not.toBe(beforeTrackpadPan);
  await expect(content).toHaveAttribute("data-scale", "1");
  expect(await page.evaluate(() => scrollY)).toBe(pageScrollBeforeTrackpadPan);
});
