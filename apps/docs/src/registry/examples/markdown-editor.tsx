"use client";

import { useState } from "react";
import { MarkdownEditor, MarkdownEditorContent } from "@/components/control-ui/markdown-editor";
import { MarkdownEditorSuggestions } from "@/components/control-ui/markdown-editor/suggestions";
import { MarkdownEditorToolbar, MarkdownEditorUploads } from "@/components/control-ui/markdown-editor/toolbar";
import { Markdown } from "@/components/control-ui/ui/markdown";
import { Text } from "@/components/control-ui/ui/typography";

const people = [
  { id: "alex", label: "Alex Morgan", href: "/people/alex", description: "Design" },
  { id: "sam", label: "Sam Rivera", href: "/people/sam", description: "Engineering" },
  { id: "jordan", label: "Jordan Lee", href: "/people/jordan", description: "Product" },
];

export function MarkdownEditorExample() {
  const [value, setValue] = useState(
    "## Project feedback\n\nWe need **clearer feedback** on the new dashboard.\n\n- [x] Describe the issue\n- [ ] Add a screenshot\n\n> Keep the next step easy to find.",
  );
  return (
    <div className="grid gap-6">
      <MarkdownEditor value={value} onValueChange={setValue}>
        <MarkdownEditorToolbar />
        <MarkdownEditorContent label="Project description" placeholder="Describe your project…" />
        <MarkdownEditorSuggestions mentions={people} />
        <MarkdownEditorUploads />
      </MarkdownEditor>
      <Text size="label" tone="muted">
        Type / for blocks or @ to mention someone. Drag the handle beside a block to reorder it.
      </Text>
      <section aria-label="Saved Markdown preview">
        <Markdown content={value} mode="static" />
      </section>
    </div>
  );
}
