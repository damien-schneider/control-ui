"use client";

import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import { type ComponentProps, type CSSProperties, createContext, useContext } from "react";
import type { PopupKnobStyle } from "@/components/control-ui/knob-contracts/popup-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { controlEffectsAttribute } from "@/components/control-ui/skin";
import { useSkin } from "@/components/control-ui/skin-provider";

export const drawerSides = ["bottom", "top", "right", "left"] as const;

export type DrawerSide = (typeof drawerSides)[number];

export const drawerBodyPaddings = ["default", "none"] as const;

export type DrawerBodyPadding = (typeof drawerBodyPaddings)[number];

export const drawerContentSurfaces = ["background", "card"] as const;

export type DrawerContentSurface = (typeof drawerContentSurfaces)[number];

export const drawerContentVariants = ["edge", "floating"] as const;

export type DrawerContentVariant = (typeof drawerContentVariants)[number];

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
        "items-end justify-center pb-[var(--_drawer-float-gap)] [--_drawer-float-gap:max(--spacing(2),env(safe-area-inset-bottom))]",
      popup: "w-full max-h-[85vh]",
    },
    top: {
      viewport: "items-start justify-center pt-[var(--_drawer-float-gap)] [--_drawer-float-gap:max(--spacing(2),env(safe-area-inset-top))]",
      popup: "w-full max-h-[85vh]",
    },
    right: {
      viewport:
        "items-stretch justify-end pr-[var(--_drawer-float-gap)] [--_drawer-float-gap:max(--spacing(2),env(safe-area-inset-right))]",
      popup: "w-3/4 max-w-sm",
    },
    left: {
      viewport:
        "items-stretch justify-start pl-[var(--_drawer-float-gap)] [--_drawer-float-gap:max(--spacing(2),env(safe-area-inset-left))]",
      popup: "w-3/4 max-w-sm",
    },
  },
};

// Base UI leaves the backdrop pointer-capturing even when the drawer is not modal, and the viewport is a
// full-screen positioning layer either way. A non-modal drawer that silently ate every click on the page
// behind it would be worse than no drawer, so the content layers read the root's own modal flag.
const DrawerModalContext = createContext(true);

export function Drawer(props: ComponentProps<typeof DrawerPrimitive.Root> & { side?: DrawerSide }) {
  const { side = "bottom", swipeDirection, modal = true, ...rest } = props;
  return (
    <DrawerModalContext value={modal === true}>
      <DrawerPrimitive.Root swipeDirection={swipeDirection ?? swipeFor[side]} modal={modal} {...rest} />
    </DrawerModalContext>
  );
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
  return <DrawerPrimitive.Close data-control-ui="drawer" data-popup-kind="drawer" data-slot="close" className={className} {...props} />;
}

export function DrawerContent({
  className,
  children,
  side = "bottom",
  surface = "background",
  variant = "edge",
  style,
  ...props
}: Omit<ComponentProps<typeof DrawerPrimitive.Popup>, "style"> & {
  side?: DrawerSide;
  surface?: DrawerContentSurface;
  variant?: DrawerContentVariant;
  style?: CSSProperties & PopupKnobStyle;
}) {
  const skin = useSkin();
  const modal = useContext(DrawerModalContext);
  const place = placement[variant][side];
  const grabbable = side === "bottom" || side === "top";
  const backdropStyle: (CSSProperties & PopupKnobStyle) | undefined = style
    ? {
        "--cui-popup-backdrop-background": style["--cui-popup-backdrop-background"],
        "--cui-popup-backdrop-blur": style["--cui-popup-backdrop-blur"],
      }
    : undefined;
  return (
    <DrawerPrimitive.Portal>
      <DrawerPrimitive.Backdrop
        data-control-ui="drawer"
        data-control-family="popup"
        data-popup-kind="drawer"
        data-popup-part="backdrop"
        data-slot="backdrop"
        data-skin={skin.id}
        data-effects={controlEffectsAttribute(skin.effects)}
        className={cn("fixed inset-0 z-(--z-overlay)", !modal && "pointer-events-none")}
        style={backdropStyle}
      />
      <DrawerPrimitive.Viewport
        data-control-ui="drawer"
        data-control-family="popup"
        data-popup-kind="drawer"
        data-slot="viewport"
        data-side={side}
        data-variant={variant}
        data-skin={skin.id}
        data-effects={controlEffectsAttribute(skin.effects)}
        className={cn("fixed inset-0 z-(--z-modal) flex", place.viewport, !modal && "pointer-events-none")}
      >
        <DrawerPrimitive.Popup
          data-control-ui="drawer"
          data-control-family="popup"
          data-popup-kind="drawer"
          data-popup-part="surface"
          data-slot="content"
          data-side={side}
          data-surface="modal"
          data-surface-variant={surface}
          data-variant={variant}
          className={cn("flex flex-col", place.popup, !modal && "pointer-events-auto", className)}
          style={style}
          {...props}
        >
          {grabbable ? (
            <div data-control-ui="drawer" data-control-family="popup" data-popup-kind="drawer" data-slot="handle" className="shrink-0" />
          ) : null}
          {children}
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
      className={cn("flex shrink-0 flex-col", className)}
      {...props}
    />
  );
}

export function DrawerBody({
  className,
  padding = "default",
  ...props
}: Omit<ComponentProps<typeof DrawerPrimitive.Content>, "style"> & {
  padding?: DrawerBodyPadding;
  style?: CSSProperties & PopupKnobStyle;
}) {
  return (
    <DrawerPrimitive.Content
      data-control-ui="drawer"
      data-control-family="popup"
      data-popup-kind="drawer"
      data-slot="body"
      data-padding={padding}
      className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto", className)}
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
      className={cn("mt-auto flex shrink-0 flex-col sm:flex-row sm:justify-end", className)}
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
