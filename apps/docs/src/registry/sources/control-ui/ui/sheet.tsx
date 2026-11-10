"use client";

import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";
import type { ComponentProps, CSSProperties } from "react";
import type { PopupKnobStyle } from "@/components/control-ui/knob-contracts/popup-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { PopupCloseButton, popupBackdropStyle } from "@/components/control-ui/popup-parts";
import { skinScopeAttributes } from "@/components/control-ui/skin";
import { useSkin } from "@/components/control-ui/skin-provider";

export const sheetBodyPaddings = ["default", "none"] as const;

export type SheetBodyPadding = (typeof sheetBodyPaddings)[number];

export function Sheet(props: ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root {...props} />;
}

export function SheetTrigger({
  className,
  ...props
}: ComponentProps<typeof SheetPrimitive.Trigger> & { style?: CSSProperties & PopupKnobStyle }) {
  return <SheetPrimitive.Trigger data-control-ui="sheet" data-popup-kind="sheet" data-slot="trigger" className={className} {...props} />;
}

export function SheetClose({
  className,
  ...props
}: ComponentProps<typeof SheetPrimitive.Close> & { style?: CSSProperties & PopupKnobStyle }) {
  return <SheetPrimitive.Close data-control-ui="sheet" data-popup-kind="sheet" data-slot="close" className={className} {...props} />;
}

export type SheetContentProps = Omit<ComponentProps<typeof SheetPrimitive.Popup>, "style"> & { style?: CSSProperties & PopupKnobStyle } & {
  /** `left` is the inline-start edge and `right` the inline-end edge, so the sheet follows the writing direction like Sidebar does. */
  side?: "left" | "right";
  showCloseButton?: boolean;
  closeLabel?: string;
};

export function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = false,
  closeLabel = "Close",
  style,
  ...props
}: SheetContentProps) {
  const skin = useSkin();
  const backdropStyle = popupBackdropStyle(style);
  return (
    <SheetPrimitive.Portal {...skinScopeAttributes(skin)}>
      <SheetPrimitive.Backdrop
        data-control-ui="sheet"
        data-popup-kind="sheet"
        data-slot="backdrop"
        data-control-family="popup"
        data-popup-part="backdrop"
        className="fixed inset-0 z-(--z-overlay)"
        style={backdropStyle}
      />
      <SheetPrimitive.Popup
        data-control-ui="sheet"
        data-popup-kind="sheet"
        data-control-family="popup"
        data-slot="content"
        data-popup-part="surface"
        data-surface="modal"
        className={cn(
          "fixed inset-y-0 z-(--z-modal) flex h-full w-3/4 max-w-sm flex-col",
          side === "left" ? "start-0" : "end-0",
          className,
        )}
        style={style}
        {...props}
        data-side={side}
      >
        {children}
        {showCloseButton ? <SheetPrimitive.Close render={<PopupCloseButton label={closeLabel} />} /> : null}
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
      className={cn("flex shrink-0 flex-col", className)}
      {...props}
    />
  );
}

export function SheetBody({
  padding = "default",
  className,
  ...props
}: ComponentProps<"div"> & { padding?: SheetBodyPadding; style?: CSSProperties & PopupKnobStyle }) {
  return (
    <div
      data-control-ui="sheet"
      data-control-family="popup"
      data-popup-kind="sheet"
      data-slot="body"
      data-padding={padding}
      className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto", className)}
      {...props}
    />
  );
}

export function SheetFooter({ className, ...props }: ComponentProps<"div"> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    <div
      data-control-ui="sheet"
      data-control-family="popup"
      data-popup-kind="sheet"
      data-slot="footer"
      className={cn("mt-auto flex shrink-0 flex-col-reverse sm:flex-row sm:justify-end", className)}
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
