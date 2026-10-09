import {
  areaY,
  barX,
  barY,
  type ChartPositionScaleOptions,
  crosshair,
  defineChart,
  dot,
  group,
  lineY,
  stack,
  stackRowsY,
} from "@tanstack/charts";
import { decorative } from "@tanstack/charts/mark/decorative";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { tooltip as pointerTooltip } from "@tanstack/charts/tooltip";
import { type ChartColor, chartColor, chartSeriesColor } from "@/components/control-ui/ui/chart-colors";
import { type ChartCurveName, chartCurve } from "@/components/control-ui/ui/chart-curves";
import {
  type ChartPart,
  type ChartReference,
  chartBarFill,
  chartBarGradients,
  chartBars,
  chartFillPaint,
  chartGradients,
  chartOutline,
  chartPart,
  chartReferenceMarks,
  dimUnfocused,
  quietAxis,
  quietGrid,
  seriesTooltip,
} from "@/components/control-ui/ui/chart-marks";
import {
  type ChartFill,
  type ChartSeries,
  type ChartValueKey,
  type ChartXKey,
  type ChartXValue,
  chartFormatters,
  chartSeriesRows,
  chartXScale,
  type ResolvedChartSeries,
  resolveChartSeries,
} from "@/components/control-ui/ui/chart-series";

export type CartesianChartOptions<TDatum> = {
  data: readonly TDatum[];
  x: ChartXKey<TDatum>;
  series: readonly ChartSeries<TDatum>[];
  fill?: ChartFill;
  xScale?: Partial<ChartPositionScaleOptions>;
  yScale?: Partial<ChartPositionScaleOptions>;
  formatX?: (value: ChartXValue) => string;
  formatValue?: (value: number) => string;
  formatTick?: (value: number) => string;
  locale?: Intl.LocalesArgument;
  references?: readonly ChartReference[];
  grid?: boolean;
  tooltip?: boolean;
};

export type AreaChartOptions<TDatum> = CartesianChartOptions<TDatum> & {
  stacked?: boolean | "percent";
  curve?: ChartCurveName;
};

export type LineChartOptions<TDatum> = CartesianChartOptions<TDatum> & {
  curve?: ChartCurveName;
  dots?: boolean;
};

export type BarChartOptions<TDatum> = CartesianChartOptions<TDatum> & {
  orientation?: "vertical" | "horizontal";
  layout?: "grouped" | "stacked" | "percent";
};

function cartesianSetup<TDatum>(options: CartesianChartOptions<TDatum>, percent: boolean) {
  const series = resolveChartSeries(options.series, options.fill ?? "gradient");
  const rows = chartSeriesRows(options.data, options.x, series);
  const formats = chartFormatters(options.locale);
  const formatX = options.formatX ?? formats.x;
  const formatValue = options.formatValue ?? formats.value;
  const valueScale = {
    scale: scaleLinear,
    nice: true,
    grid: options.grid === false ? false : quietGrid,
    axis: quietAxis(options.formatTick ?? (percent ? formats.percent : formats.tick)),
    ...options.yScale,
  };
  return {
    series,
    rows,
    formatX,
    valueScale,
    tooltip:
      options.tooltip === false
        ? (false as const)
        : seriesTooltip(
            series.map((entry) => entry.label),
            formatX,
            formatValue,
          ),
    lastX: rows.at(-1)?.x,
  };
}

function gradientColors<TDatum>(series: readonly ResolvedChartSeries<TDatum>[]): ChartColor[] {
  return series.filter((entry) => entry.fill === "gradient").map((entry) => entry.color);
}

const SERIES_FOCUS_POINT = { id: "focus", key: "id", x: "x", z: "series", r: 4, fillOpacity: 0, strokeOpacity: 0 } as const;

