"use client";

import { useState } from "react";
import { Card } from "@/components/control-ui/ui/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/control-ui/ui/context-menu";
import { Text } from "@/components/control-ui/ui/typography";

export function PrimitiveContextMenuExample() {
  const [lastAction, setLastAction] = useState("No action yet");

  return (
    <div className="grid w-full gap-3">
      <ContextMenu>
        <ContextMenuTrigger className="grid min-h-56">
          <Card className="items-center justify-center text-center">
            <div className="grid gap-1">
              <Text weight="medium">Canvas surface</Text>
              <Text size="caption" tone="muted">
                Right-click or long-press anywhere here
              </Text>
            </div>
          </Card>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuGroup>
            <ContextMenuLabel>Selection</ContextMenuLabel>
            <ContextMenuItem onClick={() => setLastAction("Frame selection")}>Frame selection</ContextMenuItem>
            <ContextMenuItem onClick={() => setLastAction("Duplicate")}>Duplicate</ContextMenuItem>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuSub>
            <ContextMenuSubTrigger>Arrange</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem onClick={() => setLastAction("Bring forward")}>Bring forward</ContextMenuItem>
              <ContextMenuItem onClick={() => setLastAction("Send backward")}>Send backward</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuItem onClick={() => setLastAction("Copy")}>
            Copy
            <ContextMenuShortcut>⌘C</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <Text size="caption" tone="muted">
        {lastAction}
      </Text>
    </div>
  );
}
