"use client";

import type { ComponentProps, CSSProperties } from "react";
import { createContext, useContext } from "react";
import type { MarkdownBlockKnobStyle } from "@/components/control-ui/knob-contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { CodeCopy, type CodeCopyProps } from "@/components/control-ui/ui/code";
import { Markdown } from "@/components/control-ui/ui/markdown";

const MarkdownBlockContext = createContext<string | null>(null);

function useMarkdownBlockContext() {
  const code = useContext(MarkdownBlockContext);
  if (code === null) throw new Error("MarkdownBlock compound components must be rendered inside <MarkdownBlock>.");
  return code;
}

export type MarkdownBlockProps = Omit<ComponentProps<"figure">, "style"> & {
  code: string;
  style?: CSSProperties & MarkdownBlockKnobStyle;
};

export function MarkdownBlock({ code, className, children, ...props }: MarkdownBlockProps) {
  return (
    <MarkdownBlockContext.Provider value={code}>
      <figure
        data-control-ui="markdown-block"
        data-control-family="markdown-block"
        data-slot="root"
        data-surface="panel"
        className={cn("my-4 overflow-hidden", className)}
        {...props}
      >
        {children}
      </figure>
    </MarkdownBlockContext.Provider>
  );
}

export type MarkdownBlockHeaderProps = Omit<ComponentProps<"figcaption">, "style"> & {
  style?: CSSProperties & MarkdownBlockKnobStyle;
};

export function MarkdownBlockHeader({ className, ...props }: MarkdownBlockHeaderProps) {
  return (
    <figcaption
      data-control-ui="markdown-block"
      data-control-family="markdown-block"
      data-slot="header"
      className={cn("sticky top-0 z-10 flex items-center justify-between gap-3 px-4 py-2", className)}
      {...props}
    />
  );
}

export type MarkdownBlockTitleProps = Omit<ComponentProps<"div">, "style"> & {
  style?: CSSProperties & MarkdownBlockKnobStyle;
};

export function MarkdownBlockTitle({ children = "Markdown", className, ...props }: MarkdownBlockTitleProps) {
  return (
    <div
      data-control-ui="markdown-block"
      data-control-family="markdown-block"
      data-slot="title"
      className={cn("flex min-w-0 items-center gap-2", className)}
      {...props}
    >
      <span
        aria-hidden="true"
        data-control-ui="markdown-block"
        data-control-family="markdown-block"
        data-slot="title-icon"
        className="flex size-5 items-center justify-center"
      >
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

export type MarkdownBlockContentProps = ComponentProps<"div"> & { style?: CSSProperties & MarkdownBlockKnobStyle };

export function MarkdownBlockContent({ children, className, ...props }: MarkdownBlockContentProps) {
  const code = useMarkdownBlockContext();

  return (
    <div
      data-control-ui="markdown-block"
      data-control-family="markdown-block"
      data-slot="content"
      className={cn("max-h-[420px] overflow-auto mask-y-from-[calc(100%_-_var(--scroll-fade-size))] p-4", className)}
      {...props}
    >
      {children ?? <Markdown content={code} />}
    </div>
  );
}
