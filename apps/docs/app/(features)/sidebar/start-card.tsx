"use client";

import { ArrowDown01Icon, MinusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SetupPromptCopyButton } from "@/app/(features)/create/agent-setup";
import type { ActivePageId } from "@/app/(features)/model/types";
import { Button } from "@/components/control-ui/ui/button";
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/control-ui/ui/sidebar";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/control-ui/ui/tabs";
import type { GuideNavGroup } from "./nav-items";
import { humanizeNavName } from "./nav-items";
import type { DocsNavItem } from "./types";

type StartTab = "steps" | "agent";

const MINIMIZED_STORAGE_KEY = "control-ui-docs:start-card";

function readStoredMinimized(): boolean {
  try {
    return window.localStorage.getItem(MINIMIZED_STORAGE_KEY) === "min";
  } catch {
    return false;
  }
}

function writeStoredMinimized(minimized: boolean) {
  try {
    if (minimized) window.localStorage.setItem(MINIMIZED_STORAGE_KEY, "min");
    else window.localStorage.removeItem(MINIMIZED_STORAGE_KEY);
  } catch {
    // private mode or quota — the choice will not persist
  }
}

function StartRow({
  item,
  index,
  active,
  onNavigate,
}: {
  item: DocsNavItem;
  index?: number;
  active: ActivePageId;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={`/${item.id}`}
      onClick={onNavigate}
      aria-current={active === item.id ? "page" : undefined}
      className="group/step flex items-center gap-2.5 px-3 py-2 text-label text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground aria-[current=page]:font-medium aria-[current=page]:text-foreground"
    >
      {index == null ? null : (
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border bg-background font-mono text-micro tabular-nums transition-colors group-aria-[current=page]/step:border-primary group-aria-[current=page]/step:bg-primary group-aria-[current=page]/step:text-primary-foreground">
          {index + 1}
        </span>
      )}
      <span className="min-w-0 truncate">{humanizeNavName(item.name)}</span>
    </Link>
  );
}

function StartPanel({
  value,
  items,
  numbered,
  active,
  onNavigate,
}: {
  value: StartTab;
  items: DocsNavItem[];
  numbered?: boolean;
  active: ActivePageId;
  onNavigate: () => void;
}) {
  return (
    <TabsPanel value={value}>
      <div className="divide-y divide-border/60 overflow-hidden rounded-[calc(var(--radius-panel)-0.25rem)] border border-border/60 bg-card shadow-sm">
        {items.map((item, index) => (
          <StartRow key={item.id} item={item} index={numbered ? index : undefined} active={active} onNavigate={onNavigate} />
        ))}
      </div>
    </TabsPanel>
  );
}

export function StartCard({
  steps,
  agent,
  active,
  onNavigate,
  className,
}: {
  steps: GuideNavGroup;
  agent: GuideNavGroup;
  active: ActivePageId;
  onNavigate: () => void;
  className?: string;
}) {
  const [selected, setSelected] = useState<StartTab | null>(null);
  const tab = selected ?? (agent.items.some((item) => item.id === active) ? "agent" : "steps");
  const [minimized, setMinimized] = useState(false);
  useEffect(() => {
    if (readStoredMinimized()) setMinimized(true);
  }, []);

  function toggleMinimized(next: boolean) {
    setMinimized(next);
    writeStoredMinimized(next);
  }

  if (minimized) {
    const activeStepIndex = steps.items.findIndex((item) => item.id === active);
    return (
      <SidebarGroup className={className}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => toggleMinimized(false)} size="sm">
              <span className="min-w-0 truncate">Getting started</span>
              {activeStepIndex === -1 ? null : (
                <span className="shrink-0 font-mono text-micro text-muted-foreground tabular-nums">
                  {activeStepIndex + 1}/{steps.items.length}
                </span>
              )}
              <HugeiconsIcon aria-hidden icon={ArrowDown01Icon} size={14} strokeWidth={1.7} className="ml-auto text-muted-foreground" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup className={className}>
      <Tabs<StartTab> value={tab} onValueChange={setSelected} className="grid gap-1.5">
        <div className="relative">
          <TabsList size="xs" className="mx-auto w-fit [--cui-tabs-foreground:var(--sidebar-foreground)]">
            <TabsTab value="steps">By hand</TabsTab>
            <TabsTab value="agent">With agent</TabsTab>
          </TabsList>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            iconOnly
            aria-label="Minimize getting started"
            onClick={() => toggleMinimized(true)}
            className="absolute top-1/2 right-0 -translate-y-1/2"
          >
            <HugeiconsIcon aria-hidden icon={MinusSignIcon} size={14} strokeWidth={1.7} />
          </Button>
        </div>
        <StartPanel value="steps" items={steps.items} numbered active={active} onNavigate={onNavigate} />
        <StartPanel value="agent" items={agent.items} active={active} onNavigate={onNavigate} />
        <div className="flex justify-end">
          <SetupPromptCopyButton compact />
        </div>
      </Tabs>
    </SidebarGroup>
  );
}
