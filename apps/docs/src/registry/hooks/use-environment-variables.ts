"use client";

import { useRef, useState } from "react";
import type { EnvironmentVariableEntry } from "@/components/control-ui/lib/env-file";
import {
  collectEnvironmentVariables,
  createEmptyEnvironmentVariableEntry,
  getDuplicateEnvironmentVariableKeys,
  parseEnvFileText,
  readEnvFile,
  rowsToEnvFileText,
} from "@/components/control-ui/lib/env-file";

export type EnvironmentVariableRow = EnvironmentVariableEntry;

export type EnvironmentVariablesImportMode = "auto" | "bulk";

export interface UseEnvironmentVariablesOptions<TRow extends EnvironmentVariableRow = EnvironmentVariableRow> {
  initialRows?: readonly TRow[];
  rows?: readonly TRow[];
  onRowsChange?: (rows: TRow[]) => void;
  createDefaultRow?: () => TRow;
  createRow?: (entry: EnvironmentVariableEntry) => TRow;
  getEditableRows?: (rows: readonly TRow[]) => readonly TRow[];
  getPreservedRows?: (rows: readonly TRow[]) => readonly TRow[];
  maxUploadSize?: number;
}

export interface EnvironmentVariablesFileUploadEvent {
  target: {
    files?: FileList | readonly File[] | null;
    value: string;
  };
}

export interface EnvironmentVariablesImportOptions {
  targetIndex?: number;
  mode?: EnvironmentVariablesImportMode;
}

export interface EnvironmentVariablesController<TRow extends EnvironmentVariableRow = EnvironmentVariableRow> {
  rows: readonly TRow[];
  uploadError: string | null;
  duplicateKeys: Set<string>;
  hasDuplicateKeys: boolean;
  isDirty: boolean;
  setRows: (rows: readonly TRow[]) => TRow[];
  resetRows: (rows?: readonly TRow[]) => TRow[];
  appendRow: (row?: TRow) => TRow[];
  updateRow: (index: number, patch: Partial<EnvironmentVariableEntry>) => TRow[];
  removeRow: (index: number) => TRow[];
  getRowsForSubmit: () => TRow[];
  getEnvironmentVariablesForSubmit: () => Record<string, string>;
  getEnvFileTextForSubmit: () => string;
  importText: (text: string, options?: EnvironmentVariablesImportOptions) => boolean;
  handleFileUpload: (event: EnvironmentVariablesFileUploadEvent) => Promise<void>;
  handlePaste: (index: number, text: string) => boolean;
  clearUploadError: () => void;
  getRowId: (index: number) => string;
  isValueRevealed: (index: number) => boolean;
  toggleValueVisibility: (index: number) => void;
  rowHasDuplicateKey: (index: number) => boolean;
}

function defaultCreateRow(entry: EnvironmentVariableEntry): EnvironmentVariableRow {
  return { key: entry.key, value: entry.value };
}

function defaultEditableRows<TRow extends EnvironmentVariableRow>(rows: readonly TRow[]) {
  return rows;
}

function defaultPreservedRows() {
  return [];
}

function normalizeRows<TRow extends EnvironmentVariableRow>(rows: readonly TRow[] | undefined, createDefaultRow: () => TRow) {
  return rows && rows.length > 0 ? rows.map((row) => ({ ...row })) : [createDefaultRow()];
}

function hasOnlyEmptyRow(rows: readonly EnvironmentVariableEntry[]) {
  if (rows.length !== 1) return false;
  const [firstRow] = rows;
  if (!firstRow) return false;
  return !firstRow.key.trim() && !firstRow.value;
}

function areRowsEqual(a: readonly EnvironmentVariableEntry[], b: readonly EnvironmentVariableEntry[]) {
  if (a.length !== b.length) return false;

  for (let index = 0; index < a.length; index++) {
    const aRow = a[index];
    const bRow = b[index];
    if (!aRow || !bRow || aRow.key !== bRow.key || aRow.value !== bRow.value) {
      return false;
    }
  }

  return true;
}

