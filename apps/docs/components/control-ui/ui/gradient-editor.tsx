"use client";

import type {
  ComponentProps,
  CSSProperties,
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from "react";
import { createContext, useContext, useRef, useState } from "react";
import { useColorArea } from "@/components/control-ui/hooks/use-color-area";
import type { GradientEditorKnobStyle } from "@/components/control-ui/knob-contracts/gradient-editor-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import {
  formatGradient,
  type GradientInterpolation,
  type GradientStop,
  type GradientType,
  type GradientValue,
  gradientColorAt,
} from "@/components/control-ui/lib/gradient";

export type { GradientInterpolation, GradientStop, GradientType, GradientValue } from "@/components/control-ui/lib/gradient";

export type GradientEditorProps = Omit<ComponentProps<"div">, "onChange" | "defaultValue"> & {
  value?: GradientValue;
  defaultValue?: GradientValue;
  onValueChange?: (value: GradientValue) => void;
} & { style?: CSSProperties & GradientEditorKnobStyle };

export type GradientEditorPreviewProps = Omit<ComponentProps<"div">, "style"> & {
  style?: CSSProperties & GradientEditorKnobStyle;
};

export type GradientEditorTrackProps = Omit<ComponentProps<"fieldset">, "style"> & {
  style?: CSSProperties & GradientEditorKnobStyle;
};

export type GradientEditorStopProps = Omit<ComponentProps<"button">, "style"> & {
  stop: GradientStop;
  style?: CSSProperties & GradientEditorKnobStyle;
};

export type GradientEditorStopAddProps = Omit<ComponentProps<"button">, "onClick" | "style"> & {
  style?: CSSProperties & GradientEditorKnobStyle;
};

const DEFAULT_GRADIENT: GradientValue = {
  type: "linear",
  angle: 90,
  interpolation: "oklab",
  stops: [
    { id: "stop-1", position: 0, color: "#7c3aed" },
    { id: "stop-2", position: 1, color: "#3b82f6" },
  ],
};

const MIN_GRADIENT_STOPS = 2;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

function unusedStopId(stops: GradientStop[]): string {
  const taken = new Set(stops.map((stop) => stop.id));
  let ordinal = stops.length + 1;
  while (taken.has(`stop-${ordinal}`)) ordinal += 1;
  return `stop-${ordinal}`;
}

type GradientImageStyle = CSSProperties & Record<"--_gradient-editor-image", string>;

type GradientEditorContextValue = GradientValue & {
  gradient: string;
  selectedStop: GradientStop | undefined;
  canRemoveStop: boolean;
  trackRef: RefObject<HTMLFieldSetElement | null>;
  stopNodes: Map<string, HTMLButtonElement>;
  select: (id: string) => void;
  setStopColor: (id: string, color: string) => void;
  setStopPosition: (id: string, position: number) => void;
  addStop: (position: number) => void;
  removeStop: (id: string) => void;
  setType: (type: GradientType) => void;
  setAngle: (angle: number) => void;
  setInterpolation: (interpolation: GradientInterpolation) => void;
};

const GradientEditorContext = createContext<GradientEditorContextValue | null>(null);

export function useGradientEditor(): GradientEditorContextValue {
  const ctx = useContext(GradientEditorContext);
  if (!ctx) throw new Error("GradientEditor parts must be rendered inside <GradientEditor>.");
  return ctx;
}

