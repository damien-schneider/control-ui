"use client";

import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";
import type { ComponentProps } from "react";
import type { AlertDialogContentProps, AlertDialogProps, ButtonProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinEffects, skinId, skinSlot } from "@/components/control-ui/skin";
import { surfaceEnterExitMotionClasses } from "@/components/control-ui/surface-variants";
import { Button } from "@/components/control-ui/ui/button";

// Mirrors Dialog panel styling, but on Base UI's AlertDialog: no light dismiss (no backdrop/Esc close), must be resolved by explicit action.
export function AlertDialog(props: AlertDialogProps) {
  return <AlertDialogPrimitive.Root {...props} />;
}

export function AlertDialogTrigger({ className, ...props }: ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger
      data-control-ui="alert-dialog"
      data-slot="trigger"
      className={cn(skinSlot("alert-dialog", "trigger", {}), className)}
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
          data-control-ui="alert-dialog"
          data-slot="close"
          variant={variant}
          size={size}
          tone={tone}
          className={cn(renderProps.className, skinSlot("alert-dialog", "close", {}), className)}
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
      {/* Portals land outside container-scoped skin root; backdrop/popup re-assert token scope on themselves. */}
      <AlertDialogPrimitive.Backdrop
        data-skin={skinId()}
        data-effects={skinEffects()}
        className="fixed inset-0 z-[70] bg-[oklch(from_var(--foreground)_l_c_h/var(--overlay-opacity))] backdrop-blur-[var(--backdrop-blur-overlay)] transition-opacity duration-[var(--duration-base)] ease-[var(--ease-standard)] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:bg-[oklch(from_var(--background)_l_c_h/var(--overlay-opacity))]"
      />
      <AlertDialogPrimitive.Popup
        data-skin={skinId()}
        data-effects={skinEffects()}
        data-control-ui="alert-dialog"
        data-slot="content"
        data-surface="modal"
        className={cn(
          "fixed left-1/2 top-[12vh] z-[71] grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 gap-4 rounded-panel border bg-popover backdrop-blur-[var(--backdrop-blur-popover)] p-0 text-popover-foreground shadow-modal outline-none",
          surfaceEnterExitMotionClasses,
          skinSlot("alert-dialog", "content", {}),
          className,
        )}
        {...props}
      >
        {children}
      </AlertDialogPrimitive.Popup>
    </AlertDialogPrimitive.Portal>
  );
}

export function AlertDialogHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-control-ui="alert-dialog"
      data-slot="header"
      className={cn("grid gap-1.5 p-4 pb-0", skinSlot("alert-dialog", "header", {}), className)}
      {...props}
    />
  );
}

export function AlertDialogFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-control-ui="alert-dialog"
      data-slot="footer"
      className={cn("flex flex-col-reverse gap-2 p-4 pt-0 sm:flex-row sm:justify-end", skinSlot("alert-dialog", "footer", {}), className)}
      {...props}
    />
  );
}

export function AlertDialogTitle({ className, ...props }: ComponentProps<"h2">) {
  return (
    <AlertDialogPrimitive.Title
      data-control-ui="alert-dialog"
      data-slot="title"
      className={cn("text-lg font-semibold leading-none tracking-tight", skinSlot("alert-dialog", "title", {}), className)}
      {...props}
    />
  );
}

export function AlertDialogDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <AlertDialogPrimitive.Description
      data-control-ui="alert-dialog"
      data-slot="description"
      className={cn("text-sm text-muted-foreground", skinSlot("alert-dialog", "description", {}), className)}
      {...props}
    />
  );
}
