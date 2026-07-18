"use client";

import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import type { ComponentProps } from "react";
import type {
  MenuContentProps,
  MenuItemProps,
  MenuLabelProps,
  MenuProps,
  MenuSeparatorProps,
  MenuTriggerProps,
  MenuTriggerVariant,
} from "@/components/control-ui/contracts";
import { controlSize, controlSurfaceClasses } from "@/components/control-ui/control-variants";
import { cn } from "@/components/control-ui/lib/cn";
import { skinEffects, skinId, skinSlot } from "@/components/control-ui/skin";
import { floatingListContentClasses, floatingListItemClasses } from "@/components/control-ui/surface-variants";

// Refined skin slot, 100% Base UI: trigger shares --radius-control/controlSize w/ Button & Select — one token set, every trigger matches.

type RefinedMenuTriggerProps = MenuTriggerProps & Pick<ComponentProps<typeof MenuPrimitive.Trigger>, "nativeButton" | "render">;

export function Menu({ children, ...props }: MenuProps) {
  return <MenuPrimitive.Root {...props}>{children}</MenuPrimitive.Root>;
}

export function MenuTrigger({
  size = "sm",
  iconOnly = false,
  variant = "surface",
  className,
  children,
  disabled,
  ...props
}: RefinedMenuTriggerProps) {
  const skinClasses = skinSlot("menu", "trigger", { size, variant });
  const variantClasses: Record<MenuTriggerVariant, string> = {
    surface: controlSurfaceClasses,
    ghost: "text-foreground hover:bg-foreground/6",
  };
  return (
    <MenuPrimitive.Trigger
      data-control-ui="menu"
      data-slot="trigger"
      data-control="true"
      data-size={size}
      data-icon-only={iconOnly ? "true" : undefined}
      data-variant={variant}
      className={cn(
        "relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center overflow-visible rounded-[var(--radius-control)] font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-foreground/20 disabled:cursor-not-allowed disabled:opacity-45",
        variantClasses[variant],
        controlSize({ size }),
        iconOnly && "aspect-square px-0",
        skinClasses,
        className,
      )}
      disabled={disabled}
      {...props}
    >
      <span data-control-ui="button" data-slot="content" className="relative z-[1] inline-flex items-center justify-center gap-[inherit]">
        {children}
      </span>
    </MenuPrimitive.Trigger>
  );
}

export function MenuContent({ className, children, ...props }: MenuContentProps) {
  const skinClasses = skinSlot("menu", "content", {});
  return (
    <MenuPrimitive.Portal>
      {/* Portal escapes token-scoped ancestor — positioner re-asserts ACTIVE skin's scope (theme.css mirrors). */}
      <MenuPrimitive.Positioner
        data-skin={skinId()}
        data-effects={skinEffects()}
        side="bottom"
        align="start"
        sideOffset={6}
        className="z-[80] outline-none"
      >
        <MenuPrimitive.Popup
          data-control-ui="menu"
          data-slot="content"
          data-surface="floating"
          className={cn("min-w-[max(11rem,var(--anchor-width))]", floatingListContentClasses, skinClasses, className)}
          {...props}
        >
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

export function MenuItem({ className, ...props }: MenuItemProps) {
  const skinClasses = skinSlot("menu", "item", { disabled: Boolean(props.disabled) });
  return (
    <MenuPrimitive.Item
      data-control-ui="menu"
      data-slot="item"
      className={cn(floatingListItemClasses, skinClasses, className)}
      {...props}
    />
  );
}

export function MenuSeparator({ className, ...props }: MenuSeparatorProps) {
  const skinClasses = skinSlot("menu", "separator", {});
  return (
    // -mx-[--popover-padding] bleeds rule through popup padding for edge-to-edge; rows keep inset, tracks same knob as popup.
    <MenuPrimitive.Separator
      data-control-ui="menu"
      data-slot="separator"
      className={cn("-mx-[var(--popover-padding)] my-1 h-px bg-border", skinClasses, className)}
      {...props}
    />
  );
}

export function MenuLabel({ className, ...props }: MenuLabelProps) {
  const skinClasses = skinSlot("menu", "label", {});
  return (
    <div
      data-control-ui="menu"
      data-slot="label"
      className={cn("px-2 py-1 text-micro font-medium uppercase tracking-[0.08em] text-muted-foreground", skinClasses, className)}
      {...props}
    />
  );
}
