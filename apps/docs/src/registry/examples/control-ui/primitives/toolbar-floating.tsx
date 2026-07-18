"use client";

import { ChevronDownIcon, HandIcon, MousePointer2Icon, SquareIcon, TypeIcon } from "lucide-react";
import { useState } from "react";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/control-ui/ui/menu";
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator } from "@/components/control-ui/ui/toolbar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/control-ui/ui/tooltip";

type Tool = "select" | "hand" | "shape" | "text";

export function PrimitiveFloatingToolbarExample() {
  const [activeTool, setActiveTool] = useState<Tool>("select");

  return (
    <div className="relative grid min-h-64 w-full place-items-center overflow-hidden bg-canvas">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-radial-[circle_at_center,oklch(from_var(--foreground)_l_c_h/0.16)_1px,transparent_1px] bg-size-[20px_20px] opacity-45"
      />
      <div className="h-28 w-44 rounded-[var(--radius-panel)] bg-card shadow-sm ring-1 ring-border" />
      <TooltipProvider delay={300}>
        <Toolbar aria-label="Canvas tools" className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <ToolbarGroup aria-label="Tools">
            <Tooltip>
              <TooltipTrigger
                render={
                  <ToolbarButton
                    aria-label="Select"
                    iconOnly
                    aria-pressed={activeTool === "select"}
                    data-pressed={activeTool === "select" ? "" : undefined}
                    onClick={() => setActiveTool("select")}
                  />
                }
              >
                <MousePointer2Icon />
              </TooltipTrigger>
              <TooltipContent>Select · V</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <ToolbarButton
                    aria-label="Hand"
                    iconOnly
                    aria-pressed={activeTool === "hand"}
                    data-pressed={activeTool === "hand" ? "" : undefined}
                    onClick={() => setActiveTool("hand")}
                  />
                }
              >
                <HandIcon />
              </TooltipTrigger>
              <TooltipContent>Hand · H</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <ToolbarButton
                    aria-label="Rectangle"
                    iconOnly
                    aria-pressed={activeTool === "shape"}
                    data-pressed={activeTool === "shape" ? "" : undefined}
                    onClick={() => setActiveTool("shape")}
                  />
                }
              >
                <SquareIcon />
              </TooltipTrigger>
              <TooltipContent>Rectangle · R</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <ToolbarButton
                    aria-label="Text"
                    iconOnly
                    aria-pressed={activeTool === "text"}
                    data-pressed={activeTool === "text" ? "" : undefined}
                    onClick={() => setActiveTool("text")}
                  />
                }
              >
                <TypeIcon />
              </TooltipTrigger>
              <TooltipContent>Text · T</TooltipContent>
            </Tooltip>
          </ToolbarGroup>
          <ToolbarSeparator />
          <Menu>
            <ToolbarButton iconOnly render={<MenuTrigger aria-label="More shape tools" variant="ghost" iconOnly />}>
              <ChevronDownIcon />
            </ToolbarButton>
            <MenuContent>
              <MenuItem onClick={() => setActiveTool("shape")}>Rectangle</MenuItem>
              <MenuItem>Ellipse</MenuItem>
              <MenuItem>Line</MenuItem>
            </MenuContent>
          </Menu>
        </Toolbar>
      </TooltipProvider>
    </div>
  );
}
