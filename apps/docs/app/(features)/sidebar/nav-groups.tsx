"use client";

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { StatusBadge } from "@/app/(features)/components/status";
import type { ActivePageId, DocsSkill, DocsSkillConcern } from "@/app/(features)/model/types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/control-ui/ui/collapsible";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/control-ui/ui/sidebar";
import { skillConcernSidebarIcons } from "./icons";
import { humanizeNavName } from "./nav-items";
import type { DocsNavItem, SidebarDoor, SidebarDoorId } from "./types";

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
    <SidebarMenu indicator="hover">
      {items.map((item) => {
        const href = `${prefix}${item.id}`;
        const name = humanizeNavName(item.name);
        return (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton
              render={<Link href={href} onClick={onNavigate} aria-current={active === item.id ? "page" : undefined} />}
              isActive={active === item.id}
              size="sm"
            >
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
      <Collapsible defaultOpen>
        <SidebarGroupLabel render={<CollapsibleTrigger />}>
          {icon ? <HugeiconsIcon aria-hidden icon={icon} size={16} strokeWidth={1.7} /> : null}
          <span className="min-w-0 truncate">{title}</span>
          <HugeiconsIcon aria-hidden icon={ArrowRight01Icon} size={14} strokeWidth={1.7} data-slot="chevron" />
        </SidebarGroupLabel>
        <CollapsibleContent>
          <NavMenu items={items} active={active} prefix={prefix} onNavigate={onNavigate} />
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  );
}

export function SidebarDoorMenu({
  doors,
  activeDoorId,
  onOpen,
}: {
  doors: readonly SidebarDoor[];
  activeDoorId: SidebarDoorId | null;
  onOpen: (doorId: SidebarDoorId) => void;
}) {
  return (
    <SidebarGroup>
      <SidebarMenu indicator="hover">
        {doors.map((door) => (
          <SidebarMenuItem key={door.id}>
            <SidebarMenuButton onClick={() => onOpen(door.id)} isActive={activeDoorId === door.id} size="sm">
              <HugeiconsIcon aria-hidden icon={door.icon} size={16} strokeWidth={1.7} />
              <span className="min-w-0 truncate">{door.title}</span>
              <HugeiconsIcon aria-hidden icon={ArrowRight01Icon} size={14} strokeWidth={1.7} className="ml-auto text-muted-foreground" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export function SidebarDoorPane({
  door,
  active,
  onNavigate,
  onBack,
  children,
}: {
  door: SidebarDoor;
  active: ActivePageId;
  onNavigate: () => void;
  onBack: () => void;
  children: ReactNode;
}) {
  return (
    <SidebarGroup>
      <SidebarMenu indicator="hover">
        <SidebarMenuItem>
          <SidebarMenuButton onClick={onBack} size="sm" aria-label={`Back from ${door.title}`}>
            <HugeiconsIcon aria-hidden icon={ArrowLeft01Icon} size={14} strokeWidth={1.7} className="text-muted-foreground" />
            <span className="min-w-0 truncate font-medium">{door.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      {door.overviewId ? (
        <NavMenu items={[{ id: door.overviewId, name: "Overview" }]} active={active} prefix="/" onNavigate={onNavigate} />
      ) : null}
      <div className="grid gap-2 pt-1">{children}</div>
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
