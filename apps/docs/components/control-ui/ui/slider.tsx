"use client";

import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import type { SliderProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";

const MAX_VISIBLE_STEP_TICKS = 50;

// skipped when steps are too fine or too coarse to read as marks
function tickPositions(min: number, max: number, step: number | undefined): number[] {
  if (typeof step !== "number" || step <= 0 || !Number.isFinite(step)) return [];
  const range = max - min;
  if (range <= 0) return [];
  const stepCount = Math.round(range / step);
  if (stepCount <= 1 || stepCount > MAX_VISIBLE_STEP_TICKS) return [];
  return Array.from({ length: stepCount - 1 }, (_, i) => ((i + 1) / stepCount) * 100);
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
  min = 0,
  max = 100,
  step,
  disabled,
  style,
  ...props
}: SliderProps) {
  const showValueResolved = showValue ?? Boolean(label);
  const labeled = variant === "plain" && (label !== undefined || showValue === true);
  const ticks = labeled ? tickPositions(min, max, step) : [];
  const trackStyle = style;
  const indicatorStyle = style;
  const thumbStyle = style;

  // explicit, never spread: Base UI reads controlled-ness from `value !== undefined`, and spread can carry `undefined` for tick
  return (
    <SliderPrimitive.Root
      data-control-ui="slider"
      data-range-kind="slider"
      data-slot="root"
      data-control-family="range"
      data-variant={variant}
      data-labeled={labeled ? "true" : undefined}
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      onValueChange={onValueChange ? (next) => onValueChange(Array.isArray(next) ? next[0] : next) : undefined}
      className={cn(
        "group relative flex w-full cursor-pointer touch-none select-none items-center data-[disabled]:cursor-not-allowed",
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
        className={cn("flex w-full items-center", labeled ? "h-[1.875rem]" : "py-1.5")}
      >
        <SliderPrimitive.Track
          data-control-ui="slider"
          data-control-family="range"
          data-range-kind="slider"
          data-slot="track"
          data-variant={variant}
          className={cn("relative w-full grow overflow-hidden", variant === "default" ? "h-1.5" : "h-1.5", labeled && "h-full")}
          style={trackStyle}
        >
          <SliderPrimitive.Indicator
            data-control-ui="slider"
            data-control-family="range"
            data-range-kind="slider"
            data-slot="indicator"
            data-variant={variant}
            style={indicatorStyle}
          />
          {ticks.map((pct) => (
            <span
              key={pct}
              aria-hidden
              data-control-ui="slider"
              data-control-family="range"
              data-range-kind="slider"
              data-slot="tick"
              className="pointer-events-none absolute bottom-0 h-1.5 w-px"
              style={{ left: `${pct}%` }}
            />
          ))}
          <SliderPrimitive.Thumb
            data-control-ui="slider"
            data-control-family="range"
            data-range-kind="slider"
            data-slot="thumb"
            data-variant={variant}
            className={cn("block", variant === "default" ? "size-3.5" : "after:absolute after:-inset-3 after:content-['']")}
            style={thumbStyle}
          />
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
      {labeled && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-between px-3">
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
              {(_, values) => (formatValue ? formatValue(values[0]) : Math.round(values[0]))}
            </SliderPrimitive.Value>
          )}
        </div>
      )}
    </SliderPrimitive.Root>
  );
}
