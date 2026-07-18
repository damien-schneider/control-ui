"use client";

import { useState } from "react";
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

export function PrimitiveContextMenuExample() {
  const [lastAction, setLastAction] = useState("No action yet");

  return (
    <div className="grid w-full gap-3 p-4">
      <ContextMenu>
        <ContextMenuTrigger className="grid min-h-56 place-items-center rounded-[var(--radius-panel)] bg-canvas text-center ring-1 ring-border/70">
          <div className="grid gap-1">
            <span className="text-sm font-medium">Canvas surface</span>
            <span className="text-caption text-muted-foreground">Right-click or long-press anywhere here</span>
          </div>
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
      <span className="text-caption text-muted-foreground">{lastAction}</span>
    </div>
  );
}
