"use client";

import type { ToastManagerAddOptions, ToastManagerPromiseOptions, ToastManagerUpdateOptions, ToastObject } from "@base-ui/react/toast";
import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { CircleCheckIcon, CircleXIcon, InfoIcon, TriangleAlertIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import type { PopupKnobStyle } from "@/components/control-ui/knob-contracts/popup-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { PopupCloseButton } from "@/components/control-ui/popup-parts";
import { skinScopeAttributes } from "@/components/control-ui/skin";
import { useSkin } from "@/components/control-ui/skin-provider";
import { Button, type ButtonProps } from "@/components/control-ui/ui/button";
import { Spinner } from "@/components/control-ui/ui/spinner";

export type ToasterProps = {
  className?: string;
  timeout?: number;
  limit?: number;
  rootStyle?: CSSProperties & PopupKnobStyle;
  indicatorStyle?: CSSProperties & PopupKnobStyle;
  actionStyle?: ButtonProps["style"];
  closeStyle?: ButtonProps["style"];
  label?: string;
  closeLabel?: string;
  successLabel?: string;
  errorLabel?: string;
  warningLabel?: string;
  infoLabel?: string;
  loadingLabel?: string;
};

export const toastManager = ToastPrimitive.createToastManager();

type ToastOptions = Omit<ToastManagerAddOptions<object>, "title">;
type ToastUpdate = ToastManagerUpdateOptions<object>;

const errorDefaults: ToastUpdate = { timeout: 0, priority: "high" };

function persistenceDefaults(options: ToastOptions): ToastUpdate | undefined {
  if (options.type === "error") return errorDefaults;
  return options.actionProps ? { timeout: 0 } : undefined;
}

function show(title: ReactNode, options: ToastOptions = {}) {
  return toastManager.add({ title, ...persistenceDefaults(options), ...options });
}

function withType(type: string) {
  return (title: ReactNode, options?: ToastOptions) => show(title, { type, ...options });
}

function persistentError(update: string | ToastUpdate): ToastUpdate {
  return typeof update === "string" ? { ...errorDefaults, description: update } : { ...errorDefaults, ...update };
}

export const toast = Object.assign(show, {
  success: withType("success"),
  error: withType("error"),
  warning: withType("warning"),
  info: withType("info"),
  /** Stays until it is updated or dismissed: resolve it with `toastManager.update(id, …)` or `toast.dismiss(id)`. */
  loading: withType("loading"),
  message: (title: ReactNode, options?: ToastOptions) => show(title, options),
  promise: <Value,>(promise: Promise<Value>, options: ToastManagerPromiseOptions<Value, object>) => {
    const settled = toastManager.promise(promise, {
      ...options,
      error: (reason: unknown) => persistentError(typeof options.error === "function" ? options.error(reason) : options.error),
    });
    // The error toast already reports the failure, so a caller that does not await must not get an unhandled rejection.
    settled.catch(() => {});
    return settled;
  },
  dismiss: (id?: string) => toastManager.close(id),
});

const statusIcons = {
  success: CircleCheckIcon,
  error: CircleXIcon,
  warning: TriangleAlertIcon,
  info: InfoIcon,
};

type ToastStatus = keyof typeof statusIcons | "loading";

function isToastStatus(type: string | undefined): type is ToastStatus {
  return type === "loading" || (type !== undefined && Object.hasOwn(statusIcons, type));
}

export const useToast = ToastPrimitive.useToastManager;

type ToastListProps = Pick<ToasterProps, "rootStyle" | "indicatorStyle" | "actionStyle" | "closeStyle"> & {
  closeLabel: string;
  statusLabels: Record<ToastStatus, string>;
};

function ToastIndicator({ status, style }: { status: ToastStatus | undefined; style: ToasterProps["indicatorStyle"] }) {
  if (!status) return null;
  const StatusIcon = status === "loading" ? null : statusIcons[status];
  return (
    <span
      aria-hidden="true"
      data-control-ui="toast"
      data-control-family="popup"
      data-popup-kind="toast"
      data-slot="indicator"
      style={style}
      className="shrink-0"
    >
      {StatusIcon ? <StatusIcon /> : <Spinner size="sm" />}
    </span>
  );
}

// A toast with one line of text shows it as its title, so the toast always has an accessible name.
function ToastText({ entry, statusPrefix }: { entry: ToastObject<object>; statusPrefix: ReactNode }) {
  const title = entry.title || entry.description;
  const description = entry.title ? entry.description : null;
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      {title ? (
        <ToastPrimitive.Title data-control-ui="toast" data-control-family="popup" data-popup-kind="toast" data-slot="title">
          {statusPrefix}
          {title}
        </ToastPrimitive.Title>
      ) : null}
      {description ? (
        <ToastPrimitive.Description data-control-ui="toast" data-control-family="popup" data-popup-kind="toast" data-slot="description">
          {description}
        </ToastPrimitive.Description>
      ) : null}
    </div>
  );
}

