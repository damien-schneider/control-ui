"use client";

import type { ComponentProps, CSSProperties, KeyboardEvent as ReactKeyboardEvent } from "react";
import { useColorArea } from "@/components/control-ui/hooks/use-color-area";
import type { ColorPickerKnobStyle } from "@/components/control-ui/knob-contracts/color-picker-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { pointToHueSat, pointToSaturationValue } from "@/components/control-ui/lib/color";
import { useColorPicker } from "@/components/control-ui/ui/color-picker-context";

export type ColorPickerAreaProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & ColorPickerKnobStyle };

export type ColorPickerAreaThumbProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & ColorPickerKnobStyle };

export type ColorPickerWheelProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & ColorPickerKnobStyle };

export function ColorPickerArea({ className, style, children, ...props }: ColorPickerAreaProps) {
  const { hsva, setHsva, disabled } = useColorPicker();
  const { areaRef, onPointerDown, dragging } = useColorArea((offset, rect) => {
    if (disabled) return;
    const { s, v } = pointToSaturationValue(rect, offset.x, offset.y);
    setHsva({ s, v });
  });

  function axisKey(axis: "s" | "v", event: ReactKeyboardEvent) {
    if (!event.shiftKey) return;
    const cur = axis === "s" ? hsva.s : hsva.v;
    let delta = 0;
    if (event.key === "ArrowUp" || event.key === "ArrowRight") delta = 10;
    else if (event.key === "ArrowDown" || event.key === "ArrowLeft") delta = -10;
    if (delta === 0) return;
    event.preventDefault();
    const next = Math.min(100, Math.max(0, cur + delta));
    setHsva(axis === "s" ? { s: next } : { v: next });
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: a 2D color surface is a labelled slider group, not a fieldset form group.
    <div
      data-focus-ring="within"
      ref={areaRef}
      data-control-ui="color-picker"
      data-control-family="color-picker"
      data-slot="area"
      data-disabled={disabled ? "true" : undefined}
      data-dragging={dragging ? "true" : undefined}
      role="group"
      aria-label="Saturation and brightness"
      onPointerDown={disabled ? undefined : onPointerDown}
      className={cn(
        "group relative w-full touch-none select-none overflow-hidden",
        disabled ? "cursor-not-allowed" : "cursor-crosshair",
        className,
      )}
      style={{ ...style, backgroundColor: `hsl(${hsva.h} 100% 50%)` }}
      {...props}
    >
      <span
        aria-hidden
        data-control-ui="color-picker"
        data-control-family="color-picker"
        data-slot="area-saturation"
        className="absolute inset-0"
      />
      <span
        aria-hidden
        data-control-ui="color-picker"
        data-control-family="color-picker"
        data-slot="area-brightness"
        className="absolute inset-0"
      />
      <input
        type="range"
        aria-label="Saturation"
        className="sr-only"
        min={0}
        max={100}
        step={1}
        value={Math.round(hsva.s)}
        disabled={disabled}
        onChange={(event) => setHsva({ s: Number(event.target.value) })}
        onKeyDown={(event) => axisKey("s", event)}
      />
      <input
        type="range"
        aria-label="Brightness"
        className="sr-only"
        min={0}
        max={100}
        step={1}
        value={Math.round(hsva.v)}
        disabled={disabled}
        onChange={(event) => setHsva({ v: Number(event.target.value) })}
        onKeyDown={(event) => axisKey("v", event)}
      />
      {children ?? <ColorPickerAreaThumb />}
    </div>
  );
}

export function ColorPickerAreaThumb({ className, style, ...props }: ColorPickerAreaThumbProps) {
  const { hsva } = useColorPicker();
  return (
    <div
      data-control-ui="color-picker"
      data-control-family="color-picker"
      data-slot="area-thumb"
      aria-hidden
      className={cn("pointer-events-none absolute -translate-x-1/2 -translate-y-1/2", className)}
      style={{ ...style, left: `${hsva.s}%`, top: `${100 - hsva.v}%` }}
      {...props}
    />
  );
}

const WHEEL_HUE =
  "conic-gradient(from 90deg, hsl(0 100% 50%), hsl(60 100% 50%), hsl(120 100% 50%), hsl(180 100% 50%), hsl(240 100% 50%), hsl(300 100% 50%), hsl(360 100% 50%))";

export function ColorPickerWheel({ className, style, ...props }: ColorPickerWheelProps) {
  const { hsva, setHsva, disabled } = useColorPicker();
  const { areaRef, onPointerDown, dragging } = useColorArea((offset, rect) => {
    if (disabled) return;
    const { h, s } = pointToHueSat(rect, offset.x, offset.y);
    setHsva({ h, s });
  });
  const radius = (hsva.s / 100) * 50;
  const rad = (hsva.h * Math.PI) / 180;
  const left = 50 + radius * Math.cos(rad);
  const top = 50 + radius * Math.sin(rad);
  return (
    // biome-ignore lint/a11y/useSemanticElements: a 2D color surface is a labelled slider group, not a fieldset form group.
    <div
      data-focus-ring="within"
      ref={areaRef}
      data-control-ui="color-picker"
      data-control-family="color-picker"
      data-slot="wheel"
      data-disabled={disabled ? "true" : undefined}
      data-dragging={dragging ? "true" : undefined}
      role="group"
      aria-label="Color wheel"
      onPointerDown={disabled ? undefined : onPointerDown}
      className={cn(
        "group relative aspect-square w-full touch-none select-none",
        disabled ? "cursor-not-allowed" : "cursor-crosshair",
        className,
      )}
      style={{ ...style, backgroundImage: `radial-gradient(circle at center, #fff, transparent 70%), ${WHEEL_HUE}` }}
      {...props}
    >
      <div
        data-control-ui="color-picker"
        data-control-family="color-picker"
        data-slot="wheel-thumb"
        aria-hidden
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${left}%`, top: `${top}%` }}
      />
      <input
        type="range"
        aria-label="Wheel hue"
        className="sr-only"
        min={0}
        max={360}
        step={1}
        value={Math.round(hsva.h)}
        disabled={disabled}
        onChange={(event) => setHsva({ h: Number(event.target.value) })}
      />
      <input
        type="range"
        aria-label="Wheel saturation"
        className="sr-only"
        min={0}
        max={100}
        step={1}
        value={Math.round(hsva.s)}
        disabled={disabled}
        onChange={(event) => setHsva({ s: Number(event.target.value) })}
      />
    </div>
  );
}
