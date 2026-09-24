// biome-ignore-all lint/a11y/noNoninteractiveTabindex: Infinite Canvas is a composite pan-and-zoom widget with documented keyboard commands.
"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import type { ComponentProps, CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { createContext, use, useEffect, useEffectEvent, useRef, useState } from "react";
import type { InfiniteCanvasKnobStyle } from "@/components/control-ui/knob-contracts/infinite-canvas-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { Button } from "@/components/control-ui/ui/button";

export type InfiniteCanvasTransform = { x: number; y: number; scale: number };

export type InfiniteCanvasMoveReason = "pointer" | "wheel" | "keyboard" | "control";

export type InfiniteCanvasMoveDetails = { reason: InfiniteCanvasMoveReason };

export type InfiniteCanvasProps = Omit<ComponentProps<"section">, "onChange" | "onWheel" | "ref" | "style"> & {
  transform?: InfiniteCanvasTransform;
  defaultTransform?: InfiniteCanvasTransform;
  onTransformChange?: (transform: InfiniteCanvasTransform, details: InfiniteCanvasMoveDetails) => void;
  minScale?: number;
  maxScale?: number;
  onWheel?: (event: WheelEvent) => void;
  style?: CSSProperties & InfiniteCanvasKnobStyle;
};

export type InfiniteCanvasContentProps = ComponentProps<"div"> & { style?: CSSProperties & InfiniteCanvasKnobStyle };

export type InfiniteCanvasPoint = { x: number; y: number };

export type InfiniteCanvasItemProps = Omit<ComponentProps<"div">, "style"> & {
  x: number;
  y: number;
  onPositionChange?: (position: InfiniteCanvasPoint) => void;
  style?: CSSProperties & InfiniteCanvasKnobStyle;
};

export type InfiniteCanvasControlsProps = Omit<ComponentProps<"div">, "children" | "style"> & {
  style?: CSSProperties & InfiniteCanvasKnobStyle;
};

const DEFAULT_TRANSFORM: InfiniteCanvasTransform = { x: 0, y: 0, scale: 1 };
const DEFAULT_MIN_SCALE = 0.35;
const DEFAULT_MAX_SCALE = 2.5;
const KEYBOARD_PAN_STEP = 32;
const GRID_SIZE = 24;
const WHEEL_ZOOM_SPEED = 0.004;
const MAX_WHEEL_ZOOM_DELTA = 50;
const NOTCHED_WHEEL_DELTA = 40;
const KEYBOARD_PAN_DIRECTIONS: Partial<Record<string, { x: number; y: number }>> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
};

type InfiniteCanvasPanSession = {
  pointerId: number;
  startPointer: { x: number; y: number };
  startTransform: InfiniteCanvasTransform;
};

type InfiniteCanvasItemDragSession = {
  pointerId: number;
  startPointer: InfiniteCanvasPoint;
  startPosition: InfiniteCanvasPoint;
};

type InfiniteCanvasContextValue = {
  transform: InfiniteCanvasTransform;
  minScale: number;
  maxScale: number;
  reset: (reason: InfiniteCanvasMoveReason) => void;
  zoomBy: (factor: number, reason: InfiniteCanvasMoveReason) => void;
};

const InfiniteCanvasContext = createContext<InfiniteCanvasContextValue | null>(null);

function clampScale(scale: number, minScale: number, maxScale: number) {
  return Math.min(Math.max(scale, minScale), maxScale);
}

function zoomAroundPoint(transform: InfiniteCanvasTransform, nextScale: number, point: { x: number; y: number }): InfiniteCanvasTransform {
  const worldX = (point.x - transform.x) / transform.scale;
  const worldY = (point.y - transform.y) / transform.scale;
  return {
    x: point.x - worldX * nextScale,
    y: point.y - worldY * nextScale,
    scale: nextScale,
  };
}

function wheelDeltaMultiplier(event: WheelEvent, viewportHeight: number) {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return 16;
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return viewportHeight;
  return 1;
}

function panFromWheel(transform: InfiniteCanvasTransform, event: WheelEvent, viewportHeight: number): InfiniteCanvasTransform {
  const deltaMultiplier = wheelDeltaMultiplier(event, viewportHeight);
  const horizontalDelta = event.shiftKey && event.deltaX === 0 ? event.deltaY : event.deltaX;
  const verticalDelta = event.shiftKey && event.deltaX === 0 ? 0 : event.deltaY;
  return {
    x: transform.x - horizontalDelta * deltaMultiplier,
    y: transform.y - verticalDelta * deltaMultiplier,
    scale: transform.scale,
  };
}

export function useInfiniteCanvas() {
  const context = use(InfiniteCanvasContext);
  if (!context) throw new Error("useInfiniteCanvas must be used within InfiniteCanvas");
  return context;
}

