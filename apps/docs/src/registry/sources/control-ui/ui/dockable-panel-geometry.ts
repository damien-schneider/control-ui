export type DockablePanelBounds = { width: number; height: number };
export type DockablePanelSize = { width: number; height: number };
export type DockablePanelPosition = { x: number; y: number };

export function clampDockablePanelPosition(
  position: DockablePanelPosition,
  bounds: DockablePanelBounds,
  panel: DockablePanelSize,
  inset = 12,
): DockablePanelPosition {
  const maxX = Math.max(inset, bounds.width - panel.width - inset);
  const maxY = Math.max(inset, bounds.height - panel.height - inset);

  return {
    x: Math.min(Math.max(position.x, inset), maxX),
    y: Math.min(Math.max(position.y, inset), maxY),
  };
}

export function dockablePanelSideAt(pointerX: number, width: number): "left" | "right" {
  return pointerX < width / 2 ? "left" : "right";
}

export function oppositeDockablePanelSide(placement: "left" | "right"): "left" | "right" {
  return placement === "left" ? "right" : "left";
}

export function dockablePanelSideForKey(key: string, placement: "left" | "right"): "left" | "right" | null {
  if (key === "ArrowLeft") return "left";
  if (key === "ArrowRight") return "right";
  if (key === "Enter" || key === " ") return oppositeDockablePanelSide(placement);
  return null;
}
