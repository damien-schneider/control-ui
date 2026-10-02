import type { ComponentProps, CSSProperties, JSX, ReactNode } from "react";
import type { MarkdownKnobStyle } from "@/components/control-ui/knob-contracts/markdown-knobs";

import { cn } from "@/components/control-ui/lib/cn";
import { Code, CodeActions, CodeContent, CodeCopy, CodeHeader, CodeTitle } from "@/components/control-ui/ui/code";
import { CodeDiff } from "@/components/control-ui/ui/code-diff";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";

type MarkdownCodeProps = ComponentProps<"code"> & {
  node?: unknown;
} & { style?: CSSProperties & MarkdownKnobStyle };

type MarkdownElementProps<Tag extends keyof JSX.IntrinsicElements> = ComponentProps<Tag> & {
  node?: unknown;
} & { style?: CSSProperties & MarkdownKnobStyle };

function textValue(children: ReactNode) {
  return Array.isArray(children) ? children.join("") : String(children ?? "");
}

function languageFromClassName(className?: string) {
  return /language-([\w-]+)/.exec(className ?? "")?.[1];
}

export function MarkdownInlineCode({ className, children, node: _node, ...props }: MarkdownCodeProps) {
  return (
    <code data-control-ui="markdown" data-control-family="markdown" data-slot="inline-code" className={className} {...props}>
      {children}
    </code>
  );
}

export function MarkdownPre({ children, node: _node }: MarkdownElementProps<"pre">) {
  return <>{children}</>;
}

export function MarkdownCode({ className, children, node: _node, ...props }: MarkdownCodeProps) {
  const lang = languageFromClassName(className);
  const rawValue = textValue(children);
  if (!lang && !rawValue.includes("\n")) {
    return (
      <MarkdownInlineCode className={className} {...props}>
        {children}
      </MarkdownInlineCode>
    );
  }

  const value = rawValue.replace(/^\n/, "").replace(/\n$/, "");
  if (lang === "diff" && value.includes("@@")) {
    return <CodeDiff patch={value} lang="diff" diffStyle="unified" />;
  }

  return (
    <Code>
      <CodeHeader>
        {lang ? <CodeTitle>{lang}</CodeTitle> : null}
        <CodeActions>
          <CodeCopy value={value} />
        </CodeActions>
      </CodeHeader>
      <CodeContent code={value} lang={lang} highlight={lang ? "auto" : "none"} />
    </Code>
  );
}

export function MarkdownH1({ className, node: _node, ...props }: MarkdownElementProps<"h1">) {
  return <h1 data-control-ui="markdown" data-control-family="markdown" data-slot="h1" className={className} {...props} />;
}

export function MarkdownH2({ className, node: _node, ...props }: MarkdownElementProps<"h2">) {
  return <h2 data-control-ui="markdown" data-control-family="markdown" data-slot="h2" className={className} {...props} />;
}

export function MarkdownH3({ className, node: _node, ...props }: MarkdownElementProps<"h3">) {
  return <h3 data-control-ui="markdown" data-control-family="markdown" data-slot="h3" className={className} {...props} />;
}

export function MarkdownH4({ className, node: _node, ...props }: MarkdownElementProps<"h4">) {
  return <h4 data-control-ui="markdown" data-control-family="markdown" data-slot="h4" className={className} {...props} />;
}

export function MarkdownH5({ className, node: _node, ...props }: MarkdownElementProps<"h5">) {
  return <h5 data-control-ui="markdown" data-control-family="markdown" data-slot="h5" className={className} {...props} />;
}

export function MarkdownH6({ className, node: _node, ...props }: MarkdownElementProps<"h6">) {
  return <h6 data-control-ui="markdown" data-control-family="markdown" data-slot="h6" className={className} {...props} />;
}

export function MarkdownP({ className, node: _node, ...props }: MarkdownElementProps<"p">) {
  return <p data-control-ui="markdown" data-control-family="markdown" data-slot="paragraph" className={className} {...props} />;
}

export function MarkdownUl({ className, node: _node, ...props }: MarkdownElementProps<"ul">) {
  return (
    <ul
      data-control-ui="markdown"
      data-control-family="markdown"
      data-slot="unordered-list"
      className={cn("list-disc", className)}
      {...props}
    />
  );
}

export function MarkdownOl({ className, node: _node, ...props }: MarkdownElementProps<"ol">) {
  return (
    <ol
      data-control-ui="markdown"
      data-control-family="markdown"
      data-slot="ordered-list"
      className={cn("list-decimal", className)}
      {...props}
    />
  );
}

export function MarkdownLi({ className, node: _node, ...props }: MarkdownElementProps<"li">) {
  return <li data-control-ui="markdown" data-control-family="markdown" data-slot="list-item" className={className} {...props} />;
}

export function MarkdownA({ className, node: _node, ...props }: MarkdownElementProps<"a">) {
  return <a data-control-ui="markdown" data-control-family="markdown" data-slot="link" className={className} {...props} />;
}

export function MarkdownBlockquote({ className, node: _node, ...props }: MarkdownElementProps<"blockquote">) {
  return <blockquote data-control-ui="markdown" data-control-family="markdown" data-slot="blockquote" className={className} {...props} />;
}

export function MarkdownHr({ className, node: _node, ...props }: MarkdownElementProps<"hr">) {
  return <hr data-control-ui="markdown" data-control-family="markdown" data-slot="separator" className={className} {...props} />;
}

export function MarkdownStrong({ className, node: _node, ...props }: MarkdownElementProps<"strong">) {
  return <strong data-control-ui="markdown" data-control-family="markdown" data-slot="strong" className={className} {...props} />;
}

export function MarkdownEm({ className, node: _node, ...props }: MarkdownElementProps<"em">) {
  return <em data-control-ui="markdown" data-control-family="markdown" data-slot="emphasis" className={className} {...props} />;
}

export function MarkdownTable({ className, children, node: _node, ...props }: MarkdownElementProps<"table">) {
  return (
    <div data-control-ui="markdown" data-control-family="markdown" data-slot="table-scroll">
      <ScrollArea lockAxis="y">
        <table data-control-ui="markdown" data-control-family="markdown" data-slot="table" className={cn("w-full", className)} {...props}>
          {children}
        </table>
      </ScrollArea>
    </div>
  );
}

export function MarkdownTh({ className, node: _node, ...props }: MarkdownElementProps<"th">) {
  return <th data-control-ui="markdown" data-control-family="markdown" data-slot="table-header" className={className} {...props} />;
}

export function MarkdownTd({ className, node: _node, ...props }: MarkdownElementProps<"td">) {
  return <td data-control-ui="markdown" data-control-family="markdown" data-slot="table-cell" className={className} {...props} />;
}

// `pre` overrides break Streamdown's fence detection.
export const markdownComponents = {
  code: MarkdownCode,
  inlineCode: MarkdownInlineCode,
  h1: MarkdownH1,
  h2: MarkdownH2,
  h3: MarkdownH3,
  h4: MarkdownH4,
  h5: MarkdownH5,
  h6: MarkdownH6,
  p: MarkdownP,
  ul: MarkdownUl,
  ol: MarkdownOl,
  li: MarkdownLi,
  a: MarkdownA,
  blockquote: MarkdownBlockquote,
  hr: MarkdownHr,
  strong: MarkdownStrong,
  em: MarkdownEm,
  table: MarkdownTable,
  th: MarkdownTh,
  td: MarkdownTd,
};
