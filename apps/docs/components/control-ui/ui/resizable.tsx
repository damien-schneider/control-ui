"use client";

import { createContext, useContext } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import type { ResizableHandleProps, ResizablePanelGroupProps, ResizablePanelProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";

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
        data-control-family="resizable"
        data-slot="panel-group"
        data-surface="panel"
        data-variant={variant}
        orientation={orientation}
        className={cn("flex h-full w-full", className)}
        {...props}
      >
        {children}
      </Group>
    </OrientationContext.Provider>
  );
}

export function ResizablePanel({ className, ...props }: ResizablePanelProps) {
  return <Panel data-control-ui="resizable" data-control-family="resizable" data-slot="panel" className={className} {...props} />;
}

export function ResizableHandle({ className, variant = "solid", withHandle, children, ...props }: ResizableHandleProps) {
  const orientation = useContext(OrientationContext);
  const axis = orientation === "horizontal" ? "vertical" : "horizontal";
  return (
    <Separator
      data-control-ui="resizable"
      data-control-family="resizable"
      data-slot="handle"
      data-variant={variant}
      data-axis={axis}
      className={cn("relative flex items-center justify-center", axis === "vertical" ? "w-px" : "h-px", className)}
      {...props}
    >
      {withHandle ? (
        <span
          data-control-ui="resizable"
          data-control-family="resizable"
          data-slot="handle-grip"
          data-variant={variant}
          data-axis={axis}
          className={cn(
            "absolute top-1/2 left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center",
            axis === "vertical" ? "h-5 w-3.5" : "h-3.5 w-5",
          )}
        >
          <GripIcon className={axis === "horizontal" ? "rotate-90" : undefined} />
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
