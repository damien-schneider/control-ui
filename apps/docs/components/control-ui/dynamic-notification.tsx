"use client";

import type { ChangeEvent, ComponentProps, CSSProperties, KeyboardEvent, MouseEvent, SubmitEvent } from "react";
import { createContext, useContext, useEffect, useId, useMemo, useRef } from "react";
import { createDynamicNotificationGlass } from "@/components/control-ui/dynamic-notification-glass";
import { createDynamicNotificationLiquid } from "@/components/control-ui/dynamic-notification-liquid";
import type { DynamicNotificationProps, DynamicNotificationVariant } from "@/components/control-ui/hooks/use-dynamic-notification";
import { type DynamicNotificationController, useDynamicNotification } from "@/components/control-ui/hooks/use-dynamic-notification";
import type { DynamicNotificationKnobStyle } from "@/components/control-ui/knob-contracts/dynamic-notification-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { Button } from "@/components/control-ui/ui/button";

export type DynamicNotificationState = "collapsed" | "thinking" | "expanded";

type DynamicNotificationWordStyle = CSSProperties & { "--_dynamic-notification-word-index"?: string };

type DynamicNotificationShellContextValue = Pick<DynamicNotificationController, "open" | "disabled" | "setOpen"> & {
  state: DynamicNotificationState;
  variant: DynamicNotificationVariant;
  contentId: string;
};

type DynamicNotificationReplyContextValue = Pick<
  DynamicNotificationController,
  "reply" | "setReply" | "normalizedReply" | "canSubmit" | "clear" | "submitReply" | "handleReplySubmit"
>;

const DynamicNotificationShellContext = createContext<DynamicNotificationShellContextValue | null>(null);
const DynamicNotificationReplyContext = createContext<DynamicNotificationReplyContextValue | null>(null);

function resolveNotificationState(open: boolean, loading: boolean): DynamicNotificationState {
  if (!open) return "collapsed";
  if (loading) return "thinking";
  return "expanded";
}

function useDynamicNotificationShellContext() {
  const context = useContext(DynamicNotificationShellContext);
  if (!context) throw new Error("DynamicNotification compound components must be rendered inside <DynamicNotification>.");
  return context;
}

function useDynamicNotificationReplyContext() {
  const context = useContext(DynamicNotificationReplyContext);
  if (!context) throw new Error("DynamicNotification reply components must be rendered inside <DynamicNotification>.");
  return context;
}

export function useDynamicNotificationContext() {
  const shell = useDynamicNotificationShellContext();
  const reply = useDynamicNotificationReplyContext();
  return { ...shell, ...reply };
}

export function DynamicNotification({
  open,
  defaultOpen,
  onOpenChange,
  loading = false,
  replyValue,
  defaultReplyValue,
  onReplyValueChange,
  onReply,
  variant = "surface",
  disabled = false,
  className,
  children,
  ...props
}: DynamicNotificationProps) {
  const notification = useDynamicNotification({
    open,
    defaultOpen,
    onOpenChange,
    replyValue,
    defaultReplyValue,
    onReplyValueChange,
    onReply,
    disabled,
  });
  const contentId = useId();
  const state = resolveNotificationState(notification.open, loading);
  const shellContext = useMemo(
    () =>
      ({
        open: notification.open,
        disabled: notification.disabled,
        setOpen: notification.setOpen,
        state,
        variant,
        contentId,
      }) satisfies DynamicNotificationShellContextValue,
    [notification.open, notification.disabled, notification.setOpen, state, variant, contentId],
  );
  const replyContext = useMemo(
    () =>
      ({
        reply: notification.reply,
        setReply: notification.setReply,
        normalizedReply: notification.normalizedReply,
        canSubmit: notification.canSubmit,
        clear: notification.clear,
        submitReply: notification.submitReply,
        handleReplySubmit: notification.handleReplySubmit,
      }) satisfies DynamicNotificationReplyContextValue,
    [
      notification.reply,
      notification.setReply,
      notification.normalizedReply,
      notification.canSubmit,
      notification.clear,
      notification.submitReply,
      notification.handleReplySubmit,
    ],
  );

  return (
    <DynamicNotificationShellContext.Provider value={shellContext}>
      <DynamicNotificationReplyContext.Provider value={replyContext}>
        <div
          data-control-ui="dynamic-notification"
          data-control-family="dynamic-notification"
          data-slot="root"
          data-state={state}
          data-variant={variant}
          className={cn("relative flex w-full justify-center", className)}
          {...props}
        >
          {children}
        </div>
      </DynamicNotificationReplyContext.Provider>
    </DynamicNotificationShellContext.Provider>
  );
}

