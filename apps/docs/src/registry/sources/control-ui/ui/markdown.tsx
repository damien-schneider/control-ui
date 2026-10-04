"use client";

import type { ComponentProps, CSSProperties } from "react";
import { Streamdown } from "streamdown";
import type { MarkdownKnobStyle } from "@/components/control-ui/knob-contracts/markdown-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { markdownComponents } from "@/components/control-ui/ui/markdown-elements";

export type MarkdownRootProps = Omit<ComponentProps<"div">, "style"> & {
  style?: CSSProperties & MarkdownKnobStyle;
};

export type MarkdownProps = Omit<MarkdownRootProps, "children"> & { content: string; mode?: "streaming" | "static" };

export function MarkdownRoot({ className, ...props }: MarkdownRootProps) {
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

export function MarkdownFlow(props: MarkdownRootProps) {
  return <div data-control-ui="markdown" data-control-family="markdown" data-slot="flow" {...props} />;
}

export function Markdown({ content, mode = "streaming", className, ...props }: MarkdownProps) {
  return (
    <MarkdownRoot className={className} {...props}>
      <MarkdownFlow>
        {/* Streamdown's wrapper drops DOM props and adds utility margins. */}
        <Streamdown
          mode={mode}
          parseIncompleteMarkdown={mode === "streaming"}
          controls={false}
          components={markdownComponents}
          className="cui-markdown-streamdown [&>[data-control-family]]:[margin-block:revert-layer]"
        >
          {content}
        </Streamdown>
      </MarkdownFlow>
    </MarkdownRoot>
  );
}

export type MarkdownComponentProps = ComponentProps<typeof Markdown>;
