"use client";

import { ChartNoAxesColumnIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/control-ui/ui/card";
import { Chart, ChartLegend, ChartLegendItem, ChartPlot } from "@/components/control-ui/ui/chart";
import { areaChart, barChart, sparklineChart } from "@/components/control-ui/ui/chart-cartesian";
import type { ChartColor } from "@/components/control-ui/ui/chart-colors";
import { type ChartFill, resolveChartSeries } from "@/components/control-ui/ui/chart-series";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/control-ui/ui/empty";
import { Skeleton } from "@/components/control-ui/ui/skeleton";
import { Toggle, ToggleGroup } from "@/components/control-ui/ui/toggle";
import { Text } from "@/components/control-ui/ui/typography";
import { deviceVisits, forecastRevenue, kpiSeries, plannedHeadcount } from "./chart-data";

type KpiSeries = (typeof kpiSeries)[keyof typeof kpiSeries];

type Kpi = {
  label: string;
  data: KpiSeries;
  color: ChartColor;
  type: "area" | "line" | "bar";
  fill: ChartFill;
  format: (value: number) => string;
};

const kpis: readonly Kpi[] = [
  { label: "Revenue", data: kpiSeries.revenue, color: "blue", type: "area", fill: "gradient", format: (value) => `$${value}k` },
  { label: "Sessions", data: kpiSeries.sessions, color: "purple", type: "bar", fill: "gradient", format: (value) => `${value}k` },
  { label: "Churn", data: kpiSeries.churn, color: "orange", type: "line", fill: "solid", format: (value) => `${value / 100}%` },
];

function KpiCard({ kpi }: { kpi: Kpi }) {
  const definition = useMemo(
    () => sparklineChart({ data: kpi.data, x: "day", y: "value", color: kpi.color, type: kpi.type, fill: kpi.fill }),
    [kpi],
  );
  const first = kpi.data[0]?.value ?? 0;
  const last = kpi.data.at(-1)?.value ?? 0;
  const change = first === 0 ? 0 : (last - first) / first;
  return (
    <Card>
      <CardHeader>
        <CardDescription>{kpi.label}</CardDescription>
        <CardTitle className="tabular-nums">{kpi.format(last)}</CardTitle>
        <CardAction>
          <Text size="caption" weight="medium" className={change >= 0 ? "text-chart-green" : "text-chart-red"}>
            {change >= 0 ? "+" : ""}
            {(change * 100).toFixed(1)}%
          </Text>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Chart>
          <ChartPlot ariaLabel={`${kpi.label} over the last 14 days`} definition={definition} height={48} />
        </Chart>
      </CardContent>
    </Card>
  );
}

export function ChartSparklineExample() {
  return (
    <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-3">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.label} kpi={kpi} />
      ))}
    </div>
  );
}

const forecastSeries = resolveChartSeries<(typeof forecastRevenue)[number]>([
  { key: "actual", label: "Actual" },
  { key: "forecast", label: "Forecast", fill: "hatched", dashed: true },
]);

const headcountSeries = resolveChartSeries<(typeof plannedHeadcount)[number]>([
  { key: "hired", label: "Hired" },
  { key: "planned", label: "Planned", fill: "hatched" },
]);

export function ChartHatchedExample() {
  const forecast = useMemo(() => areaChart({ data: forecastRevenue, x: "month", series: forecastSeries }), []);
  const headcount = useMemo(() => barChart({ data: plannedHeadcount, x: "team", series: headcountSeries, layout: "stacked" }), []);
  return (
    <div className="grid w-full max-w-3xl gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Revenue forecast</CardTitle>
          <CardDescription>Measured through August, projected after</CardDescription>
        </CardHeader>
        <CardContent>
          <Chart>
            <ChartPlot ariaLabel="Actual and forecast monthly revenue" definition={forecast} height={220} />
            <ChartLegend>
              {forecastSeries.map((entry) => (
                <ChartLegendItem key={entry.key} color={entry.color} fill={entry.fill}>
                  {entry.label}
                </ChartLegendItem>
              ))}
            </ChartLegend>
          </Chart>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Headcount plan</CardTitle>
          <CardDescription>Hired and open roles per team</CardDescription>
        </CardHeader>
        <CardContent>
          <Chart>
            <ChartPlot ariaLabel="Hired and planned headcount per team" definition={headcount} height={220} />
            <ChartLegend>
              {headcountSeries.map((entry) => (
                <ChartLegendItem key={entry.key} color={entry.color} fill={entry.fill}>
                  {entry.label}
                </ChartLegendItem>
              ))}
            </ChartLegend>
          </Chart>
        </CardContent>
      </Card>
    </div>
  );
}

const visitSeries = resolveChartSeries<(typeof deviceVisits)[number]>([
  { key: "desktop", label: "Desktop" },
  { key: "mobile", label: "Mobile" },
  { key: "tablet", label: "Tablet" },
]);

export function ChartLegendExample() {
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set());
  const definition = useMemo(
    () => areaChart({ data: deviceVisits, x: "month", series: visitSeries.filter((entry) => !hidden.has(entry.key)) }),
    [hidden],
  );
  const toggle = (key: string, nextHidden: boolean) => {
    setHidden((current) => {
      const next = new Set(current);
      if (nextHidden) next.add(key);
      else next.delete(key);
      return next;
    });
  };
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Visitors by device</CardTitle>
        <CardDescription>Toggle a series in the legend</CardDescription>
      </CardHeader>
      <CardContent>
        <Chart>
          <ChartPlot ariaLabel="Monthly visitors for the visible devices" definition={definition} height={240} />
          <ChartLegend>
            {visitSeries.map((entry) => (
              <ChartLegendItem
                key={entry.key}
                color={entry.color}
                fill={entry.fill}
                hidden={hidden.has(entry.key)}
                onHiddenChange={(nextHidden) => toggle(entry.key, nextHidden)}
              >
                {entry.label}
              </ChartLegendItem>
            ))}
          </ChartLegend>
        </Chart>
      </CardContent>
    </Card>
  );
}

const NO_VISITS: typeof deviceVisits = [];

export function ChartStatesExample() {
  const [state, setState] = useState<string[]>(["loading"]);
  const current = state[0] ?? "loaded";
  const data = current === "loaded" ? deviceVisits : NO_VISITS;
  const definition = useMemo(() => areaChart({ data, x: "month", series: visitSeries }), [data]);
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Visitors by device</CardTitle>
        <CardDescription>Loading, empty, and loaded</CardDescription>
        <CardAction>
          <ToggleGroup value={state} onValueChange={setState} aria-label="Data state">
            <Toggle value="loading">Loading</Toggle>
            <Toggle value="empty">Empty</Toggle>
            <Toggle value="loaded">Loaded</Toggle>
          </ToggleGroup>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Chart>
          {current === "loading" ? <Skeleton className="h-60 w-full" /> : null}
          {current === "empty" ? (
            <Empty className="h-60">
              <EmptyHeader>
                <EmptyMedia>
                  <ChartNoAxesColumnIcon />
                </EmptyMedia>
                <EmptyTitle>No visits yet</EmptyTitle>
                <EmptyDescription>Data appears here once the first visitor arrives.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : null}
          {current === "loaded" ? <ChartPlot ariaLabel="Monthly visitors by device" definition={definition} height={240} /> : null}
        </Chart>
      </CardContent>
    </Card>
  );
}
