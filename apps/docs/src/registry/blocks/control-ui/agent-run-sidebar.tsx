"use client";

import { BotIcon, CheckIcon, CircleAlertIcon, CircleDashedIcon, CirclePauseIcon, CircleSlashIcon, PlusIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/control-ui/ui/sidebar";
import { Spinner } from "@/components/control-ui/ui/spinner";
import { Text } from "@/components/control-ui/ui/typography";
import type { AgentRunStatus, AgentRunSummary } from "./agent-run-status";

const runStatusIcons = {
  running: <Spinner aria-hidden="true" />,
  waiting: <CirclePauseIcon className="text-warning-text" aria-hidden="true" />,
  success: <CheckIcon className="text-success-text" aria-hidden="true" />,
  error: <CircleAlertIcon className="text-destructive-text" aria-hidden="true" />,
  cancelled: <CircleSlashIcon className="text-muted-foreground" aria-hidden="true" />,
  pending: <CircleDashedIcon className="text-muted-foreground" aria-hidden="true" />,
} satisfies Record<AgentRunStatus, ReactNode>;

export function AgentRunSidebar({
  appName,
  brand,
  runs,
  activeRunId,
  sidebarFooter,
  newRunLabel,
  runsLabel,
  emptyRunsLabel,
  statusLabels,
  onRunSelect,
  onNewRun,
}: {
  appName: string;
  brand?: ReactNode;
  runs: readonly AgentRunSummary[];
  activeRunId?: string;
  sidebarFooter?: ReactNode;
  newRunLabel: string;
  runsLabel: string;
  emptyRunsLabel: string;
  statusLabels: Record<AgentRunStatus, string>;
  onRunSelect?: (run: AgentRunSummary) => void;
  onNewRun?: () => void;
}) {
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader divider className="gap-1.5">
        <div className="flex min-w-0 items-center gap-2 px-1 py-1">
          {brand ?? (
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-foreground text-background">
              <BotIcon className="size-3.5" aria-hidden="true" />
            </span>
          )}
          <Text size="label" weight="semibold" className="truncate" title={appName}>
            {appName}
          </Text>
        </div>
        {onNewRun ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="sm"
                onClick={() => {
                  onNewRun();
                  setOpenMobile(false);
                }}
              >
                <PlusIcon />
                <span>{newRunLabel}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : null}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="gap-1">
          <SidebarGroupLabel>{runsLabel}</SidebarGroupLabel>
          {runs.length === 0 ? (
            <Text size="caption" tone="muted" className="mx-2">
              {emptyRunsLabel}
            </Text>
          ) : (
            <SidebarMenu>
              {runs.map((run) => (
                <SidebarMenuItem key={run.id}>
                  <SidebarMenuButton
                    size="sm"
                    isActive={run.id === activeRunId}
                    onClick={() => {
                      onRunSelect?.(run);
                      setOpenMobile(false);
                    }}
                  >
                    {runStatusIcons[run.status]}
                    <span className="truncate">{run.title}</span>
                    <span className="sr-only">, {statusLabels[run.status]}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          )}
        </SidebarGroup>
      </SidebarContent>

      {sidebarFooter ? <SidebarFooter>{sidebarFooter}</SidebarFooter> : null}
      <SidebarRail />
    </Sidebar>
  );
}
