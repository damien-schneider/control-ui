"use client";

import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";
import type { ComponentProps, CSSProperties } from "react";
import type { AlertDialogContentProps, AlertDialogProps, ButtonProps } from "@/components/control-ui/contracts";
import type { PopupKnobStyle } from "@/components/control-ui/knob-contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinEffects, skinId } from "@/components/control-ui/skin";
import { Button } from "@/components/control-ui/ui/button";

// No light dismiss — neither backdrop nor Esc closes it, so it needs explicit action.
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
      data-control-family="popup"
      data-popup-kind="alert-dialog"
      data-slot="trigger"
      className={className}
      {...props}
    />
  );
}

type AlertDialogCloseProps = Omit<ComponentProps<typeof AlertDialogPrimitive.Close>, "render"> &
  Pick<ButtonProps, "variant" | "size" | "tone">;

export function AlertDialogClose({
  className,
  children,
  variant = "surface",
  size = "sm",
  tone = "neutral",
  ...props
}: AlertDialogCloseProps) {
  return (
    <AlertDialogPrimitive.Close
      {...props}
      render={(renderProps) => (
        <Button
          {...renderProps}
          data-dialog-part="close"
          variant={variant}
          size={size}
          tone={tone}
          className={cn(renderProps.className, className)}
        >
          {children}
        </Button>
      )}
    />
  );
}

export function AlertDialogContent({ className, children, ...props }: AlertDialogContentProps) {
  return (
    <AlertDialogPrimitive.Portal>
      {/* portal lands outside container-scoped skin root, so scope is re-asserted here */}
      <AlertDialogPrimitive.Backdrop
        data-control-ui="alert-dialog"
        data-popup-kind="alert-dialog"
        data-slot="backdrop"
        data-control-family="popup"
        data-popup-part="backdrop"
        data-skin={skinId()}
        data-effects={skinEffects()}
        className="fixed inset-0 z-[70]"
      />
      <AlertDialogPrimitive.Popup
        data-skin={skinId()}
        data-effects={skinEffects()}
        data-control-ui="alert-dialog"
        data-popup-kind="alert-dialog"
        data-slot="content"
        data-control-family="popup"
        data-popup-part="surface"
        data-surface="modal"
        className={cn("fixed left-1/2 top-[12vh] z-[71] grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 gap-4 p-0", className)}
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
      className={cn("grid gap-1.5 p-4 pb-0", className)}
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
      className={cn("flex flex-col-reverse gap-2 p-4 pt-0 sm:flex-row sm:justify-end", className)}
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
