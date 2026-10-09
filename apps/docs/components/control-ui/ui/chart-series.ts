import type { ChartPositionScaleOptions } from "@tanstack/charts";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { scalePoint } from "@tanstack/charts/scales/point";
import { type ChartColor, chartSeriesColor } from "@/components/control-ui/ui/chart-colors";

export type ChartFill = "gradient" | "hatched" | "solid";

export type ChartXValue = string | number | Date;

export type ChartXKey<TDatum> = { [K in keyof TDatum]-?: TDatum[K] extends ChartXValue ? K : never }[keyof TDatum] & keyof TDatum & string;

export type ChartValueKey<TDatum> = {
  [K in keyof TDatum]-?: TDatum[K] extends number | null | undefined ? K : never;
}[keyof TDatum] &
  keyof TDatum &
  string;

export type ChartSeries<TDatum> = {
  key: ChartValueKey<TDatum>;
  label?: string;
  color?: ChartColor;
  fill?: ChartFill;
  dashed?: boolean;
};

export type ResolvedChartSeries<TDatum> = Required<ChartSeries<TDatum>>;

export type ChartSeriesRow = {
  id: string;
  x: ChartXValue;
  value: number | null;
  series: string;
  color: ChartColor;
  fill: ChartFill;
};

export function resolveChartSeries<TDatum>(
  series: readonly ChartSeries<TDatum>[],
  fill: ChartFill = "gradient",
): ResolvedChartSeries<TDatum>[] {
  return series.map((entry, index) => ({
    key: entry.key,
    label: entry.label ?? entry.key,
    color: entry.color ?? chartSeriesColor(index),
    fill: entry.fill ?? fill,
    dashed: entry.dashed ?? false,
  }));
}

function isChartXValue(value: unknown): value is ChartXValue {
  return typeof value === "string" || (typeof value === "number" && Number.isFinite(value)) || value instanceof Date;
}

export function chartSeriesRows<TDatum>(
  data: readonly TDatum[],
  x: ChartXKey<TDatum>,
  series: readonly ResolvedChartSeries<TDatum>[],
): ChartSeriesRow[] {
  return series.flatMap((entry) =>
    data.flatMap((datum) => {
      const xValue: unknown = datum[x];
      if (!isChartXValue(xValue)) return [];
      const value: unknown = datum[entry.key];
      return {
        id: `${entry.key}:${xValue instanceof Date ? xValue.toISOString() : String(xValue)}`,
        x: xValue,
        value: typeof value === "number" && Number.isFinite(value) ? value : null,
        series: entry.label,
        color: entry.color,
        fill: entry.fill,
      };
    }),
  );
}

export type ChartFormatters = {
  x: (value: ChartXValue) => string;
  value: (value: number) => string;
  tick: (value: number) => string;
  percent: (value: number) => string;
};

export function chartFormatters(locale: Intl.LocalesArgument = "en-US"): ChartFormatters {
  const plainNumber = new Intl.NumberFormat(locale);
  const compactNumber = new Intl.NumberFormat(locale, { notation: "compact" });
  const percentNumber = new Intl.NumberFormat(locale, { style: "percent" });
  const shortDay = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", timeZone: "UTC" });
  return {
    x: (value) => {
      if (value instanceof Date) return shortDay.format(value);
      if (typeof value === "number") return plainNumber.format(value);
      return value;
    },
    value: (value) => plainNumber.format(value),
    tick: (value) => compactNumber.format(value),
    percent: (value) => percentNumber.format(value),
  };
}

export function chartXScale(
  rows: readonly { x: ChartXValue }[],
  kind: "point" | "band",
  override?: Partial<ChartPositionScaleOptions>,
): ChartPositionScaleOptions {
  if (override?.scale) return { ...override, scale: override.scale };
  const first = rows[0]?.x;
  if (first instanceof Date) {
    throw new Error("Chart presets need an xScale for Date x values, for example { scale: scaleUtc } from d3-scale.");
  }
  if (typeof first === "number") return { scale: scaleLinear, nice: true, ...override };
  return { scale: kind === "band" ? () => scaleBand().padding(0.3) : scalePoint, ...override };
}
