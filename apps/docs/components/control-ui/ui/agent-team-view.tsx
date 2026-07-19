"use client";

import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { createContext, use, useRef, useState } from "react";
import type {
  AgentTeamViewAgentProps,
  AgentTeamViewCanvasProps,
  AgentTeamViewPosition,
  AgentTeamViewProps,
  AgentTeamViewZoneContentProps,
  AgentTeamViewZoneDragHandleProps,
  AgentTeamViewZoneHeaderProps,
  AgentTeamViewZoneProps,
  AgentTeamViewZoneTitleProps,
} from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";
import { type AgentTeamViewSize, agentTeamViewPositionFromDrag, clampAgentTeamViewZonePosition } from "./agent-team-view-geometry";

const DEFAULT_CANVAS_WIDTH = 1040;
const DEFAULT_CANVAS_HEIGHT = 640;
const DEFAULT_ZONE_WIDTH = 256;
const DEFAULT_ZONE_HEIGHT = 188;
const DRAG_THRESHOLD = 5;
const KEYBOARD_STEP = 12;
const KEYBOARD_LARGE_STEP = 48;
const ZONE_X_PROPERTY = "--agent-team-zone-x";
const ZONE_Y_PROPERTY = "--agent-team-zone-y";

type AgentTeamViewZoneStyle = CSSProperties & {
  "--agent-team-zone-x": string;
  "--agent-team-zone-y": string;
};

type AgentTeamViewCanvasContextValue = {
  size: AgentTeamViewSize;
};

type AgentTeamViewDragSession = {
  pointerId: number;
  startPosition: AgentTeamViewPosition;
  startPointer: AgentTeamViewPosition;
  nextPosition: AgentTeamViewPosition;
  zoneSize: AgentTeamViewSize;
  dragged: boolean;
};

type AgentTeamViewZoneContextValue = {
  label: string;
  position: AgentTeamViewPosition;
  selected: boolean;
  dragging: boolean;
  disabled: boolean;
  movable: boolean;
  moveByKeyboard: (event: ReactKeyboardEvent<HTMLButtonElement>) => void;
  dragHandleProps: {
    onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
    onPointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => void;
    onPointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => void;
    onPointerCancel: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  };
};

const AgentTeamViewContext = createContext<boolean | null>(null);
const AgentTeamViewCanvasContext = createContext<AgentTeamViewCanvasContextValue | null>(null);
const AgentTeamViewZoneContext = createContext<AgentTeamViewZoneContextValue | null>(null);

function useAgentTeamViewContext() {
  const context = use(AgentTeamViewContext);
  if (!context) throw new Error("AgentTeamViewCanvas must be used inside AgentTeamView.");
}

function useAgentTeamViewCanvasContext() {
  const context = use(AgentTeamViewCanvasContext);
  if (!context) throw new Error("AgentTeamViewZone must be used inside AgentTeamViewCanvas.");
  return context;
}

function useAgentTeamViewZoneContext() {
  const context = use(AgentTeamViewZoneContext);
  if (!context) throw new Error("AgentTeamViewZone parts must be used inside AgentTeamViewZone.");
  return context;
}

function writeZonePosition(zone: HTMLElement, position: AgentTeamViewPosition) {
  zone.style.setProperty(ZONE_X_PROPERTY, `${position.x}px`);
  zone.style.setProperty(ZONE_Y_PROPERTY, `${position.y}px`);
}