function ToastList({ rootStyle, indicatorStyle, actionStyle, closeStyle, closeLabel, statusLabels }: ToastListProps) {
  const { toasts } = ToastPrimitive.useToastManager();
  return toasts.map((entry) => {
    const status = isToastStatus(entry.type) ? entry.type : undefined;
    const statusPrefix = status ? <span className="sr-only">{`${statusLabels[status]}: `}</span> : null;
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
          "absolute end-0 bottom-0 z-[calc(var(--z-toast)-var(--toast-index))] h-[var(--height)] w-full select-none data-[expanded]:h-[var(--toast-height)]",
          "after:absolute after:top-full after:start-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
        )}
      >
        <ToastPrimitive.Content
          data-control-ui="toast"
          data-control-family="popup"
          data-popup-kind="toast"
          data-slot="content"
          className="flex items-start"
        >
          <ToastIndicator status={status} style={indicatorStyle} />
          <ToastText entry={entry} statusPrefix={statusPrefix} />
          {entry.actionProps ? (
            <ToastPrimitive.Action
              style={actionStyle}
              onClick={(event) => {
                if (!event.defaultPrevented) toastManager.close(entry.id);
              }}
              render={(renderProps) => (
                <Button {...renderProps} data-popup-kind="toast" data-popup-part="action" variant="surface" size="xs" />
              )}
            />
          ) : null}
          <ToastPrimitive.Close
            style={closeStyle}
            render={(renderProps) => <PopupCloseButton {...renderProps} data-popup-kind="toast" label={closeLabel} variant="quiet" />}
          />
        </ToastPrimitive.Content>
      </ToastPrimitive.Root>
    );
  });
}

export function Toaster({
  className,
  timeout,
  limit,
  rootStyle,
  indicatorStyle,
  actionStyle,
  closeStyle,
  label = "Notifications",
  closeLabel = "Dismiss notification",
  successLabel = "Success",
  errorLabel = "Error",
  warningLabel = "Warning",
  infoLabel = "Info",
  loadingLabel = "Loading",
}: ToasterProps) {
  const skin = useSkin();
  return (
    <ToastPrimitive.Provider toastManager={toastManager} timeout={timeout} limit={limit}>
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport
          aria-label={label}
          data-control-ui="toast"
          data-control-family="popup"
          data-popup-kind="toast"
          data-slot="viewport"
          {...skinScopeAttributes(skin)}
          className={cn(
            "fixed end-4 bottom-[max(--spacing(4),env(safe-area-inset-bottom))] z-(--z-toast) mx-auto w-[calc(100vw-2rem)] sm:end-6 sm:bottom-[max(--spacing(6),env(safe-area-inset-bottom))] sm:w-[22.5rem]",
            className,
          )}
        >
          <ToastList
            rootStyle={rootStyle}
            indicatorStyle={indicatorStyle}
            actionStyle={actionStyle}
            closeStyle={closeStyle}
            closeLabel={closeLabel}
            statusLabels={{ success: successLabel, error: errorLabel, warning: warningLabel, info: infoLabel, loading: loadingLabel }}
          />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  );
}
