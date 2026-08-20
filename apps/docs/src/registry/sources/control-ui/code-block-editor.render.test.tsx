import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";

import { CodeBlockEditor, CodeBlockEditorContent } from "@/components/control-ui/code-block-editor";

describe("CodeBlockEditor renders", () => {
  test("stamps code block editor anatomy on plain content", () => {
    const html = renderToString(
      <CodeBlockEditor>
        <CodeBlockEditorContent code="const answer = 42;" highlight="none" />
      </CodeBlockEditor>,
    );

    expect(html).toContain('data-control-ui="code-block-editor"');
    expect(html).toContain('data-slot="content"');
  });
});
