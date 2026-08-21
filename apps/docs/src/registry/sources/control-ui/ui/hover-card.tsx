"use client";

import { PreviewCard as PreviewCardPrimitive } from "@base-ui/react/preview-card";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import type { OpenChangeEventDetails } from "@/components/control-ui/control-props";
import type { PopupKnobStyle } from "@/components/control-ui/knob-contracts/popup-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { skinEffects, skinId } from "@/components/control-ui/skin";

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
  },
  "style"
> & { style?: CSSProperties & PopupKnobStyle };

// Base UI PreviewCard behind shadcn-shaped facade, so shadcn HoverCard snippets compose verbatim.
export function HoverCard(props: HoverCardProps) {
  return <PreviewCardPrimitive.Root {...props} />;
}

export function HoverCardTrigger({
  className,
  ...props
}: ComponentProps<typeof PreviewCardPrimitive.Trigger> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    <PreviewCardPrimitive.Trigger
      data-control-ui="hover-card"
      data-control-family="popup"
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
  ...props
}: HoverCardContentProps) {
  return (
    <PreviewCardPrimitive.Portal>
      {/* portal escapes every token-scoped ancestor, so scope is re-asserted here */}
      <PreviewCardPrimitive.Positioner
        data-control-ui="hover-card"
        data-popup-kind="hover-card"
        data-control-family="popup"
        data-slot="positioner"
        data-skin={skinId()}
        data-effects={skinEffects()}
        side={side}
        align={align}
        sideOffset={sideOffset}
        className="z-[80]"
      >
        <PreviewCardPrimitive.Popup
          data-control-ui="hover-card"
          data-popup-kind="hover-card"
          data-control-family="popup"
          data-slot="content"
          data-surface="floating"
          data-popup-part="surface"
          className={cn("w-64 p-[var(--popover-padding)]", className)}
          {...props}
        >
          {children}
        </PreviewCardPrimitive.Popup>
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPrimitive.Portal>
  );
}
