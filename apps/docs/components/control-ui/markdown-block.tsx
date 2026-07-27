"use client";

import type { ComponentProps } from "react";
import { createContext, useContext } from "react";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";
import { CodeCopy, type CodeCopyProps } from "@/components/control-ui/ui/code";
import { Markdown } from "@/components/control-ui/ui/markdown";

const MarkdownBlockContext = createContext<string | null>(null);

function useMarkdownBlockContext() {
  const code = useContext(MarkdownBlockContext);
  if (code === null) throw new Error("MarkdownBlock compound components must be rendered inside <MarkdownBlock>.");
  return code;
}

export type MarkdownBlockProps = ComponentProps<"figure"> & {
  code: string;
};

export function MarkdownBlock({ code, className, children, ...props }: MarkdownBlockProps) {
  return (
    <MarkdownBlockContext.Provider value={code}>
      <figure
        data-control-ui="markdown-block"
        data-slot="root"
        data-surface="panel"
        className={cn(
          "my-4 overflow-hidden rounded-panel border bg-background shadow-sm",
          skinSlot("markdown-block", "root", {}),
          className,
        )}
        {...props}
      >
        {children}
      </figure>
    </MarkdownBlockContext.Provider>
  );
}

export type MarkdownBlockHeaderProps = ComponentProps<"figcaption">;

export function MarkdownBlockHeader({ className, ...props }: MarkdownBlockHeaderProps) {
  return (
    <figcaption
      data-control-ui="markdown-block"
      data-slot="header"
      className={cn(
        "sticky top-0 z-10 flex items-center justify-between gap-3 border-b px-4 py-2",
        skinSlot("markdown-block", "header", {}),
        className,
      )}
      {...props}
    />
  );
}

export type MarkdownBlockTitleProps = ComponentProps<"div">;

export function MarkdownBlockTitle({ children = "Markdown", className, ...props }: MarkdownBlockTitleProps) {
  return (
    <div
      data-control-ui="markdown-block"
      data-slot="title"
      className={cn("flex min-w-0 items-center gap-2 text-sm font-medium", skinSlot("markdown-block", "title", {}), className)}
      {...props}
    >
      <span aria-hidden="true" className="flex size-5 items-center justify-center rounded-md bg-foreground/8 text-micro">
        MD
      </span>
      <span className="truncate">{children}</span>
    </div>
  );
}

export type MarkdownBlockCopyProps = Omit<CodeCopyProps, "value">;

// IS CodeCopy, so markdown block's copy and a code block's copy can never drift
export function MarkdownBlockCopy({ "aria-label": ariaLabel = "Copy markdown", ...props }: MarkdownBlockCopyProps) {
  const code = useMarkdownBlockContext();
  return <CodeCopy value={code} aria-label={ariaLabel} {...props} />;
}

export type MarkdownBlockContentProps = ComponentProps<"div">;

export function MarkdownBlockContent({ children, className, ...props }: MarkdownBlockContentProps) {
  const code = useMarkdownBlockContext();

  return (
    <div
      data-control-ui="markdown-block"
      data-slot="content"
      className={cn(
        "max-h-[420px] overflow-auto mask-y-from-[calc(100%_-_var(--scroll-fade-size))] p-4",
        skinSlot("markdown-block", "content", {}),
        className,
      )}
      {...props}
    >
      {children ?? <Markdown content={code} />}
    </div>
  );
}
