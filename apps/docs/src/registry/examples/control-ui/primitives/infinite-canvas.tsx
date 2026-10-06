"use client";

import { useState } from "react";
import {
  InfiniteCanvas,
  InfiniteCanvasContent,
  InfiniteCanvasControls,
  InfiniteCanvasItem,
} from "@/components/control-ui/ui/infinite-canvas";
import { Heading, Text } from "@/components/control-ui/ui/typography";

const initialItems = [
  { id: "brief", title: "Research brief", detail: "Customer signals and open questions", x: 24, y: 24 },
  { id: "flows", title: "Interaction map", detail: "Primary path and recovery states", x: 296, y: 156 },
  { id: "handoff", title: "Build handoff", detail: "Contracts, states, and acceptance checks", x: 64, y: 344 },
];

export function PrimitiveInfiniteCanvasExample() {
  const [items, setItems] = useState(initialItems);

  return (
    <div className="w-full sm:p-6">
      <InfiniteCanvas className="h-140 w-full sm:h-150" defaultTransform={{ x: 96, y: 72, scale: 1 }}>
        <InfiniteCanvasContent>
          {items.map((item) => (
            <InfiniteCanvasItem
              key={item.id}
              x={item.x}
              y={item.y}
              onPositionChange={(position) =>
                setItems((current) => current.map((candidate) => (candidate.id === item.id ? { ...candidate, ...position } : candidate)))
              }
              className="w-52 rounded-[var(--radius-panel)] bg-card p-4 text-card-foreground shadow-sm ring-1 ring-border"
            >
              <Heading level={3} size="heading-4">
                {item.title}
              </Heading>
              <Text as="p" size="caption" tone="muted" className="mt-1">
                {item.detail}
              </Text>
            </InfiniteCanvasItem>
          ))}
        </InfiniteCanvasContent>
        <Text
          as="div"
          size="caption"
          tone="muted"
          className="pointer-events-none absolute top-(--cui-infinite-canvas-padding) left-(--cui-infinite-canvas-padding) rounded-(--cui-infinite-canvas-controls-radius) bg-card/90 px-2.5 py-1.5 shadow-sm ring-1 ring-border backdrop-blur-sm"
        >
          Drag cards to move them · Drag the background or scroll to pan · Pinch or hold ⌘ while scrolling to zoom
        </Text>
        <InfiniteCanvasControls />
      </InfiniteCanvas>
    </div>
  );
}
