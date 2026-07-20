"use client";

import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { createContext, use, useRef, useState } from "react";
import type {
  AgentTeamViewAgentProps,
  AgentTeamViewPosition,
  AgentTeamViewProps,
  AgentTeamViewZoneContentProps,
  AgentTeamViewZoneDetailsProps,
  AgentTeamViewZoneDragHandleProps,
  AgentTeamViewZoneProps,
  AgentTeamViewZoneTitleProps,
} from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";
import { agentTeamViewPositionFromDrag } from "./ui/agent-team-view-geometry";
import { useInfiniteCanvas } from "./ui/infinite-canvas";

const DRAG_THRESHOLD = 5;
const KEYBOARD_STEP = 12;
const KEYBOARD_LARGE_STEP = 48;

type AgentTeamViewZoneStyle = CSSProperties & {
  "--agent-team-zone-x": string;
  "--agent-team-zone-y": string;
};

type AgentTeamViewDragSession = {
  pointerId: number;
  startPointer: AgentTeamViewPosition;
  startPosition: AgentTeamViewPosition;
  nextPosition: AgentTeamViewPosition;
  dragged: boolean;
};

type AgentTeamViewZoneContextValue = {
  label: string;
  selected: boolean;
  dragging: boolean;
  disabled: boolean;
  movable: boolean;
  select: () => void;
  suppressClickUntilRef: { current: number };
  moveByKeyboard: (event: ReactKeyboardEvent<HTMLButtonElement>) => void;
  dragHandleProps: {
    onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
    onPointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => void;
    onPointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => void;
    onPointerCancel: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  };
};

const AgentTeamViewContext = createContext(false);
const AgentTeamViewZoneContext = createContext<AgentTeamViewZoneContextValue | null>(null);

function useAgentTeamViewContext() {
  const context = use(AgentTeamViewContext);
  if (!context) throw new Error("AgentTeamView parts must be used within AgentTeamView");
}

function useAgentTeamViewZoneContext() {
  const context = use(AgentTeamViewZoneContext);
  if (!context) throw new Error("AgentTeamView zone parts must be used within AgentTeamViewZone");
  return context;
}

function writeZonePosition(zone: HTMLElement, position: AgentTeamViewPosition) {
  zone.style.setProperty("--agent-team-zone-x", `${position.x}px`);
  zone.style.setProperty("--agent-team-zone-y", `${position.y}px`);
}

function moveFromArrowKey(event: ReactKeyboardEvent<HTMLButtonElement>, position: AgentTeamViewPosition): AgentTeamViewPosition | null {
  const step = event.shiftKey ? KEYBOARD_LARGE_STEP : KEYBOARD_STEP;
  switch (event.key) {
    case "ArrowLeft":
      return { x: position.x - step, y: position.y };
    case "ArrowRight":
      return { x: position.x + step, y: position.y };
    case "ArrowUp":
      return { x: position.x, y: position.y - step };
    case "ArrowDown":
      return { x: position.x, y: position.y + step };
    default:
      return null;
  }
}

export function AgentTeamView({ className, children, "aria-label": ariaLabel = "Agent teams", ...props }: AgentTeamViewProps) {
  return (
    <AgentTeamViewContext.Provider value={true}>
      <section
        {...props}
        data-control-ui="agent-team-view"
        data-slot="root"
        aria-label={ariaLabel}
        className={cn(
          "pointer-events-none absolute top-0 left-0 h-0 w-0 [&_[data-slot=zone]]:pointer-events-auto",
          skinSlot("agent-team-view", "root", {}),
          className,
        )}
      >
        {children}
      </section>
    </AgentTeamViewContext.Provider>
  );
}

