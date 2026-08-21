"use client";

import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import type { ComponentProps, CSSProperties } from "react";

import type { PopupKnobStyle } from "@/components/control-ui/knob-contracts/popup-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { skinEffects, skinId } from "@/components/control-ui/skin";

export const drawerSides = ["bottom", "top", "right", "left"] as const;

export type DrawerSide = (typeof drawerSides)[number];

export const drawerContentPaddings = ["default", "none"] as const;

export type DrawerContentPadding = (typeof drawerContentPaddings)[number];

export const drawerContentSurfaces = ["background", "card"] as const;

export type DrawerContentSurface = (typeof drawerContentSurfaces)[number];

export const drawerContentVariants = ["edge", "floating"] as const;

export type DrawerContentVariant = (typeof drawerContentVariants)[number];

// Base UI Drawer throughout — native swipe gestures and snap points, no vaul.

// swipeDirection is dismiss axis — always edge drawer is pinned to
const swipeFor: Record<DrawerSide, ComponentProps<typeof DrawerPrimitive.Root>["swipeDirection"]> = {
  bottom: "down",
  top: "up",
  right: "right",
  left: "left",
};

const placement: Record<DrawerContentVariant, Record<DrawerSide, { viewport: string; popup: string }>> = {
  edge: {
    bottom: {
      viewport: "items-end justify-center",
      popup: "w-full max-h-[85vh]",
    },
    top: {
      viewport: "items-start justify-center",
      popup: "w-full max-h-[85vh]",
    },
    right: {
      viewport: "items-stretch justify-end",
      popup: "h-full w-3/4 max-w-sm",
    },
    left: {
      viewport: "items-stretch justify-start",
      popup: "h-full w-3/4 max-w-sm",
    },
  },
  floating: {
    bottom: {
      viewport:
        "items-end justify-center p-2 pb-[var(--_drawer-float-gap)] [--_drawer-float-gap:max(--spacing(2),env(safe-area-inset-bottom))]",
      popup: "w-full max-h-[85vh]",
    },
    top: {
      viewport:
        "items-start justify-center p-2 pt-[var(--_drawer-float-gap)] [--_drawer-float-gap:max(--spacing(2),env(safe-area-inset-top))]",
      popup: "w-full max-h-[85vh]",
    },
    right: {
      viewport:
        "items-stretch justify-end p-2 pr-[var(--_drawer-float-gap)] [--_drawer-float-gap:max(--spacing(2),env(safe-area-inset-right))]",
      popup: "w-3/4 max-w-sm",
    },
    left: {
      viewport:
        "items-stretch justify-start p-2 pl-[var(--_drawer-float-gap)] [--_drawer-float-gap:max(--spacing(2),env(safe-area-inset-left))]",
      popup: "w-3/4 max-w-sm",
    },
  },
};

// inset belongs to handle, not popup padding — under padding="none" pill would otherwise sit flush against rounded edge
const handleGap: Record<"bottom" | "top", string> = {
  bottom: "mt-2.5 mb-1",
  top: "order-last mt-1 mb-2.5",
};

// skips grabbed edge, whose inset handleGap already owns
const contentPadding: Record<DrawerSide, string> = {
  bottom: "pb-4",
  top: "pt-4",
  right: "py-4",
  left: "py-4",
};

export function Drawer(props: ComponentProps<typeof DrawerPrimitive.Root> & { side?: DrawerSide }) {
  const { side = "bottom", swipeDirection, ...rest } = props;
  return <DrawerPrimitive.Root swipeDirection={swipeDirection ?? swipeFor[side]} {...rest} />;
}

export function DrawerTrigger({
  className,
  ...props
}: ComponentProps<typeof DrawerPrimitive.Trigger> & { style?: CSSProperties & PopupKnobStyle }) {
  return <DrawerPrimitive.Trigger data-control-ui="drawer" data-popup-kind="drawer" data-slot="trigger" className={className} {...props} />;
}

