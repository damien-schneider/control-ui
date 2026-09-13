"use client";

import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";
import type { ComponentProps, CSSProperties } from "react";
import type { PopupKnobStyle } from "@/components/control-ui/knob-contracts/popup-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { controlEffectsAttribute } from "@/components/control-ui/skin";
import { useSkin } from "@/components/control-ui/skin-provider";

export function Sheet(props: ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root {...props} />;
}

export function SheetClose({
  className,
  ...props
}: ComponentProps<typeof SheetPrimitive.Close> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    <SheetPrimitive.Close
      data-control-ui="sheet"
      data-control-family="popup"
      data-popup-kind="sheet"
      data-slot="close"
      className={className}
      {...props}
    />
  );
}

export type SheetContentProps = Omit<ComponentProps<typeof SheetPrimitive.Popup>, "style"> & { style?: CSSProperties & PopupKnobStyle } & {
  side?: "left" | "right";
};

export function SheetContent({ className, children, side = "right", ...props }: SheetContentProps) {
  const skin = useSkin();
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Backdrop
        data-control-ui="sheet"
        data-popup-kind="sheet"
        data-slot="backdrop"
        data-control-family="popup"
        data-popup-part="backdrop"
        data-skin={skin.id}
        data-effects={controlEffectsAttribute(skin.effects)}
        className="fixed inset-0 z-[70]"
      />
      <SheetPrimitive.Popup
        data-skin={skin.id}
        data-effects={controlEffectsAttribute(skin.effects)}
        data-control-ui="sheet"
        data-popup-kind="sheet"
        data-control-family="popup"
        data-slot="content"
        data-popup-part="surface"
        data-surface="modal"
        className={cn("fixed inset-y-0 z-[71] flex h-full w-3/4 max-w-sm flex-col", side === "left" ? "left-0" : "right-0", className)}
        {...props}
        data-side={side}
      >
        {children}
      </SheetPrimitive.Popup>
    </SheetPrimitive.Portal>
  );
}

export function SheetHeader({ className, ...props }: ComponentProps<"div"> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    <div
      data-control-ui="sheet"
      data-control-family="popup"
      data-popup-kind="sheet"
      data-slot="header"
      className={cn("flex flex-col", className)}
      {...props}
    />
  );
}

export function SheetTitle({
  className,
  ...props
}: ComponentProps<typeof SheetPrimitive.Title> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    <SheetPrimitive.Title
      data-control-ui="sheet"
      data-control-family="popup"
      data-popup-kind="sheet"
      data-slot="title"
      className={className}
      {...props}
    />
  );
}

export function SheetDescription({
  className,
  ...props
}: ComponentProps<typeof SheetPrimitive.Description> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    <SheetPrimitive.Description
      data-control-ui="sheet"
      data-control-family="popup"
      data-popup-kind="sheet"
      data-slot="description"
      className={className}
      {...props}
    />
  );
}
