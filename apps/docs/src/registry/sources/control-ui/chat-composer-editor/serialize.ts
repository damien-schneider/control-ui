import type { Node as ProseMirrorNode, Schema } from "prosemirror-model";

// Doc is source of truth; these bridge it to chat-composer hook's plain-string value (canSubmit/consumers) and back for external resets (clear, edit-prefill).
// serializeDoc is generic — no mention knowledge; each leaf serializes via its own schema leafText (mention sets "@label"), so extensions stay self-describing.

// Doc → plain text. Blocks join with "\n"; each leaf contributes its schema `leafText` (empty if none).
export function serializeDoc(doc: ProseMirrorNode): string {
  return doc.textBetween(0, doc.content.size, "\n", (leaf) => {
    const leafText = leaf.type.spec.leafText;
    return typeof leafText === "function" ? leafText(leaf) : "";
  });
}

// Plain string → doc, one paragraph per line. Used only for external resets (editor never rebuilds its doc from its own output — would fight caret).
export function docFromText(schema: Schema, text: string): ProseMirrorNode {
  const paragraph = schema.nodes.paragraph;
  const blocks = text.split("\n").map((line) => paragraph.create(null, line === "" ? null : schema.text(line)));
  return schema.nodes.doc.create(null, blocks.length === 0 ? paragraph.create() : blocks);
}