export function AgentTeamViewZone({
  label,
  position,
  selected = false,
  disabled = false,
  onSelect,
  onPositionChange,
  className,
  style,
  children,
  "aria-label": ariaLabel = `${label} team zone`,
  ...props
}: AgentTeamViewZoneProps) {
  useAgentTeamViewContext();
  const canvas = useInfiniteCanvas();
  const zoneRef = useRef<HTMLElement>(null);
  const dragRef = useRef<AgentTeamViewDragSession | null>(null);
  const suppressClickUntilRef = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const movable = !disabled && onPositionChange !== undefined;

  function announcePosition(next: AgentTeamViewPosition) {
    setAnnouncement(`${label} team moved to ${Math.round(next.x)}, ${Math.round(next.y)}.`);
  }

  function select() {
    if (!disabled) onSelect?.();
  }

  function beginPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    if (disabled || !event.isPrimary || event.button !== 0) return;
    select();
    if (!movable) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startPosition: position,
      startPointer: { x: event.clientX, y: event.clientY },
      nextPosition: position,
      dragged: false,
    };
  }

  function updatePointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    const zone = zoneRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !zone) return;
    const currentPointer = { x: event.clientX, y: event.clientY };
    const deltaX = currentPointer.x - drag.startPointer.x;
    const deltaY = currentPointer.y - drag.startPointer.y;
    if (!drag.dragged && Math.hypot(deltaX, deltaY) <= DRAG_THRESHOLD) return;
    if (!drag.dragged) {
      drag.dragged = true;
      setDragging(true);
    }
    const nextPosition = agentTeamViewPositionFromDrag(drag.startPosition, drag.startPointer, currentPointer, canvas.transform.scale);
    drag.nextPosition = nextPosition;
    writeZonePosition(zone, nextPosition);
  }

  function finishPointerMove(event: ReactPointerEvent<HTMLButtonElement>, commit: boolean) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = null;
    setDragging(false);
    const zone = zoneRef.current;
    if (zone) writeZonePosition(zone, position);
    if (drag.dragged) suppressClickUntilRef.current = performance.now() + 250;
    if (commit && drag.dragged && onPositionChange) {
      announcePosition(drag.nextPosition);
      onPositionChange(drag.nextPosition, { reason: "pointer" });
    }
  }

  function endPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    finishPointerMove(event, true);
  }

  function cancelPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    finishPointerMove(event, false);
  }

  function moveByKeyboard(event: ReactKeyboardEvent<HTMLButtonElement>) {
    const nextPosition = moveFromArrowKey(event, position);
    if (!nextPosition || !movable || !onPositionChange) return;
    event.preventDefault();
    announcePosition(nextPosition);
    onPositionChange(nextPosition, { reason: "keyboard" });
  }

  const context: AgentTeamViewZoneContextValue = {
    label,
    selected,
    dragging,
    disabled,
    movable,
    select,
    suppressClickUntilRef,
    moveByKeyboard,
    dragHandleProps: {
      onPointerDown: beginPointerMove,
      onPointerMove: updatePointerMove,
      onPointerUp: endPointerMove,
      onPointerCancel: cancelPointerMove,
    },
  };
  const zoneStyle = {
    ...style,
    "--agent-team-zone-x": `${position.x}px`,
    "--agent-team-zone-y": `${position.y}px`,
  } satisfies AgentTeamViewZoneStyle;

  return (
    <AgentTeamViewZoneContext.Provider value={context}>
      <section
        {...props}
        ref={zoneRef}
        data-control-ui="agent-team-view"
        data-slot="zone"
        data-selected={selected || undefined}
        data-dragging={dragging || undefined}
        data-disabled={disabled || undefined}
        aria-label={ariaLabel}
        className={cn(
          "absolute top-0 left-0 isolate h-32 w-50 [transform:translate3d(var(--agent-team-zone-x),var(--agent-team-zone-y),0)]",
          selected && "z-30",
          dragging && "z-40 select-none",
          disabled && "opacity-60",
          skinSlot("agent-team-view", "zone", { selected, dragging, disabled }),
          className,
        )}
        style={zoneStyle}
      >
        {children}
        <span className="sr-only" aria-live="polite">
          {announcement}
        </span>
      </section>
    </AgentTeamViewZoneContext.Provider>
  );
}

