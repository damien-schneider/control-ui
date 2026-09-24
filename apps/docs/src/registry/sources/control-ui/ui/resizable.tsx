"use client";

import type { ComponentProps, CSSProperties, KeyboardEvent, PointerEvent as ReactPointerEvent, Ref } from "react";
import { createContext, useContext, useRef, useState } from "react";
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

export type ResizableFloatingPanelSide = "left" | "right";

export type ResizableSeparatorState = "inactive" | "hover" | "focus" | "active";

type ResizableFloatingPanelStyle = CSSProperties & ResizableKnobStyle & { "--resizable-floating-width"?: string };

export type ResizableFloatingPanelProps = Omit<ComponentProps<"div">, "style"> & {
  side?: ResizableFloatingPanelSide;
  size?: number;
  defaultSize?: number;
  onSizeChange?: (size: number) => void;
  minSize?: number;
  maxSize?: number;
  handleVariant?: ResizableHandleVariant;
  handleLabel?: string;
  style?: ResizableFloatingPanelStyle;
};

type Orientation = "horizontal" | "vertical";
type ResizableGroupContextValue = { orientation: Orientation; disableCursor: boolean };
const ResizableGroupContext = createContext<ResizableGroupContextValue>({ orientation: "horizontal", disableCursor: false });

type FloatingResizeSession = { pointerId: number; startX: number; startSize: number };

const FLOATING_KEYBOARD_STEP_PX = 10;
const FLOATING_ARROW_DIRECTIONS: Partial<Record<string, number>> = { ArrowLeft: -1, ArrowRight: 1 };

export function ResizablePanelGroup({
  className,
  orientation = "horizontal",
  variant = "framed",
  disableCursor = false,
  children,
  ...props
}: ResizablePanelGroupProps) {
  return (
    <ResizableGroupContext.Provider value={{ orientation, disableCursor }}>
      <Group
        data-control-ui="resizable"
        data-control-family="resizable"
        data-slot="panel-group"
        data-surface="panel"
        data-variant={variant}
        orientation={orientation}
        disableCursor
        className={cn("flex h-full w-full", className)}
        {...props}
      >
        {children}
      </Group>
    </ResizableGroupContext.Provider>
  );
}

export function ResizablePanel({ className, ...props }: ResizablePanelProps) {
  return <Panel data-control-ui="resizable" data-control-family="resizable" data-slot="panel" className={className} {...props} />;
}

export function ResizableHandle({ className, variant = "solid", withHandle, children, ...props }: ResizableHandleProps) {
  const { orientation, disableCursor } = useContext(ResizableGroupContext);
  const axis = orientation === "horizontal" ? "vertical" : "horizontal";
  return (
    <Separator
      data-control-ui="resizable"
      data-control-family="resizable"
      data-slot="handle"
      data-variant={variant}
      data-axis={axis}
      data-cursor={disableCursor ? "none" : undefined}
      className={cn("relative flex items-center justify-center", axis === "vertical" ? "w-px touch-pan-y" : "h-px touch-pan-x", className)}
      {...props}
    >
      {withHandle ? (
        <span
          data-control-ui="resizable"
          data-control-family="resizable"
          data-slot="handle-grip"
          data-variant={variant}
          data-axis={axis}
          className="absolute top-1/2 left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
        >
          <GripIcon className={axis === "horizontal" ? "rotate-90" : undefined} />
        </span>
      ) : null}
      {children}
    </Separator>
  );
}

export function ResizableFloatingPanel({
  side = "right",
  size: controlledSize,
  defaultSize = 280,
  onSizeChange,
  minSize = 160,
  maxSize = 640,
  handleVariant = "hover",
  handleLabel = "Resize panel",
  className,
  style,
  children,
  ...props
}: ResizableFloatingPanelProps) {
  const [uncontrolledSize, setUncontrolledSize] = useState(defaultSize);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [resizing, setResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<FloatingResizeSession | null>(null);
  const size = controlledSize ?? uncontrolledSize;
  const growthPerPointerPx = side === "right" ? -1 : 1;

  function changeSize(next: number) {
    const clamped = Math.round(Math.min(Math.max(next, minSize), maxSize));
    if (clamped === size) return;
    if (controlledSize === undefined) setUncontrolledSize(clamped);
    onSizeChange?.(clamped);
  }

  function beginResize(event: ReactPointerEvent<HTMLDivElement>) {
    const panel = panelRef.current;
    if (!panel || !event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeRef.current = { pointerId: event.pointerId, startX: event.clientX, startSize: panel.getBoundingClientRect().width };
    setResizing(true);
  }

  function updateResize(event: ReactPointerEvent<HTMLDivElement>) {
    const session = resizeRef.current;
    if (session?.pointerId !== event.pointerId) return;
    changeSize(session.startSize + (event.clientX - session.startX) * growthPerPointerPx);
  }

  function endResize(event: ReactPointerEvent<HTMLDivElement>) {
    if (resizeRef.current?.pointerId !== event.pointerId) return;
    resizeRef.current = null;
    setResizing(false);
  }

  function resizeWithKeyboard(event: KeyboardEvent<HTMLDivElement>) {
    const arrowDirection = FLOATING_ARROW_DIRECTIONS[event.key];
    const step = event.shiftKey ? FLOATING_KEYBOARD_STEP_PX * 5 : FLOATING_KEYBOARD_STEP_PX;
    if (arrowDirection) changeSize(size + arrowDirection * step * growthPerPointerPx);
    else if (event.key === "Home") changeSize(minSize);
    else if (event.key === "End") changeSize(maxSize);
    else return;
    event.preventDefault();
  }

  let separatorState: ResizableSeparatorState = "inactive";
  if (resizing) separatorState = "active";
  else if (focused) separatorState = "focus";
  else if (hovered) separatorState = "hover";

  const panelStyle: ResizableFloatingPanelStyle = { ...style, "--resizable-floating-width": `${size}px` };

  return (
    <div
      ref={panelRef}
      {...props}
      data-control-ui="resizable"
      data-control-family="resizable"
      data-slot="floating"
      data-side={side}
      className={cn(
        "absolute inset-y-2 isolate flex w-(--resizable-floating-width) max-w-[calc(100%-1rem)] flex-col",
        side === "right" ? "right-2" : "left-2",
        className,
      )}
      style={panelStyle}
    >
      <div
        aria-hidden="true"
        data-control-ui="resizable"
        data-control-family="popup"
        data-popup-kind="resizable"
        data-popup-part="surface"
        data-popup-static=""
        data-surface="floating"
        data-slot="surface"
        className="pointer-events-none absolute inset-0 -z-1"
      />
      {children}
      {/* biome-ignore lint/a11y/useSemanticElements: focusable window splitter needs pointer and key handlers an <hr> cannot carry */}
      <div
        role="separator"
        tabIndex={0}
        aria-label={handleLabel}
        aria-orientation="vertical"
        aria-valuenow={size}
        aria-valuemin={minSize}
        aria-valuemax={maxSize}
        data-control-ui="resizable"
        data-control-family="resizable"
        data-slot="handle"
        data-variant={handleVariant}
        data-axis="vertical"
        data-separator={separatorState}
        className={cn(
          "absolute inset-y-0 w-px touch-none after:absolute after:inset-y-0 after:-inset-x-1 after:content-['']",
          side === "right" ? "left-0" : "right-0",
        )}
        onPointerDown={beginResize}
        onPointerMove={updateResize}
        onPointerUp={endResize}
        onPointerCancel={endResize}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={resizeWithKeyboard}
        onDoubleClick={() => changeSize(defaultSize)}
      />
    </div>
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
