"use client";

import { Badge } from "@/components/control-ui/ui/badge";
import {
  InfiniteCanvas,
  InfiniteCanvasContent,
  InfiniteCanvasControls,
  InfiniteCanvasItem,
} from "@/components/control-ui/ui/infinite-canvas";
import { Text } from "@/components/control-ui/ui/typography";

const pipelineSteps = [
  { id: "install", title: "Install dependencies", detail: "bun install, 14s", x: 0, y: 0 },
  { id: "build", title: "Build application", detail: "next build, 52s", x: 260, y: 48 },
  { id: "deploy", title: "Deploy preview", detail: "Waiting for build", x: 520, y: 96 },
];

export function PrimitiveInfiniteCanvasEmbeddedExample() {
  return (
    <div className="flex w-full max-w-3xl flex-col overflow-hidden rounded-(--radius-panel) border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-border border-b px-4 py-3">
        <Text weight="medium">Release pipeline</Text>
        <Badge>3 steps</Badge>
      </div>
      <InfiniteCanvas
        chrome="embedded"
        aria-label="Release pipeline canvas"
        className="h-80 w-full"
        defaultTransform={{ x: 32, y: 48, scale: 1 }}
      >
        <InfiniteCanvasContent>
          {pipelineSteps.map((step) => (
            <InfiniteCanvasItem key={step.id} x={step.x} y={step.y} className="w-52">
              <div className="flex flex-col gap-1 rounded-(--radius-panel) bg-background p-3 ring-1 ring-border">
                <Text weight="medium">{step.title}</Text>
                <Text size="caption" tone="muted">
                  {step.detail}
                </Text>
              </div>
            </InfiniteCanvasItem>
          ))}
        </InfiniteCanvasContent>
        <InfiniteCanvasControls />
      </InfiniteCanvas>
    </div>
  );
}
