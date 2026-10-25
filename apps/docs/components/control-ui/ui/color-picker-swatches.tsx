"use client";

import type { ComponentProps, CSSProperties, ReactNode } from "react";
import type { ButtonKnobStyle } from "@/components/control-ui/knob-contracts/button-knobs";
import type { ColorPickerKnobStyle } from "@/components/control-ui/knob-contracts/color-picker-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { formatColor, parseColor } from "@/components/control-ui/lib/color";
import { Button } from "@/components/control-ui/ui/button";
import { useColorPicker } from "@/components/control-ui/ui/color-picker-context";

export type ColorPickerSwatchesProps = ComponentProps<"div"> & {
  colors?: string[];
  label?: ReactNode;
} & { style?: CSSProperties & ColorPickerKnobStyle };

export type ColorPickerSwatchProps = Omit<Omit<ComponentProps<"button">, "color">, "style"> & {
  style?: CSSProperties & ColorPickerKnobStyle;
} & {
  color: string;
};

export type ColorPickerSwatchAddProps = Omit<ComponentProps<"button">, "onClick" | "style"> & {
  style?: CSSProperties & ButtonKnobStyle;
} & {
  onAdd?: (value: string) => void;
};

export function ColorPickerSwatches({ colors, label, className, children, ...props }: ColorPickerSwatchesProps) {
  return (
    <div data-control-ui="color-picker" data-control-family="color-picker" data-slot="swatches-group" className="grid">
      {label ? (
        <span data-control-ui="color-picker" data-control-family="color-picker" data-slot="swatches-label">
          {label}
        </span>
      ) : null}
      <div
        data-control-ui="color-picker"
        data-control-family="color-picker"
        data-slot="swatches"
        className={cn("flex flex-wrap", className)}
        {...props}
      >
        {colors?.map((color) => (
          <ColorPickerSwatch key={color} color={color} />
        ))}
        {children}
      </div>
    </div>
  );
}

export function ColorPickerSwatch({ color, className, "aria-label": ariaLabel, ...props }: ColorPickerSwatchProps) {
  const { setFromString, valueString, disabled } = useColorPicker();
  const selected = sameColor(valueString, color);
  return (
    <button
      type="button"
      data-control-ui="color-picker"
      data-control-family="color-picker"
      data-slot="swatch"
      data-selected={selected ? "true" : undefined}
      aria-pressed={selected}
      aria-label={ariaLabel ?? `Set color ${color}`}
      title={color}
      disabled={disabled}
      onClick={() => setFromString(color)}
      className={cn("relative shrink-0 cursor-pointer overflow-hidden disabled:cursor-not-allowed", className)}
      {...props}
    >
      <span
        data-control-ui="color-picker"
        data-control-family="color-picker"
        data-slot="swatch-checker"
        aria-hidden
        className="absolute inset-0"
      />
      <span
        data-control-ui="color-picker"
        data-control-family="color-picker"
        data-slot="swatch-color"
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundColor: color }}
      />
    </button>
  );
}

export function ColorPickerSwatchAdd({ onAdd, children, ...props }: ColorPickerSwatchAddProps) {
  const { valueString, disabled } = useColorPicker();
  return (
    <Button
      variant="dashed"
      size="xs"
      iconOnly
      data-color-picker-swatch-add="true"
      aria-label="Add current color"
      disabled={disabled}
      onClick={() => onAdd?.(valueString)}
      {...props}
    >
      {children ?? <PlusIcon />}
    </Button>
  );
}

function sameColor(a: string, b: string): boolean {
  const pa = parseColor(a);
  const pb = parseColor(b);
  if (!pa || !pb) return false;
  return formatColor(pa, "hex", { alpha: true }) === formatColor(pb, "hex", { alpha: true });
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}
