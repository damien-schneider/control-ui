"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/control-ui/ui/sidebar";
import { sidebarModes } from "./icons";
import type { SidebarMode } from "./types";

export function SidebarControlSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 px-1 text-caption font-medium uppercase tracking-[0.08em] text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}

export function SidebarModeSelector({
  mode,
  hrefs,
  onNavigate,
}: {
  mode: SidebarMode;
  hrefs: Record<SidebarMode, string>;
  onNavigate: (mode: SidebarMode) => void;
}) {
  return (
    <nav aria-label="Catalogs" className="shrink-0 px-2 pb-2">
      <SidebarMenu indicator="hover" className="[&>ul]:grid [&>ul]:grid-cols-2 [&>ul]:gap-1">
        {sidebarModes.map((item) => (
          <SidebarMenuItem key={item.id} className="min-w-0">
            <SidebarMenuButton
              render={
                <Link href={hrefs[item.id]} onClick={() => onNavigate(item.id)} aria-current={mode === item.id ? "true" : undefined} />
              }
              size="sm"
              isActive={mode === item.id}
            >
              <HugeiconsIcon aria-hidden icon={item.icon} size={16} strokeWidth={1.7} />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </nav>
  );
}
