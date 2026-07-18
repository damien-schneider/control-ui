"use client";

import { HashIcon, LayersIcon, SettingsIcon, SparklesIcon } from "lucide-react";
import { cn } from "@/components/control-ui/lib/cn";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/control-ui/ui/sidebar";

type SidebarPreviewVariant = "sidebar" | "floating" | "inset";

export function PrimitiveSidebarExample() {
  return (
    <div className="grid w-full gap-3 p-3 sm:grid-cols-3">
      <SidebarVariantPreview variant="sidebar" label="Sidebar" />
      <SidebarVariantPreview variant="floating" label="Floating" />
      <SidebarVariantPreview variant="inset" label="Inset" />
    </div>
  );
}

function SidebarVariantPreview({ variant, label }: { variant: SidebarPreviewVariant; label: string }) {
  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-caption font-medium text-foreground">{label}</span>
        <span className="rounded-[var(--radius-control)] bg-foreground/5 px-1.5 py-0.5 text-micro text-muted-foreground">{variant}</span>
      </div>
      <div
        className={cn(
          "flex h-64 min-w-0 overflow-hidden rounded-[var(--radius-panel)] border border-border/70 bg-background",
          variant === "floating" && "bg-canvas p-2",
          variant === "inset" && "bg-sidebar p-2",
        )}
      >
        <SidebarProvider className="min-h-0! h-full w-auto shrink-0">
          <Sidebar
            collapsible="none"
            variant={variant}
            className={cn(
              "w-28 shrink-0 p-1.5",
              variant === "sidebar" && "border-r border-sidebar-border",
              variant === "floating" && "rounded-[var(--radius-panel)] border border-sidebar-border shadow-sm",
            )}
          >
            <SidebarHeader>
              <div className="flex items-center gap-2 px-1 py-1">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
                  A
                </span>
                <span className="truncate text-xs font-semibold">Acme</span>
              </div>
            </SidebarHeader>
            <SidebarPreviewContent />
          </Sidebar>
        </SidebarProvider>
        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col gap-2 p-2",
            variant === "inset" && "ml-2 rounded-[var(--radius-panel)] border border-border/70 bg-card shadow-sm",
          )}
        >
          <div className="h-5 w-16 rounded-[var(--radius-control)] bg-foreground/8" />
          <div className="grid gap-1.5">
            <span className="h-12 rounded-[var(--radius-control)] bg-foreground/5" />
            <span className="h-12 rounded-[var(--radius-control)] bg-foreground/5" />
            <span className="h-12 rounded-[var(--radius-control)] bg-foreground/5" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarPreviewContent() {
  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Workspace</SidebarGroupLabel>
        <SidebarMenu indicator="slide">
          <SidebarMenuItem>
            <SidebarMenuButton isActive size="sm">
              <SparklesIcon />
              <span>Agents</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton size="sm">
              <LayersIcon />
              <span>Workflows</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton size="sm">
              <HashIcon />
              <span>Tools</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Account</SidebarGroupLabel>
        <SidebarMenu indicator="slide">
          <SidebarMenuItem>
            <SidebarMenuButton size="sm">
              <SettingsIcon />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  );
}
