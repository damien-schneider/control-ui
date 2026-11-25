"use client";

import { CheckIcon, CircleAlertIcon, CircleDashedIcon, CirclePauseIcon, CircleSlashIcon, PlusIcon } from "lucide-react";
import type { ReactNode } from "react";
import { SkinIcon, useSkinIcon } from "@/components/control-ui/skin-provider";
import { Avatar, AvatarFallback } from "@/components/control-ui/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  type SidebarMenuIconTone,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/control-ui/ui/sidebar";
import { Spinner } from "@/components/control-ui/ui/spinner";
import { Text } from "@/components/control-ui/ui/typography";
import type { AgentRunStatus, AgentRunSummary } from "./agent-run-status";

const runStatusIcons = {
  running: <Spinner aria-hidden="true" />,
  waiting: <SkinIcon name="waiting" fallback={CirclePauseIcon} aria-hidden="true" />,
  success: <SkinIcon name="success" fallback={CheckIcon} aria-hidden="true" />,
  error: <SkinIcon name="error" fallback={CircleAlertIcon} aria-hidden="true" />,
  cancelled: <SkinIcon name="cancelled" fallback={CircleSlashIcon} aria-hidden="true" />,
  pending: <SkinIcon name="pending" fallback={CircleDashedIcon} aria-hidden="true" />,
} satisfies Record<AgentRunStatus, ReactNode>;

const runStatusIconTones = {
  running: "default",
  waiting: "warning",
  success: "success",
  error: "danger",
  cancelled: "muted",
  pending: "muted",
} satisfies Record<AgentRunStatus, SidebarMenuIconTone>;

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
  const PlusGlyph = useSkinIcon("plus", PlusIcon);
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader divider className="gap-1.5">
        <div className="flex min-w-0 items-center gap-2 px-1 py-1">
          {brand ?? (
            <Avatar size="xs" aria-hidden="true">
              <AvatarFallback>{appName.charAt(0)}</AvatarFallback>
            </Avatar>
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
                <PlusGlyph />
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
                    iconTone={runStatusIconTones[run.status]}
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
