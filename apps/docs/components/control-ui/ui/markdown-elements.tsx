import type { ComponentProps, JSX, ReactNode } from "react";

import { cn } from "@/components/control-ui/lib/cn";
import { Code, CodeContent } from "@/components/control-ui/ui/code";
import { CodeDiff } from "@/components/control-ui/ui/code-diff";

type MarkdownCodeProps = ComponentProps<"code"> & {
  node?: unknown;
};

type MarkdownElementProps<Tag extends keyof JSX.IntrinsicElements> = ComponentProps<Tag> & {
  node?: unknown;
};

function textValue(children: ReactNode) {
  return Array.isArray(children) ? children.join("") : String(children ?? "");
}

function languageFromClassName(className?: string) {
  return /language-([\w-]+)/.exec(className ?? "")?.[1];
}

export function MarkdownInlineCode({ className, children, node: _node, ...props }: MarkdownCodeProps) {
  return (
    <code className={cn("rounded bg-foreground/8 px-1 py-0.5 font-mono text-[0.9em] text-foreground", className)} {...props}>
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
    return <CodeDiff patch={value} lang="diff" diffStyle="unified" className="my-4" />;
  }

  return (
    <Code className="my-4">
      <CodeContent code={value} lang={lang} highlight={lang ? "auto" : "none"} />
    </Code>
  );
}

export function MarkdownH1({ className, node: _node, ...props }: MarkdownElementProps<"h1">) {
  return <h1 className={cn("mt-6 mb-3 font-semibold text-xl text-foreground first:mt-0", className)} {...props} />;
}

export function MarkdownH2({ className, node: _node, ...props }: MarkdownElementProps<"h2">) {
  return <h2 className={cn("mt-6 mb-3 font-semibold text-lg text-foreground first:mt-0", className)} {...props} />;
}

export function MarkdownH3({ className, node: _node, ...props }: MarkdownElementProps<"h3">) {
  return <h3 className={cn("mt-5 mb-2 font-semibold text-base text-foreground first:mt-0", className)} {...props} />;
}

export function MarkdownP({ className, node: _node, ...props }: MarkdownElementProps<"p">) {
  return <p className={cn("my-3 leading-7 first:mt-0 last:mb-0", className)} {...props} />;
}

export function MarkdownUl({ className, node: _node, ...props }: MarkdownElementProps<"ul">) {
  return <ul className={cn("my-3 list-disc space-y-1 pl-6", className)} {...props} />;
}

export function MarkdownOl({ className, node: _node, ...props }: MarkdownElementProps<"ol">) {
  return <ol className={cn("my-3 list-decimal space-y-1 pl-6", className)} {...props} />;
}

export function MarkdownLi({ className, node: _node, ...props }: MarkdownElementProps<"li">) {
  return <li className={cn("leading-7", className)} {...props} />;
}

export function MarkdownA({ className, node: _node, ...props }: MarkdownElementProps<"a">) {
  return <a className={cn("font-medium text-primary-text underline underline-offset-2 hover:no-underline", className)} {...props} />;
}

export function MarkdownBlockquote({ className, node: _node, ...props }: MarkdownElementProps<"blockquote">) {
  return <blockquote className={cn("my-4 border-border border-l-2 pl-4 text-muted-foreground italic", className)} {...props} />;
}

export function MarkdownHr({ className, node: _node, ...props }: MarkdownElementProps<"hr">) {
  return <hr className={cn("my-6 border-border", className)} {...props} />;
}

export function MarkdownStrong({ className, node: _node, ...props }: MarkdownElementProps<"strong">) {
  return <strong className={cn("font-semibold text-foreground", className)} {...props} />;
}

export function MarkdownEm({ className, node: _node, ...props }: MarkdownElementProps<"em">) {
  return <em className={cn("italic", className)} {...props} />;
}

export function MarkdownTable({ className, children, node: _node, ...props }: MarkdownElementProps<"table">) {
  return (
    <div className="my-4 overflow-x-auto">
      <table className={cn("w-full border-collapse text-label", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function MarkdownTh({ className, node: _node, ...props }: MarkdownElementProps<"th">) {
  return <th className={cn("border border-border bg-muted px-3 py-1.5 text-left font-semibold", className)} {...props} />;
}

export function MarkdownTd({ className, node: _node, ...props }: MarkdownElementProps<"td">) {
  return <td className={cn("border border-border px-3 py-1.5", className)} {...props} />;
}

// No `pre` override: Streamdown only routes fenced blocks to `code` w/ language-* className when `pre` stays default.
// Override `pre` and the fence falls back to inline rendering — MarkdownCode never sees the language.
export const markdownComponents = {
  code: MarkdownCode,
  inlineCode: MarkdownInlineCode,
  h1: MarkdownH1,
  h2: MarkdownH2,
  h3: MarkdownH3,
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
