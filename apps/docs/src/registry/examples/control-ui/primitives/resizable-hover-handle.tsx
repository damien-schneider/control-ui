"use client";

// variant="hover" keeps divider off screen until pointer or keyboard focus reaches it, then fades in a
// gradient line running from --resizable-handle-color to alpha 0 — calm option when permanent hairline
// would compete with content it separates. Track thickness matches variant="solid", so nothing shifts.
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/control-ui/ui/resizable";

function Pane({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1 p-4 text-center">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {hint ? <span className="text-[11px] text-muted-foreground">{hint}</span> : null}
    </div>
  );
}

export function PrimitiveResizableHoverHandleExample() {
  return (
    <div className="h-72 w-full max-w-2xl">
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize="30%" minSize="18%">
          <Pane label="Files" hint="Hover the divider to reveal it" />
        </ResizablePanel>
        <ResizableHandle variant="hover" />
        <ResizablePanel defaultSize="70%">
          <ResizablePanelGroup orientation="vertical" variant="nested">
            <ResizablePanel defaultSize="62%">
              <Pane label="Editor" />
            </ResizablePanel>
            <ResizableHandle variant="hover" withHandle />
            <ResizablePanel defaultSize="38%" minSize="18%">
              <Pane label="Terminal" hint="The grip fades in with the line" />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
