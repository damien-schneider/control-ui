"use client";

import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { createContext, useContext, useEffect, useId, useState } from "react";

import type { InlineAttachmentKnobStyle } from "@/components/control-ui/knob-contracts/inline-attachment-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type InlineAttachmentState = "ready" | "pending" | "error";

type InlineAttachmentContextValue = {
  name: string;
  state: InlineAttachmentState;
  descriptionId: string;
  registerDescription: () => () => void;
};

type InlineAttachmentStyle = CSSProperties & InlineAttachmentKnobStyle;
type InlineAttachmentStyleProps<Props, Style> = Omit<Props, "style"> & { style?: CSSProperties & Style };

const InlineAttachmentContext = createContext<InlineAttachmentContextValue | null>(null);

function useInlineAttachmentContext() {
  const context = useContext(InlineAttachmentContext);
  if (!context) throw new Error("InlineAttachment compound components must be rendered inside <InlineAttachment>.");
  return context;
}

type AttachmentLabel = (name: string) => string;

const defaultOpenLabel: AttachmentLabel = (name) => `Open attachment: ${name}`;
const defaultPendingLabel: AttachmentLabel = (name) => `Generating ${name}`;
const defaultErrorLabel: AttachmentLabel = (name) => `${name} couldn't load. Try again.`;

export type InlineAttachmentProps = InlineAttachmentStyleProps<ComponentProps<"button">, InlineAttachmentKnobStyle> & {
  name: string;
  state?: InlineAttachmentState;
  /** Width-to-height ratio of the reserved box — generated media knows its ratio before its pixels, so arrival never reflows the turn. */
  aspect?: number;
  openLabel?: AttachmentLabel;
  pendingLabel?: AttachmentLabel;
  errorLabel?: AttachmentLabel;
};

export function InlineAttachment({
  name,
  state = "ready",
  aspect = 1.26,
  disabled,
  openLabel = defaultOpenLabel,
  pendingLabel = defaultPendingLabel,
  errorLabel = defaultErrorLabel,
  onClick,
  className,
  children,
  style,
  "aria-label": ariaLabel,
  ...props
}: InlineAttachmentProps) {
  const attachmentStyle = { aspectRatio: aspect, ...style } satisfies InlineAttachmentStyle;
  const descriptionId = useId();
  // Unknown until effects run, so server markup keeps the reference and a described attachment is announced before hydration.
  const [descriptionCount, setDescriptionCount] = useState<number>();
  const [registerDescription] = useState(() => () => {
    setDescriptionCount((count) => (count ?? 0) + 1);
    return () => setDescriptionCount((count) => (count ?? 0) - 1);
  });
  useEffect(() => setDescriptionCount((count) => count ?? 0), []);
  const pending = state === "pending";
  const labelFor: Record<InlineAttachmentState, AttachmentLabel> = { ready: openLabel, pending: pendingLabel, error: errorLabel };
  const defaultLabel = labelFor[state](name);

  return (
    <InlineAttachmentContext.Provider value={{ name, state, descriptionId, registerDescription }}>
      <button
        type="button"
        aria-label={ariaLabel ?? defaultLabel}
        aria-describedby={descriptionCount === 0 ? undefined : descriptionId}
        aria-busy={pending || undefined}
        aria-disabled={pending || undefined}
        disabled={disabled}
        onClick={(event) => {
          if (pending) {
            event.preventDefault();
            return;
          }
          onClick?.(event);
        }}
        data-control-ui="inline-attachment"
        data-control-family="inline-attachment"
        data-slot="root"
        data-surface="panel"
        data-state={state}
        className={cn("group relative w-full max-w-72 overflow-hidden", className)}
        style={attachmentStyle}
        {...props}
      >
        {children}
      </button>
    </InlineAttachmentContext.Provider>
  );
}

export type InlineAttachmentMediaProps = ComponentProps<"span"> & {
  src?: string;
  alt?: string;
} & { style?: CSSProperties & InlineAttachmentKnobStyle };

function GeneratingPlaceholder() {
  return (
    <span
      aria-hidden="true"
      data-control-ui="inline-attachment"
      data-control-family="inline-attachment"
      data-slot="placeholder"
      className="block size-full halftone"
    />
  );
}

