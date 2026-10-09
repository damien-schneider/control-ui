import { defineChart } from "@tanstack/charts";
import { decorative } from "@tanstack/charts/mark/decorative";
import { pie, polar, radialArc, radialBarAngle } from "@tanstack/charts/polar";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { tooltip } from "@tanstack/charts/tooltip";
import { type ChartColor, chartColor, chartSeriesColor } from "@/components/control-ui/ui/chart-colors";
import { chartFillPaint, chartGradients, chartHatch, chartOutline, dimUnfocused } from "@/components/control-ui/ui/chart-marks";
import { type ChartFill, type ChartValueKey, type ChartXKey, chartFormatters } from "@/components/control-ui/ui/chart-series";

export type ChartSliceOptions<TDatum> = {
  data: readonly TDatum[];
  label: ChartXKey<TDatum>;
  value: ChartValueKey<TDatum>;
  colors?: Partial<Record<string, ChartColor>>;
  fill?: ChartFill;
  fills?: Partial<Record<string, ChartFill>>;
  formatValue?: (value: number) => string;
  locale?: Intl.LocalesArgument;
};

export type ChartSlice = { id: string; label: string; value: number; color: ChartColor; fill: ChartFill };

export function resolveChartSlices<TDatum>(options: ChartSliceOptions<TDatum>): ChartSlice[] {
  return options.data.flatMap((datum, index) => {
    const label: unknown = datum[options.label];
    const value: unknown = datum[options.value];
    if (typeof label !== "string" || typeof value !== "number" || !Number.isFinite(value) || value < 0) return [];
    return {
      id: label,
      label,
      value,
      color: options.colors?.[label] ?? chartSeriesColor(index),
      fill: options.fills?.[label] ?? options.fill ?? "gradient",
    };
  });
}

export type DonutChartOptions<TDatum> = ChartSliceOptions<TDatum> & { innerRadius?: number };

export function donutChart<TDatum>(options: DonutChartOptions<TDatum>) {
  const slices = resolveChartSlices(options);
  const innerRadius = options.innerRadius ?? 0.62;
  const formats = chartFormatters(options.locale);
  const formatValue = options.formatValue ?? formats.value;
  return defineChart({
    marks: [
      polar({
        marks: [
          radialArc(pie(slices, { value: "value", gapAngle: 0.025 }), {
            key: "label",
            innerRadius: ({ radius }) => radius * innerRadius,
            cornerRadius: 4,
            fill: (slice) => chartFillPaint(slice.color, slice.fill, "arc"),
            stroke: (slice) => chartOutline(slice.color, slice.fill),
            strokeWidth: 1,
            className: "cui-chart-arc",
            states: dimUnfocused,
          }),
        ],
        scales: { angle: null, radius: null },
        inset: 4,
      }),
    ],
    scales: { x: null, y: null },
    gradients: chartGradients(
      slices.filter((slice) => slice.fill === "gradient").map((slice) => slice.color),
      "arc",
    ),
    tooltip: {
      use: tooltip,
      content: (points, context) => ({
        rows: points.map((point) => ({
          label: point.datum.label,
          value: `${formatValue(point.datum.value)} · ${formats.percent(point.datum.fraction)}`,
          color: chartColor(point.datum.color),
          active: point.key === context.primaryPoint?.key,
        })),
      }),
    },
  });
}

export type RadialBarChartOptions<TDatum> = ChartSliceOptions<TDatum> & {
  max?: number;
  track?: "hatched" | "solid" | "none";
};

export function radialBarChart<TDatum>(options: RadialBarChartOptions<TDatum>) {
  const rows = resolveChartSlices(options);
  const max = options.max ?? Math.max(1, ...rows.map((row) => row.value));
  const track = options.track ?? "hatched";
  const formatValue = options.formatValue ?? chartFormatters(options.locale).value;
  const ringScales = () => ({
    angle: { scale: scaleLinear().domain([0, max]) },
    radius: {
      scale: () => scaleBand().padding(0.3),
      range: [({ radius }: { radius: number }) => radius * 0.4, ({ radius }: { radius: number }) => radius] as const,
    },
  });
  const trackMarks =
    track === "none"
      ? []
      : [
          decorative(
            polar({
              className: "cui-chart-radial-track",
              marks: [
                radialBarAngle(rows, {
                  id: "track",
                  key: "id",
                  radius: "label",
                  angle: () => max,
                  cornerRadius: "full",
                  fill: track === "hatched" ? chartHatch("neutral") : "oklch(from var(--chart-neutral) l c h / 0.15)",
                }),
              ],
              scales: ringScales(),
            }),
          ),
        ];
  return defineChart({
    marks: [
      ...trackMarks,
      polar({
        marks: [
          radialBarAngle(rows, {
            id: "value",
            key: "id",
            radius: "label",
            angle: "value",
            cornerRadius: "full",
            fill: (row) => chartFillPaint(row.color, row.fill, "arc"),
            stroke: (row) => chartOutline(row.color, row.fill),
            strokeWidth: 1,
            className: "cui-chart-radial-bar",
            states: dimUnfocused,
          }),
        ],
        scales: ringScales(),
      }),
    ],
    scales: { x: null, y: null },
    gradients: chartGradients(
      rows.filter((row) => row.fill === "gradient").map((row) => row.color),
      "arc",
    ),
    tooltip: {
      use: tooltip,
      content: (points, context) => ({
        rows: points.map((point) => ({
          label: point.datum.label,
          value: `${formatValue(point.datum.value)} / ${formatValue(max)}`,
          color: chartColor(point.datum.color),
          active: point.key === context.primaryPoint?.key,
        })),
      }),
    },
  });
}
