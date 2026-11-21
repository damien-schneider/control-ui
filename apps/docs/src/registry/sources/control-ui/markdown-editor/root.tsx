"use client";

import { type ComponentProps, type CSSProperties, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import type { MarkdownEditorKnobStyle } from "@/components/control-ui/knob-contracts/markdown-editor-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { defaultMarkdownEditorLabels, MarkdownEditorContext, type MarkdownEditorLabels, useEngineSnapshot } from "./context";
import type { MarkdownEditorEngine } from "./engine";
import { type MarkdownImageUploader, useImageUploads } from "./uploads";
import { type MarkdownUrlPolicy, persistentUrlPolicy } from "./url-policy";

export type MarkdownEditorStatus = { isEmpty: boolean; hasPendingUploads: boolean };
export type MarkdownEditorRootProps = Omit<ComponentProps<"div">, "defaultValue" | "onChange" | "style"> & {
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
  /** Which link and image URLs the editor keeps; defaults to URLs that survive a reload. Read once, when the editor mounts. */
  isUrlAllowed?: MarkdownUrlPolicy;
  style?: CSSProperties & MarkdownEditorKnobStyle;
};

export type MarkdownEditorContentProps = Omit<ComponentProps<"div">, "children"> & {
  label: string;
  placeholder?: string;
  autoFocus?: boolean;
};

const filesOf = (transfer: DataTransfer | null) => Array.from(transfer?.files ?? []);

export function MarkdownEditorRoot({
  engine,
  value,
  defaultValue = "",
  onValueChange,
  disabled = false,
  readOnly = false,
  labels: labelOverrides,
  onUploadImage,
  maxImageBytes = 10 * 1024 * 1024,
  onStatusChange,
  isUrlAllowed = persistentUrlPolicy,
  children,
  className,
  ...props
}: MarkdownEditorRootProps & { engine: MarkdownEditorEngine | null }) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const markdown = value ?? internalValue;
  const [sourceMode, setSourceMode] = useState(false);
  const emitted = useRef(markdown);
  const labels = useMemo(() => ({ ...defaultMarkdownEditorLabels, ...labelOverrides }), [labelOverrides]);
  const snapshot = useEngineSnapshot(engine);
  const writable = !disabled && !readOnly;
  const source = sourceMode || snapshot.sourceRequired;
  const editable = engine !== null && writable && !(source && engine.sourceView === "textarea");
  const { cancelAll, ...imageUploads } = useImageUploads(engine, onUploadImage, maxImageBytes, isUrlAllowed, labels);

  function setMarkdown(next: string) {
    emitted.current = next;
    setInternalValue(next);
    onValueChange?.(next);
  }

  function upload(files: File[], position?: number) {
    if (writable) imageUploads.upload(files, position);
  }

  const emit = useEffectEvent(setMarkdown);
  const uploadFiles = useEffectEvent(upload);
  const cancelUploads = useEffectEvent(cancelAll);

  useEffect(() => engine?.onChange(emit), [engine]);

  useEffect(() => {
    engine?.setEditable(writable);
  }, [engine, writable]);

  useEffect(() => {
    if (!engine) return;
    if (emitted.current !== markdown) {
      emitted.current = markdown;
      cancelUploads();
    }
    engine.setMarkdown(markdown);
  }, [engine, markdown]);

  const canUpload = Boolean(onUploadImage);
  useEffect(() => {
    if (!engine || !canUpload) return;
    const element = engine.element;
    function paste(event: ClipboardEvent) {
      const files = filesOf(event.clipboardData);
      if (files.length === 0) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      uploadFiles(files);
    }
    function drop(event: DragEvent) {
      const files = filesOf(event.dataTransfer);
      if (files.length === 0) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      uploadFiles(files, engine?.positionAt({ x: event.clientX, y: event.clientY }) ?? undefined);
    }
    element.addEventListener("paste", paste, true);
    element.addEventListener("drop", drop, true);
    return () => {
      element.removeEventListener("paste", paste, true);
      element.removeEventListener("drop", drop, true);
    };
  }, [engine, canUpload]);

  const isEmpty = engine ? snapshot.isEmpty : markdown.trim() === "";
  const hasPendingUploads = imageUploads.uploads.length > 0;
  useEffect(() => {
    onStatusChange?.({ isEmpty, hasPendingUploads });
  }, [onStatusChange, isEmpty, hasPendingUploads]);

  return (
    <MarkdownEditorContext
      value={{
        engine,
        disabled,
        readOnly,
        editable,
        labels,
        source,
        markdown,
        sourceRequired: snapshot.sourceRequired,
        setSource: setSourceMode,
        setMarkdown,
        canUpload,
        isUrlAllowed,
        ...imageUploads,
        upload,
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
