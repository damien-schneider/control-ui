import type { Editor } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { isEditorUrl } from "./extensions";

export type MarkdownImage = { url: string; alt?: string; title?: string };
export type MarkdownImageUploader = (
  file: File,
  options: { signal: AbortSignal; onProgress: (progress: number) => void },
) => Promise<MarkdownImage>;
export type MarkdownImageUpload = {
  id: string;
  file: File;
  status: "uploading" | "error";
  progress?: number;
  error?: string;
};

export function findImageUpload(document: ProseMirrorNode, id: string) {
  let position: number | undefined;
  document.descendants((node, pos) => {
    if (node.type.name === "imageUpload" && node.attrs.id === id) position = pos;
  });
  return position;
}

export function completeImageUpload(editor: Editor, id: string, image: MarkdownImage, fallbackAlt: string) {
  if (!isEditorUrl(image.url, true)) throw new Error("The upload must return a permanent HTTP(S) or root-relative image URL.");
  const position = findImageUpload(editor.state.doc, id);
  if (position === undefined) return;
  const imageType = editor.schema.nodes.image;
  const paragraphType = editor.schema.nodes.paragraph;
  if (!imageType || !paragraphType) throw new Error("Image uploads require image and paragraph nodes.");
  const node = imageType.create({ src: image.url, alt: image.alt ?? fallbackAlt, title: image.title ?? null });
  editor.view.dispatch(
    editor.state.tr.replaceWith(position, position + 1, paragraphType.create(null, node)).setMeta("addToHistory", false),
  );
}

export const markdownImageTypes = ["image/png", "image/jpeg", "image/gif", "image/webp", "image/avif"];
