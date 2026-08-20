"use client";

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { createContext, use, useRef, useState } from "react";
import type {
  DockablePanelActionsProps,
  DockablePanelCloseProps,
  DockablePanelContentProps,
  DockablePanelDockProps,
  DockablePanelDragHandleProps,
  DockablePanelHeaderProps,
  DockablePanelPlacement,
  DockablePanelProps,
  DockablePanelTitleProps,
  DockablePanelToggleProps,
} from "@/components/control-ui/contracts";
import { useIsMobile } from "@/components/control-ui/hooks/use-mobile";
import type { DockablePanelKnobStyle } from "@/components/control-ui/knob-contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { Button } from "@/components/control-ui/ui/button";
import { Drawer, DrawerContent } from "@/components/control-ui/ui/drawer";
import { clampDockablePanelPosition, dockablePanelSideAt, oppositeDockablePanelSide } from "./dockable-panel-geometry";

type DockablePanelContextValue = {
  close: () => void;
  dragging: boolean;
  isMobile: boolean;
  placement: DockablePanelPlacement;
  setPlacement: (placement: DockablePanelPlacement) => void;
  togglePlacement: () => void;
  dragHandleProps: {
    onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
    onPointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => void;
    onPointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => void;
    onPointerCancel: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  };
};

const DockablePanelContext = createContext<DockablePanelContextValue | null>(null);

function useDockablePanelContext() {
  const context = use(DockablePanelContext);
  if (!context) throw new Error("DockablePanel parts must be used inside DockablePanel.");
  return context;
}

function useControllableState<T>(controlled: T | undefined, defaultValue: T, onChange?: (value: T) => void) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const value = controlled ?? uncontrolled;
  function setValue(next: T) {
    if (controlled === undefined) setUncontrolled(next);
    onChange?.(next);
  }
  return [value, setValue] as const;
}