export type DynamicNotificationIslandProps = ComponentProps<"section"> & { style?: CSSProperties & DynamicNotificationKnobStyle };

export function DynamicNotificationIsland({ className, onKeyDown, ...props }: DynamicNotificationIslandProps) {
  const { open, setOpen, state, variant } = useDynamicNotificationShellContext();

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === "Escape" && open) {
      setOpen(false, "escape-key", event.nativeEvent, event.currentTarget);
    }
  }

  return (
    <section
      aria-label="Assistant notification"
      aria-busy={state === "thinking" || undefined}
      data-control-ui="dynamic-notification"
      data-control-family="dynamic-notification"
      data-slot="island"
      data-state={state}
      data-variant={variant}
      onKeyDown={handleKeyDown}
      className={cn("relative isolate overflow-hidden", className)}
      {...props}
    />
  );
}

export type DynamicNotificationGlassProps = ComponentProps<"canvas"> & { style?: CSSProperties & DynamicNotificationKnobStyle };

/** Optional upgrade for variant="glass" — CSS fallback stays underneath. */
export function DynamicNotificationGlass({ className, ...props }: DynamicNotificationGlassProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return createDynamicNotificationGlass(canvas);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      tabIndex={-1}
      data-control-ui="dynamic-notification"
      data-control-family="dynamic-notification"
      data-slot="glass"
      className={cn("pointer-events-none absolute inset-0 -z-10 size-full", className)}
      {...props}
    />
  );
}

export type DynamicNotificationLiquidProps = ComponentProps<"canvas"> & { style?: CSSProperties & DynamicNotificationKnobStyle };

/** WebGL transmits nearest scene through surface while keeping distortion concentrated at its edge. */
export function DynamicNotificationLiquid({ className, ...props }: DynamicNotificationLiquidProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return createDynamicNotificationLiquid(canvas);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      tabIndex={-1}
      data-control-ui="dynamic-notification"
      data-control-family="dynamic-notification"
      data-slot="liquid"
      className={cn("pointer-events-none absolute inset-0 -z-10 size-full", className)}
      {...props}
    />
  );
}

export type DynamicNotificationPillProps = ComponentProps<"button"> & { style?: CSSProperties & DynamicNotificationKnobStyle };

export function DynamicNotificationPill({ className, children, onClick, ...props }: DynamicNotificationPillProps) {
  const { contentId, disabled, open, setOpen } = useDynamicNotificationShellContext();

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    setOpen(true, "trigger-press", event.nativeEvent, event.currentTarget);
  }

  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={contentId}
      // inert, not CSS visibility: it lands with React commit, so tab order is right mid-morph instead of flipping halfway through
      inert={open}
      data-control-ui="dynamic-notification"
      data-control-family="dynamic-notification"
      data-slot="pill"
      onClick={handleClick}
      disabled={disabled}
      className={cn("absolute inset-0 flex cursor-pointer items-center justify-center gap-2 px-4", className)}
      {...props}
    >
      {children}
    </button>
  );
}

export type DynamicNotificationIndicatorProps = ComponentProps<"span"> & { style?: CSSProperties & DynamicNotificationKnobStyle };

/** Breathing orb marking assistant activity; dynamic-notification.css animates it. */
export function DynamicNotificationIndicator({ className, ...props }: DynamicNotificationIndicatorProps) {
  return (
    <span
      aria-hidden="true"
      data-control-ui="dynamic-notification"
      data-control-family="dynamic-notification"
      data-slot="indicator"
      className={cn("size-2 shrink-0", className)}
      {...props}
    />
  );
}

export type DynamicNotificationContentProps = ComponentProps<"div"> & { style?: CSSProperties & DynamicNotificationKnobStyle };

export function DynamicNotificationContent({ className, id, ...props }: DynamicNotificationContentProps) {
  const { contentId, state } = useDynamicNotificationShellContext();

  return (
    <div
      id={id ?? contentId}
      inert={state !== "expanded"}
      data-control-ui="dynamic-notification"
      data-control-family="dynamic-notification"
      data-slot="content"
      className={cn("flex flex-col gap-2.5 px-4 pt-3 pb-3.5", className)}
      {...props}
    />
  );
}

export type DynamicNotificationTitleProps = ComponentProps<"div"> & { style?: CSSProperties & DynamicNotificationKnobStyle };

export function DynamicNotificationTitle({ className, ...props }: DynamicNotificationTitleProps) {
  return (
    <div
      data-control-ui="dynamic-notification"
      data-control-family="dynamic-notification"
      data-slot="title"
      className={cn("flex-1", className)}
      {...props}
    />
  );
}

