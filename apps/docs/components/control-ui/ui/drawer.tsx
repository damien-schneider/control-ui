"use client";

import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import type { ComponentProps } from "react";
import type { DrawerContentPadding, DrawerContentSurface } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinEffects, skinId, skinSlot } from "@/components/control-ui/skin";

// Refined skin slot. 100% Base UI Drawer — native swipe gestures/snap points, no vaul.
// Panel tracks pointer via --drawer-swipe-movement-* vars; tempo from theme.
// Panel+backdrop re-assert skin scope on portal, like Sheet/Dialog.

type DrawerSide = "bottom" | "top" | "right" | "left";

// swipeDirection = drag axis that dismisses; same edge it's pinned to.
const swipeFor: Record<DrawerSide, ComponentProps<typeof DrawerPrimitive.Root>["swipeDirection"]> = {
  bottom: "down",
  top: "up",
  right: "right",
  left: "left",
};

// Per-edge viewport placement, popup shape, closed-state slide transform.
// Literal class strings — Tailwind's scanner can't see interpolated classes.
const placement: Record<DrawerSide, { viewport: string; popup: string }> = {
  bottom: {
    viewport: "items-end justify-center",
    popup: "w-full max-h-[85vh] rounded-t-panel border-t data-[starting-style]:translate-y-full data-[ending-style]:translate-y-full",
  },
  top: {
    viewport: "items-start justify-center",
    popup: "w-full max-h-[85vh] rounded-b-panel border-b data-[starting-style]:-translate-y-full data-[ending-style]:-translate-y-full",
  },
  right: {
    viewport: "items-stretch justify-end",
    popup: "h-full w-3/4 max-w-sm border-l data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full",
  },
  left: {
    viewport: "items-stretch justify-start",
    popup: "h-full w-3/4 max-w-sm border-r data-[starting-style]:-translate-x-full data-[ending-style]:-translate-x-full",
  },
};

export function Drawer(props: ComponentProps<typeof DrawerPrimitive.Root> & { side?: DrawerSide }) {
  const { side = "bottom", swipeDirection, ...rest } = props;
  return <DrawerPrimitive.Root swipeDirection={swipeDirection ?? swipeFor[side]} {...rest} />;
}

export function DrawerTrigger({ className, ...props }: ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return (
    <DrawerPrimitive.Trigger
      data-control-ui="drawer"
      data-slot="trigger"
      className={cn(skinSlot("drawer", "trigger", {}), className)}
      {...props}
    />
  );
}

export function DrawerClose({ className, ...props }: ComponentProps<typeof DrawerPrimitive.Close>) {
  return (
    <DrawerPrimitive.Close
      data-control-ui="drawer"
      data-slot="close"
      className={cn(skinSlot("drawer", "close", {}), className)}
      {...props}
    />
  );
}

export function DrawerContent({
  className,
  children,
  side = "bottom",
  padding = "default",
  surface = "background",
  ...props
}: ComponentProps<typeof DrawerPrimitive.Popup> & {
  side?: DrawerSide;
  padding?: DrawerContentPadding;
  surface?: DrawerContentSurface;
}) {
  const place = placement[side];
  const grabbable = side === "bottom" || side === "top";
  return (
    <DrawerPrimitive.Portal>
      {/* Portal escapes token-scoped ancestor — backdrop+popup re-assert skin scope. */}
      <DrawerPrimitive.Backdrop
        data-skin={skinId()}
        data-effects={skinEffects()}
        className="fixed inset-0 z-[70] bg-[oklch(from_var(--foreground)_l_c_h/var(--overlay-opacity))] backdrop-blur-[var(--backdrop-blur-overlay)] transition-opacity duration-[var(--duration-base)] data-[swiping]:duration-0 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:bg-[oklch(from_var(--background)_l_c_h/var(--overlay-opacity))]"
      />
      <DrawerPrimitive.Viewport
        data-skin={skinId()}
        data-effects={skinEffects()}
        className={cn("fixed inset-0 z-[71] flex", place.viewport)}
      >
        <DrawerPrimitive.Popup
          data-control-ui="drawer"
          data-slot="content"
          data-surface="modal"
          data-padding={padding}
          data-surface-variant={surface}
          className={cn(
            "flex flex-col gap-4 text-foreground shadow-modal outline-none transform-[translate(var(--drawer-swipe-movement-x,0),var(--drawer-swipe-movement-y,0))] transition-transform duration-[var(--duration-base)] ease-[var(--ease-emphasized)] data-[swiping]:duration-0",
            surface === "background" ? "bg-background" : "bg-card",
            padding === "default" && "py-4",
            place.popup,
            skinSlot("drawer", "content", { padding, surface }),
            className,
          )}
          {...props}
        >
          {grabbable ? (
            <div
              data-control-ui="drawer"
              data-slot="handle"
              className={cn(
                "mx-auto h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/30",
                side === "top" && "order-last",
                skinSlot("drawer", "handle", {}),
              )}
            />
          ) : null}
          <DrawerPrimitive.Content className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">{children}</DrawerPrimitive.Content>
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPrimitive.Portal>
  );
}

export function DrawerHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-control-ui="drawer"
      data-slot="header"
      className={cn("flex flex-col gap-1.5 px-4 text-center sm:text-left", skinSlot("drawer", "header", {}), className)}
      {...props}
    />
  );
}

export function DrawerFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-control-ui="drawer"
      data-slot="footer"
      className={cn("mt-auto flex flex-col gap-2 px-4", skinSlot("drawer", "footer", {}), className)}
      {...props}
    />
  );
}

export function DrawerTitle({ className, ...props }: ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-control-ui="drawer"
      data-slot="title"
      className={cn("font-semibold text-foreground", skinSlot("drawer", "title", {}), className)}
      {...props}
    />
  );
}

export function DrawerDescription({ className, ...props }: ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-control-ui="drawer"
      data-slot="description"
      className={cn("text-sm text-muted-foreground", skinSlot("drawer", "description", {}), className)}
      {...props}
    />
  );
}
