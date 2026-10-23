"use client";

import { BotIcon, Check, CircleAlert, CircleDashed, CirclePause, CircleSlash, LoaderCircle, PlusIcon } from "lucide-react";
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
import { Text } from "@/components/control-ui/ui/typography";
import { type AgentRunStatus, type AgentRunSummary, agentRunStatusLabels } from "./agent-run-status";

const runStatusIcons = {
  running: <LoaderCircle className="size-3.5 shrink-0 motion-safe:animate-spin" aria-hidden="true" />,
  waiting: <CirclePause className="size-3.5 shrink-0 text-warning-text" aria-hidden="true" />,
  success: <Check className="size-3.5 shrink-0 text-success-text" aria-hidden="true" />,
  error: <CircleAlert className="size-3.5 shrink-0 text-destructive-text" aria-hidden="true" />,
  cancelled: <CircleSlash className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />,
  pending: <CircleDashed className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />,
} satisfies Record<AgentRunStatus, ReactNode>;

export function AgentRunSidebar({
  appName,
  brand,
  runs,
  activeRunId,
  sidebarFooter,
  onRunSelect,
  onNewRun,
}: {
  appName: string;
  brand?: ReactNode;
  runs: readonly AgentRunSummary[];
  activeRunId?: string;
  sidebarFooter?: ReactNode;
  onRunSelect?: (run: AgentRunSummary) => void;
  onNewRun?: () => void;
}) {
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader divider className="gap-1.5 px-2 pb-2 pt-3">
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
                <span>New run</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : null}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="gap-1 pt-1">
          <SidebarGroupLabel>Runs</SidebarGroupLabel>
          {runs.length === 0 ? (
            <Text size="caption" tone="muted" className="px-2">
              No runs yet
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
                    <span className="sr-only">, {agentRunStatusLabels[run.status]}</span>
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
