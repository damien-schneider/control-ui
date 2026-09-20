"use client";

import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { ActivePageId } from "@/app/(features)/model/types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/control-ui/ui/collapsible";
import { SidebarGroup, SidebarGroupLabel } from "@/components/control-ui/ui/sidebar";
import type { GuideNavGroup } from "./nav-items";
import { humanizeNavName } from "./nav-items";
import type { DocsNavItem } from "./types";

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

function StartRow({ item, active, onNavigate }: { item: DocsNavItem; active: ActivePageId | undefined; onNavigate: () => void }) {
  return (
    <Link
      href={`/${item.id}`}
      onClick={onNavigate}
      aria-current={active === item.id ? "page" : undefined}
      className="flex min-w-0 items-center rounded-[calc(var(--radius-panel)-0.25rem)] px-2 py-1.5 text-label text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground aria-[current=page]:text-sidebar-foreground"
    >
      <span className="min-w-0 truncate">{humanizeNavName(item.name)}</span>
    </Link>
  );
}

export function StartCard({
  steps,
  active,
  onNavigate,
  className,
}: {
  steps: GuideNavGroup;
  active: ActivePageId | undefined;
  onNavigate: () => void;
  className?: string;
}) {
  const [minimized, setMinimized] = useState(false);
  useEffect(() => {
    if (readStoredMinimized()) setMinimized(true);
  }, []);

  function changeOpen(open: boolean) {
    setMinimized(!open);
    writeStoredMinimized(!open);
  }

  return (
    <SidebarGroup className={className}>
      <Collapsible open={!minimized} onOpenChange={changeOpen}>
        <SidebarGroupLabel
          render={<CollapsibleTrigger />}
          className="w-full cursor-pointer gap-2 px-2 text-label text-muted-foreground transition-colors hover:text-sidebar-foreground"
        >
          <span className="min-w-0 truncate">Getting started</span>
          <HugeiconsIcon
            aria-hidden
            icon={minimized ? PlusSignIcon : MinusSignIcon}
            size={14}
            strokeWidth={1.7}
            className="ml-auto shrink-0"
          />
        </SidebarGroupLabel>
        <CollapsibleContent>
          <div className="grid gap-0.5 rounded-panel border border-border/50 bg-card/70 p-1">
            {steps.items.map((item) => (
              <StartRow key={item.id} item={item} active={active} onNavigate={onNavigate} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  );
}
