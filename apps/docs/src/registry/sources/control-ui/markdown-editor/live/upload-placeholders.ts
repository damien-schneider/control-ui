import { type EditorState, StateEffect, StateField, type Text, Transaction } from "@codemirror/state";
import { Decoration, EditorView, WidgetType } from "@codemirror/view";
import type { MarkdownUploadPlaceholders } from "../engine";
import { enclosingNode } from "./format/inline";
import { imageMarkdown } from "./format/links";

type Placeholder = { id: string; name: string; pos: number };

const addPlaceholder = StateEffect.define<Placeholder>();
const dropPlaceholder = StateEffect.define<string>();
export const clearPlaceholders = StateEffect.define<null>();

class PlaceholderWidget extends WidgetType {
  constructor(readonly name: string) {
    super();
  }

  eq(other: PlaceholderWidget) {
    return other.name === this.name;
  }

  toDOM() {
    const element = document.createElement("div");
    element.dataset.imageUpload = "";
    element.setAttribute("role", "status");
    element.textContent = `Image: ${this.name}`;
    return element;
  }
}

function placeholderDecorations(state: EditorState, placeholders: readonly Placeholder[]) {
  return Decoration.set(
    placeholders.map((placeholder) => {
      const line = state.doc.lineAt(placeholder.pos);
      const before = placeholder.pos === line.from;
      return Decoration.widget({ widget: new PlaceholderWidget(placeholder.name), block: true, side: before ? -1 : 1 }).range(
        before ? line.from : line.to,
      );
    }),
    true,
  );
}

/** Placeholders stand before the line they were dropped on, mapped through edits, and never enter the Markdown. */
export const uploadPlaceholders = StateField.define<readonly Placeholder[]>({
  create: () => [],
  update(value, transaction) {
    let next = transaction.docChanged
      ? value.map((placeholder) => ({ ...placeholder, pos: transaction.changes.mapPos(placeholder.pos, -1) }))
      : value;
    for (const effect of transaction.effects) {
      if (effect.is(addPlaceholder)) next = [...next, effect.value];
      else if (effect.is(dropPlaceholder)) next = next.filter((placeholder) => placeholder.id !== effect.value);
      else if (effect.is(clearPlaceholders)) next = [];
    }
    return next;
  },
  provide: (field) => EditorView.decorations.compute([field], (state) => placeholderDecorations(state, state.field(field))),
});

const isBlank = (doc: Text, number: number) => number >= 1 && number <= doc.lines && doc.line(number).text.trim() === "";

/** A pending image waits on a blank line, or before the line after the one it was dropped on. */
function anchorAt(doc: Text, pos: number) {
  const line = doc.lineAt(pos);
  if (line.text.trim() === "") return line.from;
  return line.number < doc.lines ? line.to + 1 : line.to;
}

/** The image becomes its own paragraph: it fills a blank line, or is set apart from its neighbours by blank lines. */
function blockInsertion(doc: Text, pos: number, text: string) {
  const line = doc.lineAt(pos);
  const hasBefore = line.number > 1 && !isBlank(doc, line.number - 1);
  const hasAfter = line.number < doc.lines && !isBlank(doc, line.number + 1);
  if (line.text.trim() === "") return { from: line.from, to: line.to, insert: `${hasBefore ? "\n" : ""}${text}${hasAfter ? "\n" : ""}` };
  if (pos === line.from) return { from: pos, insert: `${hasBefore ? "\n" : ""}${text}\n\n` };
  return { from: line.to, insert: `\n\n${text}` };
}

export function createLiveUploads(view: EditorView): MarkdownUploadPlaceholders {
  const find = (id: string) => view.state.field(uploadPlaceholders).find((placeholder) => placeholder.id === id);
  return {
    insert(id, name, at) {
      const target = at ?? view.state.selection.main.to;
      const table = enclosingNode(view.state, { from: target, to: target }, "Table");
      const pos = anchorAt(view.state.doc, table ? table.to : target);
      view.dispatch({ effects: addPlaceholder.of({ id, name, pos }) });
    },
    complete(id, image) {
      const placeholder = find(id);
      if (!placeholder) return;
      const markdown = imageMarkdown({ src: image.url, alt: image.alt, title: image.title });
      view.dispatch({
        changes: blockInsertion(view.state.doc, placeholder.pos, markdown),
        effects: dropPlaceholder.of(id),
        annotations: Transaction.addToHistory.of(false),
      });
    },
    remove(id) {
      if (find(id)) view.dispatch({ effects: dropPlaceholder.of(id) });
    },
    has: (id) => find(id) !== undefined,
  };
}
