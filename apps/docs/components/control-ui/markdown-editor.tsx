"use client";

import { useRender } from "@base-ui/react/use-render";
import type { Editor, Extensions } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useMarkdownEditor } from "./markdown-editor/context";
import { MarkdownEditorDragHandle } from "./markdown-editor/drag/drag-handle";
import { createRichEngine, pasteMarkdown } from "./markdown-editor/rich/engine";
import { createMarkdownCodec, markdownExtensions, requiresMarkdownSource } from "./markdown-editor/rich/extensions";
import { type MarkdownEditorContentProps, MarkdownEditorRoot, type MarkdownEditorRootProps } from "./markdown-editor/root";
import { MarkdownEditorSourceView } from "./markdown-editor/source-view";
import { MarkdownEditorTableControls } from "./markdown-editor/table/table-controls";
import { persistentUrlPolicy } from "./markdown-editor/url-policy";

export type { MarkdownEditorContentProps, MarkdownEditorStatus } from "./markdown-editor/root";

export type MarkdownEditorProps = MarkdownEditorRootProps & {
  /** Extra TipTap extensions, applied after the built-in Markdown set. Read once, when the editor mounts. */
  extensions?: Extensions;
};

type ContentAttributes = Record<string, string>;
const RichEditorContext = createContext<{ editor: Editor | null; setContentAttributes: (attributes: ContentAttributes) => void } | null>(
  null,
);

function useRichEditor() {
  const context = useContext(RichEditorContext);
  if (!context) throw new Error("MarkdownEditorContent requires a MarkdownEditor parent from the same module.");
  return context;
}

export function MarkdownEditor({
  extensions: extraExtensions,
  isUrlAllowed: urlPolicy = persistentUrlPolicy,
  ...props
}: MarkdownEditorProps) {
  const [isUrlAllowed] = useState(() => urlPolicy);
  const [options] = useState(() => ({ extensions: extraExtensions, isUrlAllowed }));
  const [codec] = useState(() => createMarkdownCodec(options));
  const [extensions] = useState(() => markdownExtensions(options));
  const [initialMarkdown] = useState(() => props.value ?? props.defaultValue ?? "");
  const [initialContent] = useState(() => (requiresMarkdownSource(initialMarkdown, codec, isUrlAllowed) ? "" : initialMarkdown));
  const [contentAttributes, setContentAttributes] = useState<ContentAttributes>({ role: "textbox", "aria-multiline": "true" });
  const editor = useEditor({
    extensions,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    content: initialContent,
    contentType: "markdown",
    editable: !props.disabled && !props.readOnly,
    editorProps: { attributes: contentAttributes, handlePaste: pasteMarkdown(codec, isUrlAllowed) },
  });
  const engine = useMemo(
    () => (editor ? createRichEngine(editor, codec, isUrlAllowed, initialMarkdown) : null),
    [editor, codec, isUrlAllowed, initialMarkdown],
  );
  return (
    <RichEditorContext value={{ editor, setContentAttributes }}>
      <MarkdownEditorRoot engine={engine} isUrlAllowed={isUrlAllowed} {...props} />
    </RichEditorContext>
  );
}

export function MarkdownEditorContent({ label, placeholder, autoFocus = false, ref, ...props }: MarkdownEditorContentProps) {
  const container = useRef<HTMLDivElement>(null);
  const { editor, setContentAttributes } = useRichEditor();
  const { disabled, readOnly, source } = useMarkdownEditor();
  const content = useRender({
    ref: [container, ref ?? null],
    render: (
      <div data-control-ui="markdown-editor" data-control-family="markdown-editor" data-slot="content" {...props}>
        <EditorContent editor={editor} />
        <MarkdownEditorDragHandle container={container} />
        <MarkdownEditorTableControls container={container} />
      </div>
    ),
  });
  useEffect(() => {
    setContentAttributes({
      role: "textbox",
      "aria-multiline": "true",
      "aria-label": label,
      "aria-disabled": String(disabled),
      "aria-readonly": String(readOnly),
      "data-placeholder": placeholder ?? "",
    });
  }, [setContentAttributes, label, disabled, readOnly, placeholder]);

  useEffect(() => {
    if (editor && !editor.isDestroyed && autoFocus && !source && !disabled) editor.commands.focus("end");
  }, [editor, autoFocus, source, disabled]);

  if (source || !editor)
    return <MarkdownEditorSourceView ref={ref} label={label} placeholder={placeholder} autoFocus={autoFocus} {...props} />;
  return content;
}
