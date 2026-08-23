"use client";

import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu";
import type { ComponentProps, CSSProperties } from "react";
import { buttonGapClass, controlSize } from "@/components/control-ui/control-variants";
import type { ButtonKnobStyle } from "@/components/control-ui/knob-contracts/button-knobs";
import type { PopupKnobStyle } from "@/components/control-ui/knob-contracts/popup-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { skinEffects, skinId } from "@/components/control-ui/skin";

export type NavigationMenuProps = ComponentProps<"nav"> & {
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  orientation?: "horizontal" | "vertical";
  delay?: number;
  closeDelay?: number;
} & { style?: CSSProperties & PopupKnobStyle };

export type NavigationMenuListProps = ComponentProps<"ul"> & { style?: CSSProperties & PopupKnobStyle };

export type NavigationMenuItemProps = ComponentProps<"li"> & {
  value?: string;
} & { style?: CSSProperties & PopupKnobStyle };

export type NavigationMenuTriggerProps = Omit<ComponentProps<"button">, "style"> & {
  style?: CSSProperties & ButtonKnobStyle & PopupKnobStyle;
};

export type NavigationMenuContentProps = ComponentProps<"div"> & { style?: CSSProperties & PopupKnobStyle };

export const navigationMenuLinkVariants = ["default", "compact"] as const;

export type NavigationMenuLinkVariant = (typeof navigationMenuLinkVariants)[number];

export type NavigationMenuLinkProps = Omit<ComponentProps<"a">, "style"> & { style?: CSSProperties & PopupKnobStyle } & {
  active?: boolean;
  closeOnClick?: boolean;
  variant?: NavigationMenuLinkVariant;
};

export type NavigationMenuViewportProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & PopupKnobStyle };

// Every item has its own Trigger and Content, but single viewport morphs between them rather than one popup per item.

type RefinedLinkProps = NavigationMenuLinkProps & Pick<ComponentProps<typeof NavigationMenuPrimitive.Link>, "render">;

export function NavigationMenu({ className, children, ...props }: NavigationMenuProps) {
  return (
    <NavigationMenuPrimitive.Root
      data-control-ui="navigation-menu"
      data-control-family="popup"
      data-popup-kind="navigation-menu"
      data-slot="root"
      className={cn("relative flex max-w-max flex-1 items-center justify-center", className)}
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
      data-control-family="popup"
      data-popup-kind="navigation-menu"
      data-slot="list"
      className={cn("flex flex-1 list-none items-center justify-center gap-0.5", className)}
      {...props}
    />
  );
}

export function NavigationMenuItem({ className, ...props }: NavigationMenuItemProps) {
  return (
    <NavigationMenuPrimitive.Item
      data-control-ui="navigation-menu"
      data-control-family="popup"
      data-popup-kind="navigation-menu"
      data-slot="item"
      className={cn("relative", className)}
      {...props}
    />
  );
}

export function NavigationMenuTrigger({ className, children, ...props }: NavigationMenuTriggerProps) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-control-ui="navigation-menu"
      data-control-family="button"
      data-slot="trigger"
      data-control="true"
      data-cursor="default"
      data-size="sm"
      data-variant="quiet"
      data-tone="neutral"
      data-shape="default"
      className={cn("inline-flex select-none items-center", controlSize({ size: "sm" }), buttonGapClass, className)}
      {...props}
    >
      {children}
      <NavigationMenuPrimitive.Icon
        data-control-ui="navigation-menu"
        data-control-family="popup"
        data-popup-kind="navigation-menu"
        data-slot="icon"
      >
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
      data-control-family="popup"
      data-popup-kind="navigation-menu"
      data-slot="content"
      className={cn("h-full w-full p-[var(--popover-padding)]", className)}
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
      data-popup-kind="navigation-menu"
      data-slot="link"
      data-control-family="popup"
      data-popup-part="navigation-link"
      data-variant={variant}
      active={active}
      className={cn(
        "block select-none px-3 py-2",
        variant === "compact" && "inline-flex h-[var(--control-h-sm)] items-center px-[calc(var(--padding-x)*0.75)] py-0",
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
        data-control-ui="navigation-menu"
        data-control-family="popup"
        data-popup-kind="navigation-menu"
        data-slot="positioner"
        data-skin={skinId()}
        data-effects={skinEffects()}
        sideOffset={8}
        collisionPadding={{ top: 5, bottom: 5, left: 16, right: 16 }}
        collisionAvoidance={{ side: "none" }}
        className="z-[80] h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)] before:absolute before:inset-x-0 before:top-[-8px] before:h-2 before:content-['']"
      >
        <NavigationMenuPrimitive.Popup
          data-control-ui="navigation-menu"
          data-control-family="popup"
          data-popup-kind="navigation-menu"
          data-slot="popup"
          className="relative h-[var(--popup-height)] w-[var(--popup-width)]"
        >
          <NavigationMenuPrimitive.Viewport
            data-control-ui="navigation-menu"
            data-popup-kind="navigation-menu"
            data-slot="viewport"
            data-surface="floating"
            data-control-family="popup"
            data-popup-part="surface"
            className={cn("relative h-full w-full overflow-hidden", className)}
            {...props}
          />
        </NavigationMenuPrimitive.Popup>
      </NavigationMenuPrimitive.Positioner>
    </NavigationMenuPrimitive.Portal>
  );
}