export function GradientEditor({
  value: controlledValue,
  defaultValue = DEFAULT_GRADIENT,
  onValueChange,
  className,
  children,
  ...props
}: GradientEditorProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const value = controlledValue ?? uncontrolledValue;
  const { stops } = value;
  const [selectedId, setSelectedId] = useState(stops[0]?.id);
  const trackRef = useRef<HTMLFieldSetElement | null>(null);
  const [stopNodes] = useState(() => new Map<string, HTMLButtonElement>());

  function change(patch: Partial<GradientValue>) {
    const next = { ...value, ...patch };
    if (controlledValue === undefined) setUncontrolledValue(next);
    onValueChange?.(next);
  }

  const canRemoveStop = stops.length > MIN_GRADIENT_STOPS;
  const changeStop = (id: string, patch: Partial<GradientStop>) =>
    change({ stops: stops.map((stop) => (stop.id === id ? { ...stop, ...patch } : stop)) });
  const addStop = (position: number) => {
    const id = unusedStopId(stops);
    const clamped = clamp01(position);
    change({ stops: [...stops, { id, position: clamped, color: gradientColorAt(value, clamped) }] });
    setSelectedId(id);
  };
  const removeStop = (id: string) => {
    if (canRemoveStop) change({ stops: stops.filter((stop) => stop.id !== id) });
  };

  const ctx: GradientEditorContextValue = {
    ...value,
    gradient: formatGradient(value),
    selectedStop: stops.find((stop) => stop.id === selectedId) ?? stops[0],
    canRemoveStop,
    trackRef,
    stopNodes,
    select: setSelectedId,
    setStopColor: (id, color) => changeStop(id, { color }),
    setStopPosition: (id, position) => changeStop(id, { position: clamp01(position) }),
    addStop,
    removeStop,
    setType: (type) => change({ type }),
    setAngle: (angle) => change({ angle }),
    setInterpolation: (interpolation) => change({ interpolation }),
  };

  return (
    <GradientEditorContext.Provider value={ctx}>
      <div
        data-control-ui="gradient-editor"
        data-control-family="gradient-editor"
        data-slot="root"
        className={cn("grid", className)}
        {...props}
      >
        {children}
      </div>
    </GradientEditorContext.Provider>
  );
}

export function GradientEditorPreview({
  className,
  style,
  "aria-label": ariaLabel = "Gradient preview",
  ...props
}: GradientEditorPreviewProps) {
  const { gradient } = useGradientEditor();
  const imageStyle: GradientImageStyle = { ...style, "--_gradient-editor-image": gradient };
  return (
    <div
      data-control-ui="gradient-editor"
      data-control-family="gradient-editor"
      data-slot="preview"
      role="img"
      aria-label={ariaLabel}
      className={cn("w-full", className)}
      style={imageStyle}
      {...props}
    />
  );
}