export function DockablePanel({
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  placement: placementProp,
  defaultPlacement = "right",
  onPlacementChange,
  className,
  style,
  children,
  "aria-label": ariaLabel = "Dockable panel",
  ...props
}: DockablePanelProps) {
  const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange);
  const [placement, setPlacementState] = useControllableState(placementProp, defaultPlacement, onPlacementChange);
  const [dragging, setDragging] = useState(false);
  const [potentialDock, setPotentialDock] = useState<DockablePanelPlacement>(placement);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [dragHeight, setDragHeight] = useState(0);
  const isMobile = useIsMobile();
  const panelRef = useRef<HTMLElement>(null);
  const potentialDockRef = useRef<DockablePanelPlacement>(placement);
  const dragRef = useRef<{ pointerId: number; offsetX: number; offsetY: number } | null>(null);

  function setPlacement(next: DockablePanelPlacement) {
    setPlacementState(next);
  }

  function togglePlacement() {
    setPlacement(oppositeDockablePanelSide(placement));
  }

  function close() {
    setOpen(false);
  }

  function finishDrag(event: ReactPointerEvent<HTMLButtonElement>, shouldDock: boolean) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (shouldDock) setPlacement(potentialDockRef.current);
    dragRef.current = null;
    setDragPosition(null);
    setDragHeight(0);
    setDragging(false);
  }

  function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.button !== 0 || isMobile) return;
    const panel = panelRef.current;
    const container = panel?.offsetParent;
    if (!(container instanceof HTMLElement) || !panel) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const panelRect = panel.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    dragRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - panelRect.left,
      offsetY: event.clientY - panelRect.top,
    };
    potentialDockRef.current = placement;
    setPotentialDock(placement);
    setDragPosition({ x: panelRect.left - containerRect.left, y: panelRect.top - containerRect.top });
    setDragHeight(panelRect.height);
    setDragging(true);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    const panel = panelRef.current;
    const container = panel?.offsetParent;
    if (!drag || drag.pointerId !== event.pointerId || !(container instanceof HTMLElement) || !panel) return;

    const bounds = container.getBoundingClientRect();
    const nextDock = dockablePanelSideAt(event.clientX - bounds.left, bounds.width);
    potentialDockRef.current = nextDock;
    setPotentialDock(nextDock);
    setDragPosition(
      clampDockablePanelPosition(
        { x: event.clientX - bounds.left - drag.offsetX, y: event.clientY - bounds.top - drag.offsetY },
        { width: bounds.width, height: bounds.height },
        { width: panel.offsetWidth, height: panel.offsetHeight },
      ),
    );
  }

  function onPointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    finishDrag(event, true);
  }

  function onPointerCancel(event: ReactPointerEvent<HTMLButtonElement>) {
    finishDrag(event, false);
  }

  const context: DockablePanelContextValue = {
    close,
    dragging,
    isMobile,
    placement,
    setPlacement,
    togglePlacement,
    dragHandleProps: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
  };
  const dropZoneStyle = dragging
    ? ({
        height: dragHeight,
        "--dockable-panel-drop-zone-active-background": style?.["--dockable-panel-drop-zone-active-background"],
        "--dockable-panel-drop-zone-active-border-color": style?.["--dockable-panel-drop-zone-active-border-color"],
      } satisfies CSSProperties & DockablePanelKnobStyle)
    : undefined;

  if (isMobile) {
    return (
      <DockablePanelContext.Provider value={context}>
        <Drawer open={open} onOpenChange={setOpen} side="bottom">
          <DrawerContent
            data-dockable-panel-root=""
            data-placement={placement}
            padding="none"
            variant="floating"
            surface="card"
            aria-label={ariaLabel}
            className={cn("max-h-[min(82vh,42rem)] gap-0 overflow-hidden", className)}
            style={style}
            {...props}
          >
            {children}
          </DrawerContent>
        </Drawer>
      </DockablePanelContext.Provider>
    );
  }

  if (!open) return null;

  return (
    <DockablePanelContext.Provider value={context}>
      {dragging ? (
        <>
          <DockablePanelDropZone side="left" active={potentialDock === "left"} style={dropZoneStyle} />
          <DockablePanelDropZone side="right" active={potentialDock === "right"} style={dropZoneStyle} />
        </>
      ) : null}
      <aside
        ref={panelRef}
        data-control-ui="dockable-panel"
        data-control-family="dockable-panel"
        data-slot="root"
        data-surface="panel"
        data-placement={placement}
        data-dragging={dragging ? "true" : undefined}
        aria-label={ariaLabel}
        className={cn(
          "absolute z-30 flex w-[min(22rem,calc(50%_-_1.125rem))] flex-col overflow-hidden",
          !dragging && placement === "left" && "top-3 left-3 max-h-[calc(100%_-_1.5rem)]",
          !dragging && placement === "right" && "top-3 right-3 max-h-[calc(100%_-_1.5rem)]",
          dragging && "top-0 left-0 max-h-[calc(100%_-_1.5rem)]",
          dragging && "select-none",
          className,
        )}
        style={dragging && dragPosition ? { ...style, transform: `translate3d(${dragPosition.x}px, ${dragPosition.y}px, 0)` } : style}
        {...props}
      >
        {children}
        <span className="sr-only" aria-live="polite">
          Panel docked {placement}.
        </span>
      </aside>
    </DockablePanelContext.Provider>
  );
}

export function DockablePanelHeader({ className, ...props }: DockablePanelHeaderProps) {
  return (
    <div
      data-control-ui="dockable-panel"
      data-control-family="dockable-panel"
      data-slot="header"
      className={cn("flex min-h-11 shrink-0 items-center gap-2 px-2", className)}
      {...props}
    />
  );
}

export function DockablePanelDragHandle({
  className,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  children,
  ...props
}: DockablePanelDragHandleProps) {
  const context = useDockablePanelContext();
  if (context.isMobile) {
    return (
      <div
        data-control-ui="dockable-panel"
        data-control-family="dockable-panel"
        data-slot="drag-handle"
        className={cn("flex min-w-0 flex-1 items-center self-stretch px-2", className)}
      >
        {children}
      </div>
    );
  }

  return (
    <button
      type="button"
      data-control-ui="dockable-panel"
      data-control-family="dockable-panel"
      data-slot="drag-handle"
      aria-label="Drag panel"
      aria-pressed={context.dragging}
      className={cn("flex min-w-0 flex-1 cursor-grab touch-none items-center self-stretch px-2 active:cursor-grabbing", className)}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (!event.defaultPrevented) context.dragHandleProps.onPointerDown(event);
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        if (!event.defaultPrevented) context.dragHandleProps.onPointerMove(event);
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event);
        if (!event.defaultPrevented) context.dragHandleProps.onPointerUp(event);
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event);
        if (!event.defaultPrevented) context.dragHandleProps.onPointerCancel(event);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export function DockablePanelTitle({ className, ...props }: DockablePanelTitleProps) {
  return (
    <h2
      data-control-ui="dockable-panel"
      data-control-family="dockable-panel"
      data-slot="title"
      className={cn("truncate", className)}
      {...props}
    />
  );
}

