"use client";

import { InboxIcon, SettingsIcon } from "lucide-react";
import { useState } from "react";
import { AppShell, AppShellContent, AppShellHeader } from "@/components/control-ui/ui/app-shell";
import { Button } from "@/components/control-ui/ui/button";
import { PageBody, PageHeader, PageLayout, PageTitle } from "@/components/control-ui/ui/page-layout";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/control-ui/ui/sidebar";
import { Skeleton } from "@/components/control-ui/ui/skeleton";
import { Text } from "@/components/control-ui/ui/typography";

export function PrimitiveAppShellExample() {
  const [loading, setLoading] = useState(false);
  return (
    <AppShell layout="contained" scroll="inset" persistOpen={false} keyboardShortcut={null}>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <span className="truncate p-2 font-medium group-data-[collapsible=icon]:hidden">Sidebar</span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive tooltip="Inbox">
                <InboxIcon />
                <span>Inbox</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Settings">
                <SettingsIcon />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarRail resizable />
      </Sidebar>
      <AppShellContent>
        <AppShellHeader>
          <SidebarTrigger />
          <span className="min-w-0 flex-1 truncate font-mono text-label">AppShellHeader</span>
          <Button size="sm" onClick={() => setLoading(!loading)}>
            {loading ? "Show content" : "Show loading"}
          </Button>
        </AppShellHeader>
        <PageLayout width="content" aria-busy={loading}>
          <PageHeader>
            <PageTitle>Page content</PageTitle>
          </PageHeader>
          <PageBody>
            {loading ? (
              <div role="status" className="space-y-3">
                <span className="sr-only">Loading inbox…</span>
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <Text as="p" tone="muted">
                AppShellContent holds the current page. Toggle loading to see the sidebar and header stay in place.
              </Text>
            )}
          </PageBody>
        </PageLayout>
      </AppShellContent>
    </AppShell>
  );
}
