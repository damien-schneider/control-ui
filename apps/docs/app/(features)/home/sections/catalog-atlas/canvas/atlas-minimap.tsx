"use client";

import type { PointerEvent } from "react";
import { cn } from "@/components/control-ui/lib/cn";
import { Card, CardContent } from "@/components/control-ui/ui/card";
import { useInfiniteCanvas, useInfiniteCanvasTransform } from "@/components/control-ui/ui/infinite-canvas";
import { Text } from "@/components/control-ui/ui/typography";
import { type AtlasNode, type AtlasRect, type AtlasSize, visibleWorld } from "../atlas-layout";

function percent(value: number) {
  return `${value * 100}%`;
}

function placeWithin(rect: AtlasRect, bounds: AtlasRect) {
  return {
    left: percent((rect.x - bounds.x) / bounds.width),
    top: percent((rect.y - bounds.y) / bounds.height),
    width: percent(rect.width / bounds.width),
    height: percent(rect.height / bounds.height),
  };
}

export function AtlasMinimap({
  nodes,
  bounds,
  inView,
  viewport,
  className,
}: {
  nodes: readonly AtlasNode[];
  bounds: AtlasRect;
  inView: ReadonlySet<string>;
  viewport: AtlasSize;
  className?: string;
}) {
  const canvas = useInfiniteCanvas();
  const view = useInfiniteCanvasTransform();

  function centerOn(event: PointerEvent<HTMLDivElement>) {
    const map = event.currentTarget.getBoundingClientRect();
    const worldX = bounds.x + ((event.clientX - map.left) / map.width) * bounds.width;
    const worldY = bounds.y + ((event.clientY - map.top) / map.height) * bounds.height;
    canvas.setTransform({
      scale: view.scale,
      x: viewport.width / 2 - worldX * view.scale,
      y: viewport.height / 2 - worldY * view.scale,
    });
  }

  return (
    <Card size="sm" className={cn("w-46", className)}>
      <CardContent className="grid gap-2">
        <div
          role="presentation"
          className="relative cursor-crosshair touch-none overflow-hidden rounded-md bg-muted"
          style={{ aspectRatio: `${bounds.width} / ${bounds.height}` }}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            centerOn(event);
          }}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) centerOn(event);
          }}
        >
          {nodes.map((node) => (
            <span
              key={node.item.id}
              className={cn(
                "absolute transition-colors duration-(--duration-base) ease-(--ease-standard)",
                inView.has(node.item.id) ? "bg-foreground/70" : "bg-foreground/15",
              )}
              style={placeWithin(node, bounds)}
            />
          ))}
          <span className="absolute border-[1.5px] border-info bg-info/10" style={placeWithin(visibleWorld(view, viewport), bounds)} />
        </div>
        <div className="flex items-center justify-between gap-2 text-muted-foreground">
          <Text size="micro" mono numeric>
            {inView.size} of {nodes.length} in view
          </Text>
          <Text size="micro" mono numeric>
            {Math.round(view.scale * 100)}%
          </Text>
        </div>
      </CardContent>
    </Card>
  );
}
