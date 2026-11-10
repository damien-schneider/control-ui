"use client";

import type { ReactNode } from "react";
import { Code, CodeActions, CodeContent, CodeCopy, CodeHeader, CodeTitle } from "@/components/control-ui/ui/code";
import { CodeDiff } from "@/components/control-ui/ui/code-diff";
import {
  MarkdownA,
  MarkdownBlockquote,
  type MarkdownCodeProps,
  MarkdownEm,
  MarkdownH1,
  MarkdownH2,
  MarkdownH3,
  MarkdownH4,
  MarkdownH5,
  MarkdownH6,
  MarkdownHr,
  MarkdownImg,
  MarkdownInlineCode,
  MarkdownInput,
  MarkdownLi,
  MarkdownOl,
  MarkdownP,
  MarkdownSpan,
  MarkdownStrong,
  MarkdownSub,
  MarkdownSup,
  MarkdownTable,
  MarkdownTbody,
  MarkdownTd,
  MarkdownTh,
  MarkdownThead,
  MarkdownTr,
  MarkdownUl,
} from "@/components/control-ui/ui/markdown-elements";

function textValue(children: ReactNode) {
  return Array.isArray(children) ? children.join("") : String(children ?? "");
}

// fence names like c++ and c# carry symbols; ":" and "{" start metadata some authors append
function languageFromClassName(className?: string) {
  return /language-([\w+#-]+)/.exec(className ?? "")?.[1];
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
  // the diff grammar would recolor source lines that merely start with "-", "+" or ">"
  if (lang === "diff" && value.includes("@@")) {
    return <CodeDiff patch={value} diffStyle="unified" />;
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

// `pre` overrides break Streamdown's fence detection.
export const markdownComponents = {
  input: MarkdownInput,
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
  thead: MarkdownThead,
  tbody: MarkdownTbody,
  tr: MarkdownTr,
  th: MarkdownTh,
  td: MarkdownTd,
  img: MarkdownImg,
  span: MarkdownSpan,
  sup: MarkdownSup,
  sub: MarkdownSub,
};
