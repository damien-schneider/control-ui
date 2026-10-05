"use client";

import { Slice } from "@tiptap/pm/model";
import { EditorState } from "@tiptap/pm/state";
import { EditorContent, useEditor } from "@tiptap/react";
import { type ComponentProps, type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import type { MarkdownEditorKnobStyle } from "@/components/control-ui/knob-contracts/markdown-editor-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { Textarea } from "@/components/control-ui/ui/textarea";
import { MarkdownEditorContext, useMarkdownEditor } from "./markdown-editor/context";
import { MarkdownEditorDragHandle } from "./markdown-editor/drag-handle";
import { createMarkdownCodec, hasMarkdownContent, markdownExtensions, requiresMarkdownSource } from "./markdown-editor/extensions";
import type { MarkdownImageUploader } from "./markdown-editor/uploads";
import { useImageUploads } from "./markdown-editor/use-image-uploads";

export type MarkdownEditorStatus = { isEmpty: boolean; hasPendingUploads: boolean };
export type MarkdownEditorProps = Omit<ComponentProps<"div">, "defaultValue" | "onChange" | "style"> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (markdown: string) => void;
  disabled?: boolean;
  onUploadImage?: MarkdownImageUploader;
  maxImageBytes?: number;
  onStatusChange?: (status: MarkdownEditorStatus) => void;
  style?: CSSProperties & MarkdownEditorKnobStyle;
};

export function MarkdownEditor({
  value,
  defaultValue = "",
  onValueChange,
  disabled = false,
  onUploadImage,
  maxImageBytes = 10 * 1024 * 1024,
  onStatusChange,
  children,
  className,
  ...props
}: MarkdownEditorProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const markdown = value ?? internalValue;
  const [sourceMode, setSourceMode] = useState(false);
  const [contentAttributes, setContentAttributes] = useState<Record<string, string>>({ role: "textbox", "aria-multiline": "true" });
  const [codec] = useState(createMarkdownCodec);
  const sourceRequired = useMemo(() => requiresMarkdownSource(markdown, codec), [markdown, codec]);
  const source = sourceMode || sourceRequired;
  const lastValue = useRef(markdown);
  const [extensions] = useState(markdownExtensions);
  const handlers = useRef<{ upload: (files: File[], position?: number) => void; cancelAll: () => void } | null>(null);

  function setMarkdown(next: string) {
    lastValue.current = next;
    setInternalValue(next);
    onValueChange?.(next);
  }

  const editor = useEditor({
    extensions,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    content: sourceRequired ? "" : markdown,
    contentType: "markdown",
    editable: !disabled,
    onUpdate: ({ editor: currentEditor }) => setMarkdown(currentEditor.getMarkdown()),
    editorProps: {
      attributes: contentAttributes,
      handlePaste: (view, event) => {
        if (disabled) return false;
        const files = Array.from(event.clipboardData?.files ?? []);
        if (onUploadImage && files.length > 0) {
          event.preventDefault();
          handlers.current?.upload(files);
          return true;
        }
        const text = event.clipboardData?.getData("text/plain");
        if (!text || event.clipboardData?.getData("text/html") || requiresMarkdownSource(text, codec)) return false;
        const document = view.state.schema.nodeFromJSON(codec.parse(text));
        event.preventDefault();
        view.dispatch(view.state.tr.replaceSelection(Slice.maxOpen(document.content)).scrollIntoView());
        return true;
      },
      handleDrop: (view, event, _slice, moved) => {
        const files = Array.from(event.dataTransfer?.files ?? []);
        if (moved || !onUploadImage || disabled || files.length === 0) return false;
        event.preventDefault();
        const position = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
        handlers.current?.upload(files, position);
        return true;
      },
    },
  });
  const imageUploads = useImageUploads(editor, onUploadImage, maxImageBytes);
  useEffect(() => {
    handlers.current = imageUploads;
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    editor.setEditable(!disabled, false);
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const externalReset = lastValue.current !== markdown;
    if (externalReset) handlers.current?.cancelAll();
    if (source) {
      lastValue.current = markdown;
      return;
    }
    if (editor.getMarkdown() !== markdown) {
      editor.commands.setContent(markdown, { contentType: "markdown", emitUpdate: false });
      if (externalReset) {
        editor.view.updateState(EditorState.create({ schema: editor.schema, doc: editor.state.doc, plugins: editor.state.plugins }));
        editor.view.dispatch(editor.state.tr);
      }
    }
    lastValue.current = markdown;
  }, [editor, markdown, source]);

  const isEmpty = source ? markdown.trim() === "" : !hasMarkdownContent(codec.parse(markdown));
  const hasPendingUploads = imageUploads.uploads.length > 0;
  useEffect(() => {
    onStatusChange?.({ isEmpty, hasPendingUploads });
  }, [onStatusChange, isEmpty, hasPendingUploads]);

  return (
    <MarkdownEditorContext
      value={{
        editor,
        disabled,
        source,
        markdown,
        sourceRequired,
        setSource: setSourceMode,
        setMarkdown,
        setContentAttributes,
        canUpload: Boolean(onUploadImage),
        ...imageUploads,
      }}
    >
      <div
        data-control-ui="markdown-editor"
        data-control-family="markdown-editor"
        data-slot="root"
        data-disabled={disabled ? "" : undefined}
        className={cn("min-w-0", className)}
        {...props}
      >
        {children}
      </div>
    </MarkdownEditorContext>
  );
}

export type MarkdownEditorContentProps = {
  label: string;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
};

export function MarkdownEditorContent({ label, placeholder, autoFocus = false, className }: MarkdownEditorContentProps) {
  const container = useRef<HTMLDivElement>(null);
  const { editor, disabled, source, sourceRequired, markdown, setMarkdown, setContentAttributes } = useMarkdownEditor();
  useEffect(() => {
    setContentAttributes({
      role: "textbox",
      "aria-multiline": "true",
      "aria-label": label,
      "aria-disabled": String(disabled),
      "data-placeholder": placeholder ?? "",
    });
  }, [setContentAttributes, label, disabled, placeholder]);

  useEffect(() => {
    if (editor && !editor.isDestroyed && autoFocus && !source && !disabled) editor.commands.focus("end");
  }, [editor, autoFocus, source, disabled]);

  if (source || !editor)
    return (
      <div data-control-ui="markdown-editor" data-control-family="markdown-editor" data-slot="source" className={className}>
        {sourceRequired ? (
          <p role="status">This content uses Markdown that is only available in source mode. Its source is preserved.</p>
        ) : null}
        <Textarea
          aria-label={label}
          placeholder={placeholder}
          value={markdown}
          disabled={disabled || !editor}
          onChange={(event) => setMarkdown(event.target.value)}
          rows={5}
          autoFocus={autoFocus}
          style={{
            "--cui-field-background": "transparent",
            "--cui-field-border-width": "0px",
            "--cui-field-radius": "0px",
            "--cui-field-shadow": "none",
          }}
        />
      </div>
    );
  return (
    <div ref={container} data-control-ui="markdown-editor" data-control-family="markdown-editor" data-slot="content" className={className}>
      <EditorContent editor={editor} />
      <MarkdownEditorDragHandle container={container} />
    </div>
  );
}
