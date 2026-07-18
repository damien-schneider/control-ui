"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import type { ComponentProps } from "react";
import type { PopoverContentPadding } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinEffects, skinId, skinSlot } from "@/components/control-ui/skin";
import { floatingContentClasses } from "@/components/control-ui/surface-variants";

// Refined skin slot, 100% Base UI: anchored floating panel on popover token set (--radius-popover, --popover-padding, shadow-pop), shared w/ menu/select/context-menu; re-asserts skin scope on portal.
// shadcn-shaped facade (Root/Trigger/Content) so shadcn Popover snippets compose verbatim, plus optional Header/Title/Description/Close.
export function Popover(props: ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root {...props} />;
}

export function PopoverTrigger({ className, ...props }: ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return (
    <PopoverPrimitive.Trigger
      data-control-ui="popover"
      data-slot="trigger"
      className={cn(skinSlot("popover", "trigger", {}), className)}
      {...props}
    />
  );
}

export function PopoverAnchor(props: ComponentProps<typeof PopoverPrimitive.Trigger>) {
  // Base UI anchors popover to trigger; render trigger as child to anchor elsewhere.
  return <PopoverPrimitive.Trigger {...props} />;
}

export function PopoverContent({
  className,
  children,
  side = "bottom",
  align = "center",
  sideOffset = 6,
  padding = "default",
  ...props
}: ComponentProps<typeof PopoverPrimitive.Popup> & {
  side?: ComponentProps<typeof PopoverPrimitive.Positioner>["side"];
  align?: ComponentProps<typeof PopoverPrimitive.Positioner>["align"];
  sideOffset?: number;
  padding?: PopoverContentPadding;
}) {
  return (
    <PopoverPrimitive.Portal>
      {/* Portal escapes token-scoped ancestor — positioner re-asserts ACTIVE skin's scope (theme.css mirrors). */}
      <PopoverPrimitive.Positioner
        data-skin={skinId()}
        data-effects={skinEffects()}
        side={side}
        align={align}
        sideOffset={sideOffset}
        className="z-[80] outline-none"
      >
        <PopoverPrimitive.Popup
          data-control-ui="popover"
          data-slot="content"
          data-surface="floating"
          data-padding={padding}
          className={cn(
            "w-72",
            padding === "default" && "p-4",
            floatingContentClasses,
            skinSlot("popover", "content", { padding }),
            className,
          )}
          {...props}
        >
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

export function PopoverHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-control-ui="popover"
      data-slot="header"
      className={cn("grid gap-1.5 pb-3", skinSlot("popover", "header", {}), className)}
      {...props}
    />
  );
}

export function PopoverTitle({ className, ...props }: ComponentProps<typeof PopoverPrimitive.Title>) {
  return (
    <PopoverPrimitive.Title
      data-control-ui="popover"
      data-slot="title"
      className={cn("text-sm font-semibold leading-none tracking-tight", skinSlot("popover", "title", {}), className)}
      {...props}
    />
  );
}

export function PopoverDescription({ className, ...props }: ComponentProps<typeof PopoverPrimitive.Description>) {
  return (
    <PopoverPrimitive.Description
      data-control-ui="popover"
      data-slot="description"
      className={cn("text-sm text-muted-foreground", skinSlot("popover", "description", {}), className)}
      {...props}
    />
  );
}

export function PopoverClose({ className, ...props }: ComponentProps<typeof PopoverPrimitive.Close>) {
  return (
    <PopoverPrimitive.Close
      data-control-ui="popover"
      data-slot="close"
      className={cn(skinSlot("popover", "close", {}), className)}
      {...props}
    />
  );
}
