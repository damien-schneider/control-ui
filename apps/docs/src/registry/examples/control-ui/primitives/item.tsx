"use client";

import { BellIcon, ChevronRightIcon, ImageIcon, MoreHorizontalIcon, RotateCcwIcon, TypeIcon, VideoIcon } from "lucide-react";
import { type KeyboardEvent, useState } from "react";
import { Button } from "@/components/control-ui/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/control-ui/ui/dropdown-menu";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from "@/components/control-ui/ui/item";
import { Text } from "@/components/control-ui/ui/typography";

const initialLayers = [
  { id: "title", label: "Title card", icon: TypeIcon },
  { id: "camera", label: "Camera", icon: VideoIcon },
  { id: "background", label: "Background", icon: ImageIcon },
];

function LayersList() {
  const [layers, setLayers] = useState(initialLayers);
  const [selectedId, setSelectedId] = useState("camera");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const moveSelection = (event: KeyboardEvent<HTMLElement>, index: number) => {
    const step = { ArrowDown: 1, ArrowUp: -1 }[event.key];
    const next = step === undefined ? undefined : layers[index + step];
    if (!next) return;
    event.preventDefault();
    setSelectedId(next.id);
    event.currentTarget.parentElement?.querySelector<HTMLElement>(`[data-layer="${next.id}"]`)?.focus();
  };

  const dropOn = (targetId: string) => {
    setLayers((current) => {
      const dragged = current.find((layer) => layer.id === draggingId);
      if (!dragged || dragged.id === targetId) return current;
      const remaining = current.filter((layer) => layer.id !== dragged.id);
      remaining.splice(
        remaining.findIndex((layer) => layer.id === targetId),
        0,
        dragged,
      );
      return remaining;
    });
    setDraggingId(null);
    setDropTargetId(null);
  };

  return (
    <ItemGroup role="listbox" aria-label="Layers" className="gap-1">
      {layers.map((layer, index) => (
        <Item
          key={layer.id}
          role="option"
          aria-selected={layer.id === selectedId}
          tabIndex={layer.id === selectedId ? 0 : -1}
          draggable
          data-layer={layer.id}
          data-dragging={layer.id === draggingId || undefined}
          data-drop-target={(layer.id === dropTargetId && layer.id !== draggingId) || undefined}
          style={{ "--cui-item-padding-block": "calc(var(--spacing) * 1.5)" }}
          onClick={() => setSelectedId(layer.id)}
          onKeyDown={(event) => moveSelection(event, index)}
          onDragStart={() => setDraggingId(layer.id)}
          onDragEnter={() => setDropTargetId(layer.id)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => dropOn(layer.id)}
          onDragEnd={() => {
            setDraggingId(null);
            setDropTargetId(null);
          }}
        >
          <ItemMedia>
            <layer.icon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{layer.label}</ItemTitle>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  );
}

export function PrimitiveItemExample() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <LayersList />

      <Item variant="outline">
        <ItemMedia>
          <BellIcon />
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
          <ChevronRightIcon className="size-4 text-muted-foreground" />
        </ItemActions>
      </Item>

      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Nightly evaluation</ItemTitle>
          <ItemDescription>Last run 6 hours ago.</ItemDescription>
        </ItemContent>
        <ItemActions showOnHover>
          <Button variant="ghost" size="sm" iconOnly aria-label="Rerun nightly evaluation">
            <RotateCcwIcon />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger variant="ghost" iconOnly aria-label="Nightly evaluation actions">
              <MoreHorizontalIcon />
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
