"use client";

import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { StatusBadge } from "@/app/(features)/components/status";
import type { ActivePageId, DocsSkill, DocsSkillConcern } from "@/app/(features)/model/types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/control-ui/ui/collapsible";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/control-ui/ui/sidebar";
import { skillConcernSidebarIcons } from "./icons";
import { humanizeNavName } from "./nav-items";
import type { DocsNavItem } from "./types";

export function DocsNavGroup({
  title,
  icon,
  items,
  active,
  prefix,
  onNavigate,
  open,
  onOpenChange,
}: {
  title: string;
  icon?: IconSvgElement;
  items: DocsNavItem[];
  active: ActivePageId;
  prefix: string;
  onNavigate: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  if (items.length === 0) return null;

  const label = (
    <>
      {icon ? <HugeiconsIcon aria-hidden icon={icon} size={16} strokeWidth={1.7} /> : null}
      <span className="min-w-0 truncate">{title}</span>
    </>
  );
  const menu = (
    <SidebarMenu indicator="slide">
      {items.map((item) => {
        const href = `${prefix}${item.id}`;
        const name = humanizeNavName(item.name);
        return (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton render={<Link href={href} onClick={onNavigate} />} isActive={active === item.id} size="sm">
              <span className="min-w-0 truncate">{name}</span>
              {item.status ? <StatusBadge status={item.status} compact className="ml-auto" /> : null}
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  if (open === undefined) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>{label}</SidebarGroupLabel>
        {menu}
      </SidebarGroup>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <SidebarGroup>
        <SidebarGroupLabel render={<CollapsibleTrigger />} className="group/nav-group w-full cursor-pointer text-left">
          {label}
          <HugeiconsIcon
            aria-hidden
            icon={ArrowDown01Icon}
            size={14}
            strokeWidth={1.7}
            className="ml-auto transition-transform duration-(--duration-fast) ease-(--ease-standard) group-data-[state=closed]/nav-group:-rotate-90"
          />
        </SidebarGroupLabel>
        <CollapsibleContent>{menu}</CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

export function SkillConcernNavGroups({
  concerns,
  skills,
  active,
  onNavigate,
}: {
  concerns: readonly DocsSkillConcern[];
  skills: readonly DocsSkill[];
  active: ActivePageId;
  onNavigate: () => void;
}) {
  const groups = concerns.map((concern) => {
    const items: DocsNavItem[] = [];
    for (const skill of skills) {
      if (skill.concern === concern.id) {
        items.push({
          id: skill.id,
          name: skill.title,
        });
      }
    }

    return { concern, items };
  });
  const visibleGroups = groups.filter((group) => group.items.length > 0);

  if (visibleGroups.length === 0) return null;

  return (
    <>
      {visibleGroups.map(({ concern, items }) => (
        <DocsNavGroup
          key={concern.id}
          title={concern.title}
          icon={skillConcernSidebarIcons[concern.id]}
          items={items}
          active={active}
          prefix="/skills/"
          onNavigate={onNavigate}
        />
      ))}
    </>
  );
}
