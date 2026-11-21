"use client";

import { useState } from "react";
import { MarkdownEditorSuggestions } from "@/components/control-ui/markdown-editor/suggestions";
import { MarkdownEditorToolbar, MarkdownEditorUploads } from "@/components/control-ui/markdown-editor/toolbar";
import { MarkdownEditor, MarkdownEditorContent } from "@/components/control-ui/markdown-editor-live";
import { Code, CodeContent } from "@/components/control-ui/ui/code";
import { Text } from "@/components/control-ui/ui/typography";

const people = [
  { id: "alex", label: "Alex Morgan", href: "/people/alex", description: "Design" },
  { id: "sam", label: "Sam Rivera", href: "/people/sam", description: "Engineering" },
  { id: "jordan", label: "Jordan Lee", href: "/people/jordan", description: "Product" },
];

const initialMarkdown = `## Project feedback

We need **clearer feedback** on the new dashboard.

- [x] Describe the issue
- [ ] Add a screenshot

| Area | Owner | Status |
| --- | --- | :---: |
| Dashboard | Sam | Review |
| Settings | Alex | Done |

> Keep the next step easy to find.`;

export function MarkdownEditorLiveExample() {
  const [value, setValue] = useState(initialMarkdown);
  return (
    <div className="grid gap-6">
      <MarkdownEditor value={value} onValueChange={setValue}>
        <MarkdownEditorToolbar />
        <MarkdownEditorContent label="Project description" placeholder="Describe your project…" />
        <MarkdownEditorSuggestions mentions={people} />
        <MarkdownEditorUploads />
      </MarkdownEditor>
      <Text size="label" tone="muted">
        Markup appears where the caret is and hides elsewhere; the Markdown you type is the Markdown you save.
      </Text>
      <Code overflow="wrap">
        <CodeContent code={value} lang="md" aria-label="Saved Markdown" />
      </Code>
    </div>
  );
}
