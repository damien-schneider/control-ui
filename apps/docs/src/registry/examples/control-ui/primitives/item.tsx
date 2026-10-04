"use client";

import { Bell, ChevronRight, MoreHorizontal, RotateCcw } from "lucide-react";
import { Button } from "@/components/control-ui/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/control-ui/ui/dropdown-menu";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from "@/components/control-ui/ui/item";
import { Text } from "@/components/control-ui/ui/typography";

export function PrimitiveItemExample() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Item variant="outline">
        <ItemMedia>
          <Bell />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Notifications</ItemTitle>
          <ItemDescription>Get pinged the moment an agent finishes a run.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="surface" size="sm">
            Enable
          </Button>
        </ItemActions>
      </Item>

      <Item variant="muted" render={<a href="#workspace-settings" />}>
        <ItemContent>
          <ItemTitle>Workspace settings</ItemTitle>
          <ItemDescription>Members, billing and API keys.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <ChevronRight className="size-4 text-muted-foreground" />
        </ItemActions>
      </Item>

      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Nightly evaluation</ItemTitle>
          <ItemDescription>Last run 6 hours ago.</ItemDescription>
        </ItemContent>
        <ItemActions showOnHover>
          <Button variant="ghost" size="sm" iconOnly aria-label="Rerun nightly evaluation">
            <RotateCcw />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger variant="ghost" iconOnly aria-label="Nightly evaluation actions">
              <MoreHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View logs</DropdownMenuItem>
              <DropdownMenuItem>Pause schedule</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ItemActions>
      </Item>

      <Item variant="outline">
        <ItemHeader>
          <Text size="caption" tone="muted">
            Deploy
          </Text>
          <Text size="caption" tone="muted">
            2 min ago
          </Text>
        </ItemHeader>
        <ItemContent>
          <ItemTitle>Production build finished</ItemTitle>
          <ItemDescription>All checks passed on main.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="surface" size="sm">
            Open
          </Button>
        </ItemActions>
        <ItemFooter>
          <span>Triggered by Ada Lovelace</span>
          <span>4 files changed</span>
        </ItemFooter>
      </Item>
    </div>
  );
}
