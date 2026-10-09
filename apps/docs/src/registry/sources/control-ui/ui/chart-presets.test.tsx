import { describe, expect, test } from "bun:test";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { renderToString } from "react-dom/server";
import { Chart, ChartPlot } from "./chart";
import { areaChart, barChart, lineChart, scatterChart, sparklineChart } from "./chart-cartesian";
import { donutChart, radialBarChart } from "./chart-polar";
import { resolveChartSeries } from "./chart-series";

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

describe("resolveChartSeries", () => {
  test("keeps each series hue when an earlier series is hidden", () => {
    const all = resolveChartSeries<(typeof visits)[number]>([{ key: "desktop" }, { key: "mobile" }, { key: "tablet" }]);
    const visible = resolveChartSeries(all.filter((entry) => entry.key !== "desktop"));
    expect(visible.map((entry) => entry.color)).toEqual(["purple", "pink"]);
  });
});
