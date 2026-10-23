"use client";

import { Check, Circle, CircleAlert, CircleDashed, CirclePause, LoaderCircle } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { createContext, useContext, useId } from "react";
import type { ActivityProps } from "@/components/control-ui/activity";
import {
  Activity,
  ActivityContent,
  ActivityDetail,
  ActivityDetailContent,
  ActivityDetailLabel,
  ActivityIcon,
  ActivityRow,
  ActivityStatus,
  ActivityTitle,
  ActivityTrigger,
} from "@/components/control-ui/activity";
import { cn } from "@/components/control-ui/lib/cn";
import { Badge } from "@/components/control-ui/ui/badge";
import { Card, CardAction, CardContent, CardHeader } from "@/components/control-ui/ui/card";
import { LiveStatus } from "@/components/control-ui/ui/live-status";
import {
  SidebarInset,
  SidebarProvider,
  type SidebarProviderProps,
  type SidebarStyle,
  SidebarTrigger,
} from "@/components/control-ui/ui/sidebar";
import type { TimelineItemProps, TimelineState } from "@/components/control-ui/ui/timeline";
import {
  Timeline,
  TimelineContent,
  TimelineDescription,
  TimelineIndicator,
  TimelineItem,
  TimelineMeta,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/control-ui/ui/timeline";
import { Heading, Text } from "@/components/control-ui/ui/typography";
import { elapsedIsoDuration, formatElapsed, useRunClock } from "./agent-run-clock";
import { AgentRunSidebar } from "./agent-run-sidebar";
import {
  type AgentRunStatus,
  type AgentRunSummary,
  agentRunStatusColors,
  agentRunStatusLabels,
  agentRunStepLabels,
} from "./agent-run-status";

export type { AgentRunStatus, AgentRunSummary } from "./agent-run-status";

type AgentRunLayout = "viewport" | "contained";

const AgentRunLayoutContext = createContext<AgentRunLayout>("viewport");

function useHeadingLevels() {
  const layout = useContext(AgentRunLayoutContext);
  return layout === "contained" ? ({ title: 2, section: 3 } as const) : ({ title: 1, section: 2 } as const);
}

export type AgentRunBlockProps = Omit<ComponentProps<"div">, "children"> &
  Pick<SidebarProviderProps, "persistOpen" | "keyboardShortcut"> & {
    appName?: string;
    brand?: ReactNode;
    runs: readonly AgentRunSummary[];
    activeRunId?: string;
    onRunSelect?: (run: AgentRunSummary) => void;
    onNewRun?: () => void;
    sidebarFooter?: ReactNode;
    children: ReactNode;
    layout?: AgentRunLayout;
  };

export function AgentRunBlock({
  appName = "Agents",
  brand,
  runs,
  activeRunId,
  onRunSelect,
  onNewRun,
  sidebarFooter,
  children,
  layout = "viewport",
  className,
  style,
  ...props
}: AgentRunBlockProps) {
  const providerStyle: SidebarStyle = { "--sidebar-width": "16rem", ...style };

  return (
    <SidebarProvider
      layout={layout}
      surface="background"
      className={cn("text-foreground", layout === "viewport" && "h-svh overflow-hidden", className)}
      style={providerStyle}
      {...props}
    >
      <AgentRunSidebar
        appName={appName}
        brand={brand}
        runs={runs}
        activeRunId={activeRunId}
        sidebarFooter={sidebarFooter}
        onRunSelect={onRunSelect}
        onNewRun={onNewRun}
      />
      <SidebarInset className="@container/agent-run flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
        <AgentRunLayoutContext.Provider value={layout}>{children}</AgentRunLayoutContext.Provider>
      </SidebarInset>
    </SidebarProvider>
  );
}

export type AgentRunElapsedProps = Omit<ComponentProps<"time">, "dateTime" | "children"> & {
  startedAt: number;
  endedAt?: number;
};

export function AgentRunElapsed({ startedAt, endedAt, className, ...props }: AgentRunElapsedProps) {
  const now = useRunClock(endedAt === undefined);
  const end = endedAt ?? now;
  const ms = end === null ? null : Math.max(0, end - startedAt);

  return (
    <time
      dateTime={ms === null ? undefined : elapsedIsoDuration(ms)}
      className={cn("text-label tabular-nums text-muted-foreground", className)}
      {...props}
    >
      {ms === null ? "" : formatElapsed(ms)}
    </time>
  );
}

export type AgentRunHeaderProps = Omit<ComponentProps<"header">, "title"> & {
  title: string;
  status: AgentRunStatus;
  startedAt?: number;
  endedAt?: number;
  actions?: ReactNode;
};

export function AgentRunHeader({ title, status, startedAt, endedAt, actions, className, ...props }: AgentRunHeaderProps) {
  const levels = useHeadingLevels();

  return (
    <header className={cn("flex h-12 shrink-0 items-center gap-2 border-b border-border/70 px-3", className)} {...props}>
      <SidebarTrigger size="xs" className="lg:hidden" />
      <Heading level={levels.title} size="label" weight="medium" className="min-w-0 truncate" title={title}>
        {title}
      </Heading>
      <Badge size="sm" color={agentRunStatusColors[status]}>
        {agentRunStatusLabels[status]}
      </Badge>
      {startedAt === undefined ? null : <AgentRunElapsed startedAt={startedAt} endedAt={endedAt} className="text-body" />}
      <div className="ms-auto flex shrink-0 items-center gap-1">{actions}</div>
      <LiveStatus message={`${title}: ${agentRunStatusLabels[status]}`} />
    </header>
  );
}

export type AgentRunBodyProps = ComponentProps<"div"> & { aside?: ReactNode };

export function AgentRunBody({ aside, className, children, ...props }: AgentRunBodyProps) {
  return (
    <div
      className={cn(
        "grid min-h-0 flex-1 content-start overflow-y-auto @3xl/agent-run:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] @3xl/agent-run:content-stretch @3xl/agent-run:overflow-hidden",
        className,
      )}
      {...props}
    >
      <div className="min-w-0 px-4 py-5 @lg/agent-run:px-6 @3xl/agent-run:overflow-y-auto">{children}</div>
      {aside}
    </div>
  );
}

export type AgentRunPlanProps = Omit<ComponentProps<"section">, "title"> & { title?: ReactNode; description?: ReactNode };

export function AgentRunPlan({ title = "Plan", description, className, children, ...props }: AgentRunPlanProps) {
  const levels = useHeadingLevels();
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className={cn("min-w-0", className)} {...props}>
      <Heading id={headingId} level={levels.section} size="label" weight="medium">
        {title}
      </Heading>
      {description ? (
        <Text size="caption" tone="muted">
          {description}
        </Text>
      ) : null}
      <Timeline className="mt-3">{children}</Timeline>
    </section>
  );
}