function zoneSize(zone: HTMLElement | null): AgentTeamViewSize {
  return {
    width: zone?.offsetWidth ?? DEFAULT_ZONE_WIDTH,
    height: zone?.offsetHeight ?? DEFAULT_ZONE_HEIGHT,
  };
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

export function AgentTeamView({ className, children, "aria-label": ariaLabel = "Agent team workspace", ...props }: AgentTeamViewProps) {
  return (
    <AgentTeamViewContext.Provider value={true}>
      {/* biome-ignore lint/a11y/useSemanticElements: The scroll viewport keeps the public div contract while exposing a named region. */}
      <div
        {...props}
        data-control-ui="agent-team-view"
        data-slot="root"
        role="region"
        aria-label={ariaLabel}
        className={cn(
          "relative max-w-full overflow-auto rounded-[var(--radius-panel)] bg-canvas text-foreground ring-1 ring-border",
          skinSlot("agent-team-view", "root", {}),
          className,
        )}
      >
        {children}
      </div>
    </AgentTeamViewContext.Provider>
  );
}

export function AgentTeamViewCanvas({
  width = DEFAULT_CANVAS_WIDTH,
  height = DEFAULT_CANVAS_HEIGHT,
  className,
  style,
  children,
  ...props
}: AgentTeamViewCanvasProps) {
  useAgentTeamViewContext();
  const context: AgentTeamViewCanvasContextValue = { size: { width, height } };

  return (
    <AgentTeamViewCanvasContext.Provider value={context}>
      <div
        {...props}
        data-control-ui="agent-team-view"
        data-slot="canvas"
        className={cn(
          "relative isolate shrink-0 bg-canvas bg-radial-[circle_at_center,oklch(from_var(--foreground)_l_c_h/0.14)_1px,transparent_1px] bg-size-[20px_20px]",
          skinSlot("agent-team-view", "canvas", {}),
          className,
        )}
        style={{ ...style, width, height }}
      >
        {children}
      </div>
    </AgentTeamViewCanvasContext.Provider>
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
  onClick,
  onKeyDown,
  "aria-label": ariaLabel = `${label} team zone`,
  ...props
}: AgentTeamViewZoneProps) {
  const canvas = useAgentTeamViewCanvasContext();
  const zoneRef = useRef<HTMLElement>(null);
  const dragRef = useRef<AgentTeamViewDragSession | null>(null);
  const [dragging, setDragging] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const movable = !disabled && onPositionChange !== undefined;

  function announcePosition(next: AgentTeamViewPosition) {
    setAnnouncement(`${label} team moved to ${Math.round(next.x)}, ${Math.round(next.y)}.`);
  }

  function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!movable || !event.isPrimary || event.button !== 0) return;
    const zone = zoneRef.current;
    if (!zone) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startPosition: position,
      startPointer: { x: event.clientX, y: event.clientY },
      nextPosition: position,
      zoneSize: zoneSize(zone),
      dragged: false,
    };
  }

  function onPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    const zone = zoneRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !zone) return;

    const pointer = { x: event.clientX, y: event.clientY };
    const deltaX = pointer.x - drag.startPointer.x;
    const deltaY = pointer.y - drag.startPointer.y;
    if (!drag.dragged && Math.hypot(deltaX, deltaY) <= DRAG_THRESHOLD) return;
    if (!drag.dragged) {
      drag.dragged = true;
      setDragging(true);
    }

    const nextPosition = clampAgentTeamViewZonePosition(
      agentTeamViewPositionFromDrag(drag.startPosition, drag.startPointer, pointer),
      canvas.size,
      drag.zoneSize,
    );
    drag.nextPosition = nextPosition;
    writeZonePosition(zone, nextPosition);
  }

  function finishPointerMove(event: ReactPointerEvent<HTMLButtonElement>, commit: boolean) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragRef.current = null;
    setDragging(false);
    const zone = zoneRef.current;
    if (zone) writeZonePosition(zone, position);
    if (commit && drag.dragged && onPositionChange) {
      announcePosition(drag.nextPosition);
      onPositionChange(drag.nextPosition, { reason: "pointer" });
    }
  }

  function onPointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    finishPointerMove(event, true);
  }

  function onPointerCancel(event: ReactPointerEvent<HTMLButtonElement>) {
    finishPointerMove(event, false);
  }

  function moveByKeyboard(event: ReactKeyboardEvent<HTMLButtonElement>) {
    const requestedPosition = moveFromArrowKey(event, position);
    if (!requestedPosition || !movable || !onPositionChange) return;
    event.preventDefault();
    const nextPosition = clampAgentTeamViewZonePosition(requestedPosition, canvas.size, zoneSize(zoneRef.current));
    announcePosition(nextPosition);
    onPositionChange(nextPosition, { reason: "keyboard" });
  }

  const context: AgentTeamViewZoneContextValue = {
    label,
    position,
    selected,
    dragging,
    disabled,
    movable,
    moveByKeyboard,
    dragHandleProps: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
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
        tabIndex={onSelect ? 0 : undefined}
        className={cn(
          "absolute top-0 left-0 isolate z-10 w-64 rounded-[var(--radius-panel)] bg-card text-foreground ring-1 ring-border [transform:translate3d(var(--agent-team-zone-x),var(--agent-team-zone-y),0)]",
          selected && "ring-primary/70",
          dragging && "z-20 select-none ring-primary",
          disabled && "opacity-60",
          skinSlot("agent-team-view", "zone", { selected, dragging, disabled }),
          className,
        )}
        style={zoneStyle}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) onSelect?.();
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || event.target !== event.currentTarget) return;
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          onSelect?.();
        }}
      >
        <div
          aria-hidden="true"
          data-control-ui="agent-team-view"
          data-slot="zone-base"
          data-selected={selected || undefined}
          data-dragging={dragging || undefined}
          className={cn(
            "pointer-events-none absolute -inset-x-6 -inset-y-4 -z-20 translate-y-2 rounded-[var(--radius-panel)] bg-foreground/15 [transform:rotateX(58deg)_rotateZ(-36deg)] ring-1 ring-border",
            skinSlot("agent-team-view", "zone-base", { selected, dragging }),
          )}
        />
        <div
          aria-hidden="true"
          data-control-ui="agent-team-view"
          data-slot="zone-platform"
          data-selected={selected || undefined}
          data-dragging={dragging || undefined}
          className={cn(
            "pointer-events-none absolute -inset-x-6 -inset-y-4 -z-10 rounded-[var(--radius-panel)] bg-card [transform:rotateX(58deg)_rotateZ(-36deg)] ring-1 ring-border",
            selected && "bg-primary/60 ring-primary",
            skinSlot("agent-team-view", "zone-platform", { selected, dragging }),
          )}
        />
        {children}
        <span className="sr-only" aria-live="polite">
          {announcement}
        </span>
      </section>
    </AgentTeamViewZoneContext.Provider>
  );
}

