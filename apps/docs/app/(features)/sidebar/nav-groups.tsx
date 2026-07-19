"use client";

import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { StatusBadge } from "@/app/(features)/components/status";
import { statusMeta } from "@/app/(features)/components/status-meta";
import type { ActivePageId, DocsSkill, DocsSkillConcern } from "@/app/(features)/model/types";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/control-ui/ui/sidebar";
import { skillConcernSidebarIcons } from "./icons";
import { humanizeNavName } from "./nav-items";
import type { DocsNavItem } from "./types";

// Dogfoods raw Sidebar anatomy: SidebarMenuButton owns active state and tooltip while Link supplies navigation.
export function DocsNavGroup({
  title,
  icon,
  items,
  active,
  prefix,
  onNavigate,
}: {
  title: string;
  icon?: IconSvgElement;
  items: DocsNavItem[];
  active: ActivePageId;
  prefix: string;
  onNavigate: () => void;
}) {
  if (items.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        {icon ? <HugeiconsIcon aria-hidden icon={icon} size={16} strokeWidth={1.7} /> : null}
        <span className="min-w-0 truncate">{title}</span>
      </SidebarGroupLabel>
      <SidebarMenu indicator="slide">
        {items.map((item) => {
          const href = `${prefix}${item.id}`;
          const name = humanizeNavName(item.name);
          // Collapsed rail shows the icon only, so the status rides along in the row's tooltip instead of the hidden chip.
          const tooltip = item.status ? `${name} · ${statusMeta[item.status].label}` : name;
          return (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                render={<Link href={href} onClick={onNavigate} />}
                isActive={active === item.id}
                size="sm"
                tooltip={tooltip}
              >
                <span className="min-w-0 truncate">{name}</span>
                {item.status ? <StatusBadge status={item.status} compact className="ml-auto group-data-[collapsible=icon]:hidden" /> : null}
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
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
