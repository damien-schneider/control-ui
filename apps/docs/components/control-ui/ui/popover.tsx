"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import type { ComponentProps, CSSProperties } from "react";
import type { PopupKnobStyle } from "@/components/control-ui/knob-contracts/popup-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { controlEffectsAttribute } from "@/components/control-ui/skin";
import { useSkin } from "@/components/control-ui/skin-provider";

export const popoverContentPaddings = ["default", "none"] as const;

export type PopoverContentPadding = (typeof popoverContentPaddings)[number];

type PopoverPopupProps = Omit<ComponentProps<typeof PopoverPrimitive.Popup>, "style"> & {
  side?: ComponentProps<typeof PopoverPrimitive.Positioner>["side"];
  align?: ComponentProps<typeof PopoverPrimitive.Positioner>["align"];
  sideOffset?: number;
  collisionPadding?: ComponentProps<typeof PopoverPrimitive.Positioner>["collisionPadding"];
  padding?: PopoverContentPadding;
  style?: CSSProperties & PopupKnobStyle;
};

export function Popover(props: ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root {...props} />;
}

export function PopoverTrigger({
  className,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Trigger> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    <PopoverPrimitive.Trigger data-control-ui="popover" data-popup-kind="popover" data-slot="trigger" className={className} {...props} />
  );
}

export function PopoverAnchor(props: ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger {...props} />;
}

export function PopoverContent({
  className,
  children,
  side = "bottom",
  align = "center",
  sideOffset = 6,
  collisionPadding,
  padding = "default",
  ...props
}: PopoverPopupProps) {
  const skin = useSkin();
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        data-skin={skin.id}
        data-effects={controlEffectsAttribute(skin.effects)}
        side={side}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className="z-[80]"
      >
        <PopoverPrimitive.Popup
          data-control-ui="popover"
          data-popup-kind="popover"
          data-slot="content"
          data-surface="floating"
          data-control-family="popup"
          data-popup-part="surface"
          data-padding={padding}
          className={cn("w-72", className)}
          {...props}
        >
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

export function PopoverHeader({ className, ...props }: ComponentProps<"div"> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    <div
      data-control-ui="popover"
      data-control-family="popup"
      data-popup-kind="popover"
      data-slot="header"
      className={cn("grid", className)}
      {...props}
    />
  );
}

export function PopoverTitle({
  className,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Title> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    <PopoverPrimitive.Title
      data-control-ui="popover"
      data-control-family="popup"
      data-popup-kind="popover"
      data-slot="title"
      className={className}
      {...props}
    />
  );
}

export function PopoverDescription({
  className,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Description> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    <PopoverPrimitive.Description
      data-control-ui="popover"
      data-control-family="popup"
      data-popup-kind="popover"
      data-slot="description"
      className={className}
      {...props}
    />
  );
}

export function PopoverClose({
  className,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Close> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    <PopoverPrimitive.Close
      data-control-ui="popover"
      data-control-family="popup"
      data-popup-kind="popover"
      data-slot="close"
      className={className}
      {...props}
    />
  );
}
