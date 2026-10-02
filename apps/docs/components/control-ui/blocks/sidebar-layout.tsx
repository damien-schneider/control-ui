"use client";

import { BotIcon, LayoutDashboardIcon, SettingsIcon, SquareTerminalIcon, WorkflowIcon } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { AppShell, AppShellContent, AppShellHeader } from "@/components/control-ui/ui/app-shell";
import { PageLayout } from "@/components/control-ui/ui/page-layout";
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
  SidebarTrigger,
} from "@/components/control-ui/ui/sidebar";

type SidebarLayoutNavItem = {
  title: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

const primaryNav: SidebarLayoutNavItem[] = [
  { title: "Playground", href: "/playground", icon: SquareTerminalIcon },
  { title: "Agents", href: "/agents", icon: BotIcon },
  { title: "Workflows", href: "/workflows", icon: WorkflowIcon },
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
];

export function AppSidebar({ active = "Playground" }: { active?: string }) {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<a href="/" />}>
              <span
                aria-hidden="true"
                className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-label font-semibold text-primary-foreground"
              >
                A
              </span>
              <span className="text-body font-semibold">Acme Studio</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            {primaryNav.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton render={<a href={item.href} />} isActive={item.title === active}>
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<a href="/settings" />} isActive={active === "Settings"}>
              <SettingsIcon />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export function SidebarLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell scroll="inset">
      <AppSidebar />
      <AppShellContent>
        <AppShellHeader>
          <SidebarTrigger />
        </AppShellHeader>
        <PageLayout width="full">
          <div
            data-control-ui="sidebar-layout"
            data-control-family="sidebar-layout"
            data-slot="content"
            data-surface="panel"
            className="flex flex-1 flex-col gap-4 p-4"
          >
            {children}
          </div>
        </PageLayout>
      </AppShellContent>
    </AppShell>
  );
}
