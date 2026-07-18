"use client";

// Three-region layout (sidebar/editor/console) on react-resizable-panels v4; right panel nests a
// vertical group uses the nested variant to stay inside one surface. Sidebar collapsible: drag past
// minSize to snap shut. v4 gotcha: number=px, string=%, so percentages are quoted ("26%") unlike v2.
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/control-ui/ui/resizable";

function Pane({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1 p-4 text-center">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {hint ? <span className="text-[11px] text-muted-foreground">{hint}</span> : null}
    </div>
  );
}

export function PrimitiveResizableExample() {
  return (
    <div className="h-72 w-full max-w-2xl">
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize="26%" minSize="15%" collapsible collapsedSize="0%">
          <Pane label="Sidebar" hint="Drag past the edge to collapse" />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="74%">
          <ResizablePanelGroup orientation="vertical" variant="nested">
            <ResizablePanel defaultSize="64%">
              <Pane label="Editor" />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize="36%" minSize="15%">
              <Pane label="Console" hint="Drag the handle above to resize" />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
