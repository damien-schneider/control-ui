"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import type { ComponentProps } from "react";
import type { ButtonProps, DialogContentProps, DialogProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinAdornment, skinEffects, skinId, skinSlot } from "@/components/control-ui/skin";
import { surfaceEnterExitMotionClasses } from "@/components/control-ui/surface-variants";
import { Button } from "@/components/control-ui/ui/button";

// Panel uses --radius-panel + shadow-modal, tracks theme (square+flat under square DA, soft+floating under default).
export function Dialog(props: DialogProps) {
  return <DialogPrimitive.Root {...props} />;
}

export function DialogTrigger({ className, ...props }: ComponentProps<typeof DialogPrimitive.Trigger>) {
  return (
    <DialogPrimitive.Trigger
      data-control-ui="dialog"
      data-slot="trigger"
      className={cn(skinSlot("dialog", "trigger", {}), className)}
      {...props}
    />
  );
}

export type DialogCloseProps = Omit<ComponentProps<typeof DialogPrimitive.Close>, "render"> &
  Pick<ButtonProps, "variant" | "size" | "tone">;

export function DialogClose({ className, children, variant = "surface", size = "sm", tone = "neutral", ...props }: DialogCloseProps) {
  return (
    <DialogPrimitive.Close
      {...props}
      render={(renderProps) => (
        <Button
          {...renderProps}
          data-control-ui="dialog"
          data-slot="close"
          variant={variant}
          size={size}
          tone={tone}
          className={cn(renderProps.className, skinSlot("dialog", "close", {}), className)}
        >
          {children}
        </Button>
      )}
    />
  );
}

export function DialogContent({ className, children, showCloseButton = true, ...props }: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      {/* Portals land outside container-scoped skin root; backdrop/popup re-assert token scope on themselves. */}
      <DialogPrimitive.Backdrop
        data-skin={skinId()}
        data-effects={skinEffects()}
        className="fixed inset-0 z-[70] bg-[oklch(from_var(--foreground)_l_c_h/var(--overlay-opacity))] backdrop-blur-[var(--backdrop-blur-overlay)] transition-opacity duration-[var(--duration-base)] ease-[var(--ease-standard)] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:bg-[oklch(from_var(--background)_l_c_h/var(--overlay-opacity))]"
      />
      <DialogPrimitive.Popup
        data-skin={skinId()}
        data-effects={skinEffects()}
        data-control-ui="dialog"
        data-slot="content"
        data-surface="modal"
        className={cn(
          "fixed left-1/2 top-[12vh] z-[71] grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 gap-4 rounded-panel border bg-popover backdrop-blur-[var(--backdrop-blur-popover)] p-0 text-popover-foreground shadow-modal outline-none",
          surfaceEnterExitMotionClasses,
          skinSlot("dialog", "content", {}),
          className,
        )}
        {...props}
      >
        {skinAdornment("dialog", "titlebar", {})}
        {children}
        {showCloseButton ? (
          <DialogClose
            variant="ghost"
            size="xs"
            className="absolute right-3 top-3 w-[var(--control-h-xs)] px-0 opacity-70 hover:opacity-100"
          >
            <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true" fill="none">
              <path d="M4 4 12 12M12 4 4 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <span className="sr-only">Close</span>
          </DialogClose>
        ) : null}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-control-ui="dialog"
      data-slot="header"
      className={cn("grid gap-1.5 p-4 pb-0", skinSlot("dialog", "header", {}), className)}
      {...props}
    />
  );
}

export function DialogFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-control-ui="dialog"
      data-slot="footer"
      className={cn("flex flex-col-reverse gap-2 p-4 pt-0 sm:flex-row sm:justify-end", skinSlot("dialog", "footer", {}), className)}
      {...props}
    />
  );
}

export function DialogTitle({ className, ...props }: ComponentProps<"h2">) {
  return (
    <DialogPrimitive.Title
      data-control-ui="dialog"
      data-slot="title"
      className={cn("text-lg font-semibold leading-none tracking-tight", skinSlot("dialog", "title", {}), className)}
      {...props}
    />
  );
}

export function DialogDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <DialogPrimitive.Description
      data-control-ui="dialog"
      data-slot="description"
      className={cn("text-sm text-muted-foreground", skinSlot("dialog", "description", {}), className)}
      {...props}
    />
  );
}
