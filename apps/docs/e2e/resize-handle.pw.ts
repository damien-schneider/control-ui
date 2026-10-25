import { expect, test } from "@playwright/test";
import { waitForReactHydration } from "./browser-test-helpers";

const EXPECTED_PLACEMENT = {
  n: { cursor: "ns-resize", x: 0.5, y: 0 },
  ne: { cursor: "nesw-resize", x: 1, y: 0 },
  e: { cursor: "ew-resize", x: 1, y: 0.5 },
  se: { cursor: "nwse-resize", x: 1, y: 1 },
  s: { cursor: "ns-resize", x: 0.5, y: 1 },
  sw: { cursor: "nesw-resize", x: 0, y: 1 },
  w: { cursor: "ew-resize", x: 0, y: 0.5 },
  nw: { cursor: "nwse-resize", x: 0, y: 0 },
} as const;

test("resize handles sit centred on their edge or corner with the matching cursor", async ({ page }) => {
  await page.goto("/components/resize-handle");
  const handles = page.locator('main [data-control-family="resize-handle"][data-slot="root"]');
  await expect(handles).toHaveCount(8);
  await waitForReactHydration(handles.first());

  for (const [direction, expected] of Object.entries(EXPECTED_PLACEMENT)) {
    const handle = handles.and(page.locator(`[data-direction="${direction}"]`));
    await expect(handle).toHaveCSS("cursor", expected.cursor);
    const placement = await handle.evaluate((element) => {
      const own = element.getBoundingClientRect();
      const parent = element.parentElement?.getBoundingClientRect();
      if (!parent) throw new Error("Resize handle has no parent box");
      return {
        centreX: own.left + own.width / 2,
        centreY: own.top + own.height / 2,
        parent: { left: parent.left, top: parent.top, width: parent.width, height: parent.height },
      };
    });
    expect(Math.abs(placement.centreX - (placement.parent.left + placement.parent.width * expected.x))).toBeLessThanOrEqual(1);
    expect(Math.abs(placement.centreY - (placement.parent.top + placement.parent.height * expected.y))).toBeLessThanOrEqual(1);
  }
});

test("the focus ring follows the handle radius and the rim can ride the shadow knob", async ({ page }) => {
  await page.goto("/components/resize-handle");
  const handle = page.locator('main [data-control-family="resize-handle"][data-slot="root"][data-direction="se"]');
  await waitForReactHydration(handle);
  await handle.evaluate((element) => {
    element.style.setProperty("--cui-resize-handle-radius", "9999px");
    element.style.setProperty("--cui-resize-handle-shadow", "0 0 0 1px rgb(255, 0, 0)");
  });
  await handle.focus();
  await expect(handle).toHaveCSS("border-top-left-radius", "9999px");
  const rim = await handle.evaluate((element) => {
    const before = getComputedStyle(element, "::before");
    return { radius: before.borderTopLeftRadius, shadow: before.boxShadow };
  });
  expect(rim).toEqual({ radius: "9999px", shadow: "rgb(255, 0, 0) 0px 0px 0px 1px" });
});
