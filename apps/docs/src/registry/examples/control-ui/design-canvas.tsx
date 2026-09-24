"use client";

import { DesignCanvasBlock, type DesignCanvasLayer } from "@/components/control-ui/blocks/design-canvas";

const layers: readonly DesignCanvasLayer[] = [
  {
    id: "landing",
    name: "Landing",
    kind: "frame",
    x: 0,
    y: 0,
    width: 480,
    height: 320,
    rotation: 0,
    opacity: 100,
    cornerRadius: 0,
    fill: { color: "#FFFFFF", opacity: 100, visible: true },
  },
  {
    id: "hero",
    name: "Hero card",
    kind: "rectangle",
    x: 32,
    y: 48,
    width: 256,
    height: 168,
    rotation: 0,
    opacity: 100,
    cornerRadius: 16,
    fill: { color: "#7038F4", opacity: 90, visible: true },
  },
  {
    id: "badge",
    name: "Badge",
    kind: "ellipse",
    x: 320,
    y: 72,
    width: 112,
    height: 112,
    rotation: 0,
    opacity: 100,
    cornerRadius: 0,
    fill: { color: "#F97316", opacity: 100, visible: true },
  },
  {
    id: "headline",
    name: "Headline",
    kind: "text",
    x: 32,
    y: 248,
    width: 280,
    height: 32,
    rotation: 0,
    opacity: 100,
    cornerRadius: 0,
    fill: { color: "#111111", opacity: 100, visible: true },
    text: "Ship the canvas",
  },
];

export function DesignCanvasExample() {
  return (
    <div className="h-[min(720px,80vh)] min-h-150 w-full overflow-hidden rounded-[var(--radius-panel)] border bg-background shadow-md">
      <DesignCanvasBlock
        layout="contained"
        defaultLayers={layers}
        defaultSelectedLayerId="hero"
        defaultTransform={{ x: 96, y: 96, scale: 1 }}
      />
    </div>
  );
}
