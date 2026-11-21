"use client";

import { Textarea } from "@/components/control-ui/ui/textarea";
import { useMarkdownEditor } from "./context";
import type { MarkdownEditorContentProps } from "./root";

/** The Markdown as plain text: source mode, and the stand-in before an editor mounts. Editable only in source mode. */
export function MarkdownEditorSourceView({ label, placeholder, autoFocus = false, ...props }: MarkdownEditorContentProps) {
  const { disabled, readOnly, labels, source, sourceRequired, markdown, setMarkdown } = useMarkdownEditor();
  return (
    <div data-control-ui="markdown-editor" data-control-family="markdown-editor" data-slot="source" {...props}>
      {sourceRequired ? <p role="status">{labels.sourceRequired}</p> : null}
      <Textarea
        aria-label={label}
        placeholder={placeholder}
        value={markdown}
        disabled={disabled}
        readOnly={readOnly || !source}
        onChange={(event) => setMarkdown(event.target.value)}
        rows={5}
        autoFocus={autoFocus}
        style={{
          "--cui-field-background": "transparent",
          "--cui-field-border-width": "0px",
          "--cui-field-radius": "0px",
          "--cui-field-shadow": "0 0 transparent",
        }}
      />
    </div>
  );
}
