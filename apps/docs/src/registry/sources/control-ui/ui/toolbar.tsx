"use client";

import { Toolbar as ToolbarPrimitive } from "@base-ui/react/toolbar";
import type { ComponentProps } from "react";
import type {
  ToolbarButtonProps,
  ToolbarGroupProps,
  ToolbarInputProps,
  ToolbarLinkProps,
  ToolbarProps,
  ToolbarSeparatorProps,
} from "@/components/control-ui/contracts";
import { controlSize } from "@/components/control-ui/control-variants";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

// Base UI Toolbar = roving-tabindex focus group (arrow keys between controls, one Tab stop for strip). The root radius derives from the inset control radius + toolbar padding in theme.css.
// Button/Link forward Base UI's `render` prop so a consumer composes Menu.Trigger/Tooltip.Trigger/control-ui Button and Base UI merges roving-focus wiring onto it.
// Separator mirrors ButtonGroupSeparator.

export function Toolbar({ orientation = "horizontal", variant = "default", className, ...props }: ToolbarProps) {
  return (
    <ToolbarPrimitive.Root
      orientation={orientation}
      data-control-ui="toolbar"
      data-slot="root"
      data-variant={variant}
      className={cn(
        "group/toolbar inline-flex gap-1 rounded-[var(--toolbar-radius)] border p-[var(--toolbar-padding)]",
        variant === "default" ? "bg-card/72 shadow-sm" : "border-transparent bg-foreground text-background shadow-pop",
        orientation === "vertical" ? "flex-col items-stretch" : "items-center",
        skinSlot("toolbar", "root", { orientation, variant }),
        className,
      )}
      {...props}
    />
  );
}

// `render` picked straight off Base UI primitive so composed trigger (Menu.Trigger/Tooltip.Trigger/control-ui Button) types/merges as Base UI expects.
type RefinedToolbarButtonProps = ToolbarButtonProps & Pick<ComponentProps<typeof ToolbarPrimitive.Button>, "render">;

export function ToolbarButton({ iconOnly = false, className, ...props }: RefinedToolbarButtonProps) {
  return (
    <ToolbarPrimitive.Button
      data-control-ui="toolbar"
      data-slot="button"
      data-control="true"
      data-size="sm"
      data-icon-only={iconOnly ? "true" : undefined}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[var(--toolbar-item-radius-fit)] font-medium text-muted-foreground outline-none transition-colors select-none hover:bg-foreground/6 hover:text-foreground data-[pressed]:bg-foreground/8 data-[pressed]:text-foreground focus-visible:ring-2 focus-visible:ring-foreground/20 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:block [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        controlSize({ size: "sm" }),
        "px-2",
        iconOnly && "aspect-square px-0",
        "group-data-[variant=inverse]/toolbar:border-transparent group-data-[variant=inverse]/toolbar:bg-transparent group-data-[variant=inverse]/toolbar:text-background/70 group-data-[variant=inverse]/toolbar:shadow-none group-data-[variant=inverse]/toolbar:ring-0 group-data-[variant=inverse]/toolbar:backdrop-blur-none group-data-[variant=inverse]/toolbar:hover:bg-background/10 group-data-[variant=inverse]/toolbar:hover:text-background group-data-[variant=inverse]/toolbar:data-[active=true]:bg-background group-data-[variant=inverse]/toolbar:data-[active=true]:text-foreground group-data-[variant=inverse]/toolbar:data-[pressed]:bg-background group-data-[variant=inverse]/toolbar:data-[pressed]:text-foreground group-data-[variant=inverse]/toolbar:focus-visible:ring-background/30",
        skinSlot("toolbar", "button", {}),
        className,
      )}
      {...props}
    />
  );
}

type RefinedToolbarLinkProps = ToolbarLinkProps & Pick<ComponentProps<typeof ToolbarPrimitive.Link>, "render">;