export function AgentTeamViewZoneDragHandle({
  className,
  children,
  onClick,
  onKeyDown,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  "aria-label": ariaLabel,
  ...props
}: AgentTeamViewZoneDragHandleProps) {
  const context = useAgentTeamViewZoneContext();
  return (
    <button
      type="button"
      {...props}
      data-control-ui="agent-team-view"
      data-slot="zone-drag-handle"
      data-selected={context.selected || undefined}
      data-dragging={context.dragging || undefined}
      data-disabled={context.disabled || undefined}
      aria-label={ariaLabel ?? `${context.movable ? "Move and select" : "Select"} ${context.label} team`}
      aria-pressed={context.selected}
      aria-keyshortcuts={context.movable ? "ArrowLeft ArrowRight ArrowUp ArrowDown" : undefined}
      disabled={context.disabled}
      className={cn(
        "group relative h-32 w-50 cursor-grab touch-none border-0 bg-transparent p-0 text-left text-foreground outline-none active:cursor-grabbing disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        skinSlot("agent-team-view", "zone-drag-handle", {
          selected: context.selected,
          dragging: context.dragging,
          disabled: context.disabled,
        }),
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || performance.now() < context.suppressClickUntilRef.current) return;
        if (event.detail === 0) context.select();
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented) context.moveByKeyboard(event);
      }}
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
    >
      <span
        aria-hidden="true"
        data-control-ui="agent-team-view"
        data-slot="zone-shadow"
        className={cn(
          "absolute top-18 left-7 h-9 w-36 rounded-[50%] bg-foreground/20 blur-md transition-[opacity,scale] duration-(--duration-moderate) ease-(--ease-standard) group-hover:scale-105",
          context.dragging && "scale-110 opacity-70",
          skinSlot("agent-team-view", "zone-shadow", {
            selected: context.selected,
            dragging: context.dragging,
          }),
        )}
      />
      <span
        aria-hidden="true"
        data-control-ui="agent-team-view"
        data-slot="zone-front"
        className={cn(
          "absolute top-2 left-2 h-24 w-44 bg-muted-foreground/35 [clip-path:polygon(0_36%,36%_58%,36%_78%,0_56%)] transition-[translate,background-color] duration-(--duration-fast) ease-(--ease-standard)",
          context.selected && "bg-primary/75",
          context.dragging && "-translate-y-1",
          skinSlot("agent-team-view", "zone-front", {
            selected: context.selected,
            dragging: context.dragging,
          }),
        )}
      />
      <span
        aria-hidden="true"
        data-control-ui="agent-team-view"
        data-slot="zone-side"
        className={cn(
          "absolute top-2 left-2 h-24 w-44 bg-muted-foreground/55 [clip-path:polygon(36%_58%,100%_22%,100%_42%,36%_78%)] transition-[translate,background-color] duration-(--duration-fast) ease-(--ease-standard)",
          context.selected && "bg-primary/60",
          context.dragging && "-translate-y-1",
          skinSlot("agent-team-view", "zone-side", {
            selected: context.selected,
            dragging: context.dragging,
          }),
        )}
      />
      <span
        aria-hidden="true"
        data-control-ui="agent-team-view"
        data-slot="zone-top"
        className={cn(
          "absolute top-2 left-2 h-24 w-44 bg-card [clip-path:polygon(0_36%,64%_0,100%_22%,36%_58%)] ring-1 ring-border transition-[translate,background-color] duration-(--duration-fast) ease-(--ease-standard) group-hover:bg-accent",
          context.selected && "bg-primary text-primary-foreground group-hover:bg-primary",
          context.dragging && "-translate-y-1",
          skinSlot("agent-team-view", "zone-top", {
            selected: context.selected,
            dragging: context.dragging,
          }),
        )}
      />
      <span
        className={cn(
          "absolute top-6 left-12 z-10 flex h-12 w-28 -rotate-[17deg] flex-col items-center justify-center text-center",
          context.dragging && "-translate-y-1",
          context.selected && "text-primary-foreground",
        )}
      >
        {children}
      </span>
    </button>
  );
}

export function AgentTeamViewZoneTitle({ className, ...props }: AgentTeamViewZoneTitleProps) {
  return (
    <span
      {...props}
      data-control-ui="agent-team-view"
      data-slot="zone-title"
      className={cn("max-w-full truncate text-sm font-semibold", skinSlot("agent-team-view", "zone-title", {}), className)}
    />
  );
}

export function AgentTeamViewZoneDetails({ className, "aria-label": ariaLabel, ...props }: AgentTeamViewZoneDetailsProps) {
  const context = useAgentTeamViewZoneContext();
  if (!context.selected) return null;
  return (
    <aside
      {...props}
      data-control-ui="agent-team-view"
      data-slot="zone-details"
      aria-label={ariaLabel ?? `${context.label} team details`}
      className={cn(
        "absolute top-24 left-0 z-30 w-48 origin-top rounded-[var(--radius-panel)] bg-card text-card-foreground shadow-lg ring-1 ring-border transition-[opacity,scale,translate] duration-(--duration-fast) ease-(--ease-standard) starting:translate-y-2 starting:scale-95 starting:opacity-0 sm:top-8 sm:left-40 sm:w-64 sm:origin-left sm:starting:translate-x-2 sm:starting:translate-y-0",
        skinSlot("agent-team-view", "zone-details", {}),
        className,
      )}
    />
  );
}

export function AgentTeamViewZoneContent({ className, ...props }: AgentTeamViewZoneContentProps) {
  return (
    <div
      {...props}
      data-control-ui="agent-team-view"
      data-slot="zone-content"
      className={cn("max-h-56 overflow-y-auto p-2", skinSlot("agent-team-view", "zone-content", {}), className)}
    />
  );
}

export function AgentTeamViewAgent({ className, ...props }: AgentTeamViewAgentProps) {
  return (
    <article
      {...props}
      data-control-ui="agent-team-view"
      data-slot="agent"
      className={cn(
        "grid min-w-0 grid-cols-[auto_1fr] items-center gap-2 rounded-[var(--radius-control)] px-2.5 py-2 text-foreground transition-colors duration-(--duration-fast) hover:bg-accent",
        skinSlot("agent-team-view", "agent", {}),
        className,
      )}
    />
  );
}
