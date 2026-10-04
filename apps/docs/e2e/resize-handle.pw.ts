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
  await page.goto("/primitives/resize-handle");
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
