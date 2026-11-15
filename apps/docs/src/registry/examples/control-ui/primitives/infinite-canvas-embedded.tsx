"use client";

import { Badge } from "@/components/control-ui/ui/badge";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/control-ui/ui/card";
import {
  InfiniteCanvas,
  InfiniteCanvasContent,
  InfiniteCanvasControls,
  InfiniteCanvasItem,
} from "@/components/control-ui/ui/infinite-canvas";

const pipelineSteps = [
  { id: "install", title: "Install dependencies", detail: "bun install, 14s", x: 0, y: 0 },
  { id: "build", title: "Build application", detail: "next build, 52s", x: 260, y: 48 },
  { id: "deploy", title: "Deploy preview", detail: "Waiting for build", x: 520, y: 96 },
];

export function PrimitiveInfiniteCanvasEmbeddedExample() {
  return (
    <Card className="w-full max-w-3xl overflow-hidden">
      <CardHeader>
        <CardTitle>Release pipeline</CardTitle>
        <CardAction>
          <Badge>3 steps</Badge>
        </CardAction>
      </CardHeader>
      <InfiniteCanvas
        chrome="embedded"
        aria-label="Release pipeline canvas"
        className="h-80 w-full"
        defaultTransform={{ x: 32, y: 48, scale: 1 }}
      >
        <InfiniteCanvasContent>
          {pipelineSteps.map((step) => (
            <InfiniteCanvasItem key={step.id} x={step.x} y={step.y} className="w-52">
              <Card size="sm">
                <CardHeader>
                  <CardTitle>{step.title}</CardTitle>
                  <CardDescription>{step.detail}</CardDescription>
                </CardHeader>
              </Card>
            </InfiniteCanvasItem>
          ))}
        </InfiniteCanvasContent>
        <InfiniteCanvasControls />
      </InfiniteCanvas>
    </Card>
  );
}
