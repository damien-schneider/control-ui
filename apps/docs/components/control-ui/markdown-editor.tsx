"use client";

import type { Extensions } from "@tiptap/core";
import { Slice } from "@tiptap/pm/model";
import { EditorState } from "@tiptap/pm/state";
import { EditorContent, useEditor } from "@tiptap/react";
import { type ComponentProps, type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import type { MarkdownEditorKnobStyle } from "@/components/control-ui/knob-contracts/markdown-editor-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { Textarea } from "@/components/control-ui/ui/textarea";
import {
  defaultMarkdownEditorLabels,
  MarkdownEditorContext,
  type MarkdownEditorLabels,
  useMarkdownEditor,
} from "./markdown-editor/context";
import { MarkdownEditorDragHandle } from "./markdown-editor/drag-handle";
import {
  createMarkdownCodec,
  hasMarkdownContent,
  type MarkdownUrlPolicy,
  markdownExtensions,
  persistentUrlPolicy,
  requiresMarkdownSource,
} from "./markdown-editor/extensions";
import type { MarkdownImageUploader } from "./markdown-editor/uploads";
import { useImageUploads } from "./markdown-editor/use-image-uploads";

export type MarkdownEditorStatus = { isEmpty: boolean; hasPendingUploads: boolean };
export type MarkdownEditorProps = Omit<ComponentProps<"div">, "defaultValue" | "onChange" | "style"> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (markdown: string) => void;
  disabled?: boolean;
  /** Shows the content without letting it change; the Markdown source stays viewable. */
  readOnly?: boolean;
  /** Replaces any of the editor's built-in strings, for every part at once. */
  labels?: Partial<MarkdownEditorLabels>;
  onUploadImage?: MarkdownImageUploader;
  maxImageBytes?: number;
  onStatusChange?: (status: MarkdownEditorStatus) => void;
  /** Extra TipTap extensions, applied after the built-in Markdown set. Read once, when the editor mounts. */
  extensions?: Extensions;
  /** Which link and image URLs the editor keeps; defaults to URLs that survive a reload. Read once, when the editor mounts. */
  isUrlAllowed?: MarkdownUrlPolicy;
  style?: CSSProperties & MarkdownEditorKnobStyle;
};

export function MarkdownEditor({
  value,
  defaultValue = "",
  onValueChange,
  disabled = false,
  readOnly = false,
  labels: labelOverrides,
  onUploadImage,
  maxImageBytes = 10 * 1024 * 1024,
  onStatusChange,
  extensions: extraExtensions,
  isUrlAllowed: urlPolicy = persistentUrlPolicy,
  children,
  className,
  ...props
}: MarkdownEditorProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const markdown = value ?? internalValue;
  const [sourceMode, setSourceMode] = useState(false);
  const [contentAttributes, setContentAttributes] = useState<Record<string, string>>({ role: "textbox", "aria-multiline": "true" });
  const [isUrlAllowed] = useState(() => urlPolicy);
  const [extensionOptions] = useState(() => ({ extensions: extraExtensions, isUrlAllowed }));
  const [codec] = useState(() => createMarkdownCodec(extensionOptions));
  const sourceRequired = useMemo(() => requiresMarkdownSource(markdown, codec, isUrlAllowed), [markdown, codec, isUrlAllowed]);
  const source = sourceMode || sourceRequired;
  const lastValue = useRef(markdown);
  const [extensions] = useState(() => markdownExtensions(extensionOptions));
  const handlers = useRef<{ upload: (files: File[], position?: number) => void; cancelAll: () => void } | null>(null);
  const labels = useMemo(() => ({ ...defaultMarkdownEditorLabels, ...labelOverrides }), [labelOverrides]);
  const writable = !disabled && !readOnly;

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
    editable: writable,
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
        if (!text || event.clipboardData?.getData("text/html") || requiresMarkdownSource(text, codec, isUrlAllowed)) return false;
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
  const imageUploads = useImageUploads(editor, onUploadImage, maxImageBytes, isUrlAllowed, labels);
  useEffect(() => {
    handlers.current = imageUploads;
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    editor.setEditable(writable, false);
  }, [editor, writable]);

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
        readOnly,
        editable: Boolean(editor) && writable && !source,
        labels,
        source,
        markdown,
        sourceRequired,
        setSource: setSourceMode,
        setMarkdown,
        setContentAttributes,
        canUpload: Boolean(onUploadImage),
        isUrlAllowed,
        ...imageUploads,
      }}
    >
      <div
        data-control-ui="markdown-editor"
        data-control-family="markdown-editor"
        data-slot="root"
        data-disabled={disabled ? "" : undefined}
        data-readonly={readOnly ? "" : undefined}
        className={cn("min-w-0", className)}
        {...props}
      >
        {children}
      </div>
    </MarkdownEditorContext>
  );
}

export type MarkdownEditorContentProps = Omit<ComponentProps<"div">, "children"> & {
  label: string;
  placeholder?: string;
  autoFocus?: boolean;
};

export function MarkdownEditorContent({ label, placeholder, autoFocus = false, ref, ...props }: MarkdownEditorContentProps) {
  const container = useRef<HTMLDivElement>(null);
  const { editor, disabled, readOnly, labels, source, sourceRequired, markdown, setMarkdown, setContentAttributes } = useMarkdownEditor();
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
    return (
      <div ref={ref} data-control-ui="markdown-editor" data-control-family="markdown-editor" data-slot="source" {...props}>
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
  return (
    <div
      ref={(node) => {
        container.current = node;
        if (typeof ref === "function") return ref(node);
        if (ref) ref.current = node;
      }}
      data-control-ui="markdown-editor"
      data-control-family="markdown-editor"
      data-slot="content"
      {...props}
    >
      <EditorContent editor={editor} />
      <MarkdownEditorDragHandle container={container} />
    </div>
  );
}