export function areaChart<TDatum>(options: AreaChartOptions<TDatum>) {
  const stacked = options.stacked ?? false;
  const { series, rows, formatX, valueScale, tooltip, lastX } = cartesianSetup(options, stacked === "percent");
  const curve = chartCurve(options.curve ?? "smooth");
  const stackedRows = stacked
    ? stackRowsY(rows, { x: "x", y: "value", z: "series", offset: stacked === "percent" ? "normalize" : undefined })
    : [];
  const seriesMarks = series.flatMap((entry) => {
    const areaParts: ChartPart[] = entry.fill === "hatched" ? ["area", "area-hatched"] : ["area"];
    const fill = chartFillPaint(entry.color, entry.fill, "area");
    const line = {
      id: `line-${entry.key}`,
      key: "id",
      x: "x",
      stroke: chartColor(entry.color),
      strokeDasharray: entry.dashed ? "4 4" : undefined,
      curve,
    } as const;
    if (stacked) {
      const seriesRows = stackedRows.filter((row) => row.series === entry.label);
      return [
        decorative(
          chartPart(areaY(seriesRows, { id: `area-${entry.key}`, key: "id", x: "x", y1: "y1", y2: "y2", fill, curve }), ...areaParts),
        ),
        decorative(chartPart(lineY(seriesRows, { ...line, y: "y2" }), "line")),
      ];
    }
    const seriesRows = rows.filter((row) => row.series === entry.label);
    return [
      decorative(chartPart(areaY(seriesRows, { id: `area-${entry.key}`, key: "id", x: "x", y: "value", fill, curve }), ...areaParts)),
      decorative(chartPart(lineY(seriesRows, { ...line, y: "value" }), "line")),
    ];
  });
  const focusPoints = stacked ? dot(stackedRows, { ...SERIES_FOCUS_POINT, y: "y2" }) : dot(rows, { ...SERIES_FOCUS_POINT, y: "value" });
  return defineChart({
    marks: [
      ...seriesMarks,
      ...chartReferenceMarks(options.references ?? [], "y", lastX),
      focusPoints,
      crosshair({ x: true, y: false, strokeDasharray: "3 3" }),
    ],
    scales: {
      x: { ...chartXScale(rows, "point", options.xScale), axis: quietAxis(formatX) },
      y: valueScale,
    },
    gradients: chartGradients(gradientColors(series), "area"),
    margin: { top: 8 },
    focus: "group-x",
    maxFocusDistance: Number.POSITIVE_INFINITY,
    tooltip,
  });
}

export function lineChart<TDatum>(options: LineChartOptions<TDatum>) {
  const { series, rows, formatX, valueScale, tooltip, lastX } = cartesianSetup(options, false);
  const curve = chartCurve(options.curve ?? "smooth");
  const seriesMarks = series.flatMap((entry) => {
    const seriesRows = rows.filter((row) => row.series === entry.label);
    const line = decorative(
      chartPart(
        lineY(seriesRows, {
          id: `line-${entry.key}`,
          key: "id",
          x: "x",
          y: "value",
          stroke: chartColor(entry.color),
          strokeDasharray: entry.dashed ? "4 4" : undefined,
          curve,
        }),
        "line",
      ),
    );
    if (!options.dots) return [line];
    const dots = decorative(
      chartPart(
        dot(seriesRows, {
          id: `dot-${entry.key}`,
          key: "id",
          x: "x",
          y: "value",
          r: 3,
          fill: chartColor(entry.color),
          stroke: "var(--cui-chart-background)",
          strokeWidth: 1.5,
        }),
        "dot",
      ),
    );
    return [line, dots];
  });
  return defineChart({
    marks: [
      ...seriesMarks,
      ...chartReferenceMarks(options.references ?? [], "y", lastX),
      dot(rows, { ...SERIES_FOCUS_POINT, y: "value" }),
      crosshair({ x: true, y: false, strokeDasharray: "3 3" }),
    ],
    scales: {
      x: { ...chartXScale(rows, "point", options.xScale), axis: quietAxis(formatX) },
      y: valueScale,
    },
    margin: { top: 8 },
    focus: "group-x",
    maxFocusDistance: Number.POSITIVE_INFINITY,
    tooltip,
  });
}

