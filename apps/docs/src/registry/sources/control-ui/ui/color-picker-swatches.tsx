"use client";

import { type ComponentProps, type CSSProperties, type ReactNode, useId } from "react";
import type { ButtonKnobStyle } from "@/components/control-ui/knob-contracts/button-knobs";
import type { ColorPickerKnobStyle } from "@/components/control-ui/knob-contracts/color-picker-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { formatColor, parseColor } from "@/components/control-ui/lib/color";
import { Button } from "@/components/control-ui/ui/button";
import { useColorPicker } from "@/components/control-ui/ui/color-picker-context";

export type ColorPickerSwatchesProps = ComponentProps<"div"> & {
  colors?: string[];
  label?: ReactNode;
  groupProps?: Omit<ComponentProps<"div">, "children">;
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

export function ColorPickerSwatches({ colors, label, groupProps, className, children, ...props }: ColorPickerSwatchesProps) {
  const labelId = useId();
  return (
    <div
      {...groupProps}
      data-control-ui="color-picker"
      data-control-family="color-picker"
      data-slot="swatches-group"
      className={cn("grid", groupProps?.className)}
    >
      {label ? (
        <span id={labelId} data-control-ui="color-picker" data-control-family="color-picker" data-slot="swatches-label">
          {label}
        </span>
      ) : null}
      <div
        data-control-ui="color-picker"
        data-control-family="color-picker"
        data-slot="swatches"
        {...(label ? ({ role: "group", "aria-labelledby": labelId } as const) : undefined)}
        className={cn("flex flex-wrap", className)}
        {...props}
      >
        {colors?.map((color, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: a palette may repeat a color, so the color alone is not a unique key.
          <ColorPickerSwatch key={`${color}-${index}`} color={color} />
        ))}
        {children}
      </div>
    </div>
  );
}

export function ColorPickerSwatch({
  color,
  className,
  "aria-label": ariaLabel,
  onClick,
  disabled: disabledProp,
  ...props
}: ColorPickerSwatchProps) {
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
      disabled={disabled || disabledProp}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setFromString(color);
      }}
      className={cn("relative shrink-0 overflow-hidden", className)}
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

export function ColorPickerSwatchAdd({ onAdd, children, disabled: disabledProp, ...props }: ColorPickerSwatchAddProps) {
  const { valueString, disabled } = useColorPicker();
  return (
    <Button
      variant="dashed"
      size="xs"
      iconOnly
      data-color-picker-swatch-add="true"
      aria-label="Add current color"
      disabled={disabled || disabledProp}
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
