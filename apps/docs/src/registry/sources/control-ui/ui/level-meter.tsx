"use client";

import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps, CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import type { RangeKnobStyle } from "@/components/control-ui/knob-contracts/range-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import {
  advanceLevelMeterReading,
  type LevelMeterReading,
  type LevelMeterScale,
  levelMeterFraction,
  levelMeterReadingSettled,
} from "@/components/control-ui/lib/level-meter-ballistics";

export type LevelMeterSource = {
  subscribe: (listener: (levelDb: number) => void) => () => void;
};

export type LevelMeterOrientation = "horizontal" | "vertical";

export type LevelMeterProps = Omit<ComponentProps<"div">, "style"> & {
  value?: number;
  source?: LevelMeterSource | null;
  minDb?: number;
  maxDb?: number;
  warningDb?: number;
  clipDb?: number;
  orientation?: LevelMeterOrientation;
  style?: CSSProperties & RangeKnobStyle;
};

export type LevelMeterTrackProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & RangeKnobStyle };

export type LevelMeterBarProps = Omit<ComponentProps<"div">, "style" | "children"> & {
  style?: CSSProperties & RangeKnobStyle;
};

export type LevelMeterPeakProps = Omit<ComponentProps<"div">, "style" | "children"> & { style?: CSSProperties & RangeKnobStyle };

type LevelMeterZoneStyle = CSSProperties & Record<"--_range-level-warning-start" | "--_range-level-clip-start", string>;

const ARIA_UPDATE_INTERVAL_MS = 250;

function createLevelMeterPainter() {
  let root: HTMLElement | null = null;
  let scale: LevelMeterScale = { minDb: -60, maxDb: 0 };
  let announcesValue = false;
  let targetDb = Number.NEGATIVE_INFINITY;
  let reading: LevelMeterReading = { levelDb: scale.minDb, peakDb: scale.minDb, peakHeldUntilMs: 0 };
  let frame = 0;
  let lastFrameMs = 0;
  let lastAnnouncedMs = Number.NEGATIVE_INFINITY;

  const paint = (element: HTMLElement, nowMs: number, settled: boolean) => {
    element.style.setProperty("--_range-level", `${levelMeterFraction(reading.levelDb, scale)}`);
    element.style.setProperty("--_range-level-peak", `${levelMeterFraction(reading.peakDb, scale)}`);
    if (!announcesValue || (!settled && nowMs - lastAnnouncedMs < ARIA_UPDATE_INTERVAL_MS)) return;
    lastAnnouncedMs = nowMs;
    const roundedDb = Math.round(reading.levelDb);
    element.setAttribute("aria-valuenow", `${roundedDb}`);
    element.setAttribute("aria-valuetext", `${roundedDb} dB`);
  };

  const step = (nowMs: number) => {
    frame = 0;
    if (!root) return;
    reading = advanceLevelMeterReading(reading, targetDb, nowMs - lastFrameMs, nowMs, scale);
    lastFrameMs = nowMs;
    const settled = levelMeterReadingSettled(reading, targetDb, scale);
    paint(root, nowMs, settled);
    if (!settled) frame = requestAnimationFrame(step);
  };

  const wake = () => {
    if (frame !== 0 || !root) return;
    lastFrameMs = performance.now();
    frame = requestAnimationFrame(step);
  };

  return {
    attach(element: HTMLElement, nextScale: LevelMeterScale, nextAnnouncesValue: boolean) {
      root = element;
      scale = nextScale;
      announcesValue = nextAnnouncesValue;
      wake();
      return () => {
        cancelAnimationFrame(frame);
        frame = 0;
        root = null;
      };
    },
    setTarget(levelDb: number) {
      targetDb = levelDb;
      wake();
    },
  };
}

export function LevelMeter({
  value,
  source,
  minDb = -60,
  maxDb = 0,
  warningDb = -18,
  clipDb = -6,
  orientation = "horizontal",
  className,
  style,
  children,
  ref,
  ...props
}: LevelMeterProps) {
  const [painter] = useState(createLevelMeterPainter);
  const rootRef = useRef<HTMLDivElement>(null);
  const labelled = Boolean(props["aria-label"] || props["aria-labelledby"]);
  const scale = { minDb, maxDb };
  const zoneStyle: LevelMeterZoneStyle = {
    "--_range-level-warning-start": `${levelMeterFraction(warningDb, scale)}`,
    "--_range-level-clip-start": `${levelMeterFraction(clipDb, scale)}`,
    ...style,
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return painter.attach(root, { minDb, maxDb }, labelled);
  }, [painter, minDb, maxDb, labelled]);

  useEffect(() => {
    if (source) return source.subscribe(painter.setTarget);
    painter.setTarget(value ?? Number.NEGATIVE_INFINITY);
  }, [painter, source, value]);

  return useRender({
    defaultTagName: "div",
    ref: [ref ?? null, rootRef],
    props: {
      ...props,
      role: labelled ? "meter" : undefined,
      "aria-hidden": labelled ? undefined : true,
      "aria-valuemin": labelled ? minDb : undefined,
      "aria-valuemax": labelled ? maxDb : undefined,
      "aria-valuenow": labelled ? minDb : undefined,
      "data-control-ui": "level-meter",
      "data-control-family": "range",
      "data-range-kind": "level-meter",
      "data-slot": "root",
      "data-orientation": orientation,
      className: cn("flex", className),
      style: zoneStyle,
      children: children ?? (
        <LevelMeterTrack>
          <LevelMeterBar />
        </LevelMeterTrack>
      ),
    },
  });
}

export function LevelMeterTrack({ className, ...props }: LevelMeterTrackProps) {
  return (
    <div
      data-control-ui="level-meter"
      data-control-family="range"
      data-range-kind="level-meter"
      data-slot="track"
      className={cn("relative overflow-hidden", className)}
      {...props}
    />
  );
}

export function LevelMeterBar({ className, ...props }: LevelMeterBarProps) {
  return (
    <div
      data-control-ui="level-meter"
      data-control-family="range"
      data-range-kind="level-meter"
      data-slot="bar"
      className={cn("absolute inset-0", className)}
      {...props}
    />
  );
}

export function LevelMeterPeak({ className, ...props }: LevelMeterPeakProps) {
  return (
    <div
      data-control-ui="level-meter"
      data-control-family="range"
      data-range-kind="level-meter"
      data-slot="peak"
      className={cn("absolute inset-0", className)}
      {...props}
    />
  );
}
