"use client";

import { BotIcon, LayoutDashboardIcon, SettingsIcon, SquareTerminalIcon, WorkflowIcon } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/control-ui/ui/sidebar";

type SidebarLayoutNavItem = {
  title: string;
  icon: ComponentType<{ className?: string }>;
};

const primaryNav: SidebarLayoutNavItem[] = [
  { title: "Playground", icon: SquareTerminalIcon },
  { title: "Agents", icon: BotIcon },
  { title: "Workflows", icon: WorkflowIcon },
  { title: "Dashboard", icon: LayoutDashboardIcon },
];

// Same AppSidebar/SidebarLayout seam as default-skin block, on Control UI Sidebar (same shadcn contract:
// provider+icon-collapse+inset), skinned via token cascade + per-slot config; advanced packs reskin from here.
export function AppSidebar({ active = "Playground" }: { active?: string }) {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
                A
              </span>
              <span className="text-sm font-semibold">Acme Studio</span>
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
                <SidebarMenuButton isActive={item.title === active} tooltip={item.title}>
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
            <SidebarMenuButton tooltip="Settings">
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
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
        </header>
        <div
          data-control-ui="sidebar-layout"
          data-slot="content"
          data-surface="panel"
          className={cn("flex flex-1 flex-col gap-4 p-4", skinSlot("sidebar-layout", "content", {}))}
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
