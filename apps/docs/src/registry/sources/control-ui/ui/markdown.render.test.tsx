import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";

import { Markdown } from "@/components/control-ui/ui/markdown";

const MD = [
  "## Title",
  "",
  "Some **bold** and `inline` text.",
  "",
  "```ts",
  "const x = 1;",
  "```",
  "",
  "```diff",
  "@@ -1 +1 @@",
  "-old",
  "+new",
  "```",
  "",
  "| A | B |",
  "| - | - |",
  "| 1 | 2 |",
].join("\n");

describe("Markdown renders", () => {
  const html = renderToString(<Markdown content={MD} />);

  test("wraps prose in the markdown component and renders GFM elements", () => {
    expect(html).toContain('data-control-ui="markdown"');
    expect(html).toContain("<h2");
    expect(html).toContain("<strong");
    expect(html).toContain("<table"); // gfm table
  });

  test("a plain code fence routes to Code", () => {
    expect(html).toContain('data-control-ui="code"');
    expect(html).toContain("const x = 1;");
  });

  test("a diff fence with hunks routes to CodeDiff", () => {
    expect(html).toContain('data-control-ui="code-diff"');
    expect(html).toContain('data-line-type="add"');
  });

  test("inline code stays a plain styled <code>, not a Code block", () => {
    expect(html).toContain(">inline</code>");
  });

  test("does not leak Streamdown AST nodes into DOM attributes", () => {
    expect(html).not.toContain(' node="[object Object]"');
  });

  test("an unlabeled fence remains a block code surface", () => {
    const content = ["```", "first", "second", "```"].join("\n");
    const unlabeled = renderToString(<Markdown content={content} />);

    expect(unlabeled).toContain('data-control-ui="code"');
    expect(unlabeled).toContain(">first</code>");
    expect(unlabeled).toContain(">second</code>");
  });
});
