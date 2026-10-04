"use client";

import { Bell, ChevronRight } from "lucide-react";
import { Button } from "@/components/control-ui/ui/button";
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
        <ItemHeader>
          <span className="text-caption text-muted-foreground">Deploy</span>
          <span className="text-caption text-muted-foreground">2 min ago</span>
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
