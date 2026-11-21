import { isolateHistory } from "@codemirror/commands";
import { syntaxTree } from "@codemirror/language";
import { type EditorState, type Extension, Prec, type Range, StateEffect, StateField } from "@codemirror/state";
import { type Command, Decoration, type DecorationSet, EditorView, keymap, ViewPlugin } from "@codemirror/view";
import type { MarkdownTables } from "../../engine";
import {
  alignColumn,
  appendColumn,
  appendRow,
  cellAt,
  deleteColumn,
  deleteRow,
  insertColumn,
  insertRow,
  moveColumn,
  moveRow,
  parseTable,
} from "./table-model";
import { fromCell, renderedTables, type TableLine, type TableView, TableWidget, tableViewOf } from "./table-widget";

type SelectedLine = { from: number; line: TableLine };
type LiveTables = { decorations: DecorationSet; selected: SelectedLine | null };

const selectLine = StateEffect.define<SelectedLine | null>();

function tableDecorations(state: EditorState, selected: SelectedLine | null): DecorationSet {
  const editable = state.facet(EditorView.editable);
  const ranges: Range<Decoration>[] = [];
  for (let node = syntaxTree(state).topNode.firstChild; node; node = node.nextSibling) {
    if (node.name !== "Table" || state.doc.lineAt(node.from).from !== node.from) continue;
    const to = state.doc.lineAt(node.to).to;
    const text = state.sliceDoc(node.from, to);
    if (!parseTable(text)) continue;
    const line = selected?.from === node.from ? selected.line : null;
    ranges.push(Decoration.replace({ widget: new TableWidget(text, editable, line), block: true }).range(node.from, to));
  }
  return Decoration.set(ranges);
}

/** Top-level tables render as grids of cell editors; a row or column selection lasts until the next edit or caret move. */
const liveTablesField = StateField.define<LiveTables>({
  create: (state) => ({ decorations: tableDecorations(state, null), selected: null }),
  update(value, transaction) {
    let selected = transaction.docChanged || transaction.selection ? null : value.selected;
    for (const effect of transaction.effects) if (effect.is(selectLine)) selected = effect.value;
    const editableChanged = transaction.startState.facet(EditorView.editable) !== transaction.state.facet(EditorView.editable);
    const treeChanged = syntaxTree(transaction.startState) !== syntaxTree(transaction.state);
    if (!(transaction.docChanged || editableChanged || treeChanged) && selected === value.selected) return value;
    return { decorations: tableDecorations(transaction.state, selected), selected };
  },
  provide: (field) => EditorView.decorations.from(field, (value) => value.decorations),
});

function tableAround(view: EditorView, pos: number) {
  for (const table of renderedTables(view)) {
    const range = table.range();
    if (range && pos >= range.from && pos <= range.to) return table;
  }
  return null;
}

export function activeTableCell(view: EditorView): { editor: EditorView; from: number } | null {
  for (const owner of renderedTables(view)) {
    const active = owner.activeCell();
    const cell = active && owner.model()?.rows[active.row]?.cells[active.column];
    if (active && cell) return { editor: active.editor.view, from: cell.from };
  }
  return null;
}

/** When the caret lands on a table, the cell under it takes focus: the outer editor never edits table text itself. */
const tableFocus = ViewPlugin.define((view) => ({
  update(update) {
    if (!(update.selectionSet || update.focusChanged) || update.transactions.some((transaction) => transaction.annotation(fromCell)))
      return;
    queueMicrotask(() => {
      if (!view.hasFocus) return;
      const { head } = view.state.selection.main;
      tableAround(view, head)?.focusAt(head);
    });
  },
}));

/** ArrowUp and ArrowDown enter a table in the column under the caret, like moving between lines. */
function enterVertically(forward: boolean): Command {
  return (view) => {
    const range = view.state.selection.main;
    if (!range.empty) return false;
    const table = tableAround(view, view.moveVertically(range, forward).head);
    const model = table?.model();
    if (!(table && model)) return false;
    const x = view.coordsAtPos(range.head)?.left ?? 0;
    return table.focusCell(forward ? 0 : model.rows.length - 1, table.columnAt(x), forward ? "start" : "end");
  };
}

export const liveTables: Extension = [
  liveTablesField,
  tableFocus,
  Prec.high(
    keymap.of([
      { key: "ArrowDown", run: enterVertically(true) },
      { key: "ArrowUp", run: enterVertically(false) },
    ]),
  ),
];

export function createLiveTables(view: EditorView): MarkdownTables {
  const viewOf = (table: HTMLTableElement): TableView | null => {
    const owner = tableViewOf(table);
    return owner?.outer === view ? owner : null;
  };
  const modelOf = (table: HTMLTableElement) => {
    const owner = viewOf(table);
    const model = owner?.model();
    return owner && model ? { owner, model } : null;
  };

  function caretInTables() {
    const { head } = view.state.selection.main;
    const owner = tableAround(view, head);
    const model = owner?.model();
    const address = model && cellAt(model, head);
    return owner && address ? { table: owner.table, ...address } : null;
  }

  function selectedLine() {
    const selected = view.state.field(liveTablesField, false)?.selected;
    if (!selected) return null;
    for (const owner of renderedTables(view)) {
      if (owner.range()?.from !== selected.from) continue;
      const { axis, index } = selected.line;
      return { table: owner.table, row: axis === "row" ? index : 0, column: axis === "column" ? index : 0 };
    }
    return null;
  }

  return {
    caret() {
      for (const owner of renderedTables(view)) {
        const active = owner.activeCell();
        if (active) return { table: owner.table, row: active.row, column: active.column };
      }
      return caretInTables() ?? selectedLine();
    },
    select(table, axis, index) {
      const from = viewOf(table)?.range()?.from;
      if (from !== undefined) view.dispatch({ effects: selectLine.of({ from, line: { axis, index } }) });
    },
    move(table, axis, from, to) {
      const found = modelOf(table);
      const edit = found && (axis === "row" ? moveRow(found.model, from, to) : moveColumn(found.model, from, to));
      if (!(found && edit)) return false;
      view.dispatch({
        changes: edit.changes,
        effects: selectLine.of({ from: found.model.from, line: { axis, index: to } }),
        annotations: isolateHistory.of("full"),
        userEvent: "move.table",
      });
      return true;
    },
    insert(table, axis, index, side) {
      const found = modelOf(table);
      if (!found) return;
      found.owner.apply(axis === "row" ? insertRow(found.model, index, side) : insertColumn(found.model, index, side));
    },
    remove(table, axis, index) {
      const found = modelOf(table);
      if (!found) return;
      const { model, owner } = found;
      const edit = axis === "row" ? deleteRow(model, index) : deleteColumn(model, index);
      const row = axis === "row" ? Math.min(index, model.rows.length - 2) : 0;
      const column = axis === "column" ? Math.min(index, model.columns - 2) : 0;
      owner.apply(edit, { row, column });
    },
    align(table, column, align) {
      const found = modelOf(table);
      if (found) found.owner.apply(alignColumn(found.model, column, align), { row: 0, column });
    },
    append(table, axis) {
      const found = modelOf(table);
      if (found) found.owner.apply(axis === "row" ? appendRow(found.model) : appendColumn(found.model));
    },
  };
}
