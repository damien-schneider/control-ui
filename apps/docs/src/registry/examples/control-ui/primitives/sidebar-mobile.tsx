"use client";

import { BotIcon, LayoutDashboardIcon, SettingsIcon, SquareTerminalIcon, WorkflowIcon } from "lucide-react";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMobileNav,
  SidebarMobileNavItem,
  SidebarMobileTrigger,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/control-ui/ui/sidebar";
import { Heading, Text } from "@/components/control-ui/ui/typography";

const navigation = [
  { id: "playground", label: "Playground", icon: SquareTerminalIcon, mobilePrimary: true, disabled: false },
  { id: "agents", label: "Agents", icon: BotIcon, mobilePrimary: true, disabled: false },
  { id: "workflows", label: "Workflows", icon: WorkflowIcon, mobilePrimary: true, disabled: false },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboardIcon, mobilePrimary: true, disabled: true },
  { id: "settings", label: "Settings", icon: SettingsIcon, mobilePrimary: false, disabled: false },
] as const;

type NavigationItem = (typeof navigation)[number];
const activity = [
  "Agent created",
  "Workflow updated",
  "Run completed",
  "Project opened",
  "Tool connected",
  "Review requested",
  "Report generated",
  "Workspace ready",
];

function WorkspaceItem({
  item,
  active,
  onNavigate,
  mobile = false,
}: {
  item: NavigationItem;
  active: string;
  onNavigate: (id: NavigationItem["id"]) => void;
  mobile?: boolean;
}) {
  const Item = mobile ? SidebarMobileNavItem : SidebarMenuButton;
  return (
    <Item isActive={active === item.id} disabled={item.disabled} onClick={() => onNavigate(item.id)}>
      <item.icon aria-hidden="true" />
      <span>{item.label}</span>
    </Item>
  );
}

function MobileWorkspace({ floating }: { floating: boolean }) {
  const [active, setActive] = useState<NavigationItem["id"]>("agents");
  const { setOpenMobile } = useSidebar();
  const activeLabel = navigation.find((item) => item.id === active)?.label;

  function navigate(id: NavigationItem["id"]) {
    setActive(id);
    setOpenMobile(false);
  }

  return (
    <>
      <Sidebar mobileVariant="drawer" collapsible="none" label="Workspace navigation">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <WorkspaceItem item={item} active={active} onNavigate={navigate} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex shrink-0 items-center gap-2 border-b border-border p-3">
          <SidebarTrigger className="lg:hidden" />
          <Text size="label" weight="medium">
            Acme workspace
          </Text>
        </header>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-5">
          <Heading level={3}>{activeLabel}</Heading>
          <Text as="p" size="body" tone="muted">
            {floating
              ? "Open the complete navigation from the Menu button below."
              : "Use the bottom bar for your main destinations and Menu for the complete navigation."}
          </Text>
          {activity.map((entry) => (
            <div key={entry} className="shrink-0 rounded-(--radius-panel) border border-border p-4 text-label">
              {entry}
            </div>
          ))}
        </div>
      </SidebarInset>
      <SidebarMobileNav variant={floating ? "floating" : "bar"} aria-label="Workspace mobile navigation">
        {!floating &&
          navigation
            .filter((item) => item.mobilePrimary)
            .map((item) => <WorkspaceItem key={item.id} item={item} active={active} onNavigate={navigate} mobile />)}
        <SidebarMobileTrigger />
      </SidebarMobileNav>
    </>
  );
}

function MobileSidebarExample({ floating = false }: { floating?: boolean }) {
  return (
    <fieldset aria-label={floating ? "Floating mobile menu" : "Bottom navigation"} className="w-full min-w-0">
      <div className="h-[30rem] overflow-hidden rounded-(--radius-panel) border border-border">
        <SidebarProvider layout="contained" persistOpen={false} keyboardShortcut={null} style={{ "--sidebar-width": "14rem" }}>
          <MobileWorkspace floating={floating} />
        </SidebarProvider>
      </div>
    </fieldset>
  );
}

export function PrimitiveSidebarBottomNavExample() {
  return <MobileSidebarExample />;
}

export function PrimitiveSidebarMobileFloatingExample() {
  return <MobileSidebarExample floating />;
}
