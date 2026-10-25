"use client";

import { scaleBand } from "@tanstack/charts/scales/band";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/control-ui/ui/card";
import { Chart, ChartLegend, ChartLegendItem, ChartPlot } from "@/components/control-ui/ui/chart";
import { barChart, lineChart } from "@/components/control-ui/ui/chart-cartesian";
import type { ChartColor } from "@/components/control-ui/ui/chart-colors";
import { Text } from "@/components/control-ui/ui/typography";
import { dailyUptime, hourlyLatency } from "./chart-data";

type UptimeDay = (typeof dailyUptime)[number];

const UPTIME_BANDS = [
  { label: "Operational", min: 99.5, color: "var(--success)" },
  { label: "Degraded", min: 95, color: "var(--warning)" },
  { label: "Outage", min: 0, color: "var(--destructive)" },
] as const satisfies readonly { label: string; min: number; color: ChartColor }[];

const NO_DATA_COLOR: ChartColor = "neutral";

const shortDay = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

function uptimeColor({ uptime }: UptimeDay): ChartColor {
  if (uptime === null) return NO_DATA_COLOR;
  return UPTIME_BANDS.find((band) => uptime >= band.min)?.color ?? NO_DATA_COLOR;
}

const measuredDays = dailyUptime.flatMap((day) => (day.uptime === null ? [] : day.uptime));
const overallUptime = measuredDays.reduce((sum, uptime) => sum + uptime, 0) / measuredDays.length;

const uptimeStrip = barChart({
  data: dailyUptime,
  x: "day",
  series: [{ key: "full", label: "Uptime", color: uptimeColor }],
  fill: "solid",
  radius: 2,
  grid: false,
  xScale: { axis: false, scale: () => scaleBand().padding(0.2) },
  yScale: { axis: false },
  formatX: (day) => shortDay.format(new Date(day)),
  formatValue: (_full, day) => (day.uptime === null ? "No data" : `${day.uptime.toFixed(2)}%`),
});

const responseTime = lineChart({
  data: hourlyLatency,
  x: "hour",
  series: [{ key: "latency", label: "Response time", color: "var(--info)" }],
  xScale: { axis: false },
  yScale: { axis: false },
  formatValue: (latency) => `${latency} ms`,
});

function RangeCaption({ from, to }: { from: string; to: string }) {
  return (
    <div className="flex justify-between">
      <Text size="caption" tone="muted">
        {from}
      </Text>
      <Text size="caption" tone="muted">
        {to}
      </Text>
    </div>
  );
}

export function ChartStatusExample() {
  return (
    <div className="grid w-full max-w-2xl gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Uptime</CardTitle>
          <CardAction>
            <Text numeric weight="semibold">
              {overallUptime.toFixed(2)}%
            </Text>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Chart>
            <div>
              <ChartPlot ariaLabel="Daily uptime, last 90 days" definition={uptimeStrip} height={40} />
              <RangeCaption from="90 days ago" to="Today" />
            </div>
            <ChartLegend>
              {UPTIME_BANDS.map((band) => (
                <ChartLegendItem key={band.label} color={band.color} fill="solid">
                  {band.label}
                </ChartLegendItem>
              ))}
              <ChartLegendItem color={NO_DATA_COLOR} fill="solid">
                No data
              </ChartLegendItem>
            </ChartLegend>
          </Chart>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Response time</CardTitle>
          <CardAction>
            <Text numeric weight="semibold">
              {hourlyLatency.at(-1)?.latency} ms
            </Text>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Chart>
            <div>
              <ChartPlot ariaLabel="Response time, last 24 hours" definition={responseTime} height={96} />
              <RangeCaption from="24 h ago" to="Now" />
            </div>
          </Chart>
        </CardContent>
      </Card>
    </div>
  );
}
