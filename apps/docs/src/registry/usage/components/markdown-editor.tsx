"use client";

import { useState } from "react";
import { MarkdownEditor, MarkdownEditorContent } from "@/components/control-ui/markdown-editor";
import { MarkdownEditorToolbar, MarkdownEditorUploads } from "@/components/control-ui/markdown-editor/toolbar";
import type { MarkdownImageUploader } from "@/components/control-ui/markdown-editor/uploads";

export default function ProjectDescription({
  initialMarkdown,
  onChange,
  uploadImage,
}: {
  initialMarkdown: string;
  onChange: (markdown: string) => void;
  uploadImage: MarkdownImageUploader;
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
      <MarkdownEditorUploads />
    </MarkdownEditor>
  );
}
