"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import type { OpenChangeEventDetails } from "@/components/control-ui/control-props";
import type { PopupKnobStyle } from "@/components/control-ui/knob-contracts/popup-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { skinAdornment, skinEffects, skinId } from "@/components/control-ui/skin";
import type { ButtonProps } from "@/components/control-ui/ui/button";
import { Button } from "@/components/control-ui/ui/button";

export type DialogProps = {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, eventDetails: OpenChangeEventDetails) => void;
};

export type DialogContentProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & PopupKnobStyle } & {
  showCloseButton?: boolean;
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
  Pick<ButtonProps, "variant" | "size" | "tone">;

export function DialogClose({ className, children, variant = "surface", size = "sm", tone = "neutral", ...props }: DialogCloseProps) {
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
          className={cn(renderProps.className, className)}
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
      {/* portal lands outside container-scoped skin root, so scope is re-asserted here */}
      <DialogPrimitive.Backdrop
        data-control-ui="dialog"
        data-popup-kind="dialog"
        data-slot="backdrop"
        data-control-family="popup"
        data-popup-part="backdrop"
        data-skin={skinId()}
        data-effects={skinEffects()}
        className="fixed inset-0 z-[70]"
      />
      <DialogPrimitive.Popup
        data-skin={skinId()}
        data-effects={skinEffects()}
        data-control-ui="dialog"
        data-popup-kind="dialog"
        data-slot="content"
        data-control-family="popup"
        data-popup-part="surface"
        data-surface="modal"
        className={cn("fixed left-1/2 top-[12vh] z-[71] grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 gap-4 p-0", className)}
        {...props}
      >
        {skinAdornment("dialog", "titlebar", {})}
        {children}
        {showCloseButton ? (
          <DialogClose variant="ghost" size="xs" className="absolute right-3 top-3 w-[var(--control-h-xs)] px-0">
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

export function DialogHeader({ className, ...props }: ComponentProps<"div"> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    <div
      data-control-ui="dialog"
      data-control-family="popup"
      data-popup-kind="dialog"
      data-slot="header"
      className={cn("grid gap-1.5 p-4 pb-0", className)}
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
      className={cn("flex flex-col-reverse gap-2 p-4 pt-0 sm:flex-row sm:justify-end", className)}
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
