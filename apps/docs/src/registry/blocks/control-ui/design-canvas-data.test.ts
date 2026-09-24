import { describe, expect, test } from "bun:test";
import { createDesignCanvasLayer, drawnDesignCanvasBounds, resizeDesignCanvasLayer } from "./design-canvas-data";

const layer = createDesignCanvasLayer("rectangle", { x: 0, y: 0, width: 200, height: 100 }, "card");

describe("resizeDesignCanvasLayer", () => {
  test("keeps the other side when the aspect ratio is unlocked", () => {
    expect(resizeDesignCanvasLayer(layer, { width: 300 }, false)).toMatchObject({ width: 300, height: 100 });
  });

  test("scales the other side when the aspect ratio is locked", () => {
    expect(resizeDesignCanvasLayer(layer, { width: 300 }, true)).toMatchObject({ width: 300, height: 150 });
    expect(resizeDesignCanvasLayer(layer, { height: 50 }, true)).toMatchObject({ width: 100, height: 50 });
  });
});

describe("drawnDesignCanvasBounds", () => {
  test("a drag toward the top-left spans from the release point to the press point", () => {
    expect(drawnDesignCanvasBounds("frame", { x: 400, y: 300 }, { x: 250.4, y: 180.6 }, 4)).toEqual({
      x: 250,
      y: 181,
      width: 150,
      height: 119,
    });
  });

  test("a press that stays within the click tolerance centers a default-size layer", () => {
    expect(drawnDesignCanvasBounds("frame", { x: 400, y: 300 }, { x: 402, y: 301 }, 4)).toEqual({
      x: 240,
      y: 200,
      width: 320,
      height: 200,
    });
  });
});
