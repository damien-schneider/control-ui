import type { Editor } from "@tiptap/core";
import { createContext, useContext } from "react";
import type { MarkdownImageUpload } from "./uploads";

export type MarkdownEditorContextValue = {
  editor: Editor | null;
  disabled: boolean;
  source: boolean;
  markdown: string;
  sourceRequired: boolean;
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
