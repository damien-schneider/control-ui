"use client";

import type { ComponentProps, CSSProperties, ReactNode } from "react";
import type { ColorPickerKnobStyle } from "@/components/control-ui/knob-contracts/color-picker-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { formatColor, hsvaToRgba, parseColor } from "@/components/control-ui/lib/color";
import {
  type ContrastFailBand,
  contrastFailBands,
  contrastOf,
  fixColorForContrast,
  formatContrastRatio,
  nextFixLevel,
  TARGET_RATIO,
  type WcagLevel,
  wcagLevels,
} from "@/components/control-ui/lib/contrast";
import { useColorPicker } from "@/components/control-ui/ui/color-picker-context";

export type ColorPickerContrastProps = Omit<Omit<ComponentProps<"div">, "children">, "style"> & {
  style?: CSSProperties & ColorPickerKnobStyle;
} & {
  background?: string;
  passLabel?: string;
  failLabel?: string;
};

export type ColorPickerAreaContrastProps = Omit<ComponentProps<"span">, "children" | "style"> & {
  style?: CSSProperties & ColorPickerKnobStyle;
} & {
  background?: string;
  level?: WcagLevel;
};

export function ColorPickerContrast({
  background = "#ffffff",
  passLabel = "Passes",
  failLabel = "Fails",
  className,
  ...props
}: ColorPickerContrastProps) {
  const { hsva, setFromString, disabled } = useColorPicker();
  const bg = parseColor(background);
  if (!bg) return null;
  const bgRgba = hsvaToRgba(bg);
  const ratio = contrastOf(hsva, bgRgba);
  const levels = wcagLevels(ratio);
  const target = nextFixLevel(levels);

  const applyFix = () => {
    if (!target) return;
    const fixed = fixColorForContrast(hsva, bgRgba, TARGET_RATIO[target]);
    if (fixed) setFromString(formatColor(fixed, "hex"));
  };

  return (
    <div
      data-control-ui="color-picker"
      data-control-family="color-picker"
      data-slot="contrast"
      className={cn("flex items-center", className)}
      {...props}
    >
      <span data-control-ui="color-picker" data-control-family="color-picker" data-slot="contrast-ratio">
        {formatContrastRatio(ratio)}:1
      </span>
      <WcagPill ok={levels.AA} passLabel={passLabel} failLabel={failLabel}>
        AA
      </WcagPill>
      <WcagPill ok={levels.AAA} passLabel={passLabel} failLabel={failLabel}>
        AAA
      </WcagPill>
      {target ? (
        <button
          type="button"
          data-control-ui="color-picker"
          data-control-family="color-picker"
          data-slot="contrast-fix"
          disabled={disabled}
          onClick={applyFix}
          className="ms-auto cursor-pointer disabled:cursor-not-allowed"
        >
          Fix for {target}
        </button>
      ) : null}
    </div>
  );
}

function WcagPill({ ok, passLabel, failLabel, children }: { ok: boolean; passLabel: string; failLabel: string; children: ReactNode }) {
  return (
    <span
      data-control-ui="color-picker"
      data-control-family="color-picker"
      data-slot="contrast-level"
      data-passing={ok ? "true" : undefined}
      className="inline-flex items-center"
    >
      <span aria-hidden="true">{ok ? "✓" : "✕"}</span>
      <span className="sr-only">{ok ? passLabel : failLabel}</span> {children}
    </span>
  );
}

const AREA_EDGE_MARGIN = 0.5;
const isInsideArea = (brightness: number) => brightness > AREA_EDGE_MARGIN && brightness < 100 - AREA_EDGE_MARGIN;

function failRegionClipPath(bands: ContrastFailBand[]): string {
  const brightEdge = bands.map((band) => `${band.saturation}% ${100 - band.failsTo}%`);
  const darkEdge = bands.toReversed().map((band) => `${band.saturation}% ${100 - band.failsFrom}%`);
  return `polygon(${[...brightEdge, ...darkEdge].join(", ")})`;
}

// a threshold resting on the area's border is no boundary to draw
function thresholdPath(bands: ContrastFailBand[], edge: "failsFrom" | "failsTo"): string {
  return bands
    .flatMap((band, column) => {
      const next = bands[column + 1];
      if (!next || !(isInsideArea(band[edge]) || isInsideArea(next[edge]))) return [];
      return [`M${band.saturation} ${100 - band[edge]}L${next.saturation} ${100 - next[edge]}`];
    })
    .join("");
}

export function ColorPickerAreaContrast({ background = "#ffffff", level = "AA", className, ...props }: ColorPickerAreaContrastProps) {
  const { hsva } = useColorPicker();
  const bg = parseColor(background);
  if (!bg) return null;
  const bands = contrastFailBands(hsva, hsvaToRgba(bg), TARGET_RATIO[level]);
  return (
    <span
      data-control-ui="color-picker"
      data-control-family="color-picker"
      data-slot="area-contrast"
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      {...props}
    >
      <span
        data-control-ui="color-picker"
        data-control-family="color-picker"
        data-slot="area-contrast-fail"
        className="absolute inset-0"
        style={{ clipPath: failRegionClipPath(bands) }}
      />
      <svg
        data-control-ui="color-picker"
        data-control-family="color-picker"
        data-slot="area-contrast-threshold"
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        fill="none"
        className="absolute inset-0 size-full"
      >
        <path d={thresholdPath(bands, "failsFrom") + thresholdPath(bands, "failsTo")} vectorEffect="non-scaling-stroke" />
      </svg>
    </span>
  );
}
