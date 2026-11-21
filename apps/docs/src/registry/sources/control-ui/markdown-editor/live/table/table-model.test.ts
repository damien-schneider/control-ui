import { describe, expect, test } from "bun:test";
import type { TextChange } from "../format/inline";
import {
  alignColumn,
  appendColumn,
  appendRow,
  cellAt,
  createTableMarkdown,
  deleteColumn,
  deleteRow,
  escapeCellText,
  insertColumn,
  insertRow,
  type MarkdownTableModel,
  moveColumn,
  moveRow,
  parseTable,
  type TableEdit,
} from "./table-model";

function apply(text: string, changes: TextChange[]): string {
  return [...changes]
    .sort((left, right) => right.from - left.from)
    .reduce((result, change) => result.slice(0, change.from) + change.insert + result.slice(change.to), text);
}

function table(text: string): MarkdownTableModel {
  const parsed = parseTable(text);
  if (!parsed) throw new Error(`expected a table: ${text}`);
  return parsed;
}

function edited(text: string, edit: (model: MarkdownTableModel) => TableEdit | null): string {
  const result = edit(table(text));
  if (!result) throw new Error("expected an edit");
  return apply(text, result.changes);
}

function cellTexts(model: MarkdownTableModel): string[][] {
  return model.rows.map((row) => row.cells.map((cell) => cell.text));
}

const lines = (...rows: string[]) => rows.join("\n");

describe("parseTable", () => {
  test("reads header and body cells of a table with outer pipes", () => {
    const text = lines("| Name | Role |", "| --- | --- |", "| Ada | Engineer |", "| Linus | Kernel |");
    const model = table(text);
    expect(cellTexts(model)).toEqual([
      ["Name", "Role"],
      ["Ada", "Engineer"],
      ["Linus", "Kernel"],
    ]);
    expect(model.columns).toBe(2);
    expect(model.from).toBe(0);
    expect(model.to).toBe(text.length);
    expect(model.delimiter.text).toBe("| --- | --- |");
    expect(model.delimiter.cells.map((cell) => cell.text)).toEqual([" --- ", " --- "]);
  });

  test("reads a table written without leading and trailing pipes", () => {
    const model = table(lines("a | b", "--- | ---:", "1 | 2"));
    expect(cellTexts(model)).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
    expect(model.aligns).toEqual([null, "right"]);
  });

  test("reports positions shifted by the document offset", () => {
    const text = lines("| a | b |", "| - | - |", "| c | d |");
    const model = table(text);
    const shifted = parseTable(text, 100);
    expect(shifted?.from).toBe(100);
    expect(shifted?.to).toBe(100 + text.length);
    expect(shifted?.rows[1].cells[1]).toEqual({ from: model.rows[1].cells[1].from + 100, to: model.rows[1].cells[1].to + 100, text: "d" });
  });

  test("keeps escaped pipes inside their cell, including inside inline code", () => {
    const model = table(lines("| a \\| b | `c \\| d` |", "| - | - |"));
    expect(model.columns).toBe(2);
    expect(cellTexts(model)).toEqual([["a \\| b", "`c \\| d`"]]);
  });

  test("keeps the cells that ragged rows actually have", () => {
    const model = table(lines("| a | b | c |", "|---|---|---|", "| 1 |", "| 1 | 2 | 3 | 4 |"));
    expect(cellTexts(model)).toEqual([["a", "b", "c"], ["1"], ["1", "2", "3", "4"]]);
    expect(model.columns).toBe(3);
  });

  test("reads every column alignment from the delimiter row", () => {
    const model = table(lines("| a | b | c | d |", "| :-- | :-: | --: | --- |"));
    expect(model.aligns).toEqual(["left", "center", "right", null]);
  });

  test("stops at a blank line after the body", () => {
    const model = table(lines("| a |", "| - |", "| 1 |", "", "| 2 |"));
    expect(model.rows).toHaveLength(2);
    expect(model.to).toBe(lines("| a |", "| - |", "| 1 |").length);
  });

  test("rejects text that is not a table", () => {
    expect(parseTable(lines("| a | b |", "| not | delimiter |"))).toBeNull();
    expect(parseTable(lines("just text", "---"))).toBeNull();
    expect(parseTable("| a | b |")).toBeNull();
    expect(parseTable(lines("| a | b |", "| --- |"))).toBeNull();
    expect(parseTable("")).toBeNull();
  });
});

