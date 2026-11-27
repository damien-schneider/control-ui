"use client";

import { HandIcon, MaximizeIcon, MinusIcon, MousePointer2Icon, PlusIcon } from "lucide-react";
import { useInfiniteCanvas, useInfiniteCanvasTransform } from "@/components/control-ui/ui/infinite-canvas";
import { Toolbar, ToolbarButton, ToolbarSeparator } from "@/components/control-ui/ui/toolbar";
import type { AtlasRect, AtlasView } from "../atlas-layout";

export type AtlasTool = "pointer" | "hand";

const ZOOM_STEP = 1.2;

const tools = [
  { id: "pointer", label: "Use the components", Icon: MousePointer2Icon },
  { id: "hand", label: "Pan the canvas", Icon: HandIcon },
] as const satisfies readonly { id: AtlasTool; label: string; Icon: typeof HandIcon }[];

function selectScale(view: AtlasView) {
  return view.scale;
}

export function AtlasToolbar({
  tool,
  onToolChange,
  bounds,
  total,
  className,
}: {
  tool: AtlasTool;
  onToolChange: (tool: AtlasTool) => void;
  bounds: AtlasRect;
  total: number;
  className?: string;
}) {
  const canvas = useInfiniteCanvas();
  const scale = useInfiniteCanvasTransform(selectScale);
  const zoom = Math.round(scale * 100);

  return (
    <div className={className}>
      <Toolbar variant="floating" aria-label="Canvas tools">
        {tools.map(({ id, label, Icon }) => (
          <ToolbarButton key={id} iconOnly aria-label={label} aria-pressed={tool === id} onClick={() => onToolChange(id)}>
            <Icon />
          </ToolbarButton>
        ))}
        <ToolbarSeparator />
        <ToolbarButton
          iconOnly
          aria-label="Zoom out"
          disabled={scale <= canvas.minScale}
          className="hidden @3xl/home:inline-flex"
          onClick={() => canvas.zoomBy(1 / ZOOM_STEP)}
        >
          <MinusIcon />
        </ToolbarButton>
        <ToolbarButton aria-label={`Reset canvas zoom, currently ${zoom}%`} className="w-13" onClick={() => canvas.reset()}>
          <span className="tabular-nums">{zoom}%</span>
        </ToolbarButton>
        <ToolbarButton
          iconOnly
          aria-label="Zoom in"
          disabled={scale >= canvas.maxScale}
          className="hidden @3xl/home:inline-flex"
          onClick={() => canvas.zoomBy(ZOOM_STEP)}
        >
          <PlusIcon />
        </ToolbarButton>
        <ToolbarSeparator />
        <ToolbarButton onClick={() => canvas.fitBounds(bounds, { padding: 32 })}>
          <MaximizeIcon />
          Fit all {total}
        </ToolbarButton>
      </Toolbar>
    </div>
  );
}
