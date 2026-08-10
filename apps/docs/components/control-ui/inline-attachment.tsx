"use client";

import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { createContext, useContext } from "react";

import type { InlineAttachmentState } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinPaint, skinSlot } from "@/components/control-ui/skin";

type InlineAttachmentContextValue = { name: string; state: InlineAttachmentState };

/** Typed so the custom property is declared rather than asserted. */
type InlineAttachmentStyle = CSSProperties & { "--inline-attachment-aspect"?: number };

const InlineAttachmentContext = createContext<InlineAttachmentContextValue | null>(null);

function useInlineAttachmentContext() {
  const context = useContext(InlineAttachmentContext);
  if (!context) throw new Error("InlineAttachment compound components must be rendered inside <InlineAttachment>.");
  return context;
}

function defaultLabel(name: string, state: InlineAttachmentState) {
  if (state === "pending") return `Generating ${name}`;
  if (state === "error") return `${name} is unavailable`;
  return `Open attachment: ${name}`;
}

export type InlineAttachmentProps = ComponentProps<"button"> & {
  name: string;
  state?: InlineAttachmentState;
  /** Width-to-height ratio of the reserved box — generated media knows its ratio before its pixels, so arrival never reflows the turn. */
  aspect?: number;
};

export function InlineAttachment({
  name,
  state = "ready",
  aspect = 1.26,
  disabled,
  className,
  children,
  style,
  "aria-label": ariaLabel,
  ...props
}: InlineAttachmentProps) {
  const attachmentStyle: InlineAttachmentStyle = { "--inline-attachment-aspect": aspect, ...style };

  return (
    <InlineAttachmentContext.Provider value={{ name, state }}>
      <button
        type="button"
        aria-label={ariaLabel ?? defaultLabel(name, state)}
        aria-busy={state === "pending" || undefined}
        disabled={disabled || state === "pending"}
        data-control-ui="inline-attachment"
        data-slot="root"
        data-surface="panel"
        data-state={state}
        className={cn(
          "group relative aspect-[var(--inline-attachment-aspect)] w-full max-w-72 cursor-pointer overflow-hidden rounded-scene bg-muted text-left shadow-sm ring-1 ring-border transition hover:shadow-md",
          "disabled:cursor-default disabled:hover:shadow-sm",
          skinSlot("inline-attachment", "root", { state }),
          className,
        )}
        style={attachmentStyle}
        {...props}
      >
        {children}
      </button>
    </InlineAttachmentContext.Provider>
  );
}

export type InlineAttachmentMediaProps = ComponentProps<"div"> & {
  src?: string;
  alt?: string;
};

function GeneratingPlaceholder() {
  return (
    <div
      aria-hidden="true"
      data-control-ui="inline-attachment"
      data-slot="placeholder"
      className={cn("size-full", skinPaint("inline-attachment", "halftone", {}) ?? "halftone")}
    />
  );
}

function DocumentPlaceholder() {
  return (
    <div className="size-full bg-linear-[135deg]/srgb from-slate-50 from-0% via-zinc-100 via-46% to-stone-200 to-100% p-5">
      <div className="h-full rounded-2xl bg-card/78 p-4 shadow-sm ring-1 ring-foreground/10">
        <div className="h-2 w-20 rounded-full bg-foreground/12" />
        <div className="mt-5 grid gap-2">
          <div className="h-1.5 w-44 rounded-full bg-foreground/16" />
          <div className="h-1.5 w-36 rounded-full bg-foreground/12" />
          <div className="h-1.5 w-48 rounded-full bg-foreground/14" />
          <div className="h-1.5 w-28 rounded-full bg-foreground/10" />
        </div>
        <div className="mt-5 h-9 w-24 rounded-xl border border-dashed border-foreground/18" />
      </div>
    </div>
  );
}

function mediaContent({ state, src, alt, children }: { state: InlineAttachmentState; src?: string; alt: string; children?: ReactNode }) {
  if (state === "pending") return <GeneratingPlaceholder />;
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="size-full object-cover transition duration-[var(--duration-slow)] group-hover:scale-[1.02]"
      />
    );
  }
  return children ?? <DocumentPlaceholder />;
}

export function InlineAttachmentMedia({ src, alt, className, children, ...props }: InlineAttachmentMediaProps) {
  const { name, state } = useInlineAttachmentContext();

  return (
    <div
      data-control-ui="inline-attachment"
      data-slot="image"
      className={cn("size-full", skinSlot("inline-attachment", "image", {}), className)}
      {...props}
    >
      {mediaContent({ state, src, alt: alt ?? name, children })}
    </div>
  );
}

export type InlineAttachmentContentProps = ComponentProps<"div">;

export function InlineAttachmentContent({ className, ...props }: InlineAttachmentContentProps) {
  return (
    <div
      data-control-ui="inline-attachment"
      data-slot="content"
      className={cn(
        "absolute inset-x-3 bottom-3 rounded-[var(--radius-control)] bg-background/85 px-3 py-1 text-caption font-medium text-foreground shadow-sm backdrop-blur",
        skinSlot("inline-attachment", "content", {}),
        className,
      )}
      {...props}
    />
  );
}

export type InlineAttachmentTitleProps = ComponentProps<"div">;

export function InlineAttachmentTitle({ children, className, ...props }: InlineAttachmentTitleProps) {
  const { name } = useInlineAttachmentContext();

  return (
    <div className={cn("truncate", className)} {...props}>
      {children ?? name}
    </div>
  );
}

export type InlineAttachmentDescriptionProps = ComponentProps<"div">;

export function InlineAttachmentDescription({ className, ...props }: InlineAttachmentDescriptionProps) {
  return <div className={cn("truncate text-micro opacity-65", className)} {...props} />;
}

export type InlineAttachmentActionsProps = ComponentProps<"div">;

export function InlineAttachmentActions({ className, ...props }: InlineAttachmentActionsProps) {
  return <div className={cn("mt-1 flex items-center gap-1", className)} {...props} />;
}

export type InlineAttachmentActionProps = ComponentProps<"span">;

export function InlineAttachmentAction({ className, ...props }: InlineAttachmentActionProps) {
  return (
    <span
      data-control-ui="inline-attachment"
      data-slot="action"
      className={cn(
        "rounded-[var(--radius-control)] bg-foreground/8 px-1.5 py-0.5 text-micro",
        skinSlot("inline-attachment", "action", {}),
        className,
      )}
      {...props}
    />
  );
}
