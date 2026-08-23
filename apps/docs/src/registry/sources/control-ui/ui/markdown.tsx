"use client";

import type { ComponentProps, CSSProperties } from "react";
import { Streamdown } from "streamdown";
import type { MarkdownKnobStyle } from "@/components/control-ui/knob-contracts/markdown-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { markdownComponents } from "@/components/control-ui/ui/markdown-elements";

export type MarkdownProps = Omit<ComponentProps<"div">, "children" | "style"> & {
  content: string;
  style?: CSSProperties & MarkdownKnobStyle;
};

// Chrome-less on purpose so it drops straight into chat message; MarkdownBlock composes it for headered, copyable block.

// Markdown parts read their paint from knobs this root declares, so prose assembled elsewhere (MDX) needs it too.
export function MarkdownRoot({
  className,
  ...props
}: Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & MarkdownKnobStyle }) {
  return (
    <div
      data-control-ui="markdown"
      data-control-family="markdown"
      data-slot="root"
      className={cn("[&>*:first-child]:mt-0 [&>*:last-child]:mb-0", className)}
      {...props}
    />
  );
}

export function Markdown({ content, className, ...props }: MarkdownProps) {
  return (
    <MarkdownRoot className={className} {...props}>
      <Streamdown
        mode="streaming"
        parseIncompleteMarkdown
        controls={false}
        components={markdownComponents}
        className="space-y-4 whitespace-normal [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
      >
        {content}
      </Streamdown>
    </MarkdownRoot>
  );
}

export type MarkdownComponentProps = ComponentProps<typeof Markdown>;