const stepIcons = {
  neutral: <Circle aria-hidden="true" />,
  pending: <CircleDashed aria-hidden="true" />,
  running: <LoaderCircle className="motion-safe:animate-spin" aria-hidden="true" />,
  waiting: <CirclePause aria-hidden="true" />,
  success: <Check aria-hidden="true" />,
  error: <CircleAlert aria-hidden="true" />,
} satisfies Record<TimelineState, ReactNode>;

export type AgentRunStepProps = Omit<TimelineItemProps, "title"> & {
  title: ReactNode;
  detail?: ReactNode;
  startedAt?: number;
  endedAt?: number;
  actions?: ReactNode;
};

export function AgentRunStep({ title, detail, startedAt, endedAt, actions, state = "pending", children, ...props }: AgentRunStepProps) {
  const hasMeta = startedAt !== undefined || actions !== undefined;

  return (
    <TimelineItem state={state} {...props}>
      <TimelineIndicator aria-label={agentRunStepLabels[state]}>{stepIcons[state]}</TimelineIndicator>
      <TimelineSeparator />
      <TimelineContent>
        <TimelineTitle>{title}</TimelineTitle>
        {detail ? <TimelineDescription>{detail}</TimelineDescription> : null}
        {hasMeta ? (
          <TimelineMeta>
            {startedAt === undefined ? null : <AgentRunElapsed startedAt={startedAt} endedAt={endedAt} />}
            {actions}
          </TimelineMeta>
        ) : null}
        {children ? <div className="mt-2 grid gap-2">{children}</div> : null}
      </TimelineContent>
    </TimelineItem>
  );
}