export function barChart<TDatum>(options: BarChartOptions<TDatum>) {
  const layoutName = options.layout ?? "grouped";
  const { rows, formatX, valueScale, tooltip } = cartesianSetup(options, layoutName === "percent");
  const barLayouts = { grouped: group({ padding: 0.15 }), stacked: undefined, percent: stack({ offset: "normalize" }) };
  const layout = barLayouts[layoutName];
  const categoryScale = { ...chartXScale(rows, "band", options.xScale), axis: quietAxis(formatX) };
  const band = { inset: -4, radius: 6, fillOpacity: 0.06 };
  const shared = {
    id: "bars",
    key: "id",
    z: "series",
    stroke: (row: (typeof rows)[number]) => chartOutline(row.color, row.fill),
    strokeWidth: 1,
    radius: { end: 6 },
    states: dimUnfocused,
    layout,
  } as const;

  if (options.orientation === "horizontal") {
    return defineChart({
      marks: [
        crosshair({ x: false, y: { band } }),
        chartBars(barX(rows, { ...shared, y: "x", x: "value", fill: (row) => chartBarFill(row, "x") }), "x"),
        ...chartReferenceMarks(options.references ?? [], "x", rows[0]?.x),
      ],
      scales: { x: valueScale, y: categoryScale },
      gradients: chartBarGradients(rows, "x"),
      margin: { top: 8 },
      focus: "group-y",
      maxFocusDistance: Number.POSITIVE_INFINITY,
      tooltip,
    });
  }

  return defineChart({
    marks: [
      crosshair({ x: { band }, y: false }),
      chartBars(barY(rows, { ...shared, x: "x", y: "value", fill: (row) => chartBarFill(row, "y") }), "y"),
      ...chartReferenceMarks(options.references ?? [], "y", rows.at(-1)?.x),
    ],
    scales: { x: categoryScale, y: valueScale },
    gradients: chartBarGradients(rows, "y"),
    margin: { top: 8 },
    focus: "group-x",
    maxFocusDistance: Number.POSITIVE_INFINITY,
    tooltip,
  });
}

export type ScatterChartOptions<TDatum> = {
  data: readonly TDatum[];
  x: ChartValueKey<TDatum>;
  y: ChartValueKey<TDatum>;
  size?: ChartValueKey<TDatum>;
  group?: ChartXKey<TDatum>;
  colors?: Partial<Record<string, ChartColor>>;
  xLabel?: string;
  yLabel?: string;
  formatX?: (value: number) => string;
  formatValue?: (value: number) => string;
  locale?: Intl.LocalesArgument;
  xScale?: Partial<ChartPositionScaleOptions>;
  yScale?: Partial<ChartPositionScaleOptions>;
  references?: readonly ChartReference[];
};

type ScatterRow = { id: string; x: number; y: number; size: number; group: string };

function finiteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function scatterRows<TDatum>(options: ScatterChartOptions<TDatum>): ScatterRow[] {
  return options.data.flatMap((datum, index) => {
    const x = finiteNumber(datum[options.x]);
    const y = finiteNumber(datum[options.y]);
    if (x === undefined || y === undefined) return [];
    const size = options.size === undefined ? 0 : (finiteNumber(datum[options.size]) ?? 0);
    const groupValue: unknown = options.group ? datum[options.group] : "";
    const groupName = groupValue instanceof Date ? groupValue.toISOString() : String(groupValue ?? "");
    return { id: String(index), x, y, size, group: groupName };
  });
}

