"use client";

import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import type { ActivePageId } from "@/app/(features)/model/types";
import { Card, CardContent } from "@/components/control-ui/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/control-ui/ui/collapsible";
import { SidebarGroup, SidebarGroupLabel } from "@/components/control-ui/ui/sidebar";
import { Text } from "@/components/control-ui/ui/typography";
import { NavMenu } from "./nav-groups";
import type { GuideNavGroup } from "./nav-items";

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

const startCardInset = {
  "--cui-card-padding-block": "var(--spacing)",
  "--cui-card-padding-inline": "var(--spacing)",
};

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
        <SidebarGroupLabel render={<CollapsibleTrigger />} className="w-full cursor-pointer gap-2">
          <Text size="label" className="min-w-0 truncate">
            Getting started
          </Text>
          <HugeiconsIcon
            aria-hidden
            icon={minimized ? PlusSignIcon : MinusSignIcon}
            size={14}
            strokeWidth={1.7}
            className="ml-auto shrink-0"
          />
        </SidebarGroupLabel>
        <CollapsibleContent>
          <Card style={startCardInset}>
            <CardContent>
              <NavMenu items={steps.items} active={active} onNavigate={onNavigate} />
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  );
}
