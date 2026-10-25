import { expect, type Locator, type Page, test } from "@playwright/test";
import { waitForReactHydration } from "./browser-test-helpers";

async function openCanvas(page: Page) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/components/infinite-canvas");
  const canvas = page.getByRole("application", { name: "Infinite canvas" });
  const content = canvas.locator('[data-control-ui="infinite-canvas"][data-slot="content"]');
  await waitForReactHydration(canvas);
  await canvas.scrollIntoViewIfNeeded();
  await expect(content).toHaveAttribute("data-scale", "1");
  return { canvas, content, initial: await cameraOf(content) };
}

function cameraOf(content: Locator) {
  return content.evaluate((element) => {
    const matrix = new DOMMatrixReadOnly(element.style.transform);
    return { x: matrix.e, y: matrix.f, scale: matrix.a };
  });
}

async function centerOf(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("Expected a rendered element.");
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

async function backgroundPoint(canvas: Locator) {
  return canvas.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    for (const yFactor of [0.5, 0.35, 0.65, 0.2, 0.8]) {
      for (const xFactor of [0.92, 0.8, 0.65, 0.5]) {
        const point = { x: bounds.left + bounds.width * xFactor, y: bounds.top + bounds.height * yFactor };
        if (document.elementFromPoint(point.x, point.y) === element) return point;
      }
    }
    throw new Error("Expected an unobstructed Infinite Canvas point.");
  });
}

async function cardsInside(canvas: Locator) {
  return canvas.evaluate((root) => {
    const bounds = root.getBoundingClientRect();
    return [...root.querySelectorAll('[data-slot="item"]')].every((item) => {
      const rect = item.getBoundingClientRect();
      return rect.left >= bounds.left && rect.right <= bounds.right && rect.top >= bounds.top && rect.bottom <= bounds.bottom;
    });
  });
}

test("pans and zooms from keyboard, controls, wheel, and background drag without moving the page", async ({ page }) => {
  const { canvas, content, initial } = await openCanvas(page);

  await canvas.focus();
  await canvas.press("ArrowRight");
  await expect.poll(() => cameraOf(content)).toEqual({ ...initial, x: initial.x - 32 });

  await canvas.getByRole("button", { name: "Zoom in" }).click();
  await expect(content).toHaveAttribute("data-scale", "1.2");

  const browserZoomPrevented = await canvas.evaluate((element) => {
    const event = new KeyboardEvent("keydown", { key: "-", ctrlKey: true, bubbles: true, cancelable: true });
    return !element.dispatchEvent(event);
  });
  expect(browserZoomPrevented).toBe(false);
  await expect(content).toHaveAttribute("data-scale", "1.2");

  const browserNavigationPrevented = await canvas.getByRole("button", { name: "Move Sign-in form" }).evaluate((element) => {
    const event = new KeyboardEvent("keydown", { key: "ArrowLeft", altKey: true, bubbles: true, cancelable: true });
    return !element.dispatchEvent(event);
  });
  expect(browserNavigationPrevented).toBe(false);

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

  const start = await backgroundPoint(canvas);
  const pageScroll = await page.evaluate(() => scrollY);
  const beforePan = await cameraOf(content);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x - 60, start.y + 20, { steps: 5 });
  await page.mouse.up();
  await expect.poll(async () => (await cameraOf(content)).x).toBeCloseTo(beforePan.x - 60, 0);
  expect(await page.evaluate(() => scrollY)).toBe(pageScroll);
});

test("uses two-finger wheel movement to pan without scrolling the page", async ({ page }) => {
  const { canvas, content, initial } = await openCanvas(page);
  const start = await backgroundPoint(canvas);

  const pageScroll = await page.evaluate(() => scrollY);
  await page.mouse.move(start.x, start.y);
  await page.mouse.wheel(48, 36);

  await expect.poll(() => cameraOf(content)).toEqual({ x: initial.x - 48, y: initial.y - 36, scale: 1 });
  expect(await page.evaluate(() => scrollY)).toBe(pageScroll);
});

