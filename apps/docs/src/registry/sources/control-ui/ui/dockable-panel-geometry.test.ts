import { describe, expect, test } from "bun:test";
import { clampDockablePanelPosition, dockablePanelSideAt, oppositeDockablePanelSide } from "./dockable-panel-geometry";

describe("dockable panel geometry", () => {
  test("clamps the transient dragged panel inside its workspace", () => {
    expect(clampDockablePanelPosition({ x: -40, y: 900 }, { width: 800, height: 600 }, { width: 320, height: 240 })).toEqual({
      x: 12,
      y: 348,
    });
  });

  test("keeps a panel inset when the workspace is smaller than the panel", () => {
    expect(clampDockablePanelPosition({ x: 80, y: 90 }, { width: 240, height: 180 }, { width: 320, height: 240 })).toEqual({
      x: 12,
      y: 12,
    });
  });

  test("clamps a drag against resized workspace bounds", () => {
    expect(clampDockablePanelPosition({ x: 640, y: 420 }, { width: 560, height: 400 }, { width: 320, height: 240 })).toEqual({
      x: 228,
      y: 148,
    });
  });

  test("assigns every pointer position to one of the two docking slots", () => {
    expect(dockablePanelSideAt(0, 800)).toBe("left");
    expect(dockablePanelSideAt(399, 800)).toBe("left");
    expect(dockablePanelSideAt(400, 800)).toBe("right");
    expect(dockablePanelSideAt(800, 800)).toBe("right");
  });

  test("toggles directly between the two precise slots", () => {
    expect(oppositeDockablePanelSide("left")).toBe("right");
    expect(oppositeDockablePanelSide("right")).toBe("left");
  });
});
