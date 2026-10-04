"use client";

import { useState } from "react";
import { MarkdownEditor, MarkdownEditorContent } from "@/components/control-ui/markdown-editor";
import { type MarkdownEditorMention, MarkdownEditorSuggestions } from "@/components/control-ui/markdown-editor/suggestions";
import { MarkdownEditorToolbar, MarkdownEditorUploads } from "@/components/control-ui/markdown-editor/toolbar";
import type { MarkdownImageUploader } from "@/components/control-ui/markdown-editor/uploads";

export default function ProjectDescription({
  initialMarkdown,
  onChange,
  uploadImage,
  people,
}: {
  initialMarkdown: string;
  onChange: (markdown: string) => void;
  uploadImage: MarkdownImageUploader;
  people: readonly MarkdownEditorMention[];
}) {
  const [value, setValue] = useState(initialMarkdown);
  return (
    <MarkdownEditor
      value={value}
      onValueChange={(markdown) => {
        setValue(markdown);
        onChange(markdown);
      }}
      onUploadImage={uploadImage}
    >
      <MarkdownEditorToolbar />
      <MarkdownEditorContent label="Project description" placeholder="Describe the project…" />
      <MarkdownEditorSuggestions mentions={people} />
      <MarkdownEditorUploads />
    </MarkdownEditor>
  );
}
