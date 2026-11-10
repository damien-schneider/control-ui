import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";

import { Code, CodeContent, CodeEditable, CodeHeader, CodeTitle } from "@/components/control-ui/ui/code";

describe("Code renders", () => {
  test("uses the shared ScrollArea for scrollable code", () => {
    const html = renderToString(
      <Code>
        <CodeContent code="const answer = 42;" highlight="none" />
      </Code>,
    );

    expect(html).toContain('data-control-ui="scroll-area"');
    expect(html).toContain('data-slot="content"');
    expect(html).toContain("const answer = 42;");
  });

  test("keeps the complete source available when visual rows virtualize", () => {
    const code = Array.from({ length: 201 }, (_, index) => `line ${index + 1}`).join("\n");
    const html = renderToString(
      <Code>
        <CodeContent code={code} highlight="none" virtualize />
      </Code>,
    );

    expect(html).toContain('data-slot="accessible-source"');
    expect(html).toContain("line 1");
    expect(html).toContain("line 201");
  });

  test("blank source lines do not inject zero-width characters into selection", () => {
    const code = "first\n\nthird";
    const html = renderToString(
      <Code>
        <CodeContent code={code} highlight="none" />
      </Code>,
    );

    expect(html).not.toContain("​");
    // an empty row has no text node, so selecting across it would copy "first\nthird"
    expect(html).toContain('<code class="min-w-0 flex-1 whitespace-pre">\n</code>');
  });

  test("tokens that no longer match their line fall back to the source text", () => {
    const code = "const a = 1;\nconst b = 2;";
    const html = renderToString(
      <Code>
        <CodeContent code={code} tokens={[[{ content: "const a = 1;" }], [{ content: "const stale = 0;" }]]} />
      </Code>,
    );

    expect(html).toContain("<span>const a = 1;</span>");
    expect(html).toContain("const b = 2;");
    expect(html).not.toContain("const stale = 0;");
  });

  test("highlights lines by their displayed number", () => {
    const code = "ten\neleven\ntwelve";
    const html = renderToString(
      <Code>
        <CodeContent code={code} startLine={10} highlightLines={[11]} highlight="none" />
      </Code>,
    );

    const highlightedRows = html.match(/<div[^>]*data-highlighted[^>]*>.*?<\/div>/g) ?? [];
    expect(highlightedRows).toHaveLength(1);
    expect(highlightedRows[0]).toContain("eleven");
  });

  test("names the editable surface after the file it edits", () => {
    const html = renderToString(
      <Code>
        <CodeEditable defaultValue="const answer = 42;" fileName="scratch.tsx" />
      </Code>,
    );

    expect(html).toContain('aria-label="scratch.tsx code"');
    expect(html).toContain("const answer = 42;");
  });

  test("a headerless surface overlays copy by default and drops it on request", () => {
    const withCopy = renderToString(
      <Code chrome="embedded">
        <CodeContent code="bun run dev" highlight="none" />
      </Code>,
    );
    const withoutCopy = renderToString(
      <Code chrome="embedded" copy={false}>
        <CodeContent code="bun run dev" highlight="none" />
      </Code>,
    );

    expect(withCopy).toContain('data-code-floating="true"');
    expect(withoutCopy).not.toContain('data-code-floating="true"');
  });

  test("CRLF sources render one row per line without the carriage return", () => {
    const crlfSource = "first\r\nsecond";
    const html = renderToString(
      <Code>
        <CodeContent code={crlfSource} highlight="none" />
      </Code>,
    );

    expect(html).toContain(">first</code>");
    expect(html).toContain(">second</code>");
    expect(html).not.toContain("\r");
  });

  test("the floating copy button takes its name from the content", () => {
    const html = renderToString(
      <Code>
        <CodeContent code="bun run dev" highlight="none" copyLabel="Copier le code" />
      </Code>,
    );

    expect(html).toContain('aria-label="Copier le code"');
    expect(html).not.toContain('aria-label="Copy code"');
  });

  test("a direct header replaces the floating copy button", () => {
    const html = renderToString(
      <Code>
        <CodeHeader>
          <CodeTitle>demo.ts</CodeTitle>
        </CodeHeader>
        <CodeContent code="bun run dev" highlight="none" />
      </Code>,
    );

    expect(html).not.toContain('data-code-floating="true"');
  });

  test("the editor leaves its focus indicator to the surface frame", () => {
    const html = renderToString(
      <Code>
        <CodeEditable defaultValue="const answer = 42;" />
      </Code>,
    );

    expect(html).toMatch(/<textarea[^>]*data-slot="editor"[^>]*data-focus-ring="none"/);
  });
});
