"use client";

import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import type { ReactNode } from "react";
import { cn } from "@/components/control-ui/lib/cn";
import { skinEffects, skinId, skinSlot } from "@/components/control-ui/skin";
import { floatingSurfaceClasses } from "@/components/control-ui/surface-variants";

// Toast on Base UI's Toast manager (no sonner); module-level manager gives sonner-shaped DX (toast("Saved"), toast.error(), toast.promise()) callable anywhere, <Toaster/> mounts Provider+Viewport once at root.
// Card rides popover token set (--radius-popover, shadow-pop), re-asserts skin scope on its portal.
// Base UI stamps data-type on card so a pack can colour per variant via skin.css.

// One global manager shared by the imperative `toast()` API and the <Toaster /> Provider.
export const toastManager = ToastPrimitive.createToastManager();

type ToastOptions = Omit<Parameters<typeof toastManager.add>[0], "title">;

function withType(type: string) {
  return (title: ReactNode, options?: ToastOptions) => toastManager.add({ title, type, ...options });
}

// Callable object: `toast("…")` plus semantic variants, promise, and dismiss — the sonner surface.
export const toast = Object.assign((title: ReactNode, options?: ToastOptions) => toastManager.add({ title, ...options }), {
  success: withType("success"),
  error: withType("error"),
  warning: withType("warning"),
  info: withType("info"),
  message: (title: ReactNode, options?: ToastOptions) => toastManager.add({ title, ...options }),
  promise: (...args: Parameters<typeof toastManager.promise>) => toastManager.promise(...args),
  dismiss: (id?: string) => toastManager.close(id),
});

// Re-export the hook so a custom viewport can read the live toast list inside the Provider.
export const useToast = ToastPrimitive.useToastManager;

// error/destructive = only status colour token contract exposes; other variants stay neutral (pack colours via data-type). Dot only renders for typed toasts.
function dotClass(type: string | undefined) {
  if (!type || type === "message") return undefined;
  return type === "error" ? "bg-destructive" : "bg-foreground";
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager();
  return toasts.map((entry) => {
    const dot = dotClass(entry.type);
    return (
      <ToastPrimitive.Root
        key={entry.id}
        toast={entry}
        data-control-ui="toast"
        data-slot="root"
        data-surface="floating"
        // Base UI's canonical stack physics (index-driven offset/scale, swipe+expand transforms), tokenised (popover surface, shadow-pop, theme durations) so motion kill-switch flattens it too.
        className={cn(
          "[--gap:0.75rem] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))]",
          "absolute right-0 bottom-0 left-auto z-[calc(1000-var(--toast-index))] w-full origin-bottom select-none",
          floatingSurfaceClasses,
          "transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))]",
          "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
          "data-[ending-style]:opacity-0 data-[limited]:opacity-0 data-[expanded]:transform-[translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))] data-[starting-style]:transform-[translateY(150%)]",
          "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:transform-[translateY(150%)]",
          "data-[ending-style]:data-[swipe-direction=down]:transform-[translateY(calc(var(--toast-swipe-movement-y)+150%))] data-[ending-style]:data-[swipe-direction=up]:transform-[translateY(calc(var(--toast-swipe-movement-y)-150%))]",
          "data-[ending-style]:data-[swipe-direction=left]:transform-[translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-[ending-style]:data-[swipe-direction=right]:transform-[translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
          "h-[var(--height)] data-[expanded]:h-[var(--toast-height)] [transition:transform_var(--duration-slow)_var(--ease-emphasized),opacity_var(--duration-slow),height_var(--duration-fast)]",
          skinSlot("toast", "root", {}),
        )}
      >
        <ToastPrimitive.Content className="flex items-start gap-3 p-3 transition-opacity duration-[var(--duration-base)] data-[behind]:opacity-0 data-[expanded]:opacity-100">
          {dot ? <span aria-hidden="true" className={cn("mt-1.5 size-2 shrink-0 rounded-full", dot)} /> : null}
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            {entry.title ? (
              <ToastPrimitive.Title
                data-control-ui="toast"
                data-slot="title"
                className={cn("text-sm font-semibold leading-none tracking-tight", skinSlot("toast", "title", {}))}
              />
            ) : null}
            {entry.description ? (
              <ToastPrimitive.Description
                data-control-ui="toast"
                data-slot="description"
                className={cn("text-sm text-muted-foreground", skinSlot("toast", "description", {}))}
              />
            ) : null}
          </div>
          {entry.actionProps ? (
            <ToastPrimitive.Action
              data-control-ui="toast"
              data-slot="action"
              className={cn(
                "shrink-0 cursor-pointer rounded-[var(--radius-control)] px-2 py-1 text-xs font-medium text-foreground ring-1 ring-inset ring-border transition hover:bg-foreground/6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20",
                skinSlot("toast", "action", {}),
              )}
            />
          ) : null}
          <ToastPrimitive.Close
            data-control-ui="toast"
            data-slot="close"
            aria-label="Close"
            className={cn(
              "-mr-1 -mt-1 shrink-0 cursor-pointer rounded-[var(--radius-control)] p-1 text-muted-foreground opacity-70 transition hover:bg-muted hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20",
              skinSlot("toast", "close", {}),
            )}
          >
            <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true" fill="none">
              <path d="M4 4 12 12M12 4 4 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </ToastPrimitive.Close>
        </ToastPrimitive.Content>
      </ToastPrimitive.Root>
    );
  });
}

// Mount once at app root; reads global manager so toast() from anywhere lands here. Viewport re-asserts skin scope (portals outside token-scoped ancestor).
export function Toaster({ className, timeout, limit }: { className?: string; timeout?: number; limit?: number }) {
  return (
    <ToastPrimitive.Provider toastManager={toastManager} timeout={timeout} limit={limit}>
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport
          data-skin={skinId()}
          data-effects={skinEffects()}
          className={cn(
            "fixed right-4 bottom-4 z-[95] mx-auto w-[calc(100vw-2rem)] outline-none sm:right-6 sm:bottom-6 sm:w-[22.5rem]",
            className,
          )}
        >
          <ToastList />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  );
}
