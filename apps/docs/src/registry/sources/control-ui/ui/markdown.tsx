"use client";

import type { ComponentProps } from "react";

import { Streamdown } from "streamdown";

import type { MarkdownProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";
import { markdownComponents } from "@/components/control-ui/ui/markdown-elements";

// Markdown: GFM output, 3rd consumer of shared code surface — fenced code→<Code>, ```diff→<CodeDiff>; one skin-aware renderer.
// Prose is token-styled; chrome-less by design (no corner surface) — drops straight into a chat message.
// MarkdownBlock composes this for a copyable, headered block; this is the bare renderer.

export type { MarkdownProps } from "@/components/control-ui/contracts";

export function Markdown({ content, className, ...props }: MarkdownProps) {
  return (
    <div
      data-control-ui="markdown"
      data-slot="root"
      className={cn(
        "text-label text-foreground/90 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        skinSlot("markdown", "root", {}),
        className,
      )}
      {...props}
    >
      <Streamdown
        mode="streaming"
        parseIncompleteMarkdown
        controls={false}
        components={markdownComponents}
        className="space-y-4 whitespace-normal [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
      >
        {content}
      </Streamdown>
    </div>
  );
}

export type MarkdownComponentProps = ComponentProps<typeof Markdown>;
