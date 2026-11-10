"use client";

import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import type { CSSProperties } from "react";
import type { RangeKnobStyle } from "@/components/control-ui/knob-contracts/range-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type SliderVariant = "default" | "plain";

export type SliderValue = number | readonly number[];

export type SliderProps<Value extends SliderValue = number> = Omit<
  SliderPrimitive.Root.Props<Value>,
  "className" | "style" | "children" | "render"
> & {
  variant?: SliderVariant;
  label?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  thumbLabels?: readonly string[];
  className?: string;
  style?: CSSProperties & RangeKnobStyle;
};

const VALUE_SEPARATOR = " – ";

const MAX_VISIBLE_STEP_TICKS = 50;
const STEP_TOLERANCE = 1e-9;

function tickPositions(min: number, max: number, step: number | undefined): number[] {
  if (typeof step !== "number" || step <= 0 || !Number.isFinite(step)) return [];
  const range = max - min;
  if (range <= 0 || range / step > MAX_VISIBLE_STEP_TICKS + STEP_TOLERANCE) return [];
  const positions: number[] = [];
  for (let index = 1; index * step < range - step * STEP_TOLERANCE; index += 1) {
    positions.push(((index * step) / range) * 100);
  }
  return positions;
}

function knobOverrides(style: CSSProperties | undefined): CSSProperties | undefined {
  if (!style) return undefined;
  return Object.fromEntries(Object.entries(style).filter(([property]) => property.startsWith("--")));
}

function thumbIndexes(value: SliderValue | undefined): number[] {
  const count = value === undefined || typeof value === "number" ? 1 : value.length;
  return Array.from({ length: count }, (_, index) => index);
}

export function Slider<Value extends SliderValue = number>({
  className,
  variant = "default",
  label,
  showValue,
  formatValue,
  thumbLabels,
  value,
  defaultValue,
  orientation = "horizontal",
  min = 0,
  max = 100,
  step,
  style,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  ...props
}: SliderProps<Value>) {
  const showValueResolved = showValue ?? Boolean(label);
  const labeled = variant === "plain" && (label !== undefined || showValue === true);
  const labeledAttribute = labeled ? "true" : undefined;
  const vertical = orientation === "vertical";
  const ticks = labeled ? tickPositions(min, max, step) : [];
  const partStyle = knobOverrides(style);
  const verticalControlLayout = labeled ? "min-h-0 flex-1" : "self-stretch";
  const thumbLabel = ariaLabel ?? (labeled ? undefined : label);

  return (
    <SliderPrimitive.Root<Value>
      data-control-ui="slider"
      data-range-kind="slider"
      data-slot="root"
      data-control-family="range"
      data-variant={variant}
      orientation={orientation}
      data-labeled={labeledAttribute}
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      step={step}
      className={cn(
        "group relative flex select-none items-center",
        vertical ? cn("min-h-20 w-fit touch-pan-x", labeled && "flex-col") : "w-full touch-pan-y",
        className,
      )}
      style={style}
      {...props}
    >
      <SliderPrimitive.Control
        data-control-ui="slider"
        data-control-family="range"
        data-range-kind="slider"
        data-slot="control"
        data-labeled={labeledAttribute}
        className={cn("flex items-center", vertical ? verticalControlLayout : "w-full")}
      >
        <SliderPrimitive.Track
          data-control-ui="slider"
          data-control-family="range"
          data-range-kind="slider"
          data-slot="track"
          data-variant={variant}
          data-labeled={labeledAttribute}
          className={cn("relative grow", vertical ? "h-auto self-stretch" : "w-full")}
          style={partStyle}
        >
          <SliderPrimitive.Indicator
            data-control-ui="slider"
            data-control-family="range"
            data-range-kind="slider"
            data-slot="indicator"
            data-variant={variant}
            style={partStyle}
          />
          {ticks.map((pct) => (
            <span
              key={pct}
              aria-hidden
              data-control-ui="slider"
              data-control-family="range"
              data-range-kind="slider"
              data-slot="tick"
              className="pointer-events-none absolute"
              style={vertical ? { bottom: `${pct}%` } : { insetInlineStart: `${pct}%`, bottom: 0 }}
            />
          ))}
          {thumbIndexes(value ?? defaultValue).map((thumbIndex) => (
            <SliderPrimitive.Thumb
              key={thumbIndex}
              index={thumbIndex}
              aria-label={thumbLabels?.[thumbIndex] ?? thumbLabel}
              aria-describedby={ariaDescribedBy}
              getAriaValueText={formatValue ? (_, thumbValue) => formatValue(thumbValue) : undefined}
              data-control-ui="slider"
              data-control-family="range"
              data-range-kind="slider"
              data-slot="thumb"
              data-variant={variant}
              data-focus-ring="within"
              className="block"
              style={partStyle}
            />
          ))}
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
      {labeled && <SliderLabelOverlay label={label} showValue={showValueResolved} formatValue={formatValue} vertical={vertical} />}
    </SliderPrimitive.Root>
  );
}

function SliderLabelOverlay({
  label,
  showValue,
  formatValue,
  vertical,
}: {
  label: string | undefined;
  showValue: boolean;
  formatValue: ((value: number) => string) | undefined;
  vertical: boolean;
}) {
  return (
    <div
      data-control-ui="slider"
      data-control-family="range"
      data-range-kind="slider"
      data-slot="label-overlay"
      className={vertical ? "contents" : "pointer-events-none absolute inset-0 z-1 flex items-center justify-between"}
    >
      {label ? (
        <SliderPrimitive.Label
          data-control-ui="slider"
          data-control-family="range"
          data-range-kind="slider"
          data-slot="label"
          className={cn("select-none", vertical && "order-first")}
        >
          {label}
        </SliderPrimitive.Label>
      ) : (
        <span />
      )}
      {showValue && (
        <SliderPrimitive.Value
          data-control-ui="slider"
          data-control-family="range"
          data-range-kind="slider"
          data-slot="value"
          className="select-none"
        >
          {(formattedValues, values) =>
            (formatValue ? values.map((thumbValue) => formatValue(thumbValue)) : formattedValues).join(VALUE_SEPARATOR)
          }
        </SliderPrimitive.Value>
      )}
    </div>
  );
}
