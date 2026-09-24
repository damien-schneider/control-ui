"use client";

import { useState } from "react";
import { DesignCanvasBlock, type DesignCanvasLayer } from "@/components/control-ui/blocks/design-canvas";

const initialLayers: DesignCanvasLayer[] = [
  {
    id: "frame",
    name: "Frame",
    kind: "frame",
    x: 0,
    y: 0,
    width: 320,
    height: 200,
    rotation: 0,
    opacity: 100,
    cornerRadius: 0,
    fill: { color: "#FFFFFF", opacity: 100, visible: true },
  },
];

export default function DesignCanvasPage() {
  const [layers, setLayers] = useState(initialLayers);
  return <DesignCanvasBlock layers={layers} onLayersChange={setLayers} defaultTransform={{ x: 120, y: 120, scale: 1 }} />;
}
