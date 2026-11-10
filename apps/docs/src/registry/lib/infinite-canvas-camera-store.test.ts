import { describe, expect, test } from "bun:test";
import { infiniteCanvasGridStyle } from "./infinite-canvas-camera-store";

describe("infiniteCanvasGridStyle", () => {
  test("falls back to the base grid for a scale the camera would reject", () => {
    for (const scale of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(infiniteCanvasGridStyle({ x: 4, y: 8, scale })).toEqual({
        backgroundPosition: "4px 8px",
        backgroundSize: "24px 24px",
      });
    }
  });
});
