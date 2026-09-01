"use client";

import type { MDXComponents } from "mdx/types";
import type { ComponentProps } from "react";

import { CodeBlock } from "@/app/(features)/components/source";
import {
  MarkdownA,
  MarkdownBlockquote,
  MarkdownEm,
  MarkdownH1,
  MarkdownH2,
  MarkdownH3,
  MarkdownHr,
  MarkdownInlineCode,
  MarkdownLi,
  MarkdownOl,
  MarkdownP,
  MarkdownPre,
  MarkdownStrong,
  MarkdownTable,
  MarkdownTd,
  MarkdownTh,
  MarkdownUl,
} from "@/components/control-ui/ui/markdown-elements";

// Docs fences render headerless snippets; the registry's MarkdownCode keeps its lang header for chat surfaces.
function DocsMdxCode({ className, children, ...props }: ComponentProps<"code">) {
  const value = typeof children === "string" ? children : "";
  const lang = /language-([\w-]+)/.exec(className ?? "")?.[1];
  if (!lang && !value.includes("\n")) {
    return (
      <MarkdownInlineCode className={className} {...props}>
        {children}
      </MarkdownInlineCode>
    );
  }

  return <CodeBlock code={value.replace(/\n$/, "")} lang={lang ?? "text"} />;
}

const mdxComponents = {
  pre: MarkdownPre,
  code: DocsMdxCode,
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
} satisfies MDXComponents;

export function useMDXComponents(): MDXComponents {
  return mdxComponents;
}
