"use client";

import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import type { CSSProperties } from "react";
import type { RangeKnobStyle } from "@/components/control-ui/knob-contracts/range-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type SliderVariant = "default" | "plain";

export type SliderProps = Omit<
  {
    variant?: SliderVariant;
    value?: number;
    defaultValue?: number;
    onValueChange?: (value: number) => void;
    onValueCommitted?: (value: number) => void;
    orientation?: "horizontal" | "vertical";
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    label?: string;
    showValue?: boolean;
    formatValue?: (value: number) => string;
    className?: string;
    "aria-label"?: string;
  },
  "style"
> & { style?: CSSProperties & RangeKnobStyle };

const MAX_VISIBLE_STEP_TICKS = 50;

function tickPositions(min: number, max: number, step: number | undefined): number[] {
  if (typeof step !== "number" || step <= 0 || !Number.isFinite(step)) return [];
  const range = max - min;
  if (range <= 0) return [];
  const stepCount = Math.round(range / step);
  if (stepCount <= 1 || stepCount > MAX_VISIBLE_STEP_TICKS) return [];
  return Array.from({ length: stepCount - 1 }, (_, i) => ((i + 1) / stepCount) * 100);
}

function displaySliderValue(values: readonly number[], formatValue?: (value: number) => string): string | number {
  const value = values[0];
  if (value === undefined) return "";
  return formatValue ? formatValue(value) : Math.round(value);
}

export function Slider({
  className,
  variant = "default",
  label,
  showValue,
  formatValue,
  value,
  defaultValue,
  onValueChange,
  onValueCommitted,
  orientation = "horizontal",
  min = 0,
  max = 100,
  step,
  disabled,
  style,
  "aria-label": ariaLabel,
  ...props
}: SliderProps) {
  const showValueResolved = showValue ?? Boolean(label);
  const labeled = variant === "plain" && (label !== undefined || showValue === true);
  const ticks = labeled ? tickPositions(min, max, step) : [];

  return (
    <SliderPrimitive.Root<number>
      data-control-ui="slider"
      data-range-kind="slider"
      data-slot="root"
      data-control-family="range"
      data-variant={variant}
      orientation={orientation}
      data-labeled={labeled ? "true" : undefined}
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      onValueChange={onValueChange}
      onValueCommitted={onValueCommitted}
      className={cn(
        "group relative flex cursor-pointer touch-none select-none items-center data-[disabled]:cursor-not-allowed",
        orientation === "vertical" ? "min-h-20 w-fit" : "w-full",
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
        data-labeled={labeled ? "true" : undefined}
        className={cn("flex items-center", orientation === "vertical" ? "h-full" : "w-full")}
      >
        <SliderPrimitive.Track
          data-control-ui="slider"
          data-control-family="range"
          data-range-kind="slider"
          data-slot="track"
          data-variant={variant}
          data-labeled={labeled ? "true" : undefined}
          className={cn("relative grow", orientation === "vertical" ? "h-full" : "w-full")}
          style={style}
        >
          <SliderPrimitive.Indicator
            data-control-ui="slider"
            data-control-family="range"
            data-range-kind="slider"
            data-slot="indicator"
            data-variant={variant}
            style={style}
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
              style={orientation === "vertical" ? { bottom: `${pct}%` } : { left: `${pct}%`, bottom: 0 }}
            />
          ))}
          <SliderPrimitive.Thumb
            aria-label={ariaLabel}
            data-control-ui="slider"
            data-control-family="range"
            data-range-kind="slider"
            data-slot="thumb"
            data-variant={variant}
            className={cn("block", variant === "plain" && "after:absolute after:-inset-3 after:content-['']")}
            style={style}
          />
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
      {labeled && (
        <div
          data-control-ui="slider"
          data-control-family="range"
          data-range-kind="slider"
          data-slot="label-overlay"
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-between"
        >
          {label ? (
            <SliderPrimitive.Label
              data-control-ui="slider"
              data-control-family="range"
              data-range-kind="slider"
              data-slot="label"
              className="select-none"
            >
              {label}
            </SliderPrimitive.Label>
          ) : (
            <span />
          )}
          {showValueResolved && (
            <SliderPrimitive.Value
              data-control-ui="slider"
              data-control-family="range"
              data-range-kind="slider"
              data-slot="value"
              className="select-none"
            >
              {(_, values) => displaySliderValue(values, formatValue)}
            </SliderPrimitive.Value>
          )}
        </div>
      )}
    </SliderPrimitive.Root>
  );
}
