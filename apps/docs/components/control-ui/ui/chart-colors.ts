export const CHART_COLORS = ["blue", "purple", "pink", "orange", "green", "yellow", "red", "neutral"] as const;

export type ChartColor = (typeof CHART_COLORS)[number];

export const CHART_SERIES_COLORS = ["blue", "purple", "pink", "orange", "green", "yellow"] as const satisfies readonly ChartColor[];

export function chartColor(color: ChartColor) {
  return `var(--chart-${color})`;
}

export function chartSeriesColor(index: number): ChartColor {
  return CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length] ?? "blue";
}
