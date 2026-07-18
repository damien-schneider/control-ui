"use client";

import { Bell, ChevronRight } from "lucide-react";
import { Button } from "@/components/control-ui/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/control-ui/ui/item";

export function PrimitiveItemExample() {
  return (
    <ItemGroup className="w-full max-w-md overflow-hidden rounded-[var(--radius-lg)] border">
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

      <ItemSeparator />

      <Item variant="muted" asChild className="rounded-none">
        <a href="#workspace-settings">
          <ItemContent>
            <ItemTitle>Workspace settings</ItemTitle>
            <ItemDescription>Members, billing and API keys.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <ChevronRight className="size-4 text-muted-foreground" />
          </ItemActions>
        </a>
      </Item>
    </ItemGroup>
  );
}
