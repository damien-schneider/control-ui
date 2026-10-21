import { Profiler } from "react";
import { createRoot } from "react-dom/client";
import {
  InfiniteCanvas,
  InfiniteCanvasContent,
  InfiniteCanvasControls,
  InfiniteCanvasItem,
} from "../../src/registry/sources/control-ui/ui/infinite-canvas";

const cards = Array.from({ length: 300 }, (_, index) => ({ id: index, x: (index % 20) * 160, y: Math.floor(index / 20) * 120 }));

const root = document.getElementById("root");
if (!root) throw new Error("Infinite canvas fixture root is missing");
createRoot(root).render(
  <main style={{ width: 1000, margin: "40px auto" }}>
    <InfiniteCanvas
      aria-label="Performance canvas"
      className="h-150 w-full"
      onTransformChange={() => performance.mark("canvas-transform-change")}
    >
      <InfiniteCanvasContent>
        <Profiler id="canvas-items" onRender={() => performance.mark("canvas-item-render")}>
          {cards.map((card) => (
            <InfiniteCanvasItem key={card.id} x={card.x} y={card.y} className="w-36 rounded-md bg-card p-3 ring-1 ring-border">
              Card {card.id}
            </InfiniteCanvasItem>
          ))}
        </Profiler>
      </InfiniteCanvasContent>
      <InfiniteCanvasControls />
    </InfiniteCanvas>
  </main>,
);