export function InfiniteCanvas({
  transform: controlledTransform,
  defaultTransform = DEFAULT_TRANSFORM,
  onTransformChange,
  minScale: minScaleProp = DEFAULT_MIN_SCALE,
  maxScale: maxScaleProp = DEFAULT_MAX_SCALE,
  className,
  children,
  style,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onWheel,
  onKeyDown,
  "aria-label": ariaLabel = "Infinite canvas",
  ...props
}: InfiniteCanvasProps) {
  const minScale = Math.max(0.1, minScaleProp);
  const maxScale = Math.max(minScale, maxScaleProp);
  const [uncontrolledTransform, setUncontrolledTransform] = useState(defaultTransform);
  const [panning, setPanning] = useState(false);
  const [easing, setEasing] = useState(false);
  const panRef = useRef<InfiniteCanvasPanSession | null>(null);
  const rootRef = useRef<HTMLElement>(null);
  const transform = controlledTransform ?? uncontrolledTransform;
  const transformRef = useRef(transform);

  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  function commitTransform(
    next: InfiniteCanvasTransform,
    reason: InfiniteCanvasMoveReason,
    eased = reason === "control" || reason === "keyboard",
  ) {
    setEasing(eased);
    const bounded = { ...next, scale: clampScale(next.scale, minScale, maxScale) };
    transformRef.current = bounded;
    if (controlledTransform === undefined) setUncontrolledTransform(bounded);
    onTransformChange?.(bounded, { reason });
  }

  function zoomBy(factor: number, reason: InfiniteCanvasMoveReason) {
    const currentTransform = transformRef.current;
    const nextScale = clampScale(currentTransform.scale * factor, minScale, maxScale);
    const root = rootRef.current;
    const point = root ? { x: root.clientWidth / 2, y: root.clientHeight / 2 } : { x: 0, y: 0 };
    commitTransform(zoomAroundPoint(currentTransform, nextScale, point), reason);
  }

  function reset(reason: InfiniteCanvasMoveReason) {
    commitTransform(defaultTransform, reason);
  }

  function beginPan(event: ReactPointerEvent<HTMLElement>) {
    onPointerDown?.(event);
    if (event.defaultPrevented || event.target !== event.currentTarget || !event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    panRef.current = {
      pointerId: event.pointerId,
      startPointer: { x: event.clientX, y: event.clientY },
      startTransform: transformRef.current,
    };
    setPanning(true);
  }

  function updatePan(event: ReactPointerEvent<HTMLElement>) {
    onPointerMove?.(event);
    if (event.defaultPrevented) return;
    const pan = panRef.current;
    if (!pan || pan.pointerId !== event.pointerId) return;
    commitTransform(
      {
        x: pan.startTransform.x + event.clientX - pan.startPointer.x,
        y: pan.startTransform.y + event.clientY - pan.startPointer.y,
        scale: pan.startTransform.scale,
      },
      "pointer",
    );
  }

  function finishPan(event: ReactPointerEvent<HTMLElement>) {
    const pan = panRef.current;
    if (!pan || pan.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    panRef.current = null;
    setPanning(false);
  }

  function endPan(event: ReactPointerEvent<HTMLElement>) {
    onPointerUp?.(event);
    if (!event.defaultPrevented) finishPan(event);
  }

  function cancelPan(event: ReactPointerEvent<HTMLElement>) {
    onPointerCancel?.(event);
    if (!event.defaultPrevented) finishPan(event);
  }

  const handleWheel = useEffectEvent((event: WheelEvent) => {
    onWheel?.(event);
    if (event.defaultPrevented) return;
    const root = rootRef.current;
    if (!root) return;
    event.preventDefault();
    const currentTransform = transformRef.current;
    if (event.ctrlKey || event.metaKey) {
      const bounds = root.getBoundingClientRect();
      const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
      const zoomDelta = event.deltaY * wheelDeltaMultiplier(event, root.clientHeight);
      const boundedZoomDelta = Math.min(Math.max(zoomDelta, -MAX_WHEEL_ZOOM_DELTA), MAX_WHEEL_ZOOM_DELTA);
      const nextScale = clampScale(currentTransform.scale * Math.exp(-boundedZoomDelta * WHEEL_ZOOM_SPEED), minScale, maxScale);
      const notchedWheel = Math.abs(zoomDelta) >= NOTCHED_WHEEL_DELTA;
      commitTransform(zoomAroundPoint(currentTransform, nextScale, point), "wheel", notchedWheel);
      return;
    }
    commitTransform(panFromWheel(currentTransform, event, root.clientHeight), "wheel");
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const listener = (event: WheelEvent) => handleWheel(event);
    root.addEventListener("wheel", listener, { passive: false });
    return () => root.removeEventListener("wheel", listener);
  }, []);

  function moveWithKeyboard(event: ReactKeyboardEvent<HTMLElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const currentTransform = transformRef.current;
    const direction = KEYBOARD_PAN_DIRECTIONS[event.key];
    if (direction) {
      const panStep = event.shiftKey ? KEYBOARD_PAN_STEP * 3 : KEYBOARD_PAN_STEP;
      commitTransform(
        {
          ...currentTransform,
          x: currentTransform.x + direction.x * panStep,
          y: currentTransform.y + direction.y * panStep,
        },
        "keyboard",
      );
    } else if (event.key === "+" || event.key === "=") zoomBy(1.15, "keyboard");
    else if (event.key === "-") zoomBy(1 / 1.15, "keyboard");
    else if (event.key === "0") reset("keyboard");
    else return;
    event.preventDefault();
  }

  const context: InfiniteCanvasContextValue = { transform, minScale, maxScale, reset, zoomBy };
  const canvasStyle = {
    ...style,
    backgroundPosition: `${transform.x}px ${transform.y}px`,
    backgroundSize: `${GRID_SIZE * transform.scale}px ${GRID_SIZE * transform.scale}px`,
  };

  return (
    <InfiniteCanvasContext.Provider value={context}>
      <section
        ref={rootRef}
        {...props}
        data-control-ui="infinite-canvas"
        data-control-family="infinite-canvas"
        data-slot="root"
        data-panning={panning || undefined}
        data-easing={easing || undefined}
        aria-label={ariaLabel}
        role="application"
        aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown + - 0"
        tabIndex={0}
        className={cn("relative isolate overflow-hidden overscroll-contain touch-none select-none data-panning:cursor-grabbing", className)}
        style={canvasStyle}
        onPointerDown={beginPan}
        onPointerMove={updatePan}
        onPointerUp={endPan}
        onPointerCancel={cancelPan}
        onKeyDown={moveWithKeyboard}
      >
        {children}
      </section>
    </InfiniteCanvasContext.Provider>
  );
}

export function InfiniteCanvasContent({ className, style, ...props }: InfiniteCanvasContentProps) {
  const { transform } = useInfiniteCanvas();
  return (
    <div
      {...props}
      data-control-ui="infinite-canvas"
      data-control-family="infinite-canvas"
      data-slot="content"
      data-scale={transform.scale}
      className={cn(
        "pointer-events-none absolute top-0 left-0 h-0 w-0 transform-gpu will-change-transform [&>*]:pointer-events-auto",
        className,
      )}
      style={{
        ...style,
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
      }}
    />
  );
}

export function InfiniteCanvasItem({
  x,
  y,
  onPositionChange,
  className,
  style,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  ...props
}: InfiniteCanvasItemProps) {
  const { transform } = useInfiniteCanvas();
  const dragRef = useRef<InfiniteCanvasItemDragSession | null>(null);
  const [dragging, setDragging] = useState(false);

  function beginDrag(event: ReactPointerEvent<HTMLDivElement>) {
    onPointerDown?.(event);
    if (event.defaultPrevented || !onPositionChange || !event.isPrimary || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startPointer: { x: event.clientX, y: event.clientY },
      startPosition: { x, y },
    };
    setDragging(true);
  }

  function updateDrag(event: ReactPointerEvent<HTMLDivElement>) {
    onPointerMove?.(event);
    const drag = dragRef.current;
    if (event.defaultPrevented || !drag || drag.pointerId !== event.pointerId) return;
    onPositionChange?.({
      x: drag.startPosition.x + (event.clientX - drag.startPointer.x) / transform.scale,
      y: drag.startPosition.y + (event.clientY - drag.startPointer.y) / transform.scale,
    });
  }

  function finishDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = null;
    setDragging(false);
  }

  function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
    onPointerUp?.(event);
    finishDrag(event);
  }

  function cancelDrag(event: ReactPointerEvent<HTMLDivElement>) {
    onPointerCancel?.(event);
    finishDrag(event);
  }

  return (
    <div
      {...props}
      data-control-ui="infinite-canvas"
      data-control-family="infinite-canvas"
      data-slot="item"
      data-dragging={dragging || undefined}
      className={cn("absolute", onPositionChange && "cursor-grab touch-none data-dragging:cursor-grabbing", className)}
      style={{ ...style, left: x, top: y }}
      onPointerDown={beginDrag}
      onPointerMove={updateDrag}
      onPointerUp={endDrag}
      onPointerCancel={cancelDrag}
    />
  );
}

export function InfiniteCanvasControls({ className, ...props }: InfiniteCanvasControlsProps) {
  const canvas = useInfiniteCanvas();
  const percentage = Math.round(canvas.transform.scale * 100);
  return (
    <div
      data-control-ui="infinite-canvas"
      data-control-family="infinite-canvas"
      data-slot="controls"
      className={cn("absolute right-3 bottom-3 z-40 flex items-center", className)}
      {...props}
    >
      <Button
        type="button"
        size="sm"
        variant="ghost"
        iconOnly
        disabled={canvas.transform.scale <= canvas.minScale}
        aria-label="Zoom out"
        onClick={() => canvas.zoomBy(1 / 1.2, "control")}
      >
        <MinusIcon />
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="tabular-nums"
        aria-label={`Reset canvas zoom, currently ${percentage}%`}
        onClick={() => canvas.reset("control")}
      >
        {percentage}%
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        iconOnly
        disabled={canvas.transform.scale >= canvas.maxScale}
        aria-label="Zoom in"
        onClick={() => canvas.zoomBy(1.2, "control")}
      >
        <PlusIcon />
      </Button>
    </div>
  );
}
