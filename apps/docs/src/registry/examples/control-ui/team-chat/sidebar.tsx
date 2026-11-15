"use client";

import { BellOffIcon, ChevronDownIcon, HashIcon, MoreHorizontalIcon, PenSquareIcon } from "lucide-react";
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
  SidebarRail,
} from "@/components/control-ui/ui/sidebar";
import { Text } from "@/components/control-ui/ui/typography";
import { channels, directMessagePeople, people, unreadDirectMessages } from "./data";
import { PersonAvatar } from "./message";

function unreadLabel(count: number) {
  return `${count} unread`;
}

export function TeamChatSidebar({ activeId, onSelect }: { activeId: string; onSelect: (id: string) => void }) {
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger render={<SidebarMenuButton />}>
                <Text weight="semibold" className="truncate">
                  Northwind
                </Text>
                <ChevronDownIcon aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem>Invite people</DropdownMenuItem>
                <DropdownMenuItem>Workspace settings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <SidebarMenuAction aria-label="New message">
              <PenSquareIcon aria-hidden="true" />
            </SidebarMenuAction>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Channels</SidebarGroupLabel>
          <SidebarMenu>
            {channels.map((channel) => (
              <SidebarMenuItem key={channel.id}>
                <SidebarMenuButton isActive={channel.id === activeId} onClick={() => onSelect(channel.id)}>
                  <HashIcon aria-hidden="true" />
                  <span>{channel.unread > 0 ? <b>{channel.name}</b> : channel.name}</span>
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
                    <PersonAvatar person={person} size="xs" />
                    <span>{unread > 0 ? <b>{person.name}</b> : person.name}</span>
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
      <SidebarRail />
    </Sidebar>
  );
}
