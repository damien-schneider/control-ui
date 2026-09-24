import { expect, type Locator, type Page, test } from "@playwright/test";
import { waitForReactHydration } from "./browser-test-helpers";

async function dragBy(page: Page, target: Locator, delta: { x: number; y: number }) {
  const box = await target.boundingBox();
  if (!box) throw new Error("Expected a visible drag target.");
  const start = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + delta.x, start.y + delta.y, { steps: 6 });
  await page.mouse.up();
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/use-cases/design-canvas");
  const canvas = page.getByRole("application", { name: "Design canvas" });
  await waitForReactHydration(canvas);
  await canvas.scrollIntoViewIfNeeded();
});

test("dragging a layer moves it in world space and updates the position fields", async ({ page }) => {
  const heroCard = page.locator('[data-slot="item"][aria-label="Hero card"]');
  const xPosition = page.getByRole("textbox", { name: "X position" });
  const yPosition = page.getByRole("textbox", { name: "Y position" });
  await expect(xPosition).toHaveValue("32");

  await dragBy(page, heroCard, { x: 50, y: 30 });

  await expect(xPosition).toHaveValue("82");
  await expect(yPosition).toHaveValue("78");
  await expect(heroCard).toHaveCSS("left", "82px");
});

test("scrubbing a prefix label or a suffix unit changes the value without typing", async ({ page }) => {
  const xPosition = page.getByRole("textbox", { name: "X position" });
  const xLabel = page.locator('[data-slot="scrub-area"]', { hasText: /^X$/ });
  await dragBy(page, xLabel, { x: 40, y: 0 });
  await expect(xPosition).not.toHaveValue("32");
  expect(Number(await xPosition.inputValue())).toBeGreaterThan(32);

  const fillOpacity = page.getByRole("textbox", { name: "Fill opacity" });
  const percentUnit = fillOpacity.locator("xpath=following-sibling::*[@data-slot='scrub-area']");
  await dragBy(page, percentUnit, { x: -30, y: 0 });
  expect(Number(await fillOpacity.inputValue())).toBeLessThan(90);
});

test("fields nested in the fill input group share one surface", async ({ page }) => {
  const fillColor = page.getByRole("textbox", { name: "Fill color" });
  await expect(fillColor).not.toHaveAttribute("data-control", "true");
  await expect(fillColor).toHaveCSS("border-top-width", "0px");
  const opacityGroup = page.getByRole("textbox", { name: "Fill opacity" }).locator("..");
  await expect(opacityGroup).not.toHaveAttribute("data-control", "true");
});

test("a shape tool draws a new layer at the dragged size, even over existing layers", async ({ page }) => {
  const canvas = page.getByRole("application", { name: "Design canvas" });
  await page.getByRole("button", { name: "Frame", exact: true }).click();
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Expected canvas bounds.");
  await page.mouse.move(box.x + 300, box.y + 150);
  await page.mouse.down();
  await page.mouse.move(box.x + 100, box.y + 270, { steps: 8 });
  await page.mouse.up();

  await expect(page.getByRole("textbox", { name: "Width" })).toHaveValue("200");
  await expect(page.getByRole("textbox", { name: "Height" })).toHaveValue("120");
  await expect(page.getByRole("textbox", { name: "X position" })).toHaveValue("4");
  await expect(canvas).toHaveAttribute("data-tool", "move");
});

test("a shape tool click without dragging places a default-size layer", async ({ page }) => {
  const canvas = page.getByRole("application", { name: "Design canvas" });
  await page.getByRole("button", { name: "Rectangle", exact: true }).click();
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Expected canvas bounds.");
  await page.mouse.click(box.x + 240, box.y + box.height - 140);

  await expect(page.getByRole("complementary", { name: "Properties" }).getByRole("heading", { name: "Rectangle" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Width" })).toHaveValue("120");
});

test("the floating properties panel resizes from its inner edge", async ({ page }) => {
  const properties = page.getByRole("complementary", { name: "Properties" });
  const before = await properties.boundingBox();
  if (!before) throw new Error("Expected properties bounds.");
  await page.mouse.move(before.x, before.y + before.height / 2);
  await page.mouse.down();
  await page.mouse.move(before.x - 60, before.y + before.height / 2, { steps: 6 });
  await page.mouse.up();

  await expect.poll(async () => Math.round((await properties.boundingBox())?.width ?? 0)).toBe(Math.round(before.width + 60));

  const handle = page.getByRole("separator", { name: "Resize panel" }).last();
  await expect(handle).toHaveCSS("cursor", "col-resize");
  await handle.press("End");
  await expect(handle).toHaveAttribute("aria-valuenow", "440");
  await handle.press("ArrowRight");
  await expect(handle).toHaveAttribute("aria-valuenow", "430");
});

test("zoom controls ease the canvas to the next zoom level", async ({ page }) => {
  const canvas = page.getByRole("application", { name: "Design canvas" });
  await page.getByRole("button", { name: "Zoom in" }).click();
  await expect(canvas).toHaveAttribute("data-easing", "true");
  await expect(page.getByRole("button", { name: /Reset canvas zoom, currently 120%/ })).toBeVisible();
});
