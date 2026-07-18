import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";

import { Code, CodeContent } from "@/components/control-ui/ui/code";

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
        <CodeContent code={code} highlight="none" />
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
});
