"use client";

import type { ChangeEvent, ComponentProps, CSSProperties, KeyboardEvent, MouseEvent, SubmitEvent } from "react";
import { createContext, useContext, useEffect, useId, useRef } from "react";

import type { DynamicNotificationProps, DynamicNotificationState, DynamicNotificationVariant } from "@/components/control-ui/contracts";
import { createDynamicNotificationGlass } from "@/components/control-ui/dynamic-notification-glass";
import { createDynamicNotificationLiquid } from "@/components/control-ui/dynamic-notification-liquid";
import { useDynamicNotification } from "@/components/control-ui/hooks/use-dynamic-notification";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";
import { Button } from "@/components/control-ui/ui/button";

/*
 * Dynamic Island-style AI notification: a resident pill that receives a message and morphs into a
 * reply bubble on press. Anatomy is variant-agnostic; `variant` only swaps the island MATERIAL:
 * "surface" rides the popover token set (clean, theme-driven), "glass" is the backdrop-blurred black→glass
 * gradient — CSS fallback always, <DynamicNotificationGlass> upgrades it to the WebGL material —
 * and "liquid" uses an unfiltered CSS fallback while <DynamicNotificationLiquid> rasterizes the
 * scene for WebGL transmission, edge refraction, and highlights.
 * Lifecycle: collapsed → "thinking" (open + loading: intermediate blob, aurora animating while the
 * model answers) → expanded (answer + reply). Morph + text choreography live in
 * dynamic-notification.css (token-driven, kill-switch flattens).
 */

type DynamicNotificationContextValue = ReturnType<typeof useDynamicNotification> & {
  state: DynamicNotificationState;
  variant: DynamicNotificationVariant;
  contentId: string;
};

const DynamicNotificationContext = createContext<DynamicNotificationContextValue | null>(null);

const materialClassesByVariant = {
  surface: "bg-popover text-popover-foreground shadow-pop ring-1 ring-inset ring-border backdrop-blur-[var(--backdrop-blur-popover)]",
  glass: "text-white shadow-pop ring-1 ring-inset ring-white/12",
  liquid: "text-white text-shadow-[0_1px_2px_oklch(0_0_0/0.25)]",
} satisfies Record<DynamicNotificationVariant, string>;

function resolveNotificationState(open: boolean, loading: boolean): DynamicNotificationState {
  if (!open) return "collapsed";
  if (loading) return "thinking";
  return "expanded";
}

export function useDynamicNotificationContext() {
  const context = useContext(DynamicNotificationContext);
  if (!context) throw new Error("DynamicNotification compound components must be rendered inside <DynamicNotification>.");
  return context;
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

  return (
    <DynamicNotificationContext.Provider value={{ ...notification, state, variant, contentId }}>
      <div
        data-control-ui="dynamic-notification"
        data-slot="root"
        data-state={state}
        data-variant={variant}
        className={cn("relative flex w-full justify-center", skinSlot("dynamic-notification", "root", { state, variant }), className)}
        {...props}
      >
        {children}
      </div>
    </DynamicNotificationContext.Provider>
  );
}

export type DynamicNotificationIslandProps = ComponentProps<"section">;

export function DynamicNotificationIsland({ className, onKeyDown, ...props }: DynamicNotificationIslandProps) {
  const context = useDynamicNotificationContext();
  const materialClasses = materialClassesByVariant[context.variant];

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === "Escape" && context.open) {
      context.setOpen(false, "escape-key", event.nativeEvent, event.currentTarget);
    }
  }

  return (
    <section
      aria-label="Assistant notification"
      aria-busy={context.state === "thinking" || undefined}
      data-control-ui="dynamic-notification"
      data-slot="island"
      data-state={context.state}
      data-variant={context.variant}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative isolate overflow-hidden outline-none",
        // glass/liquid MATERIALS are painted by dynamic-notification.css (fallbacks) + the optional WebGL canvases.
        materialClasses,
        skinSlot("dynamic-notification", "island", { state: context.state, variant: context.variant }),
        className,
      )}
      {...props}
    />
  );
}

export type DynamicNotificationGlassProps = ComponentProps<"canvas">;

/** WebGL liquid-glass layer for variant="glass"; render nothing else changes — CSS fallback stays underneath. */
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
      data-slot="glass"
      className={cn("pointer-events-none absolute inset-0 -z-10 size-full", skinSlot("dynamic-notification", "glass", {}), className)}
      {...props}
    />
  );
}

export type DynamicNotificationLiquidProps = ComponentProps<"canvas">;

/** WebGL transmits the nearest scene through the surface while keeping distortion concentrated at its edge. */
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
      data-slot="liquid"
      className={cn("pointer-events-none absolute inset-0 -z-10 size-full", skinSlot("dynamic-notification", "liquid", {}), className)}
      {...props}
    />
  );
}

export type DynamicNotificationPillProps = ComponentProps<"button">;

