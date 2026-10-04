"use client";

import { useChatComposerContext } from "@/components/control-ui/chat-composer";
import { MarkdownEditor, MarkdownEditorContent, type MarkdownEditorStatus } from "@/components/control-ui/markdown-editor";
import { type MarkdownEditorMention, MarkdownEditorSuggestions } from "@/components/control-ui/markdown-editor/suggestions";
import { MarkdownEditorToolbar, MarkdownEditorUploads } from "@/components/control-ui/markdown-editor/toolbar";
import type { MarkdownImageUploader } from "@/components/control-ui/markdown-editor/uploads";

export default function DiscussionMarkdownInput({
  label,
  placeholder,
  autoFocus,
  onUploadImage,
  mentions,
  onStatusChange,
  blocked,
}: {
  label: string;
  placeholder?: string;
  autoFocus?: boolean;
  onUploadImage?: MarkdownImageUploader;
  mentions?: readonly MarkdownEditorMention[];
  onStatusChange: (status: MarkdownEditorStatus) => void;
  blocked: boolean;
}) {
  const composer = useChatComposerContext();
  return (
    <MarkdownEditor
      value={composer.value}
      onValueChange={composer.setValue}
      disabled={composer.isDisabled || composer.isLocked}
      onUploadImage={onUploadImage}
      onStatusChange={onStatusChange}
      onKeyDownCapture={(event) => {
        if (!(event.target instanceof HTMLElement) || (!event.target.isContentEditable && event.target.tagName !== "TEXTAREA")) return;
        if (
          event.key !== "Enter" ||
          !(event.metaKey || event.ctrlKey) ||
          event.nativeEvent.isComposing ||
          event.nativeEvent.keyCode === 229
        )
          return;
        event.preventDefault();
        event.stopPropagation();
        if (!blocked) composer.submit();
      }}
    >
      <MarkdownEditorToolbar />
      <MarkdownEditorContent label={label} placeholder={placeholder} autoFocus={autoFocus} />
      <MarkdownEditorSuggestions mentions={mentions} />
      <MarkdownEditorUploads />
    </MarkdownEditor>
  );
}
