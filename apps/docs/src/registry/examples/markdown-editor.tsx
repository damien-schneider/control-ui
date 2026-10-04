"use client";

import { useState } from "react";
import { MarkdownEditor, MarkdownEditorContent } from "@/components/control-ui/markdown-editor";
import { MarkdownEditorToolbar, MarkdownEditorUploads } from "@/components/control-ui/markdown-editor/toolbar";
import { Markdown } from "@/components/control-ui/ui/markdown";

export function MarkdownEditorExample() {
  const [value, setValue] = useState(
    "## Project feedback\n\nWe need **clearer feedback** on the new dashboard.\n\n- [x] Describe the issue\n- [ ] Add a screenshot\n\n> Keep the next step easy to find.",
  );
  return (
    <div className="grid gap-6">
      <MarkdownEditor value={value} onValueChange={setValue}>
        <MarkdownEditorToolbar />
        <MarkdownEditorContent label="Project description" placeholder="Describe your project…" />
        <MarkdownEditorUploads />
      </MarkdownEditor>
      <section aria-label="Saved Markdown preview">
        <Markdown content={value} mode="static" />
      </section>
    </div>
  );
}