export function ToolbarLink({ variant = "default", className, ...props }: RefinedToolbarLinkProps) {
  return (
    <ToolbarPrimitive.Link
      data-control-ui="toolbar"
      data-slot="link"
      data-control="true"
      data-size="sm"
      data-variant={variant}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[var(--toolbar-item-radius-fit)] font-medium text-muted-foreground no-underline outline-none transition-colors hover:bg-foreground/6 hover:text-foreground focus-visible:ring-2 focus-visible:ring-foreground/20 [&_svg]:block [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        controlSize({ size: "sm" }),
        "px-2",
        // "track" = row inside a TrackHighlight track: the moving pill owns all backgrounds, and while it
        // visits a hovered sibling (track stamps data-track-hover) the active row yields its emphasis too.
        variant === "track"
          ? "relative z-[2] gap-1 px-1 text-caption shadow-none hover:bg-transparent data-[active=true]:bg-transparent data-[active=true]:text-foreground [[data-track-hover]_&]:data-[active=true]:text-muted-foreground sm:px-1.5 sm:text-label group-data-[variant=inverse]/toolbar:text-background/70 group-data-[variant=inverse]/toolbar:hover:bg-transparent group-data-[variant=inverse]/toolbar:hover:text-background group-data-[variant=inverse]/toolbar:data-[active=true]:bg-transparent group-data-[variant=inverse]/toolbar:data-[active=true]:text-foreground group-data-[variant=inverse]/toolbar:[[data-track-hover]_&]:data-[active=true]:text-background/70 group-data-[variant=inverse]/toolbar:focus-visible:ring-background/30"
          : "group-data-[variant=inverse]/toolbar:text-background/70 group-data-[variant=inverse]/toolbar:hover:bg-background/10 group-data-[variant=inverse]/toolbar:hover:text-background group-data-[variant=inverse]/toolbar:data-[active=true]:bg-background group-data-[variant=inverse]/toolbar:data-[active=true]:text-foreground group-data-[variant=inverse]/toolbar:focus-visible:ring-background/30",
        skinSlot("toolbar", "link", { variant }),
        className,
      )}
      {...props}
    />
  );
}

export function ToolbarGroup({ className, ...props }: ToolbarGroupProps) {
  return (
    <ToolbarPrimitive.Group
      data-control-ui="toolbar"
      data-slot="group"
      className={cn("inline-flex items-center gap-1", skinSlot("toolbar", "group", {}), className)}
      {...props}
    />
  );
}

export function ToolbarSeparator({ orientation = "vertical", className, ...props }: ToolbarSeparatorProps) {
  // Mirrors ButtonGroupSeparator; horizontal toolbar renders vertical separators (1px column), so orientation defaults to "vertical".
  return (
    <ToolbarPrimitive.Separator
      orientation={orientation}
      data-control-ui="toolbar"
      data-slot="separator"
      className={cn(
        "shrink-0 self-stretch bg-border",
        orientation === "vertical" ? "w-px" : "h-px w-full",
        "group-data-[variant=inverse]/toolbar:bg-background/20",
        skinSlot("toolbar", "separator", {}),
        className,
      )}
      {...props}
    />
  );
}

type RefinedToolbarInputProps = ToolbarInputProps & Pick<ComponentProps<typeof ToolbarPrimitive.Input>, "render">;

export function ToolbarInput({ className, ...props }: RefinedToolbarInputProps) {
  return (
    <ToolbarPrimitive.Input
      data-control-ui="toolbar"
      data-slot="input"
      data-control="true"
      data-size="sm"
      className={cn(
        "min-w-0 rounded-[var(--toolbar-item-radius-fit)] bg-transparent font-medium text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-foreground/20 data-[disabled]:opacity-50",
        controlSize({ size: "sm" }),
        "px-2",
        "group-data-[variant=inverse]/toolbar:text-background group-data-[variant=inverse]/toolbar:placeholder:text-background/70 group-data-[variant=inverse]/toolbar:focus-visible:ring-background/30",
        skinSlot("toolbar", "input", {}),
        className,
      )}
      {...props}
    />
  );
}