export function DockablePanelActions({ className, ...props }: DockablePanelActionsProps) {
  return (
    <div
      data-control-ui="dockable-panel"
      data-control-family="dockable-panel"
      data-slot="actions"
      className={cn("ml-auto flex shrink-0 items-center gap-0.5", className)}
      {...props}
    />
  );
}

export function DockablePanelToggle({ className, children, "aria-label": ariaLabel, onClick, ...props }: DockablePanelToggleProps) {
  const { isMobile, placement, togglePlacement } = useDockablePanelContext();
  if (isMobile) return null;
  const target = oppositeDockablePanelSide(placement);
  const label = `Move panel to ${target}`;
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      iconOnly
      aria-label={ariaLabel ?? label}
      title={label}
      data-control-ui="dockable-panel"
      data-control-family="button"
      data-slot="toggle"
      className={className}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) togglePlacement();
      }}
      {...props}
    >
      {children ?? <DockPanelIcon side={target} />}
    </Button>
  );
}

export function DockablePanelDock({
  placement: nextPlacement,
  className,
  children,
  "aria-label": ariaLabel,
  onClick,
  ...props
}: DockablePanelDockProps) {
  const { isMobile, placement, setPlacement } = useDockablePanelContext();
  if (isMobile) return null;
  const label = `Dock panel ${nextPlacement}`;
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      iconOnly
      active={placement === nextPlacement}
      aria-pressed={placement === nextPlacement}
      aria-label={ariaLabel ?? label}
      title={label}
      data-control-ui="dockable-panel"
      data-control-family="button"
      data-slot="dock"
      className={className}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setPlacement(nextPlacement);
      }}
      {...props}
    >
      {children ?? <PlacementIcon placement={nextPlacement} />}
    </Button>
  );
}

export function DockablePanelClose({
  className,
  children,
  "aria-label": ariaLabel = "Close panel",
  onClick,
  ...props
}: DockablePanelCloseProps) {
  const { close } = useDockablePanelContext();
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      iconOnly
      aria-label={ariaLabel}
      title={ariaLabel}
      data-control-ui="dockable-panel"
      data-control-family="button"
      data-slot="close"
      className={className}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) close();
      }}
      {...props}
    >
      {children ?? <CloseIcon />}
    </Button>
  );
}

export function DockablePanelContent({ padding = "default", className, ...props }: DockablePanelContentProps) {
  return (
    <div
      data-control-ui="dockable-panel"
      data-control-family="dockable-panel"
      data-slot="content"
      data-padding={padding}
      className={cn("min-h-0 flex-1 overflow-y-auto", padding === "default" && "p-3", className)}
      {...props}
    />
  );
}

function DockablePanelDropZone({
  side,
  active,
  style,
}: {
  side: "left" | "right";
  active: boolean;
  style?: CSSProperties & DockablePanelKnobStyle;
}) {
  return (
    <div
      data-control-ui="dockable-panel"
      data-control-family="dockable-panel"
      data-slot="drop-zone"
      data-surface="panel"
      data-side={side}
      data-active={active ? "true" : undefined}
      className={cn("pointer-events-none absolute top-3 z-20 w-[min(22rem,calc(50%_-_1.125rem))]", side === "left" ? "left-3" : "right-3")}
      style={style}
    />
  );
}

function PlacementIcon({ placement }: { placement: DockablePanelPlacement }) {
  return <DockPanelIcon side={placement} />;
}

function DockPanelIcon({ side = "right" }: { side?: "left" | "right" }) {
  return (
    <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden="true">
      <rect x="2.25" y="2.25" width="11.5" height="11.5" rx="2" stroke="currentColor" strokeWidth="1.25" />
      <path d={side === "left" ? "M6 2.75v10.5" : "M10 2.75v10.5"} stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden="true">
      <path d="m4.5 4.5 7 7m0-7-7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
