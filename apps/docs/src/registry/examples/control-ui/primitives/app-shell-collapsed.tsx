"use client";

import { InboxIcon, SettingsIcon } from "lucide-react";
import { AppShell, AppShellContent, AppShellHeader } from "@/components/control-ui/ui/app-shell";
import { Button } from "@/components/control-ui/ui/button";
import { PageBody, PageHeader, PageLayout, PageTitle } from "@/components/control-ui/ui/page-layout";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/control-ui/ui/sidebar";
import { Text } from "@/components/control-ui/ui/typography";

export function PrimitiveAppShellCollapsedExample() {
  return (
    <AppShell layout="contained" scroll="inset" defaultOpen={false} persistOpen={false} keyboardShortcut={null}>
      <Sidebar collapsible="icon">
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
        <SidebarRail />
      </Sidebar>
      <AppShellContent>
        <AppShellHeader>
          <SidebarTrigger />
          <Text size="label" className="min-w-0 flex-1 truncate">
            Inbox
          </Text>
          <Button size="sm">Compose</Button>
        </AppShellHeader>
        <PageLayout width="content">
          <PageHeader>
            <PageTitle>Inbox</PageTitle>
          </PageHeader>
          <PageBody>
            <Text as="p" tone="muted">
              The sidebar starts as icons, so narrow shells keep their page content in view.
            </Text>
          </PageBody>
        </PageLayout>
      </AppShellContent>
    </AppShell>
  );
}