export function GradientEditorTrack({
  className,
  children,
  style,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: GradientEditorTrackProps) {
  const { stops, interpolation, trackRef, addStop } = useGradientEditor();
  const imageStyle: GradientImageStyle = {
    ...style,
    "--_gradient-editor-image": formatGradient({ type: "linear", angle: 90, interpolation, stops }),
  };
  return (
    <fieldset
      ref={trackRef}
      data-control-ui="gradient-editor"
      data-control-family="gradient-editor"
      data-slot="track"
      aria-label={ariaLabelledBy === undefined ? (ariaLabel ?? "Gradient stops") : ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={cn("relative m-0 min-w-0 w-full cursor-copy touch-pan-y p-0", className)}
      style={imageStyle}
      onPointerDown={(event) => {
        const pressedBareTrack = event.target === event.currentTarget;
        if (!pressedBareTrack) return;
        const rect = event.currentTarget.getBoundingClientRect();
        addStop((event.clientX - rect.left) / rect.width);
      }}
      {...props}
    >
      {children ?? stops.map((stop) => <GradientEditorStop key={stop.id} stop={stop} />)}
    </fieldset>
  );
}

export function GradientEditorStop({
  stop,
  className,
  style,
  onPointerDown,
  onKeyDown,
  onFocus,
  onDoubleClick,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ref,
  ...props
}: GradientEditorStopProps) {
  const { stops, selectedStop, canRemoveStop, select, setStopPosition, removeStop, trackRef, stopNodes } = useGradientEditor();
  const { onPointerDown: startDrag } = useColorArea<HTMLFieldSetElement>(
    (offset, rect) => setStopPosition(stop.id, offset.x / rect.width),
    trackRef,
  );

  function handlePointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    onPointerDown?.(event);
    if (event.defaultPrevented) return;
    select(stop.id);
    event.currentTarget.focus();
    startDrag(event);
  }

  function registerStop(node: HTMLButtonElement) {
    stopNodes.set(stop.id, node);
    const cleanup = typeof ref === "function" ? ref(node) : undefined;
    if (ref && typeof ref === "object") ref.current = node;
    return () => {
      stopNodes.delete(stop.id);
      if (typeof cleanup === "function") cleanup();
      else if (typeof ref === "function") ref(null);
      else if (ref) ref.current = null;
    };
  }

  function remove() {
    if (!canRemoveStop) return;
    const index = stops.findIndex((candidate) => candidate.id === stop.id);
    const neighbour = stops[index + 1] ?? stops[index - 1];
    if (neighbour) stopNodes.get(neighbour.id)?.focus();
    removeStop(stop.id);
  }

  function handleFocus(event: ReactFocusEvent<HTMLButtonElement>) {
    onFocus?.(event);
    if (!event.defaultPrevented) select(stop.id);
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    const step = event.shiftKey ? 0.1 : 0.01;
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowDown":
        event.preventDefault();
        setStopPosition(stop.id, stop.position - step);
        break;
      case "ArrowRight":
      case "ArrowUp":
        event.preventDefault();
        setStopPosition(stop.id, stop.position + step);
        break;
      case "PageDown":
        event.preventDefault();
        setStopPosition(stop.id, stop.position - 0.1);
        break;
      case "PageUp":
        event.preventDefault();
        setStopPosition(stop.id, stop.position + 0.1);
        break;
      case "Home":
        event.preventDefault();
        setStopPosition(stop.id, 0);
        break;
      case "End":
        event.preventDefault();
        setStopPosition(stop.id, 1);
        break;
      case "Backspace":
      case "Delete":
        if (!canRemoveStop) return;
        event.preventDefault();
        remove();
        break;
    }
  }

  function handleDoubleClick(event: ReactMouseEvent<HTMLButtonElement>) {
    onDoubleClick?.(event);
    if (!event.defaultPrevented) remove();
  }

  const percent = Math.round(stop.position * 100);
  const defaultLabel = `Gradient stop ${stops.indexOf(stop) + 1}`;

  return (
    <button
      ref={registerStop}
      type="button"
      role="slider"
      data-control-ui="gradient-editor"
      data-control-family="gradient-editor"
      data-slot="stop"
      data-selected={stop.id === selectedStop?.id ? "true" : undefined}
      aria-label={ariaLabelledBy === undefined ? (ariaLabel ?? defaultLabel) : ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-orientation="horizontal"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-valuetext={`${percent}%, ${stop.color}`}
      onPointerDown={handlePointerDown}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      onDoubleClick={handleDoubleClick}
      className={cn("-translate-x-1/2 absolute top-1/2 -translate-y-1/2 cursor-grab touch-pan-y active:cursor-grabbing", className)}
      style={{ ...style, left: `${stop.position * 100}%`, backgroundColor: stop.color }}
      {...props}
    />
  );
}

export function GradientEditorStopAdd({ className, children, ...props }: GradientEditorStopAddProps) {
  const { addStop } = useGradientEditor();
  return (
    <button
      type="button"
      data-control-ui="gradient-editor"
      data-control-family="gradient-editor"
      data-slot="stop-add"
      aria-label="Add gradient stop"
      onClick={() => addStop(0.5)}
      className={cn("flex shrink-0 cursor-pointer items-center justify-center", className)}
      {...props}
    >
      {children ?? (
        <svg
          viewBox="0 0 16 16"
          className="size-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M8 3v10M3 8h10" />
        </svg>
      )}
    </button>
  );
}
