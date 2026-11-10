"use client";

import { type ComponentProps, useMemo } from "react";
import { Streamdown } from "streamdown";
import { markdownComponents } from "@/components/control-ui/ui/markdown-components";
import { MarkdownFlow, MarkdownRoot, type MarkdownRootProps } from "@/components/control-ui/ui/markdown-elements";

export type MarkdownProps = Omit<MarkdownRootProps, "children"> & {
  content: string;
  mode?: "streaming" | "static";
  /** Element renderers merged over the built-in ones; keep the object stable between renders. */
  components?: ComponentProps<typeof Streamdown>["components"];
};

export function Markdown({ content, mode = "streaming", components, className, ...props }: MarkdownProps) {
  const mergedComponents = useMemo(() => (components ? { ...markdownComponents, ...components } : markdownComponents), [components]);

  return (
    <MarkdownRoot className={className} {...props}>
      <MarkdownFlow>
        {/* Streamdown's wrapper drops DOM props and adds utility margins. */}
        <Streamdown
          mode={mode}
          parseIncompleteMarkdown={mode === "streaming"}
          controls={false}
          components={mergedComponents}
          className="cui-markdown-streamdown [&>[data-control-family]]:[margin-block:revert-layer]"
        >
          {content}
        </Streamdown>
      </MarkdownFlow>
    </MarkdownRoot>
  );
}

export type MarkdownComponentProps = ComponentProps<typeof Markdown>;