describe("cell content ranges", () => {
  test("an empty template cell is an empty range between its two padding spaces", () => {
    const model = table(lines("|  | b |", "| --- | --- |"));
    expect(model.rows[0].cells[0]).toEqual({ from: 2, to: 2, text: "" });
  });

  test("a space typed after the text stays inside the cell", () => {
    const model = table(lines("| a  | b |", "| --- | --- |"));
    expect(model.rows[0].cells[0]).toEqual({ from: 2, to: 4, text: "a " });
  });

  test("a cell without padding covers its whole segment", () => {
    const model = table(lines("|a|b|", "|-|-|"));
    expect(model.rows[0].cells[0]).toEqual({ from: 1, to: 2, text: "a" });
    expect(model.rows[0].cells[1]).toEqual({ from: 3, to: 4, text: "b" });
  });

  test("a single space cell is empty right after that space", () => {
    const model = table(lines("| | b |", "| --- | --- |"));
    expect(model.rows[0].cells[0]).toEqual({ from: 2, to: 2, text: "" });
  });

  test("typing into an empty template cell grows the content range only", () => {
    const before = table(lines("|  |", "| --- |"));
    const typed = apply(lines("|  |", "| --- |"), [{ from: before.rows[0].cells[0].from, to: before.rows[0].cells[0].to, insert: "x" }]);
    expect(typed).toBe(lines("| x |", "| --- |"));
    expect(table(typed).rows[0].cells[0]).toEqual({ from: 2, to: 3, text: "x" });
  });
});

describe("cellAt", () => {
  const text = lines("| a | bb |", "| --- | --- |", "| c | d |");
  const model = table(text);

  test("finds the cell containing the caret, including its edges and padding", () => {
    expect(cellAt(model, 2)).toEqual({ row: 0, column: 0 });
    expect(cellAt(model, 3)).toEqual({ row: 0, column: 0 });
    expect(cellAt(model, 4)).toEqual({ row: 0, column: 0 });
    expect(cellAt(model, 7)).toEqual({ row: 0, column: 1 });
    expect(cellAt(model, model.rows[1].cells[1].to)).toEqual({ row: 1, column: 1 });
  });

  test("maps the row edges to the first and last cell", () => {
    expect(cellAt(model, 0)).toEqual({ row: 0, column: 0 });
    expect(cellAt(model, model.rows[0].to)).toEqual({ row: 0, column: 1 });
  });

  test("returns null on the delimiter line and outside the table", () => {
    expect(cellAt(model, model.delimiter.from + 3)).toBeNull();
    expect(cellAt(model, text.length + 1)).toBeNull();
    expect(cellAt(model, -1)).toBeNull();
  });
});

describe("moveRow", () => {
  const text = lines("| h |", "| - |", "| 1 |", "| 2 |", "| 3 |");

  test("moves a body row down past others, keeping line texts intact", () => {
    const edit = moveRow(table(text), 1, 3);
    expect(edit?.focus).toEqual({ row: 3, column: 0 });
    expect(apply(text, edit?.changes ?? [])).toBe(lines("| h |", "| - |", "| 2 |", "| 3 |", "| 1 |"));
  });

  test("swaps adjacent rows and leaves unrelated lines untouched", () => {
    const edit = moveRow(table(text), 3, 2);
    expect(apply(text, edit?.changes ?? [])).toBe(lines("| h |", "| - |", "| 1 |", "| 3 |", "| 2 |"));
    expect(edit?.changes).toEqual([{ from: table(text).rows[2].from, to: text.length, insert: "| 3 |\n| 2 |" }]);
  });

  test("never moves the header and ignores no-op or out-of-range moves", () => {
    const model = table(text);
    expect(moveRow(model, 0, 1)).toBeNull();
    expect(moveRow(model, 1, 0)).toBeNull();
    expect(moveRow(model, 2, 2)).toBeNull();
    expect(moveRow(model, 1, 4)).toBeNull();
  });
});

describe("moveColumn", () => {
  test("moves a column on every line and keeps each cell's padding byte for byte", () => {
    const text = lines("| a  | b |", "| --- | :-: |", "| 1 | 2 |");
    const edit = moveColumn(table(text), 0, 1);
    expect(edit?.focus).toEqual({ row: 0, column: 1 });
    expect(apply(text, edit?.changes ?? [])).toBe(lines("| b | a  |", "| :-: | --- |", "| 2 | 1 |"));
  });

  test("pads a ragged row with empty cells before moving", () => {
    const text = lines("| a | b | c |", "| --- | --- | --- |", "| x |");
    expect(edited(text, (model) => moveColumn(model, 2, 0))).toBe(lines("| c | a | b |", "| --- | --- | --- |", "|  | x |  |"));
  });

  test("keeps a table without outer pipes valid", () => {
    const result = edited(lines("a | b", "--- | ---", "1 | 2"), (model) => moveColumn(model, 1, 0));
    expect(result).toBe(lines(" b|a ", " ---|--- ", " 2|1 "));
    expect(cellTexts(table(result))).toEqual([
      ["b", "a"],
      ["2", "1"],
    ]);
  });

  test("ignores no-op and out-of-range moves", () => {
    const model = table(lines("| a | b |", "| - | - |"));
    expect(moveColumn(model, 1, 1)).toBeNull();
    expect(moveColumn(model, 0, 2)).toBeNull();
    expect(moveColumn(model, -1, 0)).toBeNull();
  });
});