export function scatterChart<TDatum>(options: ScatterChartOptions<TDatum>) {
  const rows = scatterRows(options);
  const groups = [...new Set(rows.map((row) => row.group))];
  const maxSize = Math.max(1, ...rows.map((row) => row.size));
  const formats = chartFormatters(options.locale);
  const formatX = options.formatX ?? formats.value;
  const formatValue = options.formatValue ?? formats.value;
  const xLabel = options.xLabel ?? options.x;
  const yLabel = options.yLabel ?? options.y;
  const sizeKey = options.size;
  const radius = sizeKey ? (row: ScatterRow) => 3 + 11 * Math.sqrt(row.size / maxSize) : 4;
  const dots = groups.map((groupName, groupIndex) => {
    const color = chartColor(options.colors?.[groupName] ?? chartSeriesColor(groupIndex));
    return chartPart(
      dot(
        rows.filter((row) => row.group === groupName),
        {
          id: `dot-${groupName}`,
          key: "id",
          x: "x",
          y: "y",
          r: radius,
          fill: color,
          fillOpacity: 0.65,
          stroke: color,
          strokeWidth: 1,
          states: dimUnfocused,
        },
      ),
      "dot",
    );
  });
  const rightmostX = rows.length > 0 ? Math.max(...rows.map((row) => row.x)) : undefined;
  return defineChart({
    marks: [...dots, ...chartReferenceMarks(options.references ?? [], "y", rightmostX)],
    scales: {
      x: { scale: scaleLinear, nice: true, grid: quietGrid, axis: quietAxis(formats.tick), ...options.xScale },
      y: { scale: scaleLinear, nice: true, grid: quietGrid, axis: quietAxis(formats.tick), ...options.yScale },
    },
    margin: { top: 8 },
    focus: "nearest",
    tooltip: {
      use: pointerTooltip,
      content: (points) => {
        const point = points[0]?.datum;
        if (!point) return { rows: [] };
        const color = chartColor(options.colors?.[point.group] ?? chartSeriesColor(groups.indexOf(point.group)));
        return {
          title: point.group || undefined,
          rows: [
            { label: xLabel, value: formatX(point.x), color },
            { label: yLabel, value: formatValue(point.y), color },
            ...(sizeKey ? [{ label: sizeKey, value: formatValue(point.size), color }] : []),
          ],
        };
      },
    },
  });
}

export type SparklineChartOptions<TDatum> = {
  data: readonly TDatum[];
  x: ChartXKey<TDatum>;
  y: ChartValueKey<TDatum>;
  color?: ChartColor;
  fill?: ChartFill;
  type?: "area" | "line" | "bar";
  curve?: ChartCurveName;
  xScale?: Partial<ChartPositionScaleOptions>;
};

export function sparklineChart<TDatum>(options: SparklineChartOptions<TDatum>) {
  const color = options.color ?? "blue";
  const fill = options.fill ?? "gradient";
  const type = options.type ?? "area";
  const curve = chartCurve(options.curve ?? "smooth");
  const rows = chartSeriesRows(options.data, options.x, resolveChartSeries([{ key: options.y, color, fill }]));
  const values = rows.flatMap((row) => (row.value === null ? [] : row.value));
  const min = values.length > 0 ? Math.min(...values) : 0;
  const shared = {
    guides: false,
    margin: 2,
    focus: false,
    pointer: false,
    keyboard: false,
    tooltip: false,
  } as const;
  const valueScale = { scale: scaleLinear, nice: false };

  if (type === "bar") {
    return defineChart({
      ...shared,
      marks: [chartBars(barY(rows, { key: "id", x: "x", y: "value", fill: (row) => chartBarFill(row, "y"), radius: { end: 2 } }), "y")],
      scales: { x: { scale: () => scaleBand().padding(0.2), ...options.xScale }, y: valueScale },
      gradients: chartBarGradients(rows, "y"),
    });
  }

  const line = chartPart(lineY(rows, { key: "id", x: "x", y: "value", stroke: chartColor(color), curve }), "line");
  const areaParts: ChartPart[] = fill === "hatched" ? ["area", "area-hatched"] : ["area"];
  const area = chartPart(
    areaY(rows, { key: "id", x: "x", y1: min, y2: "value", fill: chartFillPaint(color, fill, "area"), curve }),
    ...areaParts,
  );
  return defineChart({
    ...shared,
    marks: type === "area" ? [area, line] : [line],
    scales: { x: chartXScale(rows, "point", options.xScale), y: valueScale },
    gradients: type === "area" && fill === "gradient" ? chartGradients([color], "area") : [],
  });
}
