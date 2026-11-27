"use client";

import { CircleCheckIcon, CircleDotIcon, CircleIcon, type LucideIcon, TrendingUpIcon } from "lucide-react";
import { Badge } from "@/components/control-ui/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/control-ui/ui/card";
import { Chart, ChartPlot } from "@/components/control-ui/ui/chart";
import { barChart } from "@/components/control-ui/ui/chart-cartesian";
import { CodeDiff } from "@/components/control-ui/ui/code-diff";
import {
  Timeline,
  TimelineContent,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  type TimelineState,
  TimelineTitle,
} from "@/components/control-ui/ui/timeline";
import { Text } from "@/components/control-ui/ui/typography";
import { PreviewPanel } from "./preview-panel";

const TRIAGE_PATCH = `--- a/src/triage/route.ts
+++ b/src/triage/route.ts
@@ -12,4 +12,6 @@
 const rules = loadRules(team);
-if (ticket.tags.includes("bug")) {
+if (isBug(ticket) && !isBilling(ticket)) {
   queue.push("engineering", ticket);
-}
+} else {
+  queue.push("billing", ticket);
+}
`;

export function CodeDiffPreview() {
  return <CodeDiff patch={TRIAGE_PATCH} diffStyle="unified" diffIndicators="classic" className="w-full" />;
}

const weeklyResolved = [
  { week: "Week 1", resolved: 62 },
  { week: "Week 2", resolved: 48 },
  { week: "Week 3", resolved: 118 },
  { week: "Week 4", resolved: 110 },
  { week: "Week 5", resolved: 152 },
  { week: "Week 6", resolved: 134 },
  { week: "Week 7", resolved: 214 },
  { week: "Week 8", resolved: 186 },
  { week: "Week 9", resolved: 260 },
];

const latestWeek = weeklyResolved.at(-1)?.week;

const resolvedTotal = weeklyResolved.reduce((total, entry) => total + entry.resolved, 0);

const resolvedChart = barChart({
  data: weeklyResolved,
  x: "week",
  series: [{ key: "resolved", label: "Resolved", color: (entry) => (entry.week === latestWeek ? "blue" : "neutral") }],
  fill: "solid",
  radius: 3,
  grid: false,
  xScale: { axis: false },
  yScale: { axis: false },
});

export function ChartPreview() {
  return (
    <Card size="sm" className="w-full">
      <CardHeader>
        <CardDescription>Tickets resolved</CardDescription>
        <CardTitle>
          <Text size="display" weight="semibold" numeric>
            {resolvedTotal.toLocaleString("en-US")}
          </Text>
        </CardTitle>
        <CardAction>
          <Badge color="green" size="sm">
            <TrendingUpIcon aria-hidden="true" />
            12%
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Chart>
          <ChartPlot ariaLabel="Tickets resolved per week" definition={resolvedChart} height={80} />
        </Chart>
      </CardContent>
    </Card>
  );
}

const releaseEvents: readonly { title: string; time: string; state: TimelineState; icon: LucideIcon }[] = [
  { title: "Rules drafted", time: "9:12 AM", state: "success", icon: CircleCheckIcon },
  { title: "Review requested", time: "9:40 AM", state: "running", icon: CircleDotIcon },
  { title: "Ship to production", time: "Scheduled 2:00 PM", state: "pending", icon: CircleIcon },
];

export function TimelinePreview() {
  return (
    <PreviewPanel>
      <Timeline>
        {releaseEvents.map(({ title, time, state, icon: Icon }) => (
          <TimelineItem key={title} state={state}>
            <TimelineIndicator>
              <Icon />
            </TimelineIndicator>
            <TimelineSeparator />
            <TimelineContent className="flex items-baseline justify-between gap-3">
              <TimelineTitle>{title}</TimelineTitle>
              <Text size="caption" tone="muted" className="shrink-0">
                {time}
              </Text>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </PreviewPanel>
  );
}