/** Collapsed face; pressing it expands the bubble ("tap to answer"). */
export function DynamicNotificationPill({ className, children, onClick, ...props }: DynamicNotificationPillProps) {
  const context = useDynamicNotificationContext();

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    context.setOpen(true, "trigger-press", event.nativeEvent, event.currentTarget);
  }

  return (
    <button
      type="button"
      aria-expanded={context.open}
      aria-controls={context.contentId}
      // inert (not CSS visibility) gates focus/a11y: it lands with the React commit, so tab order is
      // correct mid-morph (visibility's discrete transition only flips halfway through).
      inert={context.open}
      data-control-ui="dynamic-notification"
      data-slot="pill"
      onClick={handleClick}
      disabled={context.disabled}
      className={cn(
        "absolute inset-0 flex cursor-pointer items-center justify-center gap-2 px-4 text-caption font-medium outline-none",
        "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-current/25",
        skinSlot("dynamic-notification", "pill", {}),
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export type DynamicNotificationIndicatorProps = ComponentProps<"span">;

/** Siri-colored breathing orb marking assistant activity (pure CSS; the css file animates it). */
export function DynamicNotificationIndicator({ className, ...props }: DynamicNotificationIndicatorProps) {
  return (
    <span
      aria-hidden="true"
      data-control-ui="dynamic-notification"
      data-slot="indicator"
      className={cn("size-2 shrink-0 rounded-full", skinSlot("dynamic-notification", "indicator", {}), className)}
      {...props}
    />
  );
}

export type DynamicNotificationContentProps = ComponentProps<"div">;

export function DynamicNotificationContent({ className, id, ...props }: DynamicNotificationContentProps) {
  const context = useDynamicNotificationContext();

  return (
    <div
      id={id ?? context.contentId}
      inert={context.state !== "expanded"}
      data-control-ui="dynamic-notification"
      data-slot="content"
      className={cn(
        "flex w-[min(var(--dn-expanded-width),100%)] flex-col gap-2.5 px-4 pt-3 pb-3.5",
        skinSlot("dynamic-notification", "content", {}),
        className,
      )}
      {...props}
    />
  );
}

export type DynamicNotificationTitleProps = ComponentProps<"div">;

export function DynamicNotificationTitle({ className, ...props }: DynamicNotificationTitleProps) {
  return (
    <div
      data-control-ui="dynamic-notification"
      data-slot="title"
      className={cn("flex-1 text-meta font-medium tracking-wide opacity-55", skinSlot("dynamic-notification", "title", {}), className)}
      {...props}
    />
  );
}

export type DynamicNotificationMessageProps = Omit<ComponentProps<"p">, "children"> & {
  children: string;
};

export function DynamicNotificationMessage({ className, children, ...props }: DynamicNotificationMessageProps) {
  return (
    <p
      aria-live="polite"
      data-control-ui="dynamic-notification"
      data-slot="message"
      className={cn("text-body-lg leading-snug", skinSlot("dynamic-notification", "message", {}), className)}
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
    const style = { "--dn-word-index": `${wordIndex}` } as CSSProperties;
    wordIndex += 1;
    return (
      // biome-ignore lint/suspicious/noArrayIndexKey: split positions are stable for a given text; the list remounts wholesale (key={text}) when the message changes.
      <span key={position} data-control-ui="dynamic-notification" data-slot="word" style={style}>
        {part}
      </span>
    );
  });
}

export type DynamicNotificationReplyProps = ComponentProps<"form">;

export function DynamicNotificationReply({ className, onSubmit, ...props }: DynamicNotificationReplyProps) {
  const context = useDynamicNotificationContext();

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    onSubmit?.(event);
    if (event.defaultPrevented) return;
    context.handleReplySubmit(event);
  }

  return (
    <form
      data-control-ui="dynamic-notification"
      data-slot="reply"
      onSubmit={handleSubmit}
      className={cn("flex items-center gap-2", skinSlot("dynamic-notification", "reply", {}), className)}
      {...props}
    />
  );
}

export type DynamicNotificationReplyInputProps = ComponentProps<"input">;

export function DynamicNotificationReplyInput({ className, onChange, disabled, ...props }: DynamicNotificationReplyInputProps) {
  const context = useDynamicNotificationContext();
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Expanding is an explicit "answer the AI" gesture, so focus rides the morph (preventScroll: the
  // island already sits in view). Waits out the "thinking" phase — content is inert until expanded.
  useEffect(() => {
    if (context.state !== "expanded") return;
    const frame = requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, [context.state]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange?.(event);
    if (!event.defaultPrevented) context.setReply(event.currentTarget.value);
  }

  return (
    <input
      ref={inputRef}
      type="text"
      aria-label="Reply"
      data-control-ui="dynamic-notification"
      data-slot="reply-input"
      value={context.reply}
      onChange={handleChange}
      disabled={disabled ?? context.disabled}
      className={cn(
        "h-9 min-w-0 flex-1 rounded-full bg-current/8 px-3.5 text-body outline-none ring-1 ring-inset ring-current/10 transition-shadow duration-[var(--duration-fast)] placeholder:text-current/45 focus-visible:ring-2 focus-visible:ring-current/30 disabled:cursor-not-allowed disabled:opacity-50",
        skinSlot("dynamic-notification", "reply-input", {}),
        className,
      )}
      {...props}
    />
  );
}

export type DynamicNotificationReplySubmitProps = ComponentProps<typeof Button>;

export function DynamicNotificationReplySubmit({ className, disabled, children, ...props }: DynamicNotificationReplySubmitProps) {
  const context = useDynamicNotificationContext();

  return (
    <Button
      data-control-ui="dynamic-notification"
      data-slot="reply-submit"
      type="submit"
      variant="solid"
      size="lg"
      iconOnly
      shape="circle"
      aria-label="Send reply"
      disabled={disabled ?? !context.canSubmit}
      className={cn("shrink-0", skinSlot("dynamic-notification", "reply-submit", {}), className)}
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
  const context = useDynamicNotificationContext();

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    context.setOpen(false, "close-press", event.nativeEvent, event.currentTarget);
  }

  return (
    <Button
      data-control-ui="dynamic-notification"
      data-slot="close"
      variant="quiet"
      size="sm"
      iconOnly
      shape="circle"
      aria-label="Dismiss"
      onClick={handleClick}
      className={cn("-mr-1.5 shrink-0 text-current/55 hover:text-current", skinSlot("dynamic-notification", "close", {}), className)}
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
