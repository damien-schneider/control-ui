"use client";

import { cva } from "class-variance-authority";
import { createContext, useContext } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import type { ResizableHandleProps, ResizablePanelGroupProps, ResizablePanelProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

// react-resizable-panels v4 throughout: handle styles off library's own data-separator state machine, holding no JS state here.
// Both variants keep same 1px track and grip footprint, so neither variant nor orientation ever shifts layout.

type Orientation = "horizontal" | "vertical";
const OrientationContext = createContext<Orientation>("horizontal");

// hairline's own direction, not the group's: horizontal group stacks panels sideways, so its separator is vertical
const handleVariants = cva(
  [
    "relative flex items-center justify-center outline-none",
    "[--resizable-grip-length:--spacing(5)] [--resizable-grip-thickness:--spacing(3.5)] [--resizable-handle-color:var(--foreground)]",
    "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
    "data-[separator=focus]:ring-2 data-[separator=focus]:ring-foreground/20 data-[separator=disabled]:opacity-50",
  ],
  {
    variants: {
      axis: {
        vertical: "w-px",
        horizontal: "h-px",
      },
      variant: {
        solid:
          "bg-border data-[separator=hover]:bg-foreground/25 data-[separator=focus]:bg-foreground/25 data-[separator=active]:bg-foreground/40",
        // gradient rides pseudo-element, so revealing it costs one opacity transition and no layout
        hover: [
          "before:absolute before:inset-0 before:opacity-0 before:content-['']",
          "before:transition-opacity before:duration-[var(--duration-base)] before:ease-[var(--ease-standard)]",
          "data-[separator=hover]:before:opacity-100 data-[separator=focus]:before:opacity-100 data-[separator=active]:before:opacity-100",
        ],
      },
    },
    compoundVariants: [
      // alpha-only fade: `to-transparent` interpolates toward transparent BLACK and greys line out in dark mode
      {
        variant: "hover",
        axis: "vertical",
        class: "before:bg-linear-to-b before:from-(--resizable-handle-color) before:to-[oklch(from_var(--resizable-handle-color)_l_c_h/0)]",
      },
      {
        variant: "hover",
        axis: "horizontal",
        class: "before:bg-linear-to-r before:from-(--resizable-handle-color) before:to-[oklch(from_var(--resizable-handle-color)_l_c_h/0)]",
      },
    ],
    defaultVariants: { axis: "vertical", variant: "solid" },
  },
);

// absolutely centred, never flex child: inside a 1px separator flex child shrinks to 1px on cross axis
const gripVariants = cva(
  [
    "absolute top-1/2 left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center",
    "rounded-[var(--radius-control)] border border-border bg-card text-muted-foreground shadow-sm",
    "transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
  ],
  {
    variants: {
      axis: {
        vertical: "h-(--resizable-grip-length) w-(--resizable-grip-thickness)",
        horizontal: "h-(--resizable-grip-thickness) w-(--resizable-grip-length)",
      },
      variant: {
        solid: "",
        // same reveal contract as line, read off separator one level up
        hover:
          "opacity-0 in-data-[separator=hover]:opacity-100 in-data-[separator=focus]:opacity-100 in-data-[separator=active]:opacity-100",
      },
    },
    defaultVariants: { axis: "vertical", variant: "solid" },
  },
);

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

export function ResizableHandle({ className, variant = "solid", withHandle, children, ...props }: ResizableHandleProps) {
  const orientation = useContext(OrientationContext);
  const axis = orientation === "horizontal" ? "vertical" : "horizontal";
  return (
    <Separator
      data-control-ui="resizable"
      data-slot="handle"
      data-variant={variant}
      className={cn(handleVariants({ axis, variant }), skinSlot("resizable", "handle", { orientation, variant }), className)}
      {...props}
    >
      {withHandle ? (
        <span
          data-control-ui="resizable"
          data-slot="handle-grip"
          className={cn(gripVariants({ axis, variant }), skinSlot("resizable", "handle-grip", { orientation, variant }))}
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
