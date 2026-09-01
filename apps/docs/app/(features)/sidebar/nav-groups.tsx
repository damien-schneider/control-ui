"use client";

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { StatusBadge } from "@/app/(features)/components/status";
import type { ActivePageId, DocsSkill, DocsSkillConcern } from "@/app/(features)/model/types";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/control-ui/ui/sidebar";
import { skillConcernSidebarIcons } from "./icons";
import type { GuideNavGroup } from "./nav-items";
import { humanizeNavName } from "./nav-items";
import type { DocsNavItem } from "./types";

function NavMenu({
  items,
  active,
  prefix,
  onNavigate,
}: {
  items: DocsNavItem[];
  active: ActivePageId;
  prefix: string;
  onNavigate: () => void;
}) {
  return (
    <SidebarMenu>
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
}

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
      <NavMenu items={items} active={active} prefix={prefix} onNavigate={onNavigate} />
    </SidebarGroup>
  );
}

export function ReferenceDoorRow({
  title,
  icon,
  isInside,
  onOpen,
}: {
  title: string;
  icon: IconSvgElement;
  isInside: boolean;
  onOpen: () => void;
}) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={onOpen} isActive={isInside} size="sm">
            <HugeiconsIcon aria-hidden icon={icon} size={16} strokeWidth={1.7} />
            <span className="min-w-0 truncate">{title}</span>
            <HugeiconsIcon aria-hidden icon={ArrowRight01Icon} size={14} strokeWidth={1.7} className="ml-auto text-muted-foreground" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}

export function ReferencePane({
  title,
  groups,
  active,
  onNavigate,
  onBack,
}: {
  title: string;
  groups: GuideNavGroup[];
  active: ActivePageId;
  onNavigate: () => void;
  onBack: () => void;
}) {
  const visibleGroups = groups.filter((group) => group.items.length > 0);

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={onBack} size="sm" aria-label={`Back from ${title}`}>
            <HugeiconsIcon aria-hidden icon={ArrowLeft01Icon} size={14} strokeWidth={1.7} className="text-muted-foreground" />
            <span className="min-w-0 truncate font-medium">{title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <NavMenu items={[{ id: "reference", name: "Overview" }]} active={active} prefix="/" onNavigate={onNavigate} />
      <div className="grid gap-2 pt-1">
        {visibleGroups.map((group) => (
          <div key={group.id}>
            <div className="px-2 pt-1 pb-0.5 text-micro font-medium uppercase tracking-[0.08em] text-muted-foreground">{group.title}</div>
            <NavMenu items={group.items} active={active} prefix="/" onNavigate={onNavigate} />
          </div>
        ))}
      </div>
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
