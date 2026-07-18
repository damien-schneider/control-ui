"use client";

import { createContext, useContext } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import type { ResizableHandleProps, ResizablePanelGroupProps, ResizablePanelProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

// Refined skin slot, 100% react-resizable-panels v4 (Group/Panel/Separator): drag-to-resize on Control UI tokens.
// Group = framed --radius-panel surface (lib forces overflow:hidden, clips flush); Panel className lands on lib's inner scroll box; Handle styled off lib's own data-separator state machine, no JS state of ours.
// Orientation flows via context so Handle draws right axis (horizontal group → vertical dividers, vice versa).

type Orientation = "horizontal" | "vertical";
const OrientationContext = createContext<Orientation>("horizontal");

export function ResizablePanelGroup({
  className,
  orientation = "horizontal",
  variant = "framed",
  children,
  ...props
}: ResizablePanelGroupProps) {
  return (
    <OrientationContext.Provider value={orientation}>
      <Group
        data-control-ui="resizable"
        data-slot="panel-group"
        data-surface="panel"
        data-variant={variant}
        orientation={orientation}
        className={cn(
          "flex h-full w-full bg-card text-card-foreground",
          variant === "framed" && "rounded-[var(--radius-panel)] border border-border shadow-sm",
          skinSlot("resizable", "panel-group", { orientation, variant }),
          className,
        )}
        {...props}
      >
        {children}
      </Group>
    </OrientationContext.Provider>
  );
}

export function ResizablePanel({ className, ...props }: ResizablePanelProps) {
  return <Panel data-control-ui="resizable" data-slot="panel" className={cn(skinSlot("resizable", "panel", {}), className)} {...props} />;
}

export function ResizableHandle({ className, withHandle, children, ...props }: ResizableHandleProps) {
  const orientation = useContext(OrientationContext);
  // A horizontal group stacks panels left↔right, so the separator between them is a vertical hairline.
  const isVerticalDivider = orientation === "horizontal";
  return (
    <Separator
      data-control-ui="resizable"
      data-slot="handle"
      className={cn(
        "relative flex shrink-0 items-center justify-center bg-border outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
        isVerticalDivider ? "w-px" : "h-px",
        "data-[separator=hover]:bg-foreground/25 data-[separator=active]:bg-foreground/40",
        "data-[separator=focus]:bg-foreground/25 data-[separator=focus]:ring-2 data-[separator=focus]:ring-foreground/20",
        "data-[separator=disabled]:opacity-50",
        skinSlot("resizable", "handle", { orientation }),
        className,
      )}
      {...props}
    >
      {withHandle ? (
        <span
          data-control-ui="resizable"
          data-slot="handle-grip"
          className={cn(
            "z-10 flex items-center justify-center rounded-[var(--radius-control)] border border-border bg-card text-muted-foreground shadow-sm",
            isVerticalDivider ? "h-5 w-3.5" : "h-3.5 w-5",
            skinSlot("resizable", "handle-grip", {}),
          )}
        >
          <GripIcon className={isVerticalDivider ? undefined : "rotate-90"} />
        </span>
      ) : null}
      {children}
    </Separator>
  );
}

function GripIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 4 16" width="4" height="16" fill="currentColor" aria-hidden="true" className={className}>
      <circle cx="2" cy="3" r="1" />
      <circle cx="2" cy="8" r="1" />
      <circle cx="2" cy="13" r="1" />
    </svg>
  );
}
