import { describe, expect, test } from "bun:test";
import {
  boundedTransform,
  fitTransform,
  pinchTransform,
  revealOffset,
  toWorldPoint,
  wheelDeltaPixels,
  zoomAroundPoint,
} from "./infinite-canvas-camera";

const area = { x: 0, y: 0, width: 800, height: 600 };

describe("infinite canvas camera", () => {
  test("zooming keeps the world point under the anchor in place", () => {
    const start = { x: 120, y: -40, scale: 0.75 };
    const anchor = { x: 310, y: 205 };
    const zoomed = zoomAroundPoint(start, 3.2, anchor);

    const before = toWorldPoint(start, anchor);
    const after = toWorldPoint(zoomed, anchor);
    expect(after.x).toBeCloseTo(before.x, 9);
    expect(after.y).toBeCloseTo(before.y, 9);
  });

  test("a pinch follows its midpoint while it scales", () => {
    const start = { x: 0, y: 0, scale: 1 };
    const next = pinchTransform(start, { x: 100, y: 100 }, { x: 140, y: 90 }, 2);

    expect(next).toEqual({ x: -60, y: -110, scale: 2 });
    expect(toWorldPoint(next, { x: 140, y: 90 })).toEqual({ x: 100, y: 100 });
  });

  test("fitting centers the content inside the padded area", () => {
    const fitted = fitTransform({ x: 100, y: 50, width: 1400, height: 300 }, area, { padding: 50, minScale: 0.1, maxScale: 4 });

    expect(fitted.scale).toBeCloseTo(0.5, 9);
    expect(fitted.x + (100 + 700) * fitted.scale).toBeCloseTo(400, 9);
    expect(fitted.y + (50 + 150) * fitted.scale).toBeCloseTo(300, 9);
  });

  test("fitting small content stops at the maximum scale", () => {
    const fitted = fitTransform({ x: 0, y: 0, width: 40, height: 20 }, area, { padding: 48, minScale: 0.1, maxScale: 1 });

    expect(fitted).toEqual({ x: 380, y: 290, scale: 1 });
  });

  test("revealing pans only as far as needed and leaves visible content alone", () => {
    expect(revealOffset({ x: 300, y: 200, width: 100, height: 50 }, area, 24)).toEqual({ x: 0, y: 0 });
    expect(revealOffset({ x: 760, y: 200, width: 100, height: 50 }, area, 24)).toEqual({ x: -84, y: 0 });
    expect(revealOffset({ x: -400, y: 640, width: 100, height: 50 }, area, 24)).toEqual({ x: 424, y: -114 });
  });

  test("revealing content larger than the area aligns its start", () => {
    expect(revealOffset({ x: 200, y: 900, width: 2000, height: 50 }, area, 24)).toEqual({ x: -176, y: -374 });
  });

  test("rejects non-finite cameras and clamps runaway values", () => {
    expect(boundedTransform({ x: Number.NaN, y: 0, scale: 1 }, 0.1, 8)).toBeNull();
    expect(boundedTransform({ x: 0, y: 0, scale: 0 }, 0.1, 8)).toBeNull();
    expect(boundedTransform({ x: 0, y: Number.POSITIVE_INFINITY, scale: 1 }, 0.1, 8)).toBeNull();
    expect(boundedTransform({ x: 1e12, y: -1e12, scale: 40 }, 0.1, 8)).toEqual({ x: 10_000_000, y: -10_000_000, scale: 8 });
  });

  test("normalizes line and page wheel deltas and maps Shift scrolling to horizontal", () => {
    expect(wheelDeltaPixels({ deltaMode: 1, deltaX: 0, deltaY: 3, shiftKey: false }, 600)).toEqual({ x: 0, y: 48 });
    expect(wheelDeltaPixels({ deltaMode: 2, deltaX: 0, deltaY: -1, shiftKey: false }, 600)).toEqual({ x: 0, y: -600 });
    expect(wheelDeltaPixels({ deltaMode: 0, deltaX: 0, deltaY: 30, shiftKey: true }, 600)).toEqual({ x: 30, y: 0 });
    expect(wheelDeltaPixels({ deltaMode: 0, deltaX: 12, deltaY: 30, shiftKey: true }, 600)).toEqual({ x: 12, y: 30 });
  });
});
