import type { Node as ProseMirrorNode, Schema } from "prosemirror-model";
import { Slice } from "prosemirror-model";

// Each leaf serializes through its own schema `leafText`, so extensions stay self-describing and this stays mention-unaware.
export function serializeDoc(doc: ProseMirrorNode): string {
  return doc.textBetween(0, doc.content.size, "\n", (leaf) => {
    const leafText = leaf.type.spec.leafText;
    return typeof leafText === "function" ? leafText(leaf) : "";
  });
}

// external resets only — rebuilding doc from its own output would fight caret
export function docFromText(schema: Schema, text: string): ProseMirrorNode {
  const paragraph = schema.nodes.paragraph;
  const doc = schema.nodes.doc;
  if (!paragraph || !doc) {
    throw new Error("Chat composer schema requires doc and paragraph nodes.");
  }
  const blocks = text.split("\n").map((line) => paragraph.create(null, line === "" ? null : schema.text(line)));
  return doc.create(null, blocks.length === 0 ? paragraph.create() : blocks);
}

// ProseMirror's own plain-text paste splits on runs of newlines, which drops every blank line of a pasted prompt.
export function sliceFromText(schema: Schema, text: string): Slice {
  return Slice.maxOpen(docFromText(schema, text.replace(/\r\n?/g, "\n")).content);
}

// ProseMirror's own plain-text copy joins blocks with a blank line; a line here is a paragraph, so copy what would be sent.
export function serializeSlice(slice: Slice): string {
  return slice.content.textBetween(0, slice.content.size, "\n");
}
