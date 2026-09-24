export type DesignCanvasLayerKind = "frame" | "rectangle" | "ellipse" | "text";

export type DesignCanvasTool = "move" | DesignCanvasLayerKind;

export type DesignCanvasFill = { color: string; opacity: number; visible: boolean };

export type DesignCanvasLayer = {
  id: string;
  name: string;
  kind: DesignCanvasLayerKind;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  cornerRadius: number;
  fill: DesignCanvasFill | null;
  text?: string;
};

export type DesignCanvasPoint = { x: number; y: number };

export type DesignCanvasBounds = Pick<DesignCanvasLayer, "x" | "y" | "width" | "height">;

const NEW_LAYER_DEFAULTS: Record<DesignCanvasLayerKind, Pick<DesignCanvasLayer, "name" | "width" | "height" | "fill" | "text">> = {
  frame: { name: "Frame", width: 320, height: 200, fill: { color: "#FFFFFF", opacity: 100, visible: true } },
  rectangle: { name: "Rectangle", width: 120, height: 120, fill: { color: "#D9D9D9", opacity: 100, visible: true } },
  ellipse: { name: "Ellipse", width: 120, height: 120, fill: { color: "#D9D9D9", opacity: 100, visible: true } },
  text: { name: "Text", width: 160, height: 32, fill: { color: "#000000", opacity: 100, visible: true }, text: "Text" },
};

export function drawnDesignCanvasBounds(
  kind: DesignCanvasLayerKind,
  start: DesignCanvasPoint,
  end: DesignCanvasPoint,
  clickTolerance: number,
): DesignCanvasBounds {
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);
  if (Math.max(width, height) < clickTolerance) {
    const defaults = NEW_LAYER_DEFAULTS[kind];
    return {
      x: Math.round(start.x - defaults.width / 2),
      y: Math.round(start.y - defaults.height / 2),
      width: defaults.width,
      height: defaults.height,
    };
  }
  return {
    x: Math.round(Math.min(start.x, end.x)),
    y: Math.round(Math.min(start.y, end.y)),
    width: Math.max(1, Math.round(width)),
    height: Math.max(1, Math.round(height)),
  };
}

export function createDesignCanvasLayer(kind: DesignCanvasLayerKind, bounds: DesignCanvasBounds, id: string): DesignCanvasLayer {
  return { ...NEW_LAYER_DEFAULTS[kind], ...bounds, id, kind, rotation: 0, opacity: 100, cornerRadius: 0 };
}

export function resizeDesignCanvasLayer(
  layer: DesignCanvasLayer,
  size: Partial<Pick<DesignCanvasLayer, "width" | "height">>,
  aspectRatioLocked: boolean,
): DesignCanvasLayer {
  const aspectRatio = layer.width / layer.height;
  if (size.width !== undefined) {
    const height = aspectRatioLocked ? Math.round(size.width / aspectRatio) : layer.height;
    return { ...layer, width: size.width, height };
  }
  if (size.height !== undefined) {
    const width = aspectRatioLocked ? Math.round(size.height * aspectRatio) : layer.width;
    return { ...layer, width, height: size.height };
  }
  return layer;
}

export function designCanvasFillColor(fill: DesignCanvasFill | null) {
  if (!fill?.visible) return "transparent";
  return `color-mix(in srgb, ${fill.color} ${fill.opacity}%, transparent)`;
}
