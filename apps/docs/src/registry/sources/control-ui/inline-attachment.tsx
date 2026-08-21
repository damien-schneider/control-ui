"use client";

import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { createContext, useContext } from "react";

import type { InlineAttachmentKnobStyle } from "@/components/control-ui/knob-contracts/inline-attachment-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type InlineAttachmentState = "ready" | "pending" | "error";

type InlineAttachmentContextValue = { name: string; state: InlineAttachmentState };

type InlineAttachmentStyle = CSSProperties & InlineAttachmentKnobStyle;
type InlineAttachmentStyleProps<Props, Style> = Omit<Props, "style"> & { style?: CSSProperties & Style };

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

export type InlineAttachmentProps = InlineAttachmentStyleProps<ComponentProps<"button">, InlineAttachmentKnobStyle> & {
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
  const attachmentStyle = { aspectRatio: aspect, ...style } satisfies InlineAttachmentStyle;

  return (
    <InlineAttachmentContext.Provider value={{ name, state }}>
      <button
        type="button"
        aria-label={ariaLabel ?? defaultLabel(name, state)}
        aria-busy={state === "pending" || undefined}
        disabled={disabled || state === "pending"}
        data-control-ui="inline-attachment"
        data-control-family="inline-attachment"
        data-slot="root"
        data-surface="panel"
        data-state={state}
        className={cn("group relative w-full max-w-72 cursor-pointer overflow-hidden disabled:cursor-default", className)}
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
} & { style?: CSSProperties & InlineAttachmentKnobStyle };

function GeneratingPlaceholder() {
  return (
    <div
      aria-hidden="true"
      data-control-ui="inline-attachment"
      data-control-family="inline-attachment"
      data-slot="placeholder"
      className={cn("size-full", "halftone")}
    />
  );
}

function DocumentPlaceholder() {
  return (
    <div data-control-ui="inline-attachment" data-control-family="inline-attachment" data-slot="document" className="size-full p-5">
      <div data-control-ui="inline-attachment" data-control-family="inline-attachment" data-slot="document-sheet" className="h-full p-4">
        <div
          data-control-ui="inline-attachment"
          data-control-family="inline-attachment"
          data-slot="document-heading"
          className="h-2 w-20"
        />
        <div className="mt-5 grid gap-2">
          <div
            data-control-ui="inline-attachment"
            data-control-family="inline-attachment"
            data-slot="document-line"
            data-width="long"
            className="h-1.5 w-44"
          />
          <div
            data-control-ui="inline-attachment"
            data-control-family="inline-attachment"
            data-slot="document-line"
            data-width="medium"
            className="h-1.5 w-36"
          />
          <div
            data-control-ui="inline-attachment"
            data-control-family="inline-attachment"
            data-slot="document-line"
            data-width="longest"
            className="h-1.5 w-48"
          />
          <div
            data-control-ui="inline-attachment"
            data-control-family="inline-attachment"
            data-slot="document-line"
            data-width="short"
            className="h-1.5 w-28"
          />
        </div>
        <div
          data-control-ui="inline-attachment"
          data-control-family="inline-attachment"
          data-slot="document-stamp"
          className="mt-5 h-9 w-24"
        />
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
        data-control-ui="inline-attachment"
        data-control-family="inline-attachment"
        data-slot="media-image"
        className="size-full object-cover"
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
      data-control-family="inline-attachment"
      data-slot="image"
      className={cn("size-full", className)}
      {...props}
    >
      {mediaContent({ state, src, alt: alt ?? name, children })}
    </div>
  );
}

export type InlineAttachmentContentProps = InlineAttachmentStyleProps<ComponentProps<"div">, InlineAttachmentKnobStyle>;

export function InlineAttachmentContent({ className, ...props }: InlineAttachmentContentProps) {
  return (
    <div
      data-control-ui="inline-attachment"
      data-control-family="inline-attachment"
      data-slot="content"
      className={cn("absolute inset-x-3 bottom-3 px-3 py-1", className)}
      {...props}
    />
  );
}

export type InlineAttachmentTitleProps = ComponentProps<"div"> & { style?: CSSProperties & InlineAttachmentKnobStyle };

export function InlineAttachmentTitle({ children, className, ...props }: InlineAttachmentTitleProps) {
  const { name } = useInlineAttachmentContext();

  return (
    <div
      data-control-ui="inline-attachment"
      data-control-family="inline-attachment"
      data-slot="title"
      className={cn("truncate", className)}
      {...props}
    >
      {children ?? name}
    </div>
  );
}

export type InlineAttachmentDescriptionProps = InlineAttachmentStyleProps<ComponentProps<"div">, InlineAttachmentKnobStyle>;

export function InlineAttachmentDescription({ className, ...props }: InlineAttachmentDescriptionProps) {
  return (
    <div
      data-control-ui="inline-attachment"
      data-control-family="inline-attachment"
      data-slot="description"
      className={cn("truncate", className)}
      {...props}
    />
  );
}

export type InlineAttachmentActionsProps = ComponentProps<"div"> & { style?: CSSProperties & InlineAttachmentKnobStyle };

export function InlineAttachmentActions({ className, ...props }: InlineAttachmentActionsProps) {
  return (
    <div
      data-control-ui="inline-attachment"
      data-control-family="inline-attachment"
      data-slot="actions"
      className={cn("mt-1 flex items-center gap-1", className)}
      {...props}
    />
  );
}

export type InlineAttachmentActionProps = InlineAttachmentStyleProps<ComponentProps<"span">, InlineAttachmentKnobStyle>;

export function InlineAttachmentAction({ className, ...props }: InlineAttachmentActionProps) {
  return (
    <span
      data-control-ui="inline-attachment"
      data-control-family="inline-attachment"
      data-slot="action"
      className={cn("px-1.5 py-0.5", className)}
      {...props}
    />
  );
}
