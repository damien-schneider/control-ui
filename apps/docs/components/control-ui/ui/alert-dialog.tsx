"use client";

import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import type { OpenChangeEventDetails } from "@/components/control-ui/control-props";
import type { PopupKnobStyle } from "@/components/control-ui/knob-contracts/popup-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { popupBackdropStyle } from "@/components/control-ui/popup-parts";
import { skinScopeAttributes } from "@/components/control-ui/skin";
import { useSkin } from "@/components/control-ui/skin-provider";
import type { ButtonProps } from "@/components/control-ui/ui/button";
import { Button } from "@/components/control-ui/ui/button";

export type AlertDialogProps = {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, eventDetails: OpenChangeEventDetails) => void;
  onOpenChangeComplete?: (open: boolean) => void;
};

export type AlertDialogContentProps = Omit<ComponentProps<"div">, "style"> &
  Pick<ComponentProps<typeof AlertDialogPrimitive.Popup>, "initialFocus" | "finalFocus"> & {
    style?: CSSProperties & PopupKnobStyle;
  };

export function AlertDialog(props: AlertDialogProps) {
  return <AlertDialogPrimitive.Root {...props} />;
}

export function AlertDialogTrigger({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Trigger> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    <AlertDialogPrimitive.Trigger
      data-control-ui="alert-dialog"
      data-popup-kind="alert-dialog"
      data-slot="trigger"
      className={className}
      {...props}
    />
  );
}

export type AlertDialogCloseProps = Omit<ComponentProps<typeof AlertDialogPrimitive.Close>, "render"> &
  Pick<ButtonProps, "variant" | "size" | "tone" | "iconOnly">;

export function AlertDialogClose({
  className,
  children,
  variant = "surface",
  size = "sm",
  tone = "neutral",
  iconOnly,
  ...props
}: AlertDialogCloseProps) {
  return (
    <AlertDialogPrimitive.Close
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

export function AlertDialogContent({ className, children, style, ...props }: AlertDialogContentProps) {
  const skin = useSkin();
  const backdropStyle = popupBackdropStyle(style);
  return (
    <AlertDialogPrimitive.Portal {...skinScopeAttributes(skin)}>
      <AlertDialogPrimitive.Backdrop
        data-control-ui="alert-dialog"
        data-popup-kind="alert-dialog"
        data-slot="backdrop"
        data-control-family="popup"
        data-popup-part="backdrop"
        className="fixed inset-0 z-(--z-overlay)"
        style={backdropStyle}
      />
      <AlertDialogPrimitive.Popup
        data-control-ui="alert-dialog"
        data-popup-kind="alert-dialog"
        data-slot="content"
        data-control-family="popup"
        data-popup-part="surface"
        data-surface="modal"
        className={cn("fixed left-1/2 top-[12vh] z-(--z-modal) flex w-[calc(100%-2rem)] -translate-x-1/2 flex-col", className)}
        style={style}
        {...props}
      >
        {children}
      </AlertDialogPrimitive.Popup>
    </AlertDialogPrimitive.Portal>
  );
}

export function AlertDialogHeader({ className, ...props }: ComponentProps<"div"> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    <div
      data-control-ui="alert-dialog"
      data-control-family="popup"
      data-popup-kind="alert-dialog"
      data-slot="header"
      className={cn("grid shrink-0", className)}
      {...props}
    />
  );
}

export function AlertDialogBody({ className, ...props }: ComponentProps<"div"> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    <div
      data-control-ui="alert-dialog"
      data-control-family="popup"
      data-popup-kind="alert-dialog"
      data-slot="body"
      className={cn("grid min-h-0 overflow-y-auto", className)}
      {...props}
    />
  );
}

export function AlertDialogFooter({ className, ...props }: ComponentProps<"div"> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    <div
      data-control-ui="alert-dialog"
      data-control-family="popup"
      data-popup-kind="alert-dialog"
      data-slot="footer"
      className={cn("flex shrink-0 flex-col-reverse sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

export function AlertDialogTitle({ className, ...props }: ComponentProps<"h2"> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    <AlertDialogPrimitive.Title
      data-control-ui="alert-dialog"
      data-control-family="popup"
      data-popup-kind="alert-dialog"
      data-slot="title"
      className={className}
      {...props}
    />
  );
}

export function AlertDialogDescription({ className, ...props }: ComponentProps<"p"> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    <AlertDialogPrimitive.Description
      data-control-ui="alert-dialog"
      data-control-family="popup"
      data-popup-kind="alert-dialog"
      data-slot="description"
      className={className}
      {...props}
    />
  );
}
