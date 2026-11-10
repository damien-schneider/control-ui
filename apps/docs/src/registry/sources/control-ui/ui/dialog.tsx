"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import type { OpenChangeEventDetails } from "@/components/control-ui/control-props";
import type { PopupKnobStyle } from "@/components/control-ui/knob-contracts/popup-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { PopupCloseButton, popupBackdropStyle } from "@/components/control-ui/popup-parts";
import { skinAdornment, skinScopeAttributes } from "@/components/control-ui/skin";
import { useSkin } from "@/components/control-ui/skin-provider";
import type { ButtonProps } from "@/components/control-ui/ui/button";
import { Button } from "@/components/control-ui/ui/button";

export type DialogProps = {
  modal?: boolean | "trap-focus";
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, eventDetails: OpenChangeEventDetails) => void;
  onOpenChangeComplete?: (open: boolean) => void;
  disablePointerDismissal?: boolean;
};

export type DialogContentProps = Omit<ComponentProps<"div">, "style"> &
  Pick<ComponentProps<typeof DialogPrimitive.Popup>, "initialFocus" | "finalFocus"> & {
    style?: CSSProperties & PopupKnobStyle;
    showCloseButton?: boolean;
    closeLabel?: string;
  };

export function Dialog(props: DialogProps) {
  return <DialogPrimitive.Root {...props} />;
}

export function DialogTrigger({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Trigger> & { style?: CSSProperties & PopupKnobStyle }) {
  return <DialogPrimitive.Trigger data-control-ui="dialog" data-popup-kind="dialog" data-slot="trigger" className={className} {...props} />;
}

export type DialogCloseProps = Omit<ComponentProps<typeof DialogPrimitive.Close>, "render"> &
  Pick<ButtonProps, "variant" | "size" | "tone" | "iconOnly">;

export function DialogClose({
  className,
  children,
  variant = "surface",
  size = "sm",
  tone = "neutral",
  iconOnly,
  ...props
}: DialogCloseProps) {
  return (
    <DialogPrimitive.Close
      {...props}
      render={(renderProps) => (
        <Button
          {...renderProps}
          data-popup-part="close"
          variant={variant}
          size={size}
          tone={tone}
          iconOnly={iconOnly}
          className={cn(renderProps.className, className)}
        >
          {children}
        </Button>
      )}
    />
  );
}

export function DialogContent({ className, children, showCloseButton = true, closeLabel = "Close", style, ...props }: DialogContentProps) {
  const skin = useSkin();
  const backdropStyle = popupBackdropStyle(style);
  return (
    <DialogPrimitive.Portal {...skinScopeAttributes(skin)}>
      <DialogPrimitive.Backdrop
        data-control-ui="dialog"
        data-popup-kind="dialog"
        data-slot="backdrop"
        data-control-family="popup"
        data-popup-part="backdrop"
        className="fixed inset-0 z-(--z-overlay)"
        style={backdropStyle}
      />
      <DialogPrimitive.Popup
        data-control-ui="dialog"
        data-popup-kind="dialog"
        data-slot="content"
        data-control-family="popup"
        data-popup-part="surface"
        data-surface="modal"
        className={cn("fixed left-1/2 top-[12vh] z-(--z-modal) flex w-[calc(100%-2rem)] -translate-x-1/2 flex-col", className)}
        style={style}
        {...props}
      >
        {skinAdornment(skin, "dialog", "titlebar", {})}
        {children}
        {showCloseButton ? <DialogPrimitive.Close render={<PopupCloseButton label={closeLabel} />} /> : null}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({ className, ...props }: ComponentProps<"div"> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    <div
      data-control-ui="dialog"
      data-control-family="popup"
      data-popup-kind="dialog"
      data-slot="header"
      className={cn("grid shrink-0", className)}
      {...props}
    />
  );
}

export function DialogBody({ className, ...props }: ComponentProps<"div"> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    <div
      data-control-ui="dialog"
      data-control-family="popup"
      data-popup-kind="dialog"
      data-slot="body"
      className={cn("grid min-h-0 overflow-y-auto", className)}
      {...props}
    />
  );
}

export function DialogFooter({ className, ...props }: ComponentProps<"div"> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    <div
      data-control-ui="dialog"
      data-control-family="popup"
      data-popup-kind="dialog"
      data-slot="footer"
      className={cn("flex shrink-0 flex-col-reverse sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

export function DialogTitle({ className, ...props }: ComponentProps<"h2"> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    <DialogPrimitive.Title
      data-control-ui="dialog"
      data-control-family="popup"
      data-popup-kind="dialog"
      data-slot="title"
      className={className}
      {...props}
    />
  );
}

export function DialogDescription({ className, ...props }: ComponentProps<"p"> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    <DialogPrimitive.Description
      data-control-ui="dialog"
      data-control-family="popup"
      data-popup-kind="dialog"
      data-slot="description"
      className={className}
      {...props}
    />
  );
}