export function AgentTeamViewZoneHeader({ className, ...props }: AgentTeamViewZoneHeaderProps) {
  useAgentTeamViewZoneContext();
  return (
    <div
      {...props}
      data-control-ui="agent-team-view"
      data-slot="zone-header"
      className={cn(
        "relative z-10 flex min-h-11 items-center gap-2 border-b border-border bg-card pr-3",
        skinSlot("agent-team-view", "zone-header", {}),
        className,
      )}
    />
  );
}

export function AgentTeamViewZoneDragHandle({
  className,
  children,
  disabled: callerDisabled = false,
  "aria-label": ariaLabel,
  onKeyDown,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  ...props
}: AgentTeamViewZoneDragHandleProps) {
  const context = useAgentTeamViewZoneContext();
  const disabled = context.disabled || callerDisabled || !context.movable;

  return (
    <button
      {...props}
      type="button"
      data-control-ui="agent-team-view"
      data-slot="zone-drag-handle"
      data-selected={context.selected || undefined}
      data-dragging={context.dragging || undefined}
      data-disabled={disabled || undefined}
      aria-label={ariaLabel ?? `Move ${context.label} team. Use arrow keys for precise movement.`}
      aria-pressed={context.selected}
      disabled={disabled}
      className={cn(
        "grid size-11 shrink-0 cursor-grab touch-none place-items-center rounded-[var(--radius-control)] text-foreground/65 outline-none hover:bg-foreground/8 active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
        context.selected && "bg-primary text-primary-foreground hover:bg-primary",
        skinSlot("agent-team-view", "zone-drag-handle", {
          selected: context.selected,
          dragging: context.dragging,
          disabled,
        }),
        className,
      )}
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
      {children ?? (
        <svg aria-hidden="true" viewBox="0 0 12 18" className="h-4.5 w-3 fill-current">
          <circle cx="3" cy="3" r="1.25" />
          <circle cx="9" cy="3" r="1.25" />
          <circle cx="3" cy="9" r="1.25" />
          <circle cx="9" cy="9" r="1.25" />
          <circle cx="3" cy="15" r="1.25" />
          <circle cx="9" cy="15" r="1.25" />
        </svg>
      )}
    </button>
  );
}

export function AgentTeamViewZoneTitle({ className, ...props }: AgentTeamViewZoneTitleProps) {
  useAgentTeamViewZoneContext();
  return (
    <h3
      {...props}
      data-control-ui="agent-team-view"
      data-slot="zone-title"
      className={cn("min-w-0 truncate text-sm font-semibold", skinSlot("agent-team-view", "zone-title", {}), className)}
    />
  );
}

export function AgentTeamViewZoneContent({ className, ...props }: AgentTeamViewZoneContentProps) {
  useAgentTeamViewZoneContext();
  return (
    <div
      {...props}
      data-control-ui="agent-team-view"
      data-slot="zone-content"
      className={cn(
        "relative z-10 flex h-36 flex-col gap-2 overflow-y-auto rounded-b-[var(--radius-panel)] bg-card p-2",
        skinSlot("agent-team-view", "zone-content", {}),
        className,
      )}
    />
  );
}

export function AgentTeamViewAgent({ className, ...props }: AgentTeamViewAgentProps) {
  useAgentTeamViewZoneContext();
  return (
    <article
      {...props}
      data-control-ui="agent-team-view"
      data-slot="agent"
      className={cn(
        "flex min-h-12 shrink-0 items-center gap-2 rounded-[var(--radius-control)] bg-canvas px-2.5 py-2 text-foreground ring-1 ring-border",
        skinSlot("agent-team-view", "agent", {}),
        className,
      )}
    />
  );
}
