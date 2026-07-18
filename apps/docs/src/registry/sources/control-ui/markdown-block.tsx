"use client";

import type { ComponentProps, MouseEvent } from "react";
import { createContext, useContext } from "react";
import { useCopyToClipboard } from "@/components/control-ui/hooks/use-copy-to-clipboard";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";
import { Button } from "@/components/control-ui/ui/button";
import { Markdown } from "@/components/control-ui/ui/markdown";

type MarkdownBlockContextValue = {
  code: string;
};

const MarkdownBlockContext = createContext<MarkdownBlockContextValue | null>(null);

function useMarkdownBlockContext() {
  const context = useContext(MarkdownBlockContext);
  if (!context) throw new Error("MarkdownBlock compound components must be rendered inside <MarkdownBlock>.");
  return context;
}

export type MarkdownBlockProps = ComponentProps<"figure"> & {
  code: string;
};

export function MarkdownBlock({ code, className, children, ...props }: MarkdownBlockProps) {
  return (
    <MarkdownBlockContext.Provider value={{ code }}>
      <figure
        data-control-ui="markdown-block"
        data-slot="root"
        data-surface="panel"
        className={cn(
          "my-4 overflow-hidden rounded-panel border bg-muted shadow-sm ring-1 ring-foreground/4",
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

export type MarkdownBlockCopyProps = ComponentProps<typeof Button>;

export function MarkdownBlockCopy({ children = "Copy", onClick, ...props }: MarkdownBlockCopyProps) {
  const { code } = useMarkdownBlockContext();
  const { copyToClipboard } = useCopyToClipboard();

  function copyCode(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (!event.defaultPrevented) void copyToClipboard(code);
  }

  return (
    <Button variant="quiet" size="xs" onClick={copyCode} {...props}>
      {children}
    </Button>
  );
}

export type MarkdownBlockContentProps = ComponentProps<"div">;

export function MarkdownBlockContent({ children, className, ...props }: MarkdownBlockContentProps) {
  const { code } = useMarkdownBlockContext();

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
