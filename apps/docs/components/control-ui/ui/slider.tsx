"use client";

import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { cva } from "class-variance-authority";
import type { SliderProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

const MAX_VISIBLE_STEP_TICKS = 50;

// Tick offsets (%) for stepped slider; skipped when steps too fine/coarse to read as marks (matches one-rec's threshold).
function tickPositions(min: number, max: number, step: number | undefined): number[] {
  if (typeof step !== "number" || step <= 0 || !Number.isFinite(step)) return [];
  const range = max - min;
  if (range <= 0) return [];
  const stepCount = Math.round(range / step);
  if (stepCount <= 1 || stepCount > MAX_VISIBLE_STEP_TICKS) return [];
  return Array.from({ length: stepCount - 1 }, (_, i) => ((i + 1) / stepCount) * 100);
}

// variant: "default" = branded (muted track/primary indicator/pill thumb). "plain" = neutral monochrome (one-rec precision slider), for unbranded contexts.
// plain + label/showValue grows into labeled bar: taller track, label+live value inside, step ticks.
const trackVariant = cva("relative w-full grow overflow-hidden transition-colors duration-[var(--duration-fast)]", {
  variants: {
    variant: {
      default: "h-1.5 rounded-full bg-muted",
      plain: "h-1.5 rounded-[3px] bg-foreground/6 data-[dragging]:bg-foreground/10",
    },
  },
  defaultVariants: { variant: "default" },
});

const indicatorVariant = cva("transition-colors duration-[var(--duration-fast)]", {
  variants: {
    variant: {
      default: "rounded-full bg-primary",
      plain: "bg-foreground/14 data-[dragging]:bg-foreground/25",
    },
  },
  defaultVariants: { variant: "default" },
});

const thumbVariant = cva(
  "block outline-none transition-[transform,background-color,box-shadow,height,width] duration-[var(--duration-fast)] focus-visible:ring-2 focus-visible:ring-foreground/30",
  {
    variants: {
      variant: {
        default:
          "size-3.5 rounded-full border border-border bg-background shadow-sm hover:scale-110 data-[dragging]:scale-110 data-[dragging]:shadow-md",
        plain:
          "h-4 w-0.5 rounded-[1px] bg-foreground/30 after:absolute after:-inset-3 after:content-[''] hover:bg-foreground/50 data-[dragging]:h-5 data-[dragging]:bg-foreground/70",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

// Bottom-anchored so grow-on-drag reads as tick rising from track, not expanding from middle.
const tick =
  "pointer-events-none absolute bottom-0 h-1.5 w-px bg-foreground/15 transition-[height,background-color] duration-[var(--duration-fast)] ease-[var(--ease-standard)] group-data-[dragging]:h-3 group-data-[dragging]:bg-foreground/25";

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
  ...props
}: SliderProps) {
  const showValueResolved = showValue ?? Boolean(label);
  const labeled = variant === "plain" && (label !== undefined || showValue === true);
  const ticks = labeled ? tickPositions(min, max, step) : [];

  // value/defaultValue passed explicitly, not via spread: Base UI reads controlled-ness from `value !== undefined` on first render; React Compiler can spread `undefined` for a tick, tripping the uncontrolled→controlled warning.
  return (
    <SliderPrimitive.Root
      data-control-ui="slider"
      data-slot="root"
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
        "group relative flex w-full cursor-pointer touch-none select-none items-center data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        skinSlot("slider", "root", { variant, labeled }),
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Control
        data-control-ui="slider"
        data-slot="control"
        className={cn("flex w-full items-center", labeled ? "h-[1.875rem]" : "py-1.5", skinSlot("slider", "control", {}))}
      >
        <SliderPrimitive.Track
          data-control-ui="slider"
          data-slot="track"
          className={cn(trackVariant({ variant }), labeled && "h-full rounded-[var(--radius-control)]", skinSlot("slider", "track", {}))}
        >
          <SliderPrimitive.Indicator
            data-control-ui="slider"
            data-slot="indicator"
            className={cn(indicatorVariant({ variant }), skinSlot("slider", "indicator", {}))}
          />
          {ticks.map((pct) => (
            <span key={pct} aria-hidden className={tick} style={{ left: `${pct}%` }} />
          ))}
          <SliderPrimitive.Thumb
            data-control-ui="slider"
            data-slot="thumb"
            className={cn(thumbVariant({ variant }), skinSlot("slider", "thumb", {}))}
          />
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
      {labeled && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-between px-3">
          {label ? (
            <SliderPrimitive.Label
              data-control-ui="slider"
              data-slot="label"
              className={cn(
                "select-none text-meta leading-3.5 tracking-tight text-muted-foreground transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
                "group-data-[dragging]:-translate-x-1 group-data-[dragging]:-translate-y-1.5 group-data-[dragging]:scale-90",
                skinSlot("slider", "label", {}),
              )}
            >
              {label}
            </SliderPrimitive.Label>
          ) : (
            <span />
          )}
          {showValueResolved && (
            <SliderPrimitive.Value
              data-control-ui="slider"
              data-slot="value"
              className={cn(
                "select-none text-meta leading-3.5 tracking-tight text-muted-foreground tabular-nums transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
                "group-data-[dragging]:translate-x-0.5 group-data-[dragging]:-translate-y-1.5 group-data-[dragging]:text-foreground",
                skinSlot("slider", "value", {}),
              )}
            >
              {(_, values) => (formatValue ? formatValue(values[0]) : Math.round(values[0]))}
            </SliderPrimitive.Value>
          )}
        </div>
      )}
    </SliderPrimitive.Root>
  );
}
