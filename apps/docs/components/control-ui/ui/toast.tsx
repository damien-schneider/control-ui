"use client";

import type { ToastManagerAddOptions, ToastManagerPromiseOptions, ToastManagerUpdateOptions, ToastObject } from "@base-ui/react/toast";
import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { CircleCheckIcon, CircleXIcon, InfoIcon, TriangleAlertIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import type { PopupKnobStyle } from "@/components/control-ui/knob-contracts/popup-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { PopupCloseButton } from "@/components/control-ui/popup-parts";
import { controlEffectsAttribute } from "@/components/control-ui/skin";
import { useSkin } from "@/components/control-ui/skin-provider";
import { Button, type ButtonProps } from "@/components/control-ui/ui/button";

export type ToasterProps = {
  className?: string;
  timeout?: number;
  limit?: number;
  rootStyle?: CSSProperties & PopupKnobStyle;
  indicatorStyle?: CSSProperties & PopupKnobStyle;
  actionStyle?: ButtonProps["style"];
  closeStyle?: ButtonProps["style"];
  closeLabel?: string;
  successLabel?: string;
  errorLabel?: string;
  warningLabel?: string;
  infoLabel?: string;
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
  message: (title: ReactNode, options?: ToastOptions) => show(title, options),
  promise: <Value,>(promise: Promise<Value>, options: ToastManagerPromiseOptions<Value, object>) =>
    toastManager.promise(promise, {
      ...options,
      error: (reason: unknown) => persistentError(typeof options.error === "function" ? options.error(reason) : options.error),
    }),
  dismiss: (id?: string) => toastManager.close(id),
});

const statusIcons = {
  success: CircleCheckIcon,
  error: CircleXIcon,
  warning: TriangleAlertIcon,
  info: InfoIcon,
};

type ToastStatus = keyof typeof statusIcons;

function isToastStatus(type: string | undefined): type is ToastStatus {
  return type !== undefined && Object.hasOwn(statusIcons, type);
}

export const useToast = ToastPrimitive.useToastManager;

type ToastListProps = Pick<ToasterProps, "rootStyle" | "indicatorStyle" | "actionStyle" | "closeStyle"> & {
  closeLabel: string;
  statusLabels: Record<ToastStatus, string>;
};

function ToastIndicator({ status, style }: { status: ToastStatus | undefined; style: ToasterProps["indicatorStyle"] }) {
  if (!status) return null;
  const StatusIcon = statusIcons[status];
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
      <StatusIcon className="size-4" />
    </span>
  );
}

function ToastText({ entry, statusPrefix }: { entry: ToastObject<object>; statusPrefix: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      {entry.title ? (
        <ToastPrimitive.Title data-control-ui="toast" data-control-family="popup" data-popup-kind="toast" data-slot="title">
          {statusPrefix}
          {entry.title}
        </ToastPrimitive.Title>
      ) : null}
      {entry.description ? (
        <ToastPrimitive.Description data-control-ui="toast" data-control-family="popup" data-popup-kind="toast" data-slot="description">
          {entry.title ? null : statusPrefix}
          {entry.description}
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
  closeLabel = "Dismiss notification",
  successLabel = "Success",
  errorLabel = "Error",
  warningLabel = "Warning",
  infoLabel = "Info",
}: ToasterProps) {
  const skin = useSkin();
  return (
    <ToastPrimitive.Provider toastManager={toastManager} timeout={timeout} limit={limit}>
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport
          data-control-ui="toast"
          data-control-family="popup"
          data-popup-kind="toast"
          data-slot="viewport"
          data-skin={skin.id}
          data-effects={controlEffectsAttribute(skin.effects)}
          className={cn("fixed end-4 bottom-4 z-(--z-toast) mx-auto w-[calc(100vw-2rem)] sm:end-6 sm:bottom-6 sm:w-[22.5rem]", className)}
        >
          <ToastList
            rootStyle={rootStyle}
            indicatorStyle={indicatorStyle}
            actionStyle={actionStyle}
            closeStyle={closeStyle}
            closeLabel={closeLabel}
            statusLabels={{ success: successLabel, error: errorLabel, warning: warningLabel, info: infoLabel }}
          />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  );
}