export function DrawerClose({
  className,
  ...props
}: ComponentProps<typeof DrawerPrimitive.Close> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    <DrawerPrimitive.Close
      data-control-ui="drawer"
      data-control-family="popup"
      data-popup-kind="drawer"
      data-slot="close"
      className={className}
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
  variant = "edge",
  style,
  ...props
}: Omit<ComponentProps<typeof DrawerPrimitive.Popup>, "style"> & {
  side?: DrawerSide;
  padding?: DrawerContentPadding;
  surface?: DrawerContentSurface;
  variant?: DrawerContentVariant;
  style?: CSSProperties & PopupKnobStyle;
}) {
  const place = placement[variant][side];
  const grabbable = side === "bottom" || side === "top";
  const backdropStyle: (CSSProperties & PopupKnobStyle) | undefined = style
    ? {
        "--cui-popup-backdrop-background": style["--cui-popup-backdrop-background"],
      }
    : undefined;
  return (
    <DrawerPrimitive.Portal>
      {/* portal escapes every token-scoped ancestor, so scope is re-asserted here */}
      <DrawerPrimitive.Backdrop
        data-control-ui="drawer"
        data-control-family="popup"
        data-popup-kind="drawer"
        data-popup-part="backdrop"
        data-slot="backdrop"
        data-skin={skinId()}
        data-effects={skinEffects()}
        className="fixed inset-0 z-[70]"
        style={backdropStyle}
      />
      <DrawerPrimitive.Viewport
        data-control-ui="drawer"
        data-control-family="popup"
        data-popup-kind="drawer"
        data-slot="viewport"
        data-skin={skinId()}
        data-effects={skinEffects()}
        className={cn("fixed inset-0 z-[71] flex", place.viewport)}
      >
        <DrawerPrimitive.Popup
          data-control-ui="drawer"
          data-control-family="popup"
          data-popup-kind="drawer"
          data-popup-part="surface"
          data-slot="content"
          data-side={side}
          data-surface="modal"
          data-padding={padding}
          data-surface-variant={surface}
          data-variant={variant}
          className={cn("flex flex-col gap-4", padding === "default" && contentPadding[side], place.popup, className)}
          style={style}
          {...props}
        >
          {grabbable ? (
            <div
              data-control-ui="drawer"
              data-control-family="popup"
              data-popup-kind="drawer"
              data-slot="handle"
              className={cn("mx-auto h-1.5 w-12 shrink-0", handleGap[side])}
            />
          ) : null}
          <DrawerPrimitive.Content className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">{children}</DrawerPrimitive.Content>
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPrimitive.Portal>
  );
}

export function DrawerHeader({ className, ...props }: ComponentProps<"div"> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    <div
      data-control-ui="drawer"
      data-control-family="popup"
      data-popup-kind="drawer"
      data-slot="header"
      className={cn("flex flex-col gap-1.5 px-4", className)}
      {...props}
    />
  );
}

export function DrawerFooter({ className, ...props }: ComponentProps<"div"> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    <div
      data-control-ui="drawer"
      data-control-family="popup"
      data-popup-kind="drawer"
      data-slot="footer"
      className={cn("mt-auto flex flex-col gap-2 px-4", className)}
      {...props}
    />
  );
}

export function DrawerTitle({
  className,
  ...props
}: Omit<ComponentProps<typeof DrawerPrimitive.Title>, "style"> & {
  style?: CSSProperties & PopupKnobStyle;
}) {
  return (
    <DrawerPrimitive.Title
      data-control-ui="drawer"
      data-control-family="popup"
      data-popup-kind="drawer"
      data-slot="title"
      className={className}
      {...props}
    />
  );
}

export function DrawerDescription({
  className,
  ...props
}: Omit<ComponentProps<typeof DrawerPrimitive.Description>, "style"> & {
  style?: CSSProperties & PopupKnobStyle;
}) {
  return (
    <DrawerPrimitive.Description
      data-control-ui="drawer"
      data-control-family="popup"
      data-popup-kind="drawer"
      data-slot="description"
      className={className}
      {...props}
    />
  );
}
