"use client";

import { BellOffIcon, HashIcon, MoreHorizontalIcon, PenSquareIcon } from "lucide-react";
import { Button } from "@/components/control-ui/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/control-ui/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/control-ui/ui/sidebar";
import { channels, directMessagePeople, people, unreadDirectMessages } from "./data";
import { PersonAvatar } from "./message";

function unreadLabel(count: number) {
  return `${count} unread`;
}

export function TeamChatSidebar({ activeId, onSelect }: { activeId: string; onSelect: (id: string) => void }) {
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="flex-row items-center justify-between gap-2 border-b border-sidebar-border p-3">
        <span className="truncate text-label font-semibold">Northwind</span>
        <Button variant="ghost" size="xs" iconOnly aria-label="New message">
          <PenSquareIcon aria-hidden="true" />
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Channels</SidebarGroupLabel>
          <SidebarMenu>
            {channels.map((channel) => (
              <SidebarMenuItem key={channel.id}>
                <SidebarMenuButton isActive={channel.id === activeId} onClick={() => onSelect(channel.id)}>
                  <HashIcon aria-hidden="true" />
                  <span className={channel.unread > 0 ? "font-semibold text-sidebar-foreground" : undefined}>{channel.name}</span>
                </SidebarMenuButton>
                {channel.unread > 0 ? (
                  <SidebarMenuBadge>
                    {channel.unread}
                    <span className="sr-only"> {unreadLabel(channel.unread)}</span>
                  </SidebarMenuBadge>
                ) : null}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <SidebarMenuAction showOnHover aria-label={`Options for ${channel.name}`}>
                        <MoreHorizontalIcon aria-hidden="true" />
                      </SidebarMenuAction>
                    }
                  />
                  <DropdownMenuContent side="right" align="start">
                    <DropdownMenuItem>Mark as read</DropdownMenuItem>
                    <DropdownMenuItem>
                      <BellOffIcon aria-hidden="true" />
                      Mute channel
                    </DropdownMenuItem>
                    <DropdownMenuItem>Leave channel</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Direct messages</SidebarGroupLabel>
          <SidebarMenu>
            {directMessagePeople.map((personId) => {
              const person = people[personId];
              const unread = unreadDirectMessages[personId] ?? 0;
              return (
                <SidebarMenuItem key={personId}>
                  <SidebarMenuButton isActive={personId === activeId} onClick={() => onSelect(personId)}>
                    <PersonAvatar person={person} className="size-5 text-micro" />
                    <span className={unread > 0 ? "font-semibold text-sidebar-foreground" : undefined}>{person.name}</span>
                  </SidebarMenuButton>
                  {unread > 0 ? (
                    <SidebarMenuBadge>
                      {unread}
                      <span className="sr-only"> {unreadLabel(unread)}</span>
                    </SidebarMenuBadge>
                  ) : null}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
