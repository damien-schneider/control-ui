"use client";

import { type ReactNode, useMemo, useState } from "react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/control-ui/ui/card";
import { Chart, ChartLegend, ChartLegendItem, ChartPlot } from "@/components/control-ui/ui/chart";
import { barChart, lineChart, scatterChart } from "@/components/control-ui/ui/chart-cartesian";
import type { ChartColor } from "@/components/control-ui/ui/chart-colors";
import { type ChartFill, resolveChartSeries } from "@/components/control-ui/ui/chart-series";
import { Toggle, ToggleGroup } from "@/components/control-ui/ui/toggle";
import { channelRevenue, deviceVisits, productLines, serviceLatency } from "./chart-data";

type LegendEntry = { key: string; label: string; color: ChartColor; fill: ChartFill };

function ChartCard({
  title,
  description,
  action,
  legend,
  children,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  legend: readonly LegendEntry[];
  children: ReactNode;
}) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent>
        <Chart>
          {children}
          <ChartLegend>
            {legend.map((entry) => (
              <ChartLegendItem key={entry.key} color={entry.color} fill={entry.fill}>
                {entry.label}
              </ChartLegendItem>
            ))}
          </ChartLegend>
        </Chart>
      </CardContent>
    </Card>
  );
}

const lineSeries = resolveChartSeries<(typeof deviceVisits)[number]>([
  { key: "desktop", label: "Desktop" },
  { key: "mobile", label: "Mobile", dashed: true },
]);

export function ChartLineExample() {
  const definition = useMemo(() => lineChart({ data: deviceVisits, x: "month", series: lineSeries, dots: true }), []);
  return (
    <ChartCard title="Desktop vs. mobile" description="Monthly visitors" legend={lineSeries.map((entry) => ({ ...entry, fill: "solid" }))}>
      <ChartPlot ariaLabel="Monthly desktop and mobile visitors" definition={definition} height={260} />
    </ChartCard>
  );
}

const productSeries = resolveChartSeries<(typeof productLines)[number]>([
  { key: "revenue", label: "Revenue" },
  { key: "margin", label: "Margin" },
]);

export function ChartBarExample() {
  const definition = useMemo(
    () =>
      barChart({
        data: productLines,
        x: "product",
        series: productSeries,
        formatValue: (value) => `${value < 0 ? "−" : ""}$${Math.abs(value)}k`,
        references: [{ value: 0, color: "neutral" }],
      }),
    [],
  );
  return (
    <ChartCard title="Revenue and margin" description="By product line, in thousands" legend={productSeries}>
      <ChartPlot ariaLabel="Revenue and margin by product line" definition={definition} height={280} />
    </ChartCard>
  );
}

const channelSeries = resolveChartSeries<(typeof channelRevenue)[number]>([
  { key: "direct", label: "Direct" },
  { key: "partner", label: "Partner" },
  { key: "paid", label: "Paid" },
]);

export function ChartBarHorizontalExample() {
  const [layout, setLayout] = useState<string[]>(["stacked"]);
  const percent = layout.includes("percent");
  const definition = useMemo(
    () =>
      barChart({
        data: channelRevenue,
        x: "channel",
        series: channelSeries,
        orientation: "horizontal",
        layout: percent ? "percent" : "stacked",
      }),
    [percent],
  );
  return (
    <ChartCard
      title="Deals by channel"
      description={percent ? "Share of each channel" : "Closed deals"}
      legend={channelSeries}
      action={
        <ToggleGroup value={layout} onValueChange={setLayout} aria-label="Bar layout">
          <Toggle value="stacked">Count</Toggle>
          <Toggle value="percent">Share</Toggle>
        </ToggleGroup>
      }
    >
      <ChartPlot ariaLabel="Closed deals by acquisition channel" definition={definition} height={280} />
    </ChartCard>
  );
}

const regionColors = { Europe: "blue", Americas: "green", Asia: "orange" } as const;

export function ChartScatterExample() {
  const definition = useMemo(
    () =>
      scatterChart({
        data: serviceLatency,
        x: "latency",
        y: "throughput",
        size: "size",
        group: "region",
        colors: regionColors,
        xLabel: "Latency (ms)",
        yLabel: "Throughput (req/s)",
        references: [{ value: 600, label: "SLO", color: "red" }],
      }),
    [],
  );
  return (
    <ChartCard
      title="Latency vs. throughput"
      description="Per service, sized by instance count"
      legend={Object.entries(regionColors).map(([region, color]) => ({ key: region, label: region, color, fill: "solid" }))}
    >
      <ChartPlot ariaLabel="Service latency against throughput, grouped by region" definition={definition} height={300} />
    </ChartCard>
  );
}
