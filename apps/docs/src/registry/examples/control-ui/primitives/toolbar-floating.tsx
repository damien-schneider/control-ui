"use client";

import { ChevronDownIcon, HandIcon, MousePointer2Icon, SquareIcon, TypeIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/control-ui/ui/dropdown-menu";
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator } from "@/components/control-ui/ui/toolbar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/control-ui/ui/tooltip";

type Tool = "select" | "hand" | "shape" | "text";

const TOOLS: readonly { tool: Tool; label: string; shortcut: string; icon: ReactNode }[] = [
  { tool: "select", label: "Select", shortcut: "V", icon: <MousePointer2Icon /> },
  { tool: "hand", label: "Hand", shortcut: "H", icon: <HandIcon /> },
  { tool: "shape", label: "Rectangle", shortcut: "R", icon: <SquareIcon /> },
  { tool: "text", label: "Text", shortcut: "T", icon: <TypeIcon /> },
];

export function PrimitiveFloatingToolbarExample() {
  const [activeTool, setActiveTool] = useState<Tool>("select");

  return (
    <div className="relative grid min-h-64 w-full place-items-center overflow-hidden bg-canvas">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-radial-[circle_at_center,oklch(from_var(--foreground)_l_c_h/0.16)_1px,transparent_1px] bg-size-[20px_20px] opacity-45"
      />
      <div className="h-28 w-44 rounded-[var(--radius-panel)] bg-card shadow-sm ring-1 ring-border" />
      <TooltipProvider>
        <Toolbar variant="floating" aria-label="Canvas tools" className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <ToolbarGroup aria-label="Tools">
            {TOOLS.map((entry) => (
              <Tooltip key={entry.tool}>
                <TooltipTrigger
                  render={
                    <ToolbarButton
                      aria-label={entry.label}
                      iconOnly
                      aria-pressed={activeTool === entry.tool}
                      onClick={() => setActiveTool(entry.tool)}
                    />
                  }
                >
                  {entry.icon}
                </TooltipTrigger>
                <TooltipContent>
                  {entry.label} · {entry.shortcut}
                </TooltipContent>
              </Tooltip>
            ))}
          </ToolbarGroup>
          <ToolbarSeparator />
          <DropdownMenu>
            <ToolbarButton iconOnly render={<DropdownMenuTrigger aria-label="More shape tools" variant="ghost" iconOnly />}>
              <ChevronDownIcon />
            </ToolbarButton>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setActiveTool("shape")}>Rectangle</DropdownMenuItem>
              <DropdownMenuItem>Ellipse</DropdownMenuItem>
              <DropdownMenuItem>Line</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Toolbar>
      </TooltipProvider>
    </div>
  );
}
