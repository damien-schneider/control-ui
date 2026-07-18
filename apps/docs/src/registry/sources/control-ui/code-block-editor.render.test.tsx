import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";

import { CodeBlockEditor, CodeBlockEditorContent } from "@/components/control-ui/code-block-editor";

describe("CodeBlockEditor renders", () => {
  test("plain and highlighted content share the Code palette foreground", () => {
    const html = renderToString(
      <CodeBlockEditor>
        <CodeBlockEditorContent code="const answer = 42;" highlight="none" />
      </CodeBlockEditor>,
    );

    expect(html).toContain("var(--code-foreground)");
  });
});
