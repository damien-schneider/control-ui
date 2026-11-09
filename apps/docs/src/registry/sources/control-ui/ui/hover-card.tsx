"use client";

import { PreviewCard as PreviewCardPrimitive } from "@base-ui/react/preview-card";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import type { OpenChangeEventDetails } from "@/components/control-ui/control-props";
import type { PopupKnobStyle } from "@/components/control-ui/knob-contracts/popup-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { controlEffectsAttribute } from "@/components/control-ui/skin";
import { useSkin } from "@/components/control-ui/skin-provider";

export type HoverCardProps = {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, eventDetails: OpenChangeEventDetails) => void;
};

export type HoverCardContentProps = Omit<
  ComponentProps<"div"> & {
    side?: "top" | "bottom" | "left" | "right";
    align?: "start" | "center" | "end";
    sideOffset?: number;
    /** Positions the card against this element instead of the trigger, for hover targets React does not render. */
    anchor?: ComponentProps<typeof PreviewCardPrimitive.Positioner>["anchor"];
  },
  "style"
> & { style?: CSSProperties & PopupKnobStyle };

export function HoverCard(props: HoverCardProps) {
  return <PreviewCardPrimitive.Root {...props} />;
}

export function HoverCardTrigger({
  className,
  ...props
}: ComponentProps<typeof PreviewCardPrimitive.Trigger> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    // No family here: a control passed as `render` keeps its own, which its recipe is keyed on.
    <PreviewCardPrimitive.Trigger
      data-control-ui="hover-card"
      data-popup-kind="hover-card"
      data-slot="trigger"
      className={className}
      {...props}
    />
  );
}

export function HoverCardContent({
  className,
  children,
  side = "bottom",
  align = "center",
  sideOffset = 8,
  anchor,
  ...props
}: HoverCardContentProps) {
  const skin = useSkin();
  return (
    <PreviewCardPrimitive.Portal>
      <PreviewCardPrimitive.Positioner
        data-control-ui="hover-card"
        data-popup-kind="hover-card"
        data-control-family="popup"
        data-slot="positioner"
        data-skin={skin.id}
        data-effects={controlEffectsAttribute(skin.effects)}
        side={side}
        align={align}
        sideOffset={sideOffset}
        anchor={anchor}
        className="z-(--z-popup)"
      >
        <PreviewCardPrimitive.Popup
          data-control-ui="hover-card"
          data-popup-kind="hover-card"
          data-control-family="popup"
          data-slot="content"
          data-surface="floating"
          data-popup-part="surface"
          className={cn("w-64", className)}
          {...props}
        >
          {children}
        </PreviewCardPrimitive.Popup>
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPrimitive.Portal>
  );
}
