"use client";

import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";
import type { ComponentProps } from "react";
import { cn } from "@/components/control-ui/lib/cn";
import { skinEffects, skinId, skinSlot } from "@/components/control-ui/skin";

// Side-anchored Dialog: panel pins to edge, slides via starting/ending-style transform. Backdrop + panel re-assert skin scope on portal.
export function Sheet(props: ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root {...props} />;
}

export function SheetClose({ className, ...props }: ComponentProps<typeof SheetPrimitive.Close>) {
  return (
    <SheetPrimitive.Close data-control-ui="sheet" data-slot="close" className={cn(skinSlot("sheet", "close", {}), className)} {...props} />
  );
}

export function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: ComponentProps<typeof SheetPrimitive.Popup> & { side?: "left" | "right" }) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Backdrop
        data-skin={skinId()}
        data-effects={skinEffects()}
        className="fixed inset-0 z-[70] bg-[oklch(from_var(--foreground)_l_c_h/var(--overlay-opacity))] backdrop-blur-[var(--backdrop-blur-overlay)] transition-opacity duration-[var(--duration-base)] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:bg-[oklch(from_var(--background)_l_c_h/var(--overlay-opacity))]"
      />
      <SheetPrimitive.Popup
        data-skin={skinId()}
        data-effects={skinEffects()}
        data-control-ui="sheet"
        data-slot="content"
        data-surface="modal"
        className={cn(
          "fixed inset-y-0 z-[71] flex h-full w-3/4 max-w-sm flex-col gap-4 bg-background text-foreground shadow-modal outline-none transition duration-[var(--duration-base)] ease-[var(--ease-emphasized)]",
          side === "left"
            ? "left-0 border-r data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full"
            : "right-0 border-l data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full",
          skinSlot("sheet", "content", {}),
          className,
        )}
        {...props}
      >
        {children}
      </SheetPrimitive.Popup>
    </SheetPrimitive.Portal>
  );
}

export function SheetHeader({ className, ...props }: ComponentProps<"div">) {
  return <div data-control-ui="sheet" data-slot="header" className={cn("flex flex-col gap-1.5 p-4", className)} {...props} />;
}

export function SheetTitle({ className, ...props }: ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-control-ui="sheet"
      data-slot="title"
      className={cn("font-semibold text-foreground", skinSlot("sheet", "title", {}), className)}
      {...props}
    />
  );
}

export function SheetDescription({ className, ...props }: ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-control-ui="sheet"
      data-slot="description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}
