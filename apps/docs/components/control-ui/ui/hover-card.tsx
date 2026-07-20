"use client";

import { PreviewCard as PreviewCardPrimitive } from "@base-ui/react/preview-card";
import type { ComponentProps } from "react";
import type { HoverCardContentProps, HoverCardProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinEffects, skinFamily, skinId, skinSlot } from "@/components/control-ui/skin";
import { floatingContentClasses } from "@/components/control-ui/surface-variants";

// Refined skin slot, 100% Base UI PreviewCard: hover/focus-triggered floating card.
// Shares popover token set (--radius-popover, --popover-padding, shadow-pop) w/ menu/select/popover; re-asserts skin scope on portal.
// shadcn-shaped facade (Root/Trigger/Content) so shadcn HoverCard snippets compose verbatim.
export function HoverCard(props: HoverCardProps) {
  return <PreviewCardPrimitive.Root {...props} />;
}

export function HoverCardTrigger({ className, ...props }: ComponentProps<typeof PreviewCardPrimitive.Trigger>) {
  return (
    <PreviewCardPrimitive.Trigger
      data-control-ui="hover-card"
      data-slot="trigger"
      className={cn(skinSlot("hover-card", "trigger", {}), className)}
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
      {/* Portal escapes token-scoped ancestor — positioner re-asserts ACTIVE skin's scope (theme.css mirrors). */}
      <PreviewCardPrimitive.Positioner
        data-skin={skinId()}
        data-effects={skinEffects()}
        side={side}
        align={align}
        sideOffset={sideOffset}
        className="z-[80] outline-none"
      >
        <PreviewCardPrimitive.Popup
          data-control-ui="hover-card"
          data-slot="content"
          data-surface="floating"
          data-popup-part="surface"
          className={cn(
            "w-64 p-[var(--popover-padding)]",
            floatingContentClasses,
            skinFamily("popup", "surface"),
            skinSlot("hover-card", "content", {}),
            className,
          )}
          {...props}
        >
          {children}
        </PreviewCardPrimitive.Popup>
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPrimitive.Portal>
  );
}
