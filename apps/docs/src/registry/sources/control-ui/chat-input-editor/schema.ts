import type { DOMOutputSpec, NodeSpec } from "prosemirror-model";
import { Schema } from "prosemirror-model";

import type { ChatInputEditorExtension } from "./types";

// Base composer schema: plain-text paragraphs only; rich nodes (mention pill) come from extensions via createEditorSchema — keep this mention-free for composability.
const baseNodes: Record<string, NodeSpec> = {
  doc: { content: "block+" },
  paragraph: {
    group: "block",
    content: "inline*",
    parseDOM: [{ tag: "p" }],
    toDOM: (): DOMOutputSpec => ["p", 0],
  },
  text: { group: "inline" },
};

// Merges base nodes with every extension's node specs; later extensions win key collisions (each owns a distinct node name in practice).
export function createEditorSchema(extensions: readonly ChatInputEditorExtension[]): Schema {
  let nodes: Record<string, NodeSpec> = { ...baseNodes };
  for (const extension of extensions) {
    if (extension.nodes) nodes = { ...nodes, ...extension.nodes };
  }
  return new Schema({ nodes, marks: {} });
}
