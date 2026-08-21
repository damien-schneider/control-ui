"use client";

import type { ComponentProps, CSSProperties, Ref } from "react";
import { createContext, useContext } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import type { ResizableKnobStyle } from "@/components/control-ui/knob-contracts/resizable-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type ResizableLayout = { [panelId: string]: number };

export type ResizablePanelGroupVariant = "framed" | "nested";

export type ResizableHandleVariant = "solid" | "hover";

export type ResizablePanelGroupProps = Omit<ComponentProps<"div">, "style"> & {
  orientation?: "horizontal" | "vertical";
  variant?: ResizablePanelGroupVariant;
  defaultLayout?: ResizableLayout;
  disableCursor?: boolean;
  disabled?: boolean;
  onLayoutChange?: (layout: ResizableLayout) => void;
  onLayoutChanged?: (layout: ResizableLayout, meta: { isUserInteraction: boolean }) => void;
  style?: CSSProperties & ResizableKnobStyle;
};

export type ResizablePanelSize = { asPercentage: number; inPixels: number };

export interface ResizablePanelHandle {
  collapse: () => void;
  expand: () => void;
  getSize: () => ResizablePanelSize;
  isCollapsed: () => boolean;
  resize: (size: number | string) => void;
}

export type ResizablePanelProps = Omit<ComponentProps<"div">, "onResize"> & {
  defaultSize?: number | string;
  minSize?: number | string;
  maxSize?: number | string;
  collapsible?: boolean;
  collapsedSize?: number | string;
  groupResizeBehavior?: "preserve-relative-size" | "preserve-pixel-size";
  disabled?: boolean;
  panelRef?: Ref<ResizablePanelHandle>;
  onResize?: (size: ResizablePanelSize, id: string | number | undefined, prevSize: ResizablePanelSize | undefined) => void;
} & { style?: CSSProperties & ResizableKnobStyle };

export type ResizableHandleProps = Omit<ComponentProps<"div">, "role" | "tabIndex" | "style"> & {
  variant?: ResizableHandleVariant;
  withHandle?: boolean;
  disabled?: boolean;
  disableDoubleClick?: boolean;
  style?: CSSProperties & ResizableKnobStyle;
};

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
