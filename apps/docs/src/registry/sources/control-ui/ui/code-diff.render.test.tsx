import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";

import { CodeDiff } from "@/components/control-ui/ui/code-diff";

const OLD = "const a = 1;\nconst b = 2;\nconst c = 3;\n";
const NEW = "const a = 1;\nconst b = 20;\nconst c = 3;\nconst d = 4;\n";

// SSR render, so neither effects nor client highlighting run and non-virtualized branch is one under test
describe("CodeDiff renders", () => {
  test("unified: emits line-type anatomy, word-diff emphasis, and the stat row", () => {
    const html = renderToString(
      <CodeDiff name="demo.ts" lang="ts" oldText={OLD} newText={NEW} diffStyle="unified" diffIndicators="classic" />,
    );
    expect(html).toContain('data-control-ui="code-diff"');
    expect(html).toContain('data-slot="root"');
    expect(html).toContain('data-line-type="add"');
    expect(html).toContain('data-line-type="del"');
    expect(html).toContain('data-line-type="context"');
    expect(html).toContain('data-control-ui="scroll-area"');
    expect(html).toContain('data-slot="body"');
    expect(html).toContain('data-slot="emphasis" data-line-type="add"');
    expect(html).toContain(">20</span>");
    // React splits "+" and number with comment node, so anatomy is asserted rather than "+2"
    expect(html).toContain('data-slot="stat"');
  });

  test("split: renders a two-column row structure without throwing", () => {
    const html = renderToString(<CodeDiff name="demo.ts" lang="ts" oldText={OLD} newText={NEW} diffStyle="split" />);
    expect(html).toContain('data-slot="row"');
    expect(html).toContain('data-control-ui="code-diff" data-control-family="code-diff" data-slot="line" data-line-type="del"');
    expect(html).toContain('data-control-ui="code-diff" data-control-family="code-diff" data-slot="line" data-line-type="add"');
  });

  test("patch input: parses and renders the git filename", () => {
    const patch = "diff --git a/x.ts b/x.ts\n--- a/x.ts\n+++ b/x.ts\n@@ -1 +1 @@\n-old\n+new\n";
    const html = renderToString(<CodeDiff patch={patch} lang="ts" diffStyle="unified" />);
    expect(html).toContain("x.ts");
    expect(html).toContain('data-line-type="add"');
  });

  test("multi-file patches render every file instead of silently dropping all but the first", () => {
    const patch = [
      "diff --git a/first.ts b/first.ts",
      "--- a/first.ts",
      "+++ b/first.ts",
      "@@ -1 +1 @@",
      "-first old",
      "+first new",
      "diff --git a/second.ts b/second.ts",
      "--- a/second.ts",
      "+++ b/second.ts",
      "@@ -1 +1 @@",
      "-second old",
      "+second new",
      "",
    ].join("\n");
    const html = renderToString(<CodeDiff patch={patch} lang="ts" />);

    expect(html).toContain("first.ts");
    expect(html).toContain("first new");
    expect(html).toContain("second.ts");
    expect(html).toContain("second new");
  });

  test("default bars mode still marks added and deleted lines with glyphs, not colour alone", () => {
    const html = renderToString(<CodeDiff oldText={OLD} newText={NEW} diffStyle="unified" />);

    expect(html).toContain('data-slot="marker" data-line-type="add" aria-hidden="true" class="shrink-0 select-none">+</span>');
    expect(html).toContain('data-slot="marker" data-line-type="del" aria-hidden="true" class="shrink-0 select-none">-</span>');
  });

  test("exposes added and deleted line meaning without relying on color", () => {
    const html = renderToString(<CodeDiff oldText={OLD} newText={NEW} diffStyle="unified" />);

    expect(html).toContain("Deleted line 2: const b = 2;");
    expect(html).toContain("Added line 2: const b = 20;");
  });

  test("keeps the complete diff available when visual rows virtualize", () => {
    const oldText = Array.from({ length: 160 }, (_, index) => `old ${index + 1}`).join("\n");
    const newText = Array.from({ length: 160 }, (_, index) => `new ${index + 1}`).join("\n");
    const html = renderToString(<CodeDiff oldText={oldText} newText={newText} />);

    expect(html).toContain('data-slot="accessible-source"');
    expect(html).toContain("Deleted line 1: old 1");
    expect(html).toContain("Added line 160: new 160");
  });

  test("identical texts say so instead of rendering an empty body", () => {
    const html = renderToString(<CodeDiff name="same.ts" oldText={OLD} newText={OLD} />);

    expect(html).not.toContain('data-slot="line"');
    expect(html).toContain('data-slot="empty"');
    expect(html).toContain("No changes");
  });

  test("a blank context line keeps its row and a line break for text selection", () => {
    const patch = "--- a/notes.txt\n+++ b/notes.txt\n@@ -1,3 +1,3 @@\n one\n\n-three\n+THREE\n";
    const html = renderToString(<CodeDiff patch={patch} diffStyle="unified" />);
    const rows = html.match(/data-slot="line"/g) ?? [];

    expect(rows).toHaveLength(4);
    expect(html).toContain('<code class="min-w-0 flex-1 whitespace-pre">\n</code>');
    expect(html).toContain("Deleted line 3: three");
  });

  test("unchanged lines after the last change stay reachable through a trailing expander", () => {
    const oldText = Array.from({ length: 12 }, (_, index) => `row ${index + 1}`).join("\n");
    const html = renderToString(<CodeDiff oldText={oldText} newText={oldText.replace("row 3", "ROW 3")} expandLabel="Show hidden rows" />);

    expect(html).not.toContain("row 12</code>");
    expect(html.match(/data-slot="expand-button"[^>]*aria-label="Show hidden rows"/g)).toHaveLength(1);
  });

  test("a missing final newline is marked on its line and in the accessible source", () => {
    const withoutFinalNewline = "a\nb";
    const html = renderToString(
      <CodeDiff oldText={withoutFinalNewline} newText={`${withoutFinalNewline}\n`} noNewlineLabel="No trailing newline" />,
    );

    expect(html.match(/data-slot="no-newline"/g)).toHaveLength(1);
    expect(html).toContain('title="No trailing newline"');
    expect(html).toContain("Deleted line 2: b (No trailing newline)");
  });

  test("every announced string can be replaced", () => {
    const oldText = "a\nb\n";
    const newText = "a\nc\n";
    const html = renderToString(
      <CodeDiff
        name="demo.ts"
        oldText={oldText}
        newText={newText}
        copyLabel="Copier"
        getStatsLabel={(additions, deletions) => `${additions} ajout, ${deletions} retrait`}
        getLineLabel={(role, lineNumber, text) => `${role}|${lineNumber}|${text}`}
      />,
    );

    expect(html).toContain('aria-label="Copier"');
    expect(html).toContain("1 ajout, 1 retrait");
    expect(html).toContain("deleted|2|b");
    expect(html).toContain("added|2|c");
    expect(html).not.toContain("Deleted line");
  });
});
