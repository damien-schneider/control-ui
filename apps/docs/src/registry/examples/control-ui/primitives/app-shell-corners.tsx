"use client";

import { BellIcon, InboxIcon, SettingsIcon } from "lucide-react";
import { AppShell, AppShellContent, AppShellCorner } from "@/components/control-ui/ui/app-shell";
import { Avatar, AvatarFallback } from "@/components/control-ui/ui/avatar";
import { Button } from "@/components/control-ui/ui/button";
import { PageBody, PageHeader, PageLayout, PageTitle } from "@/components/control-ui/ui/page-layout";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/control-ui/ui/sidebar";
import { Text } from "@/components/control-ui/ui/typography";

export function PrimitiveAppShellCornersExample() {
  return (
    <AppShell layout="contained" scroll="inset" persistOpen={false} keyboardShortcut={null}>
      <AppShellCorner placement="top-start">
        <SidebarTrigger />
        <Avatar size="xs" aria-hidden="true">
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
        <Text size="label" weight="medium">
          Acme
        </Text>
      </AppShellCorner>
      <AppShellCorner placement="top-end">
        <Button variant="ghost" size="sm" iconOnly aria-label="Notifications">
          <BellIcon />
        </Button>
      </AppShellCorner>
      <Sidebar collapsible="offcanvas">
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>
                  <InboxIcon />
                  <span>Inbox</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <SettingsIcon />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <AppShellContent>
        <PageLayout width="content">
          <PageHeader>
            <PageTitle>Inbox</PageTitle>
          </PageHeader>
          <PageBody>
            <Text as="p" tone="muted">
              Collapse the sidebar: the corners stay pinned while the column slides away.
            </Text>
          </PageBody>
        </PageLayout>
      </AppShellContent>
      <AppShellCorner placement="bottom-start">
        <Text size="caption">Synced just now</Text>
      </AppShellCorner>
      <AppShellCorner placement="bottom-end">
        <Text size="caption" mono>
          v2.4.0
        </Text>
      </AppShellCorner>
    </AppShell>
  );
}
