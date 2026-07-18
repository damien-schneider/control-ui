"use client";

import { useState } from "react";
import { Button } from "@/components/control-ui/ui/button";
import {
  DockablePanel,
  DockablePanelActions,
  DockablePanelClose,
  DockablePanelContent,
  DockablePanelDock,
  DockablePanelDragHandle,
  DockablePanelHeader,
  DockablePanelTitle,
  DockablePanelToggle,
} from "@/components/control-ui/ui/dockable-panel";

export function PrimitiveDockablePanelExample() {
  const [open, setOpen] = useState(true);

  return (
    <div className="relative h-96 w-full overflow-hidden bg-canvas">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-radial-[circle_at_center,oklch(from_var(--foreground)_l_c_h/0.18)_1px,transparent_1px] bg-size-[18px_18px] opacity-50"
      />
      <div className="absolute top-3 left-3 z-10">
        <Button variant="surface" size="sm" onClick={() => setOpen(true)} disabled={open}>
          Open inspector
        </Button>
      </div>
      <div className="absolute top-24 left-1/2 h-36 w-52 -translate-x-1/2 rounded-[var(--radius-panel)] bg-primary/12 ring-1 ring-primary/30" />

      <DockablePanel open={open} onOpenChange={setOpen} aria-label="Selection inspector">
        <DockablePanelHeader>
          <DockablePanelDragHandle>
            <DockablePanelTitle>Selection</DockablePanelTitle>
          </DockablePanelDragHandle>
          <DockablePanelActions>
            <DockablePanelDock placement="left" />
            <DockablePanelDock placement="right" />
            <DockablePanelToggle />
            <DockablePanelClose />
          </DockablePanelActions>
        </DockablePanelHeader>
        <DockablePanelContent className="grid gap-3">
          <PanelRow label="Layer" value="Launch card" />
          <PanelRow label="Position" value="240, 128" />
          <PanelRow label="Size" value="320 × 180" />
          <p className="text-caption leading-relaxed text-muted-foreground">
            Drag the title to reveal both side slots, then release over either half or use the placement buttons.
          </p>
        </DockablePanelContent>
      </DockablePanel>
    </div>
  );
}

function PanelRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}
