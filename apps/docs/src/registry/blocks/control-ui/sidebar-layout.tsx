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
  SidebarMobileNav,
  SidebarMobileNavItem,
  SidebarMobileTrigger,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/control-ui/ui/sidebar";
import { Text } from "@/components/control-ui/ui/typography";

type SidebarLayoutNavItem = {
  title: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  mobilePrimary: boolean;
};

const navigation: SidebarLayoutNavItem[] = [
  { title: "Playground", href: "/playground", icon: SquareTerminalIcon, mobilePrimary: true },
  { title: "Agents", href: "/agents", icon: BotIcon, mobilePrimary: true },
  { title: "Workflows", href: "/workflows", icon: WorkflowIcon, mobilePrimary: true },
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon, mobilePrimary: true },
  { title: "Settings", href: "/settings", icon: SettingsIcon, mobilePrimary: false },
];

function NavigationItem({ item, active, mobile = false }: { item: SidebarLayoutNavItem; active: string; mobile?: boolean }) {
  const { setOpenMobile } = useSidebar();
  const Item = mobile ? SidebarMobileNavItem : SidebarMenuButton;
  return (
    <Item render={<a href={item.href} />} isActive={item.title === active} onClick={() => setOpenMobile(false)}>
      <item.icon aria-hidden="true" />
      <span>{item.title}</span>
    </Item>
  );
}

export function AppSidebar({ active = "Playground" }: { active?: string }) {
  return (
    <Sidebar collapsible="icon" variant="inset" mobileVariant="drawer">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<a href="/" />}>
              <Text
                aria-hidden="true"
                size="label"
                weight="semibold"
                className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground"
              >
                A
              </Text>
              <Text weight="semibold">Acme Studio</Text>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            {navigation
              .filter((item) => item.mobilePrimary)
              .map((item) => (
                <SidebarMenuItem key={item.title}>
                  <NavigationItem item={item} active={active} />
                </SidebarMenuItem>
              ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {navigation
            .filter((item) => !item.mobilePrimary)
            .map((item) => (
              <SidebarMenuItem key={item.title}>
                <NavigationItem item={item} active={active} />
              </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export function AppMobileNavigation({ active = "Playground" }: { active?: string }) {
  return (
    <SidebarMobileNav>
      {navigation
        .filter((item) => item.mobilePrimary)
        .map((item) => (
          <NavigationItem key={item.title} item={item} active={active} mobile />
        ))}
      <SidebarMobileTrigger />
    </SidebarMobileNav>
  );
}

export function SidebarLayout({ children, active = "Playground" }: { children: ReactNode; active?: string }) {
  return (
    <AppShell scroll="inset">
      <AppSidebar active={active} />
      <AppShellContent>
        <AppShellHeader>
          <SidebarTrigger className="hidden lg:inline-flex" />
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
      <AppMobileNavigation active={active} />
    </AppShell>
  );
}
