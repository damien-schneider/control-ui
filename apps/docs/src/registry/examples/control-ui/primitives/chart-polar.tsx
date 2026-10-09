"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/control-ui/ui/card";
import { Chart, ChartCenter, ChartLegend, ChartLegendItem, ChartPlot } from "@/components/control-ui/ui/chart";
import { donutChart, radialBarChart, resolveChartSlices } from "@/components/control-ui/ui/chart-polar";
import { chartFormatters } from "@/components/control-ui/ui/chart-series";
import { Text } from "@/components/control-ui/ui/typography";
import { browserShare, quarterlyGoals } from "./chart-data";

const browserOptions = {
  data: browserShare,
  label: "browser",
  value: "visitors",
  colors: { Other: "neutral" },
  fills: { Other: "hatched" },
} as const;

const browserSlices = resolveChartSlices(browserOptions);
const totalVisitors = browserSlices.reduce((total, slice) => total + slice.value, 0);
const formats = chartFormatters();

export function ChartDonutExample() {
  const definition = useMemo(() => donutChart(browserOptions), []);
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Visitors by browser</CardTitle>
        <CardDescription>Last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <Chart>
          <ChartPlot ariaLabel="Share of visitors by browser" definition={definition} height={260}>
            <ChartCenter>
              <Text size="heading-2" weight="semibold" tone="foreground" className="tabular-nums">
                {formats.value(totalVisitors)}
              </Text>
              <Text size="caption" tone="muted">
                Visitors
              </Text>
            </ChartCenter>
          </ChartPlot>
          <ChartLegend className="justify-center">
            {browserSlices.map((slice) => (
              <ChartLegendItem key={slice.id} color={slice.color} fill={slice.fill}>
                {slice.label}
              </ChartLegendItem>
            ))}
          </ChartLegend>
        </Chart>
      </CardContent>
    </Card>
  );
}

const goalOptions = { data: quarterlyGoals, label: "goal", value: "value", max: 100 } as const;

const goalRings = resolveChartSlices(goalOptions);
const averageProgress = goalRings.reduce((total, ring) => total + ring.value, 0) / Math.max(1, goalRings.length) / 100;

export function ChartRadialBarExample() {
  const definition = useMemo(() => radialBarChart({ ...goalOptions, formatValue: (value) => `${value}%` }), []);
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Quarterly goals</CardTitle>
        <CardDescription>Progress toward each target</CardDescription>
      </CardHeader>
      <CardContent>
        <Chart>
          <ChartPlot ariaLabel="Progress toward quarterly goals" definition={definition} height={260}>
            <ChartCenter>
              <Text size="heading-3" weight="semibold" tone="foreground" className="tabular-nums">
                {formats.percent(averageProgress)}
              </Text>
              <Text size="caption" tone="muted">
                Average
              </Text>
            </ChartCenter>
          </ChartPlot>
          <ChartLegend className="justify-center">
            {goalRings.map((ring) => (
              <ChartLegendItem key={ring.id} color={ring.color} fill={ring.fill}>
                {ring.label}
              </ChartLegendItem>
            ))}
          </ChartLegend>
        </Chart>
      </CardContent>
    </Card>
  );
}
