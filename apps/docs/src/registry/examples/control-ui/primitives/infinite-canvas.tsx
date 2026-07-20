"use client";

import { InfiniteCanvas, InfiniteCanvasContent, InfiniteCanvasControls } from "@/components/control-ui/ui/infinite-canvas";

const canvasItems = [
  { id: "brief", title: "Research brief", detail: "Customer signals and open questions", x: 24, y: 24 },
  { id: "flows", title: "Interaction map", detail: "Primary path and recovery states", x: 296, y: 156 },
  { id: "handoff", title: "Build handoff", detail: "Contracts, states, and acceptance checks", x: 64, y: 344 },
] as const;

export function PrimitiveInfiniteCanvasExample() {
  return (
    <div className="w-full p-4 sm:p-6">
      <InfiniteCanvas className="h-140 w-full sm:h-150" defaultTransform={{ x: 96, y: 72, scale: 1 }}>
        <InfiniteCanvasContent>
          {canvasItems.map((item) => (
            <article
              key={item.id}
              className="absolute w-52 rounded-[var(--radius-panel)] bg-card p-4 text-card-foreground shadow-sm ring-1 ring-border"
              style={{ left: item.x, top: item.y }}
            >
              <h3 className="text-sm font-medium">{item.title}</h3>
              <p className="mt-1 text-meta text-muted-foreground">{item.detail}</p>
            </article>
          ))}
        </InfiniteCanvasContent>
        <div className="pointer-events-none absolute top-3 left-3 rounded-[var(--radius-control)] bg-card/90 px-2.5 py-1.5 text-meta text-muted-foreground shadow-xs ring-1 ring-border backdrop-blur-sm">
          Drag or scroll with two fingers to pan · Pinch or hold ⌘ while scrolling to zoom
        </div>
        <InfiniteCanvasControls />
      </InfiniteCanvas>
    </div>
  );
}