function formatToolValue(value: unknown): string {
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

export type AgentRunToolCallProps = Omit<ActivityProps, "kind" | "name" | "children"> & {
  name: string;
  summary?: ReactNode;
  icon?: ReactNode;
  input?: unknown;
  output?: unknown;
  errorText?: string;
  startedAt?: number;
  endedAt?: number;
};

export function AgentRunToolCall({ name, summary, icon, input, output, errorText, startedAt, endedAt, ...props }: AgentRunToolCallProps) {
  const hasDetails = input !== undefined || output !== undefined || errorText !== undefined;
  const Row = hasDetails ? ActivityTrigger : ActivityRow;

  return (
    <Activity kind="tool" name={name} {...props}>
      <Row>
        {icon ? <ActivityIcon>{icon}</ActivityIcon> : <ActivityIcon />}
        <ActivityTitle>
          {name}
          {summary ? <span className="text-muted-foreground"> · {summary}</span> : null}
        </ActivityTitle>
        {startedAt === undefined ? null : <AgentRunElapsed startedAt={startedAt} endedAt={endedAt} className="ms-2" />}
        <ActivityStatus className="sr-only" />
      </Row>
      {hasDetails ? (
        <ActivityContent>
          {input === undefined ? null : (
            <ActivityDetail>
              <ActivityDetailLabel>Input</ActivityDetailLabel>
              <ActivityDetailContent format="code">{formatToolValue(input)}</ActivityDetailContent>
            </ActivityDetail>
          )}
          {output === undefined ? null : (
            <ActivityDetail>
              <ActivityDetailLabel>Output</ActivityDetailLabel>
              <ActivityDetailContent format="code">{formatToolValue(output)}</ActivityDetailContent>
            </ActivityDetail>
          )}
          {errorText === undefined ? null : (
            <ActivityDetail>
              <ActivityDetailLabel>Error</ActivityDetailLabel>
              <ActivityDetailContent className="text-destructive-text">{errorText}</ActivityDetailContent>
            </ActivityDetail>
          )}
        </ActivityContent>
      ) : null}
    </Activity>
  );
}

export type AgentRunAsideProps = ComponentProps<"aside">;

export function AgentRunAside({ className, ...props }: AgentRunAsideProps) {
  return (
    <aside
      aria-label="Run output"
      className={cn(
        "grid content-start gap-4 border-t border-border/70 px-4 py-5 @lg/agent-run:px-6 @3xl/agent-run:overflow-y-auto @3xl/agent-run:border-t-0 @3xl/agent-run:border-s",
        className,
      )}
      {...props}
    />
  );
}

export type AgentRunSectionProps = Omit<ComponentProps<typeof Card>, "title"> & { title: ReactNode; actions?: ReactNode };

export function AgentRunSection({ title, actions, children, ...props }: AgentRunSectionProps) {
  const levels = useHeadingLevels();

  return (
    <Card {...props}>
      <CardHeader>
        <Heading level={levels.section} size="label" weight="medium">
          {title}
        </Heading>
        {actions ? <CardAction>{actions}</CardAction> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export type AgentRunDetail = { label: string; value: ReactNode };

export type AgentRunDetailsProps = Omit<AgentRunSectionProps, "title" | "children"> & {
  title?: ReactNode;
  items: readonly AgentRunDetail[];
};

export function AgentRunDetails({ title = "Details", items, ...props }: AgentRunDetailsProps) {
  if (items.length === 0) return null;

  return (
    <AgentRunSection title={title} {...props}>
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-body">
        {items.map((item) => (
          <div key={item.label} className="contents">
            <dt className="text-muted-foreground">{item.label}</dt>
            <dd className="min-w-0 break-words">{item.value}</dd>
          </div>
        ))}
      </dl>
    </AgentRunSection>
  );
}
