import type { Editor } from "@tiptap/core";
import { createContext, useContext } from "react";
import type { MarkdownUrlPolicy } from "./extensions";
import type { MarkdownImageUpload } from "./uploads";

export type MarkdownEditorLabels = {
  toolbar: string;
  selectionToolbar: string;
  bold: string;
  italic: string;
  strikethrough: string;
  inlineCode: string;
  bulletList: string;
  orderedList: string;
  taskList: string;
  quote: string;
  codeBlock: string;
  divider: string;
  undo: string;
  redo: string;
  source: string;
  sourceRequired: string;
  textStyle: (current: string) => string;
  text: string;
  paragraph: string;
  heading: (level: number) => string;
  headingShort: (level: number) => string;
  link: string;
  linkUrl: string;
  linkInvalid: string;
  applyLink: string;
  removeLink: string;
  image: string;
  imageUrl: string;
  imageInvalid: string;
  imageDescription: string;
  uploadImages: string;
  uploads: string;
  removeUpload: (fileName: string) => string;
  retryUpload: string;
  uploadFailed: string;
  uploadRejected: (maxMegabytes: number) => string;
  commands: string;
  mentions: string;
  noCommands: string;
  noMentions: string;
  suggestionCount: (count: number, listLabel: string) => string;
  dragHandle: string;
  dragHandleDescription: string;
  dragHandleHint: string;
  blockMoved: (direction: "up" | "down") => string;
  taskItem: string;
};

export const defaultMarkdownEditorLabels: MarkdownEditorLabels = {
  toolbar: "Markdown formatting",
  selectionToolbar: "Selection formatting",
  bold: "Bold",
  italic: "Italic",
  strikethrough: "Strikethrough",
  inlineCode: "Inline code",
  bulletList: "Bullet list",
  orderedList: "Numbered list",
  taskList: "Task list",
  quote: "Quote",
  codeBlock: "Code block",
  divider: "Divider",
  undo: "Undo",
  redo: "Redo",
  source: "Markdown source",
  sourceRequired: "This content uses Markdown that is only available in source mode. Its source is preserved.",
  textStyle: (current) => `Text style: ${current}`,
  text: "Text",
  paragraph: "Paragraph",
  heading: (level) => `Heading ${level}`,
  headingShort: (level) => `H${level}`,
  link: "Edit link",
  linkUrl: "URL",
  linkInvalid: "Enter a link this editor can keep, such as https://example.com.",
  applyLink: "Apply link",
  removeLink: "Remove link",
  image: "Insert image",
  imageUrl: "Image URL",
  imageInvalid: "Enter an image address this editor can keep, such as https://example.com/image.png.",
  imageDescription: "Image description",
  uploadImages: "Upload images",
  uploads: "Image uploads",
  removeUpload: (fileName) => `Remove ${fileName}`,
  retryUpload: "Retry upload",
  uploadFailed: "Image upload failed.",
  uploadRejected: (maxMegabytes) => `Choose a PNG, JPEG, GIF, WebP or AVIF image up to ${maxMegabytes} MB.`,
  commands: "Insert block",
  mentions: "Mention people",
  noCommands: "No commands found",
  noMentions: "No people found",
  suggestionCount: (count, listLabel) => `${count} ${listLabel.toLowerCase()} suggestions`,
  dragHandle: "Drag to reorder block",
  dragHandleDescription: "Drag this block, or use Alt+ArrowUp and Alt+ArrowDown to move it.",
  dragHandleHint: "Drag to reorder · Alt+↑/↓ to move",
  blockMoved: (direction) => `Block moved ${direction}.`,
  taskItem: "Task item",
};

export type MarkdownEditorContextValue = {
  editor: Editor | null;
  disabled: boolean;
  readOnly: boolean;
  /** Rich editing is possible: the editor is mounted, enabled, writable and not showing its Markdown source. */
  editable: boolean;
  labels: MarkdownEditorLabels;
  source: boolean;
  markdown: string;
  sourceRequired: boolean;
  isUrlAllowed: MarkdownUrlPolicy;
  setSource: (source: boolean) => void;
  setMarkdown: (value: string) => void;
  setContentAttributes: (attributes: Record<string, string>) => void;
  canUpload: boolean;
  uploads: MarkdownImageUpload[];
  upload: (files: File[], position?: number) => void;
  retryUpload: (id: string) => void;
  removeUpload: (id: string) => void;
  uploadError: string | null;
};

export const MarkdownEditorContext = createContext<MarkdownEditorContextValue | null>(null);

export function useMarkdownEditor() {
  const context = useContext(MarkdownEditorContext);
  if (!context) throw new Error("Markdown editor parts require a MarkdownEditor parent.");
  return context;
}