function DocumentPlaceholder() {
  return (
    <span data-control-ui="inline-attachment" data-control-family="inline-attachment" data-slot="document" className="block size-full">
      <span data-control-ui="inline-attachment" data-control-family="inline-attachment" data-slot="document-sheet" className="block h-full">
        <span data-control-ui="inline-attachment" data-control-family="inline-attachment" data-slot="document-heading" className="block" />
        <span className="grid">
          <span data-control-ui="inline-attachment" data-control-family="inline-attachment" data-slot="document-line" data-width="long" />
          <span data-control-ui="inline-attachment" data-control-family="inline-attachment" data-slot="document-line" data-width="medium" />
          <span
            data-control-ui="inline-attachment"
            data-control-family="inline-attachment"
            data-slot="document-line"
            data-width="longest"
          />
          <span data-control-ui="inline-attachment" data-control-family="inline-attachment" data-slot="document-line" data-width="short" />
        </span>
        <span data-control-ui="inline-attachment" data-control-family="inline-attachment" data-slot="document-stamp" className="block" />
      </span>
    </span>
  );
}

type MediaContentOptions = {
  state: InlineAttachmentState;
  src?: string;
  alt: string;
  children?: ReactNode;
  onError: () => void;
};

function mediaContent({ state, src, alt, children, onError }: MediaContentOptions) {
  if (state === "pending") return <GeneratingPlaceholder />;
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={onError}
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
  // A broken image would leave an empty box with the browser's broken-image glyph; a new src gets a fresh attempt.
  const [failedSrc, setFailedSrc] = useState<string>();

  return (
    <span
      data-control-ui="inline-attachment"
      data-control-family="inline-attachment"
      data-slot="image"
      className={cn("block size-full", className)}
      {...props}
    >
      {mediaContent({
        state,
        src: src === failedSrc ? undefined : src,
        alt: alt ?? name,
        children,
        onError: () => setFailedSrc(src),
      })}
    </span>
  );
}

export type InlineAttachmentContentProps = InlineAttachmentStyleProps<ComponentProps<"span">, InlineAttachmentKnobStyle>;

export function InlineAttachmentContent({ className, ...props }: InlineAttachmentContentProps) {
  return (
    <span
      data-control-ui="inline-attachment"
      data-control-family="inline-attachment"
      data-slot="content"
      className={cn("absolute", className)}
      {...props}
    />
  );
}

export type InlineAttachmentTitleProps = ComponentProps<"span"> & { style?: CSSProperties & InlineAttachmentKnobStyle };

export function InlineAttachmentTitle({ children, className, ...props }: InlineAttachmentTitleProps) {
  const { name } = useInlineAttachmentContext();
  const label = children ?? name;

  return (
    <span
      data-control-ui="inline-attachment"
      data-control-family="inline-attachment"
      data-slot="title"
      title={typeof label === "string" ? label : undefined}
      className={cn("block truncate", className)}
      {...props}
    >
      {label}
    </span>
  );
}

export type InlineAttachmentDescriptionProps = InlineAttachmentStyleProps<ComponentProps<"span">, InlineAttachmentKnobStyle>;

export function InlineAttachmentDescription({ className, children, ...props }: InlineAttachmentDescriptionProps) {
  const { descriptionId, registerDescription } = useInlineAttachmentContext();
  useEffect(() => registerDescription(), [registerDescription]);

  return (
    <span
      id={descriptionId}
      data-control-ui="inline-attachment"
      data-control-family="inline-attachment"
      data-slot="description"
      title={typeof children === "string" ? children : undefined}
      className={cn("block truncate", className)}
      {...props}
    >
      {children}
    </span>
  );
}

export type InlineAttachmentActionsProps = ComponentProps<"span"> & { style?: CSSProperties & InlineAttachmentKnobStyle };

export function InlineAttachmentActions({ className, ...props }: InlineAttachmentActionsProps) {
  return (
    <span
      data-control-ui="inline-attachment"
      data-control-family="inline-attachment"
      data-slot="actions"
      className={cn("flex items-center", className)}
      {...props}
    />
  );
}

export type InlineAttachmentActionProps = InlineAttachmentStyleProps<ComponentProps<"span">, InlineAttachmentKnobStyle>;

export function InlineAttachmentAction({ className, ...props }: InlineAttachmentActionProps) {
  return (
    <span data-control-ui="inline-attachment" data-control-family="inline-attachment" data-slot="action" className={className} {...props} />
  );
}
