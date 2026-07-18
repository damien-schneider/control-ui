"use client";

import type { MDXComponents } from "mdx/types";

import {
  MarkdownA,
  MarkdownBlockquote,
  MarkdownCode,
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

const mdxComponents = {
  pre: MarkdownPre,
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
} satisfies MDXComponents;

export function useMDXComponents(): MDXComponents {
  return mdxComponents;
}
