"use client";

import { useState } from "react";
import { Input } from "@/components/control-ui/ui/input";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup, type ResizablePanelGroupLayout } from "@/components/control-ui/ui/resizable";
import { Toggle, ToggleGroup } from "@/components/control-ui/ui/toggle";
import { Text } from "@/components/control-ui/ui/typography";

function Pane({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
      <Text weight="medium">{label}</Text>
      {hint ? (
        <Text size="caption" tone="muted">
          {hint}
        </Text>
      ) : null}
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

function NotePane({ label }: { label: string }) {
  return (
    <div className="flex h-full flex-1 flex-col justify-center gap-2 p-3">
      <Text weight="medium">{label}</Text>
      <Input size="sm" aria-label={`${label} note`} placeholder="Type, then switch layout" />
    </div>
  );
}

export function PrimitiveResizableLayoutExample() {
  const [layout, setLayout] = useState<ResizablePanelGroupLayout>("resizable");
  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <ToggleGroup
        aria-label="Panel layout"
        value={[layout]}
        onValueChange={([next]) => {
          if (next) setLayout(next);
        }}
      >
        <Toggle value="resizable">Resizable</Toggle>
        <Toggle value="static">Static</Toggle>
        <Toggle value="contents">Contents</Toggle>
      </ToggleGroup>
      <div className="flex h-80 flex-col gap-3">
        <ResizablePanelGroup layout={layout} className={layout === "static" ? "gap-3" : undefined}>
          <ResizablePanel defaultSize="30%" minSize="20%">
            <NotePane label="Camera" />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize="40%" minSize="20%">
            <NotePane label="Screen" />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize="30%" minSize="20%">
            <NotePane label="Notes" />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
