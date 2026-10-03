import { expect, test } from "@playwright/test";
import { waitForReactHydration } from "./browser-test-helpers";

for (const [index, cursor] of [
  [0, /^(col|ew|e|w)-resize$/],
  [1, /^(row|ns|n|s)-resize$/],
] as const) {
  test(`panel separator ${index} keeps the resize cursor during drag and restores it afterwards`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/primitives/resizable");
    const heading = page.getByRole("heading", { name: "Resizable", level: 1, exact: true });
    const handle = page.getByRole("separator", { name: "Resize panel", exact: true }).nth(index);
    await waitForReactHydration(handle);
    await page.waitForLoadState("networkidle");
    const originalCursor = await heading.evaluate((node) => getComputedStyle(node).cursor);
    await handle.scrollIntoViewIfNeeded();
    const box = await handle.boundingBox();
    if (!box) throw new Error("Resize handle must be visible");
    const start = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    const initialSize = await handle.getAttribute("aria-valuenow");
    await page.mouse.move(start.x, start.y);
    await expect(heading).toHaveCSS("cursor", cursor);
    await page.mouse.down();
    await page.mouse.move(start.x + (index === 0 ? 50 : 0), start.y + (index === 1 ? 50 : 0), { steps: 5 });
    await expect(handle).not.toHaveAttribute("aria-valuenow", initialSize ?? "");
    await expect(heading).toHaveCSS("cursor", cursor);
    await page.mouse.up();
    await page.mouse.move(0, 0);
    await expect(heading).toHaveCSS("cursor", originalCursor);
    await handle.press(index === 0 ? "ArrowRight" : "ArrowDown");
    await expect(heading).toHaveCSS("cursor", originalCursor);
  });
}

test("floating panel cursor survives pointer capture and clears on cancellation and navigation", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/primitives/resizable");
  const heading = page.getByRole("heading", { name: "Resizable", level: 1, exact: true });
  const handle = page.getByRole("separator", { name: "Resize panel", exact: true }).last();
  await waitForReactHydration(handle);
  await page.waitForLoadState("networkidle");
  const originalCursor = await heading.evaluate((node) => getComputedStyle(node).cursor);
  await handle.scrollIntoViewIfNeeded();
  const box = await handle.boundingBox();
  if (!box) throw new Error("Floating resize handle must be visible");
  const start = { x: box.x, y: box.y + box.height / 2 };
  await page.mouse.move(start.x, start.y);
  await expect(heading).toHaveCSS("cursor", "col-resize");
  await page.mouse.down();
  await page.mouse.move(start.x - 30, start.y, { steps: 3 });
  await expect(handle).toHaveAttribute("aria-valuenow", "270");
  await expect(heading).toHaveCSS("cursor", "col-resize");
  await handle.evaluate((node) => node.dispatchEvent(new PointerEvent("pointercancel", { pointerId: 1, bubbles: true })));
  await page.mouse.up();
  await page.mouse.move(0, 0);
  await expect(heading).toHaveCSS("cursor", originalCursor);
  await handle.evaluate((node) => {
    if (node instanceof HTMLElement) node.blur();
  });
  await handle.hover();
  await expect(heading).toHaveCSS("cursor", "col-resize");
  await page
    .locator("[data-docs-sidebar-navigation]")
    .getByRole("link", { name: "Button", exact: true })
    .evaluate((node) => {
      if (!(node instanceof HTMLElement)) throw new Error("Navigation link must be an HTML element");
      node.click();
    });
  await expect(page).toHaveURL(/\/primitives\/button$/);
  await expect(page.getByRole("heading", { name: "Button", level: 1, exact: true })).toHaveCSS("cursor", originalCursor);
});
