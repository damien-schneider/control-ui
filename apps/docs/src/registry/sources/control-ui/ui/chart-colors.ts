export const CHART_COLORS = ["blue", "purple", "pink", "orange", "green", "yellow", "red", "neutral"] as const;

export type ChartPaletteColor = (typeof CHART_COLORS)[number];

export type ChartColor = ChartPaletteColor | `${string}(${string})` | `#${string}`;

export const CHART_SERIES_COLORS = ["blue", "purple", "pink", "orange", "green", "yellow"] as const satisfies readonly ChartPaletteColor[];

const PALETTE: ReadonlySet<string> = new Set(CHART_COLORS);

export function isChartPaletteColor(color: ChartColor): color is ChartPaletteColor {
  return PALETTE.has(color);
}

export function chartColor(color: ChartColor) {
  return isChartPaletteColor(color) ? `var(--chart-${color})` : color;
}

export function chartSeriesColor(index: number): ChartPaletteColor {
  return CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length] ?? "blue";
}
