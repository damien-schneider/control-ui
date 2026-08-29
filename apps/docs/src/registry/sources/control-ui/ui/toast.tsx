"use client";

import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import type { CSSProperties, ReactNode } from "react";
import type { PopupKnobStyle } from "@/components/control-ui/knob-contracts/popup-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { skinEffects, skinId } from "@/components/control-ui/skin";

export type ToasterProps = {
  className?: string;
  timeout?: number;
  limit?: number;
  rootStyle?: CSSProperties & PopupKnobStyle;
  indicatorStyle?: CSSProperties & PopupKnobStyle;
  actionStyle?: CSSProperties & PopupKnobStyle;
  closeStyle?: CSSProperties & PopupKnobStyle;
};

// Base UI's Toast manager, not sonner, behind module-level manager so `toast()` stays callable anywhere.

// shared by imperative `toast()` API and the <Toaster /> Provider
export const toastManager = ToastPrimitive.createToastManager();

type ToastOptions = Omit<Parameters<typeof toastManager.add>[0], "title">;

function withType(type: string) {
  return (title: ReactNode, options?: ToastOptions) => toastManager.add({ title, type, ...options });
}

// callable object, so sonner-shaped surface holds
export const toast = Object.assign((title: ReactNode, options?: ToastOptions) => toastManager.add({ title, ...options }), {
  success: withType("success"),
  error: withType("error"),
  warning: withType("warning"),
  info: withType("info"),
  message: (title: ReactNode, options?: ToastOptions) => toastManager.add({ title, ...options }),
  promise: (...args: Parameters<typeof toastManager.promise>) => toastManager.promise(...args),
  dismiss: (id?: string) => toastManager.close(id),
});

// lets custom viewport read live toast list inside Provider
export const useToast = ToastPrimitive.useToastManager;

function ToastList({
  rootStyle,
  indicatorStyle,
  actionStyle,
  closeStyle,
}: Pick<ToasterProps, "rootStyle" | "indicatorStyle" | "actionStyle" | "closeStyle">) {
  const { toasts } = ToastPrimitive.useToastManager();
  return toasts.map((entry) => {
    return (
      <ToastPrimitive.Root
        key={entry.id}
        toast={entry}
        data-control-ui="toast"
        data-control-family="popup"
        data-popup-kind="toast"
        data-popup-part="surface"
        data-type={entry.type ?? "message"}
        style={rootStyle}
        data-slot="root"
        data-surface="floating"
        className={cn(
          "[--gap:0.75rem] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))]",
          "absolute right-0 bottom-0 left-auto z-[calc(1000-var(--toast-index))] h-[var(--height)] w-full select-none data-[expanded]:h-[var(--toast-height)]",
          "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
        )}
      >
        <ToastPrimitive.Content
          data-control-ui="toast"
          data-control-family="popup"
          data-popup-kind="toast"
          data-slot="content"
          className="flex items-start"
        >
          {entry.type && entry.type !== "message" ? (
            <span
              aria-hidden="true"
              data-control-ui="toast"
              data-control-family="popup"
              data-popup-kind="toast"
              data-slot="indicator"
              style={indicatorStyle}
              className="shrink-0"
            />
          ) : null}
          <div className="flex min-w-0 flex-1 flex-col">
            {entry.title ? (
              <ToastPrimitive.Title data-control-ui="toast" data-control-family="popup" data-popup-kind="toast" data-slot="title" />
            ) : null}
            {entry.description ? (
              <ToastPrimitive.Description
                data-control-ui="toast"
                data-control-family="popup"
                data-popup-kind="toast"
                data-slot="description"
              />
            ) : null}
          </div>
          {entry.actionProps ? (
            <ToastPrimitive.Action
              data-control-ui="toast"
              data-control-family="popup"
              data-popup-kind="toast"
              data-slot="action"
              style={actionStyle}
              className="shrink-0 cursor-pointer"
            />
          ) : null}
          <ToastPrimitive.Close
            data-control-ui="toast"
            data-control-family="popup"
            data-popup-kind="toast"
            data-slot="close"
            style={closeStyle}
            aria-label="Close"
            className="shrink-0 cursor-pointer"
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

// Mount once at app root — every toast() lands here, and portalled viewport re-asserts skin scope.
export function Toaster({ className, timeout, limit, rootStyle, indicatorStyle, actionStyle, closeStyle }: ToasterProps) {
  return (
    <ToastPrimitive.Provider toastManager={toastManager} timeout={timeout} limit={limit}>
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport
          data-control-ui="toast"
          data-control-family="popup"
          data-popup-kind="toast"
          data-slot="viewport"
          data-skin={skinId()}
          data-effects={skinEffects()}
          className={cn("fixed right-4 bottom-4 z-[95] mx-auto w-[calc(100vw-2rem)] sm:right-6 sm:bottom-6 sm:w-[22.5rem]", className)}
        >
          <ToastList rootStyle={rootStyle} indicatorStyle={indicatorStyle} actionStyle={actionStyle} closeStyle={closeStyle} />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  );
}
