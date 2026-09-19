import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";

import { Code, CodeContent, CodeEditable } from "@/components/control-ui/ui/code";

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

  test("keeps compact wrapped commands on the lightweight path", () => {
    const html = renderToString(
      <Code density="compact" overflow="wrap">
        <CodeContent code="bun run dev" highlight="none" />
      </Code>,
    );

    expect(html).not.toContain('data-control-ui="scroll-area"');
    expect(html).toContain('data-slot="content"');
    expect(html).toContain("bun run dev");
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
});
