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
    expect(html).toContain("<table");
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

  test("a fence language keeps its symbols", () => {
    const fenced = renderToString(<Markdown content={["```c++", "int main() {}", "```"].join("\n")} />);

    expect(fenced).toContain(">c++</span>");
  });

  test("in-page and footnote links stay in the current tab, external links keep the new-tab hardening", () => {
    const content = "[Jump](#setup) and [docs](https://example.com/docs)\n\nClaim[^1].\n\n[^1]: Source.";
    const links = renderToString(<Markdown content={content} />);
    const anchors = links.match(/<a [^>]*>/g) ?? [];
    const inPage = anchors.filter((anchor) => anchor.includes('href="#'));
    const external = anchors.filter((anchor) => anchor.includes('href="https://example.com/docs"'));

    expect(inPage.length).toBeGreaterThanOrEqual(3);
    for (const anchor of inPage) expect(anchor).not.toContain("target=");
    expect(external).toHaveLength(1);
    expect(external[0]).toContain('target="_blank"');
    expect(external[0]).toContain("noopener");
  });

  test("an image on its own line is not nested inside a paragraph", () => {
    const content = "Before\n\n![Chart](https://example.com/chart.png)\n\nAfter";
    const image = renderToString(<Markdown content={content} />);

    expect(image).toContain('alt="Chart"');
    expect(image).not.toMatch(/<p [^>]*><div/);
    expect(image.match(/data-slot="paragraph"/g)).toHaveLength(2);
  });

  test("an inline image stays inside its paragraph and carries the image part", () => {
    const image = renderToString(<Markdown content="Inline ![Chart](https://example.com/chart.png) image." />);

    expect(image).toMatch(/<p [^>]*data-slot="paragraph"[^>]*>Inline <img [^>]*data-slot="image"[^>]*alt="Chart"/);
  });

  test("table sections and blocked links are parts the recipe paints, not utility classes", () => {
    const content = "| A |\n| - |\n| 1 |\n\n[unsafe](javascript:alert(1))";
    const parts = renderToString(<Markdown content={content} />);

    expect(parts).toContain('<thead data-control-ui="markdown" data-control-family="markdown" data-slot="table-head">');
    expect(parts).toContain('data-slot="table-body"');
    expect(parts).toContain('data-slot="table-row"');
    expect(parts).toContain('data-slot="blocked-link"');
    expect(parts).not.toContain("javascript:");
    expect(parts).not.toContain("bg-muted");
    expect(parts).not.toContain("text-gray-500");
  });

  test("components override a built-in renderer and keep the rest", () => {
    const custom = renderToString(
      <Markdown content="Some *text* and **bold**." components={{ em: ({ children }) => <em data-custom="yes">{children}</em> }} />,
    );

    expect(custom).toContain('<em data-custom="yes">text</em>');
    expect(custom).toContain('data-slot="paragraph"');
    expect(custom).toContain("<strong");
  });

  for (const mode of ["static", "streaming"] as const) {
    test(`${mode} task lists use read-only library checkboxes and keep nested lists`, () => {
      const content = "- [x] Done\n- [ ] Pending\n  - [x] Nested\n\n- Regular";
      const tasks = renderToString(<Markdown mode={mode} content={content} />);
      expect(tasks.match(/data-control-ui="checkbox"[^>]*data-slot="root"/g)).toHaveLength(3);
      expect(tasks).toContain('aria-checked="true"');
      expect(tasks).toContain('aria-checked="false"');
      expect(tasks).toContain('aria-readonly="true"');
      expect(tasks).toContain('aria-labelledby="');
      expect(tasks).toContain("contains-task-list");
      expect(tasks).toContain("task-list-item");
      expect(tasks).toContain("Regular");
      expect(tasks).not.toContain(' node="[object Object]"');
    });
  }
});
