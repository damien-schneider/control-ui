"use client";

import type { ComponentProps } from "react";
import { createContext, useContext } from "react";

import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

type InlineAttachmentContextValue = {
  name: string;
};

const InlineAttachmentContext = createContext<InlineAttachmentContextValue | null>(null);

function useInlineAttachmentContext() {
  const context = useContext(InlineAttachmentContext);
  if (!context) throw new Error("InlineAttachment compound components must be rendered inside <InlineAttachment>.");
  return context;
}

export type InlineAttachmentProps = ComponentProps<"button"> & {
  name: string;
};

export function InlineAttachment({ name, className, children, ...props }: InlineAttachmentProps) {
  return (
    <InlineAttachmentContext.Provider value={{ name }}>
      <button
        type="button"
        aria-label={`Open attachment: ${name}`}
        data-control-ui="inline-attachment"
        data-slot="root"
        data-surface="panel"
        className={cn(
          "group relative aspect-[1.26] w-full max-w-72 cursor-pointer overflow-hidden rounded-scene bg-muted text-left shadow-sm ring-1 ring-border transition hover:shadow-md",
          skinSlot("inline-attachment", "root", {}),
          className,
        )}
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

export function InlineAttachmentMedia({ src, alt, className, children, ...props }: InlineAttachmentMediaProps) {
  const { name } = useInlineAttachmentContext();

  return (
    <div
      data-control-ui="inline-attachment"
      data-slot="image"
      className={cn("size-full", skinSlot("inline-attachment", "image", {}), className)}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt ?? name}
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition duration-[var(--duration-slow)] group-hover:scale-[1.02]"
        />
      ) : (
        (children ?? (
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
        ))
      )}
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
        "absolute inset-x-3 bottom-3 rounded-[var(--radius-control)] bg-background/85 px-3 py-1 text-meta font-medium text-foreground shadow-sm backdrop-blur",
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
