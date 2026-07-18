"use client";

import type { ComponentProps } from "react";
import { createContext, useContext, useState, useSyncExternalStore } from "react";
import type { OpenChangeEventDetails, ResponsiveDialogContentProps, ResponsiveDialogProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { Button } from "@/components/control-ui/ui/button";
import {
  Dialog,
  DialogClose,
  type DialogCloseProps,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/control-ui/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/control-ui/ui/drawer";

const MOBILE_QUERY = "(max-width: 767px)";
const ResponsiveDialogContext = createContext<boolean | null>(null);

function subscribeToMobileDialog(onStoreChange: () => void) {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener("change", onStoreChange);
  return () => query.removeEventListener("change", onStoreChange);
}

function getMobileDialogSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

function getMobileDialogServerSnapshot() {
  return false;
}

function useResponsiveDialogContext() {
  const isMobile = useContext(ResponsiveDialogContext);
  if (isMobile === null) throw new Error("Responsive dialog parts must be used within ResponsiveDialog");
  return isMobile;
}

export function ResponsiveDialog({ open: controlledOpen, defaultOpen = false, onOpenChange, children }: ResponsiveDialogProps) {
  const isMobile = useSyncExternalStore(subscribeToMobileDialog, getMobileDialogSnapshot, getMobileDialogServerSnapshot);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;

  function handleOpenChange(nextOpen: boolean, eventDetails: OpenChangeEventDetails) {
    if (controlledOpen === undefined) setUncontrolledOpen(nextOpen);
    onOpenChange?.(nextOpen, eventDetails);
  }

  return (
    <ResponsiveDialogContext.Provider value={isMobile}>
      {isMobile ? (
        <Drawer open={open} onOpenChange={handleOpenChange} side="bottom">
          {children}
        </Drawer>
      ) : (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          {children}
        </Dialog>
      )}
    </ResponsiveDialogContext.Provider>
  );
}

export function ResponsiveDialogTrigger(props: ComponentProps<typeof DialogTrigger>) {
  const isMobile = useResponsiveDialogContext();
  return isMobile ? <DrawerTrigger {...props} /> : <DialogTrigger {...props} />;
}

export function ResponsiveDialogClose({
  className,
  children,
  variant = "surface",
  size = "sm",
  tone = "neutral",
  ...props
}: DialogCloseProps) {
  const isMobile = useResponsiveDialogContext();

  if (!isMobile) {
    return (
      <DialogClose className={className} variant={variant} size={size} tone={tone} {...props}>
        {children}
      </DialogClose>
    );
  }

  return (
    <DrawerClose
      {...props}
      render={(renderProps) => (
        <Button {...renderProps} variant={variant} size={size} tone={tone} className={cn(renderProps.className, className)}>
          {children}
        </Button>
      )}
    />
  );
}

export function ResponsiveDialogContent({
  className,
  dialogClassName,
  drawerClassName,
  children,
  showCloseButton = true,
  ...props
}: ResponsiveDialogContentProps) {
  const isMobile = useResponsiveDialogContext();

  if (!isMobile) {
    return (
      <DialogContent className={cn(className, dialogClassName)} showCloseButton={showCloseButton} {...props}>
        {children}
      </DialogContent>
    );
  }

  return (
    <DrawerContent className={cn("relative pb-[max(1rem,env(safe-area-inset-bottom))]", className, drawerClassName)} {...props}>
      {children}
      {showCloseButton ? (
        <ResponsiveDialogClose
          variant="ghost"
          size="xs"
          className="absolute right-3 top-3 w-[var(--control-h-xs)] px-0 opacity-70 hover:opacity-100"
        >
          <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true" fill="none">
            <path d="M4 4 12 12M12 4 4 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <span className="sr-only">Close</span>
        </ResponsiveDialogClose>
      ) : null}
    </DrawerContent>
  );
}

export function ResponsiveDialogHeader(props: ComponentProps<typeof DialogHeader>) {
  const isMobile = useResponsiveDialogContext();
  return isMobile ? <DrawerHeader {...props} /> : <DialogHeader {...props} />;
}

export function ResponsiveDialogFooter(props: ComponentProps<typeof DialogFooter>) {
  const isMobile = useResponsiveDialogContext();
  return isMobile ? <DrawerFooter {...props} /> : <DialogFooter {...props} />;
}

export function ResponsiveDialogTitle(props: ComponentProps<typeof DialogTitle>) {
  const isMobile = useResponsiveDialogContext();
  return isMobile ? <DrawerTitle {...props} /> : <DialogTitle {...props} />;
}

export function ResponsiveDialogDescription(props: ComponentProps<typeof DialogDescription>) {
  const isMobile = useResponsiveDialogContext();
  return isMobile ? <DrawerDescription {...props} /> : <DialogDescription {...props} />;
}