// Generic overload keeps the public contract; the implementation works on plain entries so the
// default row factories type-check without casts. Custom TRow callers supply their own factories.
export function useEnvironmentVariables<TRow extends EnvironmentVariableRow = EnvironmentVariableRow>(
  options?: UseEnvironmentVariablesOptions<TRow>,
): EnvironmentVariablesController<TRow>;
export function useEnvironmentVariables({
  initialRows,
  rows: controlledRows,
  onRowsChange,
  createDefaultRow = createEmptyEnvironmentVariableEntry,
  createRow = defaultCreateRow,
  getEditableRows = defaultEditableRows,
  getPreservedRows = defaultPreservedRows,
  maxUploadSize,
}: UseEnvironmentVariablesOptions<EnvironmentVariableRow> = {}): EnvironmentVariablesController<EnvironmentVariableRow> {
  const initialSourceRows = controlledRows ?? initialRows;
  const nextRowId = useRef(0);
  const fallbackRowIds = useRef<Record<number, string>>({});
  const [uncontrolledRows, setUncontrolledRows] = useState(() => normalizeRows(initialSourceRows, createDefaultRow));
  const [baselineRows, setBaselineRows] = useState(() => normalizeRows(initialSourceRows, createDefaultRow));
  const [rowIds, setRowIds] = useState(() => normalizeRows(initialSourceRows, createDefaultRow).map(() => createRowId()));
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [revealedValues, setRevealedValues] = useState<Record<number, boolean>>({});

  const rows = controlledRows ? normalizeRows(controlledRows, createDefaultRow) : uncontrolledRows;
  const editableRows = (sourceRows: readonly EnvironmentVariableRow[] = rows) => getEditableRows(sourceRows);
  const preservedRows = (sourceRows: readonly EnvironmentVariableRow[] = rows) => getPreservedRows(sourceRows);

  function createRowId() {
    const rowId = nextRowId.current;
    nextRowId.current += 1;
    return `environment-variable-row-${rowId}`;
  }

  function commitRows(nextRows: readonly EnvironmentVariableRow[], nextRowIds?: readonly string[]) {
    const normalizedRows = normalizeRows(nextRows, createDefaultRow);
    const normalizedRowIds = normalizedRows.map((_, index) => nextRowIds?.[index] ?? rowIds[index] ?? createRowId());

    if (!controlledRows) {
      setUncontrolledRows(normalizedRows);
    }

    setRowIds(normalizedRowIds);
    onRowsChange?.(normalizedRows);
    return normalizedRows;
  }

  function setRows(nextRows: readonly EnvironmentVariableRow[]) {
    return commitRows(nextRows);
  }

  function resetRows(nextRows: readonly EnvironmentVariableRow[] = baselineRows) {
    const normalizedRows = normalizeRows(nextRows, createDefaultRow);
    commitRows(
      normalizedRows,
      normalizedRows.map(() => createRowId()),
    );
    setBaselineRows(normalizedRows);
    setRevealedValues({});
    setUploadError(null);
    return normalizedRows;
  }

  function getRowsForSubmit() {
    return [...rows];
  }

  function appendRow(row = createDefaultRow()) {
    return commitRows([...rows, row], [...rowIds, createRowId()]);
  }

  function updateRow(index: number, patch: Partial<EnvironmentVariableEntry>) {
    return commitRows(
      rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)),
      rowIds,
    );
  }

  function removeRow(index: number) {
    const nextRows = rows.filter((_, rowIndex) => rowIndex !== index);
    const nextRowIds = rowIds.filter((_, rowIndex) => rowIndex !== index);
    setRevealedValues({});
    return commitRows(nextRows.length > 0 ? nextRows : [createDefaultRow()], nextRows.length > 0 ? nextRowIds : [createRowId()]);
  }

  function mergeParsedRows(parsedRows: readonly EnvironmentVariableEntry[], targetIndex?: number) {
    const newRows = parsedRows.map(createRow);
    const newRowIds = newRows.map(() => createRowId());
    const currentEditableRows = editableRows(rows);

    if (hasOnlyEmptyRow(currentEditableRows)) {
      const preserved = preservedRows(rows);
      return commitRows([...preserved, ...newRows], [...rowIds.slice(0, preserved.length), ...newRowIds]);
    }

    if (typeof targetIndex !== "number") {
      return commitRows([...rows, ...newRows], [...rowIds, ...newRowIds]);
    }

    const targetRow = rows[targetIndex];
    if (!targetRow) {
      return commitRows([...rows, ...newRows], [...rowIds, ...newRowIds]);
    }

    const targetIsEmpty = !targetRow.key.trim() && !targetRow.value;
    const before = rows.slice(0, targetIndex + (targetIsEmpty ? 0 : 1));
    const after = rows.slice(targetIndex + 1);
    const beforeIds = rowIds.slice(0, targetIndex + (targetIsEmpty ? 0 : 1));
    const afterIds = rowIds.slice(targetIndex + 1);
    return commitRows([...before, ...newRows, ...after], [...beforeIds, ...newRowIds, ...afterIds]);
  }

  function importText(text: string, options: EnvironmentVariablesImportOptions = {}) {
    const entries = parseEnvironmentVariablesImportText(text, options.mode ?? "bulk");
    if (entries.length === 0) return false;

    mergeParsedRows(entries, options.targetIndex);
    setRevealedValues({});
    setUploadError(null);
    return true;
  }

  function handlePaste(index: number, text: string) {
    return importText(text, { targetIndex: index, mode: "auto" });
  }

  async function handleFileUpload(event: EnvironmentVariablesFileUploadEvent) {
    setUploadError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await readEnvFile(file, { maxSize: maxUploadSize });
    if (!result.ok) {
      setUploadError(result.error);
      event.target.value = "";
      return;
    }

    mergeParsedRows(result.entries);
    setRevealedValues({});

    event.target.value = "";
  }

  function getRowId(index: number) {
    const rowId = rowIds[index] ?? fallbackRowIds.current[index];
    if (rowId) return rowId;

    const fallbackRowId = createRowId();
    fallbackRowIds.current[index] = fallbackRowId;
    return fallbackRowId;
  }

  const duplicateKeys = getDuplicateEnvironmentVariableKeys(rows);
  const rowsDirty = !areRowsEqual(rows, baselineRows);

  return {
    rows,
    uploadError,
    duplicateKeys,
    hasDuplicateKeys: duplicateKeys.size > 0,
    isDirty: rowsDirty,
    setRows,
    resetRows,
    appendRow,
    updateRow,
    removeRow,
    getRowsForSubmit,
    getEnvironmentVariablesForSubmit: () => collectEnvironmentVariables(getRowsForSubmit()),
    getEnvFileTextForSubmit: () => rowsToEnvFileText(getRowsForSubmit()),
    importText,
    handleFileUpload,
    handlePaste,
    clearUploadError: () => setUploadError(null),
    getRowId,
    isValueRevealed: (index) => Boolean(revealedValues[index]),
    toggleValueVisibility: (index) => setRevealedValues((previous) => ({ ...previous, [index]: !previous[index] })),
    rowHasDuplicateKey: (index) => duplicateKeys.has(rows[index]?.key.trim() ?? ""),
  };
}

export function parseEnvironmentVariablesImportText(text: string, mode: EnvironmentVariablesImportMode = "bulk") {
  const trimmedText = text.trim();
  if (!trimmedText.includes("=")) return [];

  const entries = parseEnvFileText(trimmedText);
  if (entries.length === 0) return [];
  if (mode === "bulk") return entries;

  const firstAssignmentLooksLikeEnvVar = /^(?:export\s+)?[A-Z_][A-Z0-9_]*\s*=/.test(trimmedText);
  const hasBulkShape = entries.length > 1 || trimmedText.includes("\n") || firstAssignmentLooksLikeEnvVar;

  return hasBulkShape ? entries : [];
}
