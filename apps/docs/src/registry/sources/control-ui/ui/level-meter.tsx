"use client";

import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps, CSSProperties } from "react";
import { createContext, use, useEffect, useRef, useState } from "react";
import type { RangeKnobStyle } from "@/components/control-ui/knob-contracts/range-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import {
  advanceLevelMeterReading,
  type LevelMeterRange,
  type LevelMeterReading,
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
  muted?: boolean;
  orientation?: LevelMeterOrientation;
  style?: CSSProperties & RangeKnobStyle;
};

export type LevelMeterTrackProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & RangeKnobStyle };

export type LevelMeterBarProps = Omit<ComponentProps<"div">, "style" | "children"> & {
  style?: CSSProperties & RangeKnobStyle;
};

export type LevelMeterPeakProps = Omit<ComponentProps<"div">, "style" | "children"> & { style?: CSSProperties & RangeKnobStyle };

export type LevelMeterScaleProps = Omit<ComponentProps<"div">, "style" | "children"> & {
  ticks?: readonly number[];
  style?: CSSProperties & RangeKnobStyle;
};

type LevelMeterZoneStyle = CSSProperties & Record<"--_range-level-warning-start" | "--_range-level-clip-start", string>;

type LevelMeterTickStyle = CSSProperties & Record<"--_range-level-tick", string>;

type LevelMeterAttachment = { root: HTMLElement; scale: LevelMeterRange; announcesValue: boolean };

const ARIA_UPDATE_INTERVAL_MS = 250;

const STANDARD_TICKS_DB = [12, 6, 0, -6, -12, -18, -24, -36, -48, -60, -72, -84, -96] as const;

const LevelMeterScaleContext = createContext<LevelMeterRange | null>(null);

function formatTickDb(db: number) {
  if (db > 0) return `+${db}`;
  if (db < 0) return `\u2212${Math.abs(db)}`;
  return "0";
}

function createLevelMeterPainter() {
  let attachment: LevelMeterAttachment | null = null;
  let targetDb = Number.NEGATIVE_INFINITY;
  let reading: LevelMeterReading = {
    levelDb: Number.NEGATIVE_INFINITY,
    peakDb: Number.NEGATIVE_INFINITY,
    peakHeldUntilMs: 0,
  };
  let frame = 0;
  let lastFrameMs = 0;
  let lastAnnouncedMs = Number.NEGATIVE_INFINITY;

  const paint = ({ root, scale, announcesValue }: LevelMeterAttachment, nowMs: number, settled: boolean) => {
    root.style.setProperty("--_range-level", `${levelMeterFraction(reading.levelDb, scale)}`);
    root.style.setProperty("--_range-level-peak", `${levelMeterFraction(reading.peakDb, scale)}`);
    if (!announcesValue || (!settled && nowMs - lastAnnouncedMs < ARIA_UPDATE_INTERVAL_MS)) return;
    lastAnnouncedMs = nowMs;
    const roundedDb = Math.round(reading.levelDb);
    root.setAttribute("aria-valuenow", `${roundedDb}`);
    root.setAttribute("aria-valuetext", `${roundedDb} dB`);
  };

  const step = (nowMs: number) => {
    frame = 0;
    if (!attachment) return;
    reading = advanceLevelMeterReading(reading, targetDb, nowMs - lastFrameMs, nowMs, attachment.scale);
    lastFrameMs = nowMs;
    const settled = levelMeterReadingSettled(reading, targetDb, attachment.scale);
    paint(attachment, nowMs, settled);
    if (!settled) frame = requestAnimationFrame(step);
  };

  const wake = () => {
    if (frame !== 0 || !attachment) return;
    lastFrameMs = performance.now();
    frame = requestAnimationFrame(step);
  };

  return {
    attach(nextAttachment: LevelMeterAttachment) {
      attachment = nextAttachment;
      wake();
      return () => {
        cancelAnimationFrame(frame);
        frame = 0;
        attachment = null;
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
  muted = false,
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
    return painter.attach({ root, scale: { minDb, maxDb }, announcesValue: labelled });
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
      "data-muted": muted || undefined,
      className: cn("grid", className),
      style: zoneStyle,
      children: (
        <LevelMeterScaleContext value={{ minDb, maxDb }}>
          {children ?? (
            <LevelMeterTrack>
              <LevelMeterBar />
            </LevelMeterTrack>
          )}
        </LevelMeterScaleContext>
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

export function LevelMeterScale({ ticks, className, ...props }: LevelMeterScaleProps) {
  const scale = use(LevelMeterScaleContext);
  if (!scale) throw new Error("LevelMeterScale must be rendered inside LevelMeter.");
  const visibleTicks = (ticks ?? STANDARD_TICKS_DB).filter((db) => db >= scale.minDb && db <= scale.maxDb);
  return (
    <div
      aria-hidden="true"
      data-control-ui="level-meter"
      data-control-family="range"
      data-range-kind="level-meter"
      data-slot="scale"
      className={cn("relative text-micro tabular-nums", className)}
      {...props}
    >
      {visibleTicks.map((db) => {
        const tickStyle: LevelMeterTickStyle = { "--_range-level-tick": `${levelMeterFraction(db, scale)}` };
        return (
          <span
            key={db}
            data-control-ui="level-meter"
            data-control-family="range"
            data-range-kind="level-meter"
            data-slot="tick"
            style={tickStyle}
          >
            {formatTickDb(db)}
          </span>
        );
      })}
    </div>
  );
}
