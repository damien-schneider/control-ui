"use client";

import { ResizableFloatingPanel } from "@/components/control-ui/ui/resizable";

export function PrimitiveResizableFloatingExample() {
  return (
    <div className="relative h-80 w-full max-w-3xl overflow-hidden rounded-(--radius-panel) bg-canvas">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-radial-[circle_at_center,oklch(from_var(--foreground)_l_c_h/0.18)_1px,transparent_1px] bg-size-[18px_18px] opacity-50"
      />
      <ResizableFloatingPanel defaultSize={240} minSize={200} maxSize={400}>
        <div className="flex flex-col gap-1 p-4">
          <span className="text-sm font-medium text-foreground">Inspector</span>
          <span className="text-caption text-muted-foreground">Drag the left edge or focus it and use the arrow keys.</span>
        </div>
      </ResizableFloatingPanel>
    </div>
  );
}
