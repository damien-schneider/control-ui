"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/control-ui/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/control-ui/ui/card";
import { Chart, ChartLegend, ChartLegendItem, ChartPlot } from "@/components/control-ui/ui/chart";
import { areaChart } from "@/components/control-ui/ui/chart-cartesian";
import { resolveChartSeries } from "@/components/control-ui/ui/chart-series";
import { deviceVisits, deviceVisitsNextPeriod } from "./chart-data";

const series = resolveChartSeries<(typeof deviceVisits)[number]>([
  { key: "desktop", label: "Desktop" },
  { key: "mobile", label: "Mobile" },
  { key: "tablet", label: "Tablet" },
]);

export function PrimitiveChartExample() {
  const [nextPeriod, setNextPeriod] = useState(false);
  const data = nextPeriod ? deviceVisitsNextPeriod : deviceVisits;
  const definition = useMemo(
    () =>
      areaChart({
        data,
        x: "month",
        series,
        stacked: true,
        references: [{ value: 400, label: "Target", color: "red" }],
      }),
    [data],
  );

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Visitors by device</CardTitle>
        <CardDescription>{nextPeriod ? "Next year, projected" : "This year"}</CardDescription>
        <CardAction>
          <Button variant="surface" onClick={() => setNextPeriod((current) => !current)}>
            {nextPeriod ? "This period" : "Next period"}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Chart>
          <ChartPlot ariaLabel="Monthly visitors by device, stacked" definition={definition} height={260} />
          <ChartLegend>
            {series.map((entry) => (
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
