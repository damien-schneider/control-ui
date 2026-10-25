import { describe, expect, test } from "bun:test";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { renderToString } from "react-dom/server";
import { Chart, ChartPlot, type ChartPlotProps } from "./chart";
import { areaChart, barChart, lineChart, scatterChart, sparklineChart } from "./chart-cartesian";
import { seriesTooltip } from "./chart-marks";
import { donutChart, radialBarChart } from "./chart-polar";
import { chartSeriesRows, resolveChartSeries } from "./chart-series";

const visits = [
  { month: "Jan", desktop: 186, mobile: 80, tablet: 40 },
  { month: "Feb", desktop: 205, mobile: 104, tablet: 52 },
  { month: "Mar", desktop: 237, mobile: 120, tablet: 61 },
];

describe("ChartPlot hatching", () => {
  const html = renderToString(
    <Chart>
      <ChartPlot
        ariaLabel="Visits"
        definition={areaChart({ data: visits, x: "month", series: [{ key: "desktop" }, { key: "mobile", fill: "hatched" }] })}
      />
    </Chart>,
  );

  test("paints gradient series from the chart palette and hatched series from the plot patterns", () => {
    expect(html).toContain('stop-color="var(--chart-blue)"');
    expect(html).toContain("cui-chart-area-hatched");
    expect(html).toContain('fill="var(--_cui-chart-hatch-purple, var(--chart-purple))"');
  });

  test("points each hatch variable at a pattern the plot renders", () => {
    const patternId = html.match(/--_cui-chart-hatch-purple:url\(#([\w-]+)-hatch-purple\)/)?.[1];
    expect(patternId).toBeDefined();
    expect(html).toContain(`id="${patternId}-hatch-purple"`);
    expect(html).toContain(`id="${patternId}-fade"`);
  });
});

describe("presets", () => {
  test("render empty data without throwing", () => {
    const noVisits: typeof visits = [];
    const plots = [
      () => <ChartPlot ariaLabel="Empty" definition={areaChart({ data: noVisits, x: "month", series: [{ key: "desktop" }] })} />,
      () => (
        <ChartPlot
          ariaLabel="Empty"
          definition={areaChart({ data: noVisits, x: "month", series: [{ key: "desktop" }], stacked: "percent" })}
        />
      ),
      () => (
        <ChartPlot ariaLabel="Empty" definition={lineChart({ data: noVisits, x: "month", series: [{ key: "desktop" }], dots: true })} />
      ),
      () => <ChartPlot ariaLabel="Empty" definition={barChart({ data: noVisits, x: "month", series: [{ key: "desktop" }] })} />,
      () => (
        <ChartPlot
          ariaLabel="Empty"
          definition={barChart({
            data: noVisits,
            x: "month",
            series: [{ key: "desktop" }],
            orientation: "horizontal",
            layout: "percent",
          })}
        />
      ),
      () => <ChartPlot ariaLabel="Empty" definition={scatterChart({ data: noVisits, x: "desktop", y: "mobile" })} />,
      () => <ChartPlot ariaLabel="Empty" definition={sparklineChart({ data: noVisits, x: "month", y: "desktop", type: "bar" })} />,
      () => <ChartPlot ariaLabel="Empty" definition={donutChart({ data: noVisits, label: "month", value: "desktop" })} />,
      () => <ChartPlot ariaLabel="Empty" definition={radialBarChart({ data: noVisits, label: "month", value: "desktop" })} />,
    ];
    for (const plot of plots) {
      expect(() => renderToString(plot())).not.toThrow();
    }
  });

  test("require an explicit x scale for dates", () => {
    const data = [{ day: new Date(0), value: 1 }];
    expect(() => areaChart({ data, x: "day", series: [{ key: "value" }] })).toThrow(
      "Chart presets need an xScale for Date x values, for example { scale: scaleUtc } from d3-scale.",
    );
    expect(() => areaChart({ data, x: "day", series: [{ key: "value" }], xScale: { scale: scaleLinear } })).not.toThrow();
  });
});

describe("cartesian options", () => {
  const render = <TDatum,>(definition: ChartPlotProps<TDatum>["definition"]) =>
    renderToString(<ChartPlot ariaLabel="Visits" definition={definition} width={320} height={160} />);

  test("hide the category axis when xScale turns it off", () => {
    const bars = render(barChart({ data: visits, x: "month", series: [{ key: "desktop" }], xScale: { axis: false } }));
    const lines = render(lineChart({ data: visits, x: "month", series: [{ key: "desktop" }], xScale: { axis: false } }));
    expect(bars).not.toContain("x-tick-label");
    expect(lines).not.toContain("x-tick-label");
    expect(bars).toContain("y-tick-label");
  });

  test("paint a series with a CSS color", () => {
    const html = render(areaChart({ data: visits, x: "month", series: [{ key: "desktop", color: "var(--success)" }] }));
    const gradientId = html.match(/fill="url\(#([^)]+)\)"/)?.[1];
    expect(gradientId).toBeDefined();
    expect(html).toContain(`id="${gradientId}"`);
    expect(html).toContain('stop-color="var(--success)"');
    expect(html).toContain('stroke="var(--success)"');
  });

  test("paint a hatched series solid when its color has no palette pattern", () => {
    const html = render(barChart({ data: visits, x: "month", series: [{ key: "desktop", color: "#3b82f6", fill: "hatched" }] }));
    expect(html.match(/<path[^>]*fill="#3b82f6"/g)).toHaveLength(visits.length);
    expect(html).not.toContain("--_cui-chart-hatch-#");
  });

  test("color each bar from its datum", () => {
    const html = render(
      barChart({
        data: visits,
        x: "month",
        fill: "solid",
        series: [{ key: "desktop", color: (month) => (month.desktop > 200 ? "var(--warning)" : "green") }],
      }),
    );
    expect(html.match(/<path[^>]*fill="var\(--chart-green\)"/g)).toHaveLength(1);
    expect(html.match(/<path[^>]*fill="var\(--warning\)"/g)).toHaveLength(2);
  });

  test("round every bar corner with a numeric radius", () => {
    const html = render(barChart({ data: visits, x: "month", series: [{ key: "desktop" }], radius: 3 }));
    expect(html.match(/<rect[^>]*rx="3"/g)).toHaveLength(visits.length);
  });
});

describe("seriesTooltip", () => {
  test("formats each value with its source datum", () => {
    const uptime = [
      { day: "Mon", height: 100, measured: 99.2 },
      { day: "Tue", height: 100, measured: null },
    ];
    const rows = chartSeriesRows(uptime, "day", resolveChartSeries<(typeof uptime)[number]>([{ key: "height", label: "Uptime" }]));
    const { content } = seriesTooltip<(typeof uptime)[number]>(["Uptime"], String, (_height, day) =>
      day.measured === null ? "No data" : `${day.measured}%`,
    );
    const values = rows.map((row) => content([{ key: row.id, datum: row }], {}).rows[0]?.value);
    expect(values).toEqual(["99.2%", "No data"]);
  });
});

describe("resolveChartSeries", () => {
  test("keeps each series hue when an earlier series is hidden", () => {
    const all = resolveChartSeries<(typeof visits)[number]>([{ key: "desktop" }, { key: "mobile" }, { key: "tablet" }]);
    const visible = resolveChartSeries(all.filter((entry) => entry.key !== "desktop"));
    expect(visible.map((entry) => entry.color)).toEqual(["purple", "pink"]);
  });
});
