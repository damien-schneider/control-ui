import type { Editor } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import type { MarkdownUploadPlaceholders } from "../engine";

function findImageUpload(document: ProseMirrorNode, id: string) {
  let position: number | undefined;
  document.descendants((node, pos) => {
    if (node.type.name === "imageUpload" && node.attrs.id === id) position = pos;
    return position === undefined;
  });
  return position;
}

/** Each pending upload is an `imageUpload` node that serializes to nothing until its image replaces it outside the history. */
export function createRichUploads(editor: Editor): MarkdownUploadPlaceholders {
  return {
    insert(id, name, at) {
      editor
        .chain()
        .focus()
        .insertContentAt(at ?? editor.state.selection.to, { type: "imageUpload", attrs: { id, name } })
        .run();
    },
    complete(id, image) {
      const position = findImageUpload(editor.state.doc, id);
      const { image: imageType, paragraph } = editor.schema.nodes;
      if (!imageType || !paragraph) throw new Error("Image uploads require image and paragraph nodes.");
      if (position === undefined) return;
      const node = imageType.create({ src: image.url, alt: image.alt, title: image.title ?? null });
      editor.view.dispatch(
        editor.state.tr.replaceWith(position, position + 1, paragraph.create(null, node)).setMeta("addToHistory", false),
      );
    },
    remove(id) {
      const position = findImageUpload(editor.state.doc, id);
      if (position !== undefined) editor.view.dispatch(editor.state.tr.delete(position, position + 1).setMeta("addToHistory", false));
    },
    has: (id) => findImageUpload(editor.state.doc, id) !== undefined,
  };
}