test("scrolls a nested preview before the wheel pans the canvas", async ({ page }) => {
  const { canvas, content, initial } = await openCanvas(page);
  const notes = canvas.getByText("Release 1.12 shipped");
  const scroller = notes.locator("xpath=ancestor::*[@data-slot='viewport'][1]");
  const point = await centerOf(notes);

  await page.mouse.move(point.x, point.y);
  await page.mouse.wheel(0, 40);
  await expect.poll(() => scroller.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  expect(await cameraOf(content)).toEqual(initial);

  await scroller.evaluate((element) => element.scrollTo({ top: element.scrollHeight, behavior: "instant" }));
  await page.mouse.wheel(0, 40);
  await expect.poll(async () => (await cameraOf(content)).y).toBe(initial.y - 40);
});

test("holding Space pans from over a live preview without focusing it", async ({ page }) => {
  const { canvas, content, initial } = await openCanvas(page);
  const email = canvas.getByRole("textbox", { name: "Email" });
  const point = await centerOf(email);
  const pageScroll = await page.evaluate(() => scrollY);

  await page.mouse.move(point.x, point.y);
  await page.keyboard.down("Space");
  await expect(canvas).toHaveAttribute("data-pan-ready", "");
  await expect(canvas).toHaveCSS("cursor", "grab");
  await page.mouse.down();
  await page.mouse.move(point.x + 80, point.y + 40, { steps: 6 });
  await expect(canvas).toHaveCSS("cursor", "grabbing");
  await page.mouse.up();
  await expect(canvas).toHaveCSS("cursor", "grab");
  await page.keyboard.up("Space");

  await expect(canvas).not.toHaveAttribute("data-pan-ready");
  await expect(canvas).toHaveCSS("cursor", "auto");
  await expect.poll(() => cameraOf(content)).toEqual({ x: initial.x + 80, y: initial.y + 40, scale: 1 });
  await expect(email).not.toBeFocused();
  expect(await page.evaluate(() => scrollY)).toBe(pageScroll);

  await email.click();
  await page.keyboard.type("a b");
  await expect(email).toHaveValue("a b");
  await expect(canvas).not.toHaveAttribute("data-pan-ready");
});

test("middle-button drag pans over content buttons without activating them, never from the controls", async ({ page }) => {
  const { canvas, content, initial } = await openCanvas(page);
  const button = canvas.getByRole("button", { name: "Continue" });
  await button.evaluate((element) => {
    element.dataset.activations = "0";
    for (const type of ["click", "auxclick"]) {
      element.addEventListener(type, () => {
        element.dataset.activations = String(Number(element.dataset.activations) + 1);
      });
    }
  });
  const point = await centerOf(button);

  await page.mouse.move(point.x, point.y);
  await page.mouse.down({ button: "middle" });
  await page.mouse.move(point.x - 50, point.y - 30, { steps: 5 });
  await page.mouse.up({ button: "middle" });

  await expect.poll(() => cameraOf(content)).toEqual({ x: initial.x - 50, y: initial.y - 30, scale: 1 });
  await expect(button).toHaveAttribute("data-activations", "0");

  const panned = await cameraOf(content);
  const fitView = await centerOf(canvas.getByRole("button", { name: "Fit view" }));
  await page.mouse.move(fitView.x, fitView.y);
  await page.mouse.down({ button: "middle" });
  await page.mouse.move(fitView.x - 50, fitView.y - 30, { steps: 5 });
  await page.mouse.up({ button: "middle" });
  await page.evaluate(() => new Promise(requestAnimationFrame));
  await page.evaluate(() => new Promise(requestAnimationFrame));
  expect(await cameraOf(content)).toEqual(panned);
});

test("moves cards from their handle while previews stay interactive", async ({ page }) => {
  const { canvas, content, initial } = await openCanvas(page);
  const handle = canvas.getByRole("button", { name: "Move Build handoff" });
  const card = handle.locator("xpath=ancestor::*[@data-slot='item'][1]");
  const start = await card.boundingBox();
  if (!start) throw new Error("Expected card bounds.");

  const grip = await centerOf(handle);
  await page.mouse.move(grip.x, grip.y);
  await page.mouse.down();
  await page.mouse.move(grip.x + 50, grip.y + 30, { steps: 5 });
  await page.mouse.up();
  await expect.poll(async () => (await card.boundingBox())?.x).toBeCloseTo(start.x + 50, 0);
  expect((await card.boundingBox())?.y).toBeCloseTo(start.y + 30, 0);

  await handle.focus();
  await page.keyboard.press("ArrowRight");
  await expect.poll(async () => (await card.boundingBox())?.x).toBeCloseTo(start.x + 50 + 32, 0);

  const moved = await card.boundingBox();
  const preview = await centerOf(canvas.getByText("Contracts, states, and acceptance checks"));
  await page.mouse.move(preview.x, preview.y);
  await page.mouse.down();
  await page.mouse.move(preview.x + 60, preview.y + 20, { steps: 5 });
  await page.mouse.up();
  expect(await card.boundingBox()).toEqual(moved);
  expect(await cameraOf(content)).toEqual(initial);
});

test("fits every card into view and reveals offscreen cards on keyboard focus", async ({ page }) => {
  const { canvas, content, initial } = await openCanvas(page);
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Expected Infinite Canvas bounds.");

  const start = await backgroundPoint(canvas);
  await page.mouse.move(start.x, start.y);
  await page.mouse.wheel(2400, 1600);
  await expect.poll(async () => (await cameraOf(content)).x).toBe(initial.x - 2400);
  expect(await cardsInside(canvas)).toBe(false);

  await canvas.getByRole("button", { name: "Fit view" }).click();
  await expect.poll(() => cardsInside(canvas)).toBe(true);

  await page.mouse.wheel(2400, 1600);
  await expect.poll(() => cardsInside(canvas)).toBe(false);
  await canvas.focus();
  await page.keyboard.press("1");
  await expect.poll(() => cardsInside(canvas)).toBe(true);

  await page.mouse.wheel(-2400, -1600);
  await canvas.focus();
  await page.keyboard.press("Tab");
  const handle = canvas.getByRole("button", { name: "Move Sign-in form" });
  await expect(handle).toBeFocused();
  await expect
    .poll(async () => {
      const rect = await handle.boundingBox();
      return rect !== null && rect.x >= box.x && rect.x + rect.width <= box.x + box.width && rect.y >= box.y;
    })
    .toBe(true);
  expect(await canvas.evaluate((element) => [element.scrollLeft, element.scrollTop])).toEqual([0, 0]);
});

test("pinches with two touch points around their midpoint", async ({ page }) => {
  const { canvas, content, initial } = await openCanvas(page);
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Expected Infinite Canvas bounds.");
  const session = await page.context().newCDPSession(page);
  await session.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 2 });
  const center = { x: box.x + box.width - 120, y: box.y + box.height - 140 };
  const touchesAt = (spread: number) => [
    { x: center.x - spread, y: center.y, id: 0 },
    { x: center.x + spread, y: center.y, id: 1 },
  ];

  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: touchesAt(40) });
  for (const spread of [50, 60, 70, 80]) {
    await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: touchesAt(spread) });
  }
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });

  await expect.poll(async () => (await cameraOf(content)).scale).toBeCloseTo(2, 2);
  const camera = await cameraOf(content);
  const anchor = { x: center.x - box.x, y: center.y - box.y };
  expect((anchor.x - camera.x) / camera.scale).toBeCloseTo(anchor.x - initial.x, 1);
  expect((anchor.y - camera.y) / camera.scale).toBeCloseTo(anchor.y - initial.y, 1);
});
