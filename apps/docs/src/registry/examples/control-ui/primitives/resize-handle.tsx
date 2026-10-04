"use client";

import type { KeyboardEvent, PointerEvent } from "react";
import { useRef, useState } from "react";
import { ResizeHandle, type ResizeHandleDirection, resizeHandleDirections } from "@/components/control-ui/ui/resize-handle";
import { Text } from "@/components/control-ui/ui/typography";

type Frame = { x: number; y: number; width: number; height: number };

type DragSession = { pointerId: number; startX: number; startY: number; startFrame: Frame };

const MIN_FRAME_SIZE_PX = 64;
const KEYBOARD_STEP_PX = 1;
const KEYBOARD_SHIFT_STEP_PX = 10;
const INITIAL_FRAME: Frame = { x: 96, y: 48, width: 240, height: 144 };

const DIRECTION_LABELS: Record<ResizeHandleDirection, string> = {
  n: "top edge",
  ne: "top-right corner",
  e: "right edge",
  se: "bottom-right corner",
  s: "bottom edge",
  sw: "bottom-left corner",
  w: "left edge",
  nw: "top-left corner",
};

const ARROW_DELTAS: Partial<Record<string, { x: number; y: number }>> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
};

function resizeFrame(frame: Frame, direction: ResizeHandleDirection, deltaX: number, deltaY: number): Frame {
  const next = { ...frame };
  if (direction.includes("e")) next.width = Math.max(MIN_FRAME_SIZE_PX, frame.width + deltaX);
  if (direction.includes("s")) next.height = Math.max(MIN_FRAME_SIZE_PX, frame.height + deltaY);
  if (direction.includes("w")) {
    next.width = Math.max(MIN_FRAME_SIZE_PX, frame.width - deltaX);
    next.x = frame.x + frame.width - next.width;
  }
  if (direction.includes("n")) {
    next.height = Math.max(MIN_FRAME_SIZE_PX, frame.height - deltaY);
    next.y = frame.y + frame.height - next.height;
  }
  return next;
}

export function PrimitiveResizeHandleExample() {
  const [frame, setFrame] = useState(INITIAL_FRAME);
  const dragRef = useRef<DragSession | null>(null);

  function startDrag(event: PointerEvent<HTMLButtonElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, startFrame: frame };
  }

  function drag(event: PointerEvent<HTMLButtonElement>, direction: ResizeHandleDirection) {
    const session = dragRef.current;
    if (session?.pointerId !== event.pointerId) return;
    setFrame(resizeFrame(session.startFrame, direction, event.clientX - session.startX, event.clientY - session.startY));
  }

  function endDrag(event: PointerEvent<HTMLButtonElement>) {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  }

  function resizeWithKeyboard(event: KeyboardEvent<HTMLButtonElement>, direction: ResizeHandleDirection) {
    const delta = ARROW_DELTAS[event.key];
    if (!delta) return;
    event.preventDefault();
    const step = event.shiftKey ? KEYBOARD_SHIFT_STEP_PX : KEYBOARD_STEP_PX;
    setFrame((current) => resizeFrame(current, direction, delta.x * step, delta.y * step));
  }

  return (
    <div className="relative h-80 w-full max-w-xl overflow-hidden rounded-[var(--radius-panel)] bg-canvas ring-1 ring-border">
      <div
        className="absolute flex items-center justify-center rounded-sm bg-card ring-1 ring-primary"
        style={{ left: frame.x, top: frame.y, width: frame.width, height: frame.height }}
      >
        <Text size="caption" tone="muted" className="tabular-nums">
          {Math.round(frame.width)} × {Math.round(frame.height)}
        </Text>
        {resizeHandleDirections.map((direction) => (
          <ResizeHandle
            key={direction}
            direction={direction}
            aria-label={`Resize ${DIRECTION_LABELS[direction]}`}
            onPointerDown={startDrag}
            onPointerMove={(event) => drag(event, direction)}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onKeyDown={(event) => resizeWithKeyboard(event, direction)}
          />
        ))}
      </div>
    </div>
  );
}