describe("insertRow", () => {
  const text = lines("| a | b |", "| --- | --- |", "| 1 | 2 |");

  test("inserts an empty row after the header as the first body row", () => {
    const edit = insertRow(table(text), 0, "after");
    expect(edit?.focus).toEqual({ row: 1, column: 0 });
    expect(apply(text, edit?.changes ?? [])).toBe(lines("| a | b |", "| --- | --- |", "|  |  |", "| 1 | 2 |"));
  });

  test("inserts before and after a body row with a single change", () => {
    const before = insertRow(table(text), 1, "before");
    expect(before?.changes).toHaveLength(1);
    expect(apply(text, before?.changes ?? [])).toBe(lines("| a | b |", "| --- | --- |", "|  |  |", "| 1 | 2 |"));
    expect(before?.focus).toEqual({ row: 1, column: 0 });
    const after = insertRow(table(text), 1, "after");
    expect(apply(text, after?.changes ?? [])).toBe(lines("| a | b |", "| --- | --- |", "| 1 | 2 |", "|  |  |"));
    expect(after?.focus).toEqual({ row: 2, column: 0 });
  });

  test("never inserts above the header and ignores missing rows", () => {
    expect(insertRow(table(text), 0, "before")).toBeNull();
    expect(insertRow(table(text), 2, "after")).toBeNull();
  });

  test("builds the new row so a table without outer pipes still parses it", () => {
    const result = edited(lines("a | b", "--- | ---", "1 | 2"), (model) => insertRow(model, 1, "after"));
    expect(result).toBe(lines("a | b", "--- | ---", "1 | 2", "|  |  |"));
    expect(cellTexts(table(result))).toEqual([
      ["a", "b"],
      ["1", "2"],
      ["", ""],
    ]);
  });
});

describe("insertColumn", () => {
  const text = lines("| a | b |", "| --- | :-: |", "| 1 | 2 |");

  test("inserts an empty column before or after a column on every line", () => {
    const before = insertColumn(table(text), 0, "before");
    expect(before?.focus).toEqual({ row: 0, column: 0 });
    expect(apply(text, before?.changes ?? [])).toBe(lines("|  | a | b |", "| --- | --- | :-: |", "|  | 1 | 2 |"));
    const after = insertColumn(table(text), 0, "after");
    expect(after?.focus).toEqual({ row: 0, column: 1 });
    expect(apply(text, after?.changes ?? [])).toBe(lines("| a |  | b |", "| --- | --- | :-: |", "| 1 |  | 2 |"));
  });

  test("pads a ragged row before inserting the new column", () => {
    const ragged = lines("| a | b | c |", "| --- | --- | --- |", "| x |");
    expect(edited(ragged, (model) => insertColumn(model, 2, "after"))).toBe(
      lines("| a | b | c |  |", "| --- | --- | --- | --- |", "| x |  |  |  |"),
    );
  });

  test("adds a leading pipe when a table without outer pipes gains an empty first column", () => {
    const result = edited(lines("a | b", "--- | ---", "1 | 2"), (model) => insertColumn(model, 0, "before"));
    expect(result).toBe(lines("|  |a | b", " --- |--- | ---", "|  |1 | 2"));
    expect(cellTexts(table(result))).toEqual([
      ["", "a", "b"],
      ["", "1", "2"],
    ]);
  });

  test("ignores a column that does not exist", () => {
    expect(insertColumn(table(text), 2, "before")).toBeNull();
  });
});

describe("deleteRow", () => {
  const text = lines("| a |", "| - |", "| 1 |", "| 2 |");

  test("removes a body row and its line break", () => {
    expect(edited(text, (model) => deleteRow(model, 1))).toBe(lines("| a |", "| - |", "| 2 |"));
    expect(edited(text, (model) => deleteRow(model, 2))).toBe(lines("| a |", "| - |", "| 1 |"));
  });

  test("never deletes the header and ignores missing rows", () => {
    expect(deleteRow(table(text), 0)).toBeNull();
    expect(deleteRow(table(text), 3)).toBeNull();
  });
});

