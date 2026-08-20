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

// Button and Link forward Base UI's `render` prop, so composed trigger still receives roving-focus wiring.

export function Toolbar({ orientation = "horizontal", variant = "default", className, ...props }: ToolbarProps) {
  return (
    <ToolbarPrimitive.Root
      orientation={orientation}
      data-control-ui="toolbar"
      data-control-family="toolbar"
      data-slot="root"
      data-variant={variant}
      className={cn("group/toolbar inline-flex gap-1", orientation === "vertical" ? "flex-col items-stretch" : "items-center", className)}
      {...props}
    />
  );
}

// `render` is picked straight off Base UI primitive so composed trigger types and merges as Base UI expects
type RefinedToolbarButtonProps = ToolbarButtonProps & Pick<ComponentProps<typeof ToolbarPrimitive.Button>, "render">;

export function ToolbarButton({ iconOnly = false, className, ...props }: RefinedToolbarButtonProps) {
  return (
    <ToolbarPrimitive.Button
      data-control-ui="toolbar"
      data-control-family="toolbar"
      data-slot="button"
      data-control="true"
      data-size="sm"
      data-icon-only={iconOnly ? "true" : undefined}
      className={cn(
        "inline-flex shrink-0 items-center justify-center select-none data-[disabled]:pointer-events-none [&_svg]:block [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        controlSize({ size: "sm" }),
        "px-2",
        iconOnly && "aspect-square px-0",
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
      data-control-family="toolbar"
      data-slot="link"
      data-control="true"
      data-size="sm"
      data-variant={variant}
      className={cn(
        "inline-flex shrink-0 items-center justify-center [&_svg]:block [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        controlSize({ size: "sm" }),
        variant === "track" ? "relative z-[2] gap-1 px-1 sm:px-1.5" : "px-2",
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
      data-control-family="toolbar"
      data-slot="group"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  );
}

export function ToolbarSeparator({ orientation = "vertical", className, ...props }: ToolbarSeparatorProps) {
  // horizontal toolbar renders vertical separators, hence default
  return (
    <ToolbarPrimitive.Separator
      orientation={orientation}
      data-control-ui="toolbar"
      data-control-family="toolbar"
      data-slot="separator"
      className={cn("shrink-0 self-stretch", orientation === "vertical" ? "w-px" : "h-px w-full", className)}
      {...props}
    />
  );
}

type RefinedToolbarInputProps = ToolbarInputProps & Pick<ComponentProps<typeof ToolbarPrimitive.Input>, "render">;

export function ToolbarInput({ className, ...props }: RefinedToolbarInputProps) {
  return (
    <ToolbarPrimitive.Input
      data-control-ui="toolbar"
      data-control-family="toolbar"
      data-slot="input"
      data-control="true"
      data-size="sm"
      className={cn("min-w-0", controlSize({ size: "sm" }), "px-2", className)}
      {...props}
    />
  );
}
