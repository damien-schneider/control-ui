"use client";

import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu";
import type { ComponentProps } from "react";
import type {
  NavigationMenuContentProps,
  NavigationMenuItemProps,
  NavigationMenuLinkProps,
  NavigationMenuListProps,
  NavigationMenuProps,
  NavigationMenuTriggerProps,
  NavigationMenuViewportProps,
} from "@/components/control-ui/contracts";
import { controlSize } from "@/components/control-ui/control-variants";
import { cn } from "@/components/control-ui/lib/cn";
import { skinEffects, skinId, skinSlot } from "@/components/control-ui/skin";
import { floatingSurfaceClasses } from "@/components/control-ui/surface-variants";

// Refined skin slot, 100% Base UI: SHARED floating surface — every item has Trigger+Content, but one Portal→Positioner→Popup→Viewport MORPHS between active item's content (width/height + activation-direction).
// Triggers share quiet Button look + --radius-control; Viewport is popover surface (--radius-popover, ring-border, bg-popover, shadow-pop) matching Menu/Select.
// Motion token-driven (--duration-base/--ease-emphasized) — Reduce-motion kill-switch flattens morph too.

type RefinedLinkProps = NavigationMenuLinkProps & Pick<ComponentProps<typeof NavigationMenuPrimitive.Link>, "render">;

export function NavigationMenu({ className, children, ...props }: NavigationMenuProps) {
  return (
    <NavigationMenuPrimitive.Root
      data-control-ui="navigation-menu"
      data-slot="root"
      className={cn("relative flex max-w-max flex-1 items-center justify-center", skinSlot("navigation-menu", "root", {}), className)}
      {...props}
    >
      {children}
    </NavigationMenuPrimitive.Root>
  );
}

export function NavigationMenuList({ className, ...props }: NavigationMenuListProps) {
  return (
    <NavigationMenuPrimitive.List
      data-control-ui="navigation-menu"
      data-slot="list"
      className={cn("flex flex-1 list-none items-center justify-center gap-0.5", skinSlot("navigation-menu", "list", {}), className)}
      {...props}
    />
  );
}

export function NavigationMenuItem({ className, ...props }: NavigationMenuItemProps) {
  return (
    <NavigationMenuPrimitive.Item
      data-control-ui="navigation-menu"
      data-slot="item"
      className={cn("relative", skinSlot("navigation-menu", "item", {}), className)}
      {...props}
    />
  );
}

export function NavigationMenuTrigger({ className, children, ...props }: NavigationMenuTriggerProps) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-control-ui="navigation-menu"
      data-slot="trigger"
      data-control="true"
      data-size="sm"
      className={cn(
        "inline-flex cursor-default select-none items-center rounded-[var(--radius-control)] font-medium text-muted-foreground outline-none transition hover:bg-foreground/6 hover:text-foreground focus-visible:ring-2 focus-visible:ring-foreground/20 data-[popup-open]:bg-foreground/7 data-[popup-open]:text-foreground",
        controlSize({ size: "sm" }),
        skinSlot("navigation-menu", "trigger", {}),
        className,
      )}
      {...props}
    >
      {children}
      <NavigationMenuPrimitive.Icon className="text-muted-foreground transition-transform duration-[var(--duration-base)] ease-[var(--ease-emphasized)] data-[popup-open]:rotate-180">
        <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true" fill="none">
          <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </NavigationMenuPrimitive.Icon>
    </NavigationMenuPrimitive.Trigger>
  );
}

export function NavigationMenuContent({ className, children, ...props }: NavigationMenuContentProps) {
  return (
    <NavigationMenuPrimitive.Content
      data-control-ui="navigation-menu"
      data-slot="content"
      className={cn(
        // Panel moves into shared Viewport when active; fades/slides per travel direction (data-activation-direction).
        "h-full w-full p-[var(--popover-padding)] transition-[opacity,translate] duration-[var(--duration-base)] ease-[var(--ease-emphasized)] data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 data-[starting-style]:data-[activation-direction=left]:-translate-x-3 data-[starting-style]:data-[activation-direction=right]:translate-x-3 data-[ending-style]:data-[activation-direction=left]:translate-x-3 data-[ending-style]:data-[activation-direction=right]:-translate-x-3",
        skinSlot("navigation-menu", "content", {}),
        className,
      )}
      {...props}
    >
      {children}
    </NavigationMenuPrimitive.Content>
  );
}

export function NavigationMenuLink({ variant = "default", className, active, children, ...props }: RefinedLinkProps) {
  return (
    <NavigationMenuPrimitive.Link
      data-control-ui="navigation-menu"
      data-slot="link"
      data-variant={variant}
      active={active}
      className={cn(
        "block select-none rounded-[var(--radius-md)] px-3 py-2 text-body text-foreground no-underline outline-none transition hover:bg-foreground/6 focus-visible:ring-2 focus-visible:ring-foreground/20 data-[active]:bg-foreground/6 data-[active]:text-foreground",
        variant === "compact" &&
          "inline-flex h-[var(--control-h-sm)] items-center px-[calc(var(--padding-x)*0.75)] py-0 text-xs font-medium text-muted-foreground hover:text-foreground",
        skinSlot("navigation-menu", "link", { active: Boolean(active), variant }),
        className,
      )}
      {...props}
    >
      {children}
    </NavigationMenuPrimitive.Link>
  );
}

export function NavigationMenuViewport({ className, ...props }: NavigationMenuViewportProps) {
  return (
    <NavigationMenuPrimitive.Portal>
      {/* Portal escapes token-scoped ancestor — positioner re-asserts ACTIVE skin's scope.
          before:* strip bridges sideOffset gap so hover survives trigger→popup. */}
      <NavigationMenuPrimitive.Positioner
        data-skin={skinId()}
        data-effects={skinEffects()}
        sideOffset={8}
        collisionPadding={{ top: 5, bottom: 5, left: 16, right: 16 }}
        collisionAvoidance={{ side: "none" }}
        className="z-[80] h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)] outline-none transition-[top,left,right,bottom] duration-[var(--duration-base)] ease-[var(--ease-emphasized)] before:absolute before:inset-x-0 before:top-[-8px] before:h-2 before:content-['']"
      >
        <NavigationMenuPrimitive.Popup className="relative h-[var(--popup-height)] w-[var(--popup-width)] origin-[var(--transform-origin)] outline-none transition-[opacity,transform,width,height,scale] duration-[var(--duration-base)] ease-[var(--ease-emphasized)] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0">
          <NavigationMenuPrimitive.Viewport
            data-control-ui="navigation-menu"
            data-slot="viewport"
            data-surface="floating"
            className={cn(
              "relative h-full w-full overflow-hidden",
              floatingSurfaceClasses,
              skinSlot("navigation-menu", "viewport", {}),
              className,
            )}
            {...props}
          />
        </NavigationMenuPrimitive.Popup>
      </NavigationMenuPrimitive.Positioner>
    </NavigationMenuPrimitive.Portal>
  );
}