export type DynamicNotificationMessageProps = Omit<ComponentProps<"p">, "children"> & {
  children: string;
} & { style?: CSSProperties & DynamicNotificationKnobStyle };

export function DynamicNotificationMessage({ className, children, ...props }: DynamicNotificationMessageProps) {
  return (
    <p
      aria-live="polite"
      data-control-ui="dynamic-notification"
      data-control-family="dynamic-notification"
      data-slot="message"
      className={className}
      {...props}
    >
      <DynamicNotificationWords key={children} text={children} />
    </p>
  );
}

function DynamicNotificationWords({ text }: { text: string }) {
  let wordIndex = 0;
  return text.split(/(\s+)/).map((part, position) => {
    if (part.length === 0 || /^\s+$/.test(part)) return part;
    const style: DynamicNotificationWordStyle = { "--_dynamic-notification-word-index": `${wordIndex}` };
    wordIndex += 1;
    return (
      // biome-ignore lint/suspicious/noArrayIndexKey: split positions are stable for a given text; the list remounts wholesale (key={text}) when the message changes.
      <span key={position} data-control-ui="dynamic-notification" data-control-family="dynamic-notification" data-slot="word" style={style}>
        {part}
      </span>
    );
  });
}

export type DynamicNotificationReplyProps = ComponentProps<"form"> & { style?: CSSProperties & DynamicNotificationKnobStyle };

export function DynamicNotificationReply({ className, onSubmit, ...props }: DynamicNotificationReplyProps) {
  const { handleReplySubmit } = useDynamicNotificationReplyContext();

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    onSubmit?.(event);
    if (event.defaultPrevented) return;
    handleReplySubmit(event);
  }

  return (
    <form
      data-control-ui="dynamic-notification"
      data-control-family="dynamic-notification"
      data-slot="reply"
      onSubmit={handleSubmit}
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  );
}

export type DynamicNotificationReplyInputProps = ComponentProps<"input"> & { style?: CSSProperties & DynamicNotificationKnobStyle };

export function DynamicNotificationReplyInput({ className, onChange, disabled, ...props }: DynamicNotificationReplyInputProps) {
  const { disabled: contextDisabled, state } = useDynamicNotificationShellContext();
  const { reply, setReply } = useDynamicNotificationReplyContext();
  const inputRef = useRef<HTMLInputElement | null>(null);

  // waits out the "thinking" phase — content is inert until expanded, so focus would be dropped
  useEffect(() => {
    if (state !== "expanded") return;
    const frame = requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, [state]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange?.(event);
    if (!event.defaultPrevented) setReply(event.currentTarget.value);
  }

  return (
    <input
      ref={inputRef}
      type="text"
      aria-label="Reply"
      data-control-ui="dynamic-notification"
      data-control-family="dynamic-notification"
      data-slot="reply-input"
      value={reply}
      onChange={handleChange}
      disabled={disabled ?? contextDisabled}
      className={cn("h-9 min-w-0 flex-1 px-3.5 disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
}

export type DynamicNotificationReplySubmitProps = ComponentProps<typeof Button>;

export function DynamicNotificationReplySubmit({ className, disabled, children, ...props }: DynamicNotificationReplySubmitProps) {
  const { canSubmit } = useDynamicNotificationReplyContext();

  return (
    <Button
      data-control-ui="dynamic-notification"
      data-dynamic-notification-submit="true"
      data-slot="reply-submit"
      type="submit"
      variant="solid"
      size="lg"
      iconOnly
      shape="circle"
      aria-label="Send reply"
      disabled={disabled ?? !canSubmit}
      className={cn("shrink-0", className)}
      {...props}
    >
      {children ?? (
        <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true" fill="none">
          <path d="M8 12.5v-9M4 7l4-3.5L12 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </Button>
  );
}

export type DynamicNotificationCloseProps = ComponentProps<typeof Button>;

export function DynamicNotificationClose({ className, children, onClick, ...props }: DynamicNotificationCloseProps) {
  const { setOpen } = useDynamicNotificationShellContext();

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    setOpen(false, "close-press", event.nativeEvent, event.currentTarget);
  }

  return (
    <Button
      data-control-ui="dynamic-notification"
      data-dynamic-notification-close="true"
      data-slot="close"
      variant="quiet"
      size="sm"
      iconOnly
      shape="circle"
      aria-label="Dismiss"
      onClick={handleClick}
      className={cn("-mr-1.5 shrink-0", className)}
      {...props}
    >
      {children ?? (
        <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true" fill="none">
          <path d="M4 4 12 12M12 4 4 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      )}
    </Button>
  );
}