describe("deleteColumn", () => {
  test("removes a column from every line that has it, keeping other cells verbatim", () => {
    const text = lines("| a  | b | c |", "| :-- | --- | --: |", "|  x | y |", "| 1 | 2 | 3 |");
    expect(edited(text, (model) => deleteColumn(model, 1))).toBe(lines("| a  | c |", "| :-- | --: |", "|  x |", "| 1 | 3 |"));
  });

  test("leaves a ragged row that lacks the column untouched", () => {
    const text = lines("| a | b | c |", "| - | - | - |", "| x |");
    const edit = deleteColumn(table(text), 2);
    expect(edit?.changes.map((change) => change.insert)).toEqual(["| a | b |", "| - | - |"]);
  });

  test("refuses to delete the only column or a missing one", () => {
    expect(deleteColumn(table(lines("| a |", "| - |")), 0)).toBeNull();
    expect(deleteColumn(table(lines("| a | b |", "| - | - |")), 2)).toBeNull();
  });
});

describe("alignColumn", () => {
  const text = lines("| a | b | c |", "| --- | --- | --- |", "| 1 | 2 | 3 |");

  test("centers one column by replacing only its delimiter segment", () => {
    const edit = alignColumn(table(text), 1, "center");
    expect(edit?.changes).toHaveLength(1);
    expect(apply(text, edit?.changes ?? [])).toBe(lines("| a | b | c |", "| --- | :---: | --- |", "| 1 | 2 | 3 |"));
  });

  test("writes left and right markers and resets to the plain delimiter", () => {
    expect(edited(text, (model) => alignColumn(model, 0, "left"))).toBe(lines("| a | b | c |", "| :--- | --- | --- |", "| 1 | 2 | 3 |"));
    expect(edited(text, (model) => alignColumn(model, 2, "right"))).toBe(lines("| a | b | c |", "| --- | --- | ---: |", "| 1 | 2 | 3 |"));
    const centered = lines("| a |", "|:-:|");
    expect(edited(centered, (model) => alignColumn(model, 0, null))).toBe(lines("| a |", "| --- |"));
    expect(alignColumn(table(text), 0, null)?.changes).toEqual([]);
  });

  test("ignores a column that does not exist", () => {
    expect(alignColumn(table(text), 3, "left")).toBeNull();
  });
});

describe("appendRow and appendColumn", () => {
  const text = lines("| a | b |", "| --- | --- |", "| 1 | 2 |");

  test("appending a row adds an empty last row and focuses its first cell", () => {
    const edit = appendRow(table(text));
    expect(edit.focus).toEqual({ row: 2, column: 0 });
    expect(apply(text, edit.changes)).toBe(lines("| a | b |", "| --- | --- |", "| 1 | 2 |", "|  |  |"));
  });

  test("appending a row to a header-only table adds the first body row", () => {
    const headerOnly = lines("| a |", "| --- |");
    const edit = appendRow(table(headerOnly));
    expect(edit.focus).toEqual({ row: 1, column: 0 });
    expect(apply(headerOnly, edit.changes)).toBe(lines("| a |", "| --- |", "|  |"));
  });

  test("appending a column adds an empty last column and focuses its header cell", () => {
    const edit = appendColumn(table(text));
    expect(edit.focus).toEqual({ row: 0, column: 2 });
    expect(apply(text, edit.changes)).toBe(lines("| a | b |  |", "| --- | --- | --- |", "| 1 | 2 |  |"));
  });

  test("appending a column to a table without outer pipes closes the new cell with a pipe", () => {
    const result = edited(lines("a | b", "--- | ---", "1 | 2"), appendColumn);
    expect(result).toBe(lines("a | b|  |", "--- | ---| --- ", "1 | 2|  |"));
    expect(table(result).columns).toBe(3);
    expect(cellTexts(table(result))).toEqual([
      ["a", "b", ""],
      ["1", "2", ""],
    ]);
  });
});

describe("createTableMarkdown", () => {
  test("creates an empty table with the requested size", () => {
    expect(createTableMarkdown(3, 2)).toBe("|  |  |  |\n| --- | --- | --- |\n|  |  |  |\n|  |  |  |");
  });

  test("creates a table that parses into empty cells", () => {
    const model = table(createTableMarkdown(2, 1));
    expect(cellTexts(model)).toEqual([
      ["", ""],
      ["", ""],
    ]);
    expect(model.aligns).toEqual([null, null]);
  });
});

describe("escapeCellText", () => {
  test("escapes bare pipes and flattens newlines for pasting into a cell", () => {
    expect(escapeCellText("a | b\nc\r\nd")).toBe("a \\| b c d");
  });

  test("leaves already escaped pipes alone", () => {
    expect(escapeCellText("a \\| b")).toBe("a \\| b");
    expect(escapeCellText("a \\\\| b")).toBe("a \\\\\\| b");
  });
});
