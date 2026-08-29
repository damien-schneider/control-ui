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
import type { ControlSize } from "@/components/control-ui/control-variants";
import type { GradientEditorKnobStyle } from "@/components/control-ui/knob-contracts/gradient-editor-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { formatGradient } from "@/components/control-ui/lib/color";
import {
  ColorPicker,
  ColorPickerAlpha,
  ColorPickerArea,
  ColorPickerContent,
  ColorPickerFormatSelect,
  ColorPickerHue,
  ColorPickerInput,
  ColorPickerTrigger,
} from "@/components/control-ui/ui/color-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/control-ui/ui/select";

export type GradientType = "linear" | "radial" | "conic";

export type GradientStop = { id: string; position: number; color: string };

export type GradientEditorProps = Omit<ComponentProps<"div">, "onChange" | "defaultValue"> & {
  value?: string;
  defaultStops?: GradientStop[];
  defaultType?: GradientType;
  defaultAngle?: number;
  onValueChange?: (value: string) => void;
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

export type GradientEditorTypeSelectProps = {
  size?: ControlSize;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

const DEFAULT_STOPS: GradientStop[] = [
  { id: "stop-1", position: 0, color: "#7c3aed" },
  { id: "stop-2", position: 1, color: "#3b82f6" },
];

const isGradientType = (v: string): v is GradientType => v === "linear" || v === "radial" || v === "conic";
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

type GradientEditorContextValue = {
  stops: GradientStop[];
  type: GradientType;
  angle: number;
  selectedId: string;
  gradient: string;
  trackRef: RefObject<HTMLFieldSetElement | null>;
  select: (id: string) => void;
  setStopColor: (id: string, color: string) => void;
  setStopPosition: (id: string, position: number) => void;
  addStop: (position: number) => void;
  removeStop: (id: string) => void;
  setType: (type: GradientType) => void;
};

const GradientEditorContext = createContext<GradientEditorContextValue | null>(null);

function useGradientEditor(): GradientEditorContextValue {
  const ctx = useContext(GradientEditorContext);
  if (!ctx) throw new Error("GradientEditor parts must be rendered inside <GradientEditor>.");
  return ctx;
}

export function GradientEditor({
  defaultStops = DEFAULT_STOPS,
  defaultType = "linear",
  defaultAngle = 90,
  onValueChange,
  className,
  children,
  value: _value,
  ...props
}: GradientEditorProps) {
  const [stops, setStops] = useState<GradientStop[]>(defaultStops);
  const [type, setTypeState] = useState<GradientType>(defaultType);
  const [angle] = useState(defaultAngle);
  const [selectedId, setSelectedId] = useState(defaultStops[0]?.id ?? "stop-1");
  const idCounter = useRef(defaultStops.length);
  const trackRef = useRef<HTMLFieldSetElement | null>(null);

  const gradient = formatGradient(stops, type, angle);

  function updateStops(nextStops: GradientStop[]) {
    setStops(nextStops);
    onValueChange?.(formatGradient(nextStops, type, angle));
  }

  const setStopColor = (id: string, color: string) => updateStops(stops.map((stop) => (stop.id === id ? { ...stop, color } : stop)));
  const setStopPosition = (id: string, position: number) =>
    updateStops(stops.map((stop) => (stop.id === id ? { ...stop, position: clamp01(position) } : stop)));
  const addStop = (position: number) => {
    idCounter.current += 1;
    const id = `stop-${idCounter.current}`;
    const near = [...stops].sort((a, b) => Math.abs(a.position - position) - Math.abs(b.position - position))[0];
    updateStops([...stops, { id, position: clamp01(position), color: near?.color ?? "#ffffff" }]);
    setSelectedId(id);
  };
  const removeStop = (id: string) => {
    if (stops.length <= 2) return; // a gradient needs at least two stops
    const nextStops = stops.filter((stop) => stop.id !== id);
    updateStops(nextStops);
    if (selectedId === id) setSelectedId(nextStops[0]?.id ?? selectedId);
  };
  const setType = (nextType: GradientType) => {
    setTypeState(nextType);
    onValueChange?.(formatGradient(stops, nextType, angle));
  };

  const ctx: GradientEditorContextValue = {
    stops,
    type,
    angle,
    selectedId,
    gradient,
    trackRef,
    select: setSelectedId,
    setStopColor,
    setStopPosition,
    addStop,
    removeStop,
    setType,
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
  return (
    <div
      data-control-ui="gradient-editor"
      data-control-family="gradient-editor"
      data-slot="preview"
      role="img"
      aria-label={ariaLabel}
      className={cn("w-full", className)}
      style={{ ...style, backgroundImage: gradient }}
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
  const { stops, trackRef, addStop } = useGradientEditor();
  const stripe = formatGradient(stops, "linear", 90);
  return (
    <fieldset
      ref={trackRef}
      data-control-ui="gradient-editor"
      data-control-family="gradient-editor"
      data-slot="track"
      aria-label={ariaLabelledBy === undefined ? (ariaLabel ?? "Gradient stops") : ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={cn("relative m-0 min-w-0 w-full cursor-copy p-0", className)}
      style={{ ...style, backgroundImage: stripe }}
      onPointerDown={(event) => {
        // only bare track adds stop — click on handle is that handle's to deal with
        if (event.target !== event.currentTarget) return;
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
  ...props
}: GradientEditorStopProps) {
  const { stops, selectedId, select, setStopPosition, removeStop, trackRef } = useGradientEditor();
  const selected = stop.id === selectedId;
  const canRemove = stops.length > 2;

  function handlePointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    onPointerDown?.(event);
    if (event.defaultPrevented) return;
    select(stop.id);
    event.currentTarget.focus();
    event.preventDefault();
    const track = trackRef.current;
    if (!track) return;
    const move = (moveEvent: globalThis.PointerEvent) => {
      const rect = track.getBoundingClientRect();
      setStopPosition(stop.id, (moveEvent.clientX - rect.left) / rect.width);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      document.body.style.userSelect = "";
    };
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
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
        if (!canRemove) return;
        event.preventDefault();
        removeStop(stop.id);
        break;
    }
  }

  function handleDoubleClick(event: ReactMouseEvent<HTMLButtonElement>) {
    onDoubleClick?.(event);
    if (!event.defaultPrevented) removeStop(stop.id);
  }

  const percent = Math.round(stop.position * 100);
  const defaultLabel = `Gradient stop at ${percent}%. Use arrow keys to move${canRemove ? ", Delete to remove" : ""}.`;

  return (
    <button
      type="button"
      data-control-ui="gradient-editor"
      data-control-family="gradient-editor"
      data-slot="stop"
      data-selected={selected ? "true" : undefined}
      aria-label={ariaLabelledBy === undefined ? (ariaLabel ?? defaultLabel) : ariaLabel}
      aria-labelledby={ariaLabelledBy}
      onPointerDown={handlePointerDown}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      onDoubleClick={handleDoubleClick}
      className={cn("-translate-x-1/2 absolute top-1/2 -translate-y-1/2 cursor-grab overflow-hidden active:cursor-grabbing", className)}
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

export function GradientEditorStopColor() {
  const { stops, selectedId, setStopColor } = useGradientEditor();
  const selected = stops.find((s) => s.id === selectedId) ?? stops[0];
  if (!selected) return null;
  return (
    <ColorPicker value={selected.color} onValueChange={(color) => setStopColor(selected.id, color)} defaultFormat="hex">
      <ColorPickerTrigger />
      <ColorPickerContent>
        <ColorPickerArea />
        <ColorPickerHue />
        <ColorPickerAlpha />
        <div data-control-ui="gradient-editor" data-control-family="gradient-editor" data-slot="value-row" className="flex">
          <ColorPickerFormatSelect />
          <ColorPickerInput className="flex-1" />
        </div>
      </ColorPickerContent>
    </ColorPicker>
  );
}

export function GradientEditorTypeSelect({
  size = "sm",
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: GradientEditorTypeSelectProps) {
  const { type, setType } = useGradientEditor();
  return (
    <Select
      value={type}
      onValueChange={(value) => {
        if (isGradientType(value)) setType(value);
      }}
    >
      <SelectTrigger
        size={size}
        aria-label={ariaLabelledBy === undefined ? (ariaLabel ?? "Gradient type") : ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={className}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="linear">Linear</SelectItem>
        <SelectItem value="radial">Radial</SelectItem>
        <SelectItem value="conic">Conic</SelectItem>
      </SelectContent>
    </Select>
  );
}
