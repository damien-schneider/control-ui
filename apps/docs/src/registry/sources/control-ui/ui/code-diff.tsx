"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronsDownUp, ChevronsUpDown, CircleSlash, MoreHorizontal } from "lucide-react";
import type { ComponentProps, CSSProperties, Dispatch, ReactNode, SetStateAction } from "react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  type DiffLineColumn,
  type DiffLineSelection,
  type DiffLineTarget,
  useDiffLineSelection,
} from "@/components/control-ui/code-diff-selection";
import type { CodeDiffKnobStyle } from "@/components/control-ui/knob-contracts/code-diff-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { type CodeTokenLines, highlightToTokens, mergeCodeTokenLineWithEmphasis } from "@/components/control-ui/lib/code-tokens";
import {
  buildDiffFromFiles,
  buildDiffFromPatch,
  type CodeDiffAnnotation,
  type DiffFile,
  type DiffLine,
  type DiffLinePoint,
  type DiffLineRange,
  diffRunEnd,
  hiddenContext,
} from "@/components/control-ui/lib/diff";
import { SkinIcon, useSkinIcon } from "@/components/control-ui/skin-provider";
import { Button } from "@/components/control-ui/ui/button";
import type { CodeOverflow } from "@/components/control-ui/ui/code";
import { CodeCopy, type CodeCopyProps, CodeFloatingCopy, CodeTokenLine } from "@/components/control-ui/ui/code";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/control-ui/ui/tooltip";

export type { CodeDiffAnnotation, DiffLinePoint, DiffLineRange, DiffSide } from "@/components/control-ui/lib/diff";

export type DiffStyle = "unified" | "split";

export type DiffIndicators = "classic" | "bars";

export type DiffLineKind = "word" | "char" | "none";

/*
 * Split mode virtualizes one aligned-row list rather than two synced panes, so there is no scroll-sync to drift.
 * Line numbers and +/- markers sit in select-none cells, so text selection copies clean source.
 */

const ESTIMATED_ROW_HEIGHT = 20;
const VIRTUALIZE_THRESHOLD = 150;
// an opened diff still stops at the screen, so a huge one keeps scrolling inside and stays virtualized
const OPEN_MAX_HEIGHT = "100dvh";

type SideTokens = { old: CodeTokenLines | null; new: CodeTokenLines | null };

const NO_SIDE_TOKENS: SideTokens = { old: null, new: null };

type DiffGridStyle = CSSProperties & { "--_code-gutter-digits": number };

// expansion belongs to one diff: a new identity starts collapsed without remounting the scroller
type Expansion = { identity: string; gaps: ReadonlySet<number>; revealedRowId: string | null };

const NO_EXPANSION: Expansion = { identity: "", gaps: new Set(), revealedRowId: null };

type VisualRow =
  | { kind: "separator"; id: string; gapIndex: number; label: string; hidden: number; canExpand: boolean }
  | { kind: "unified"; id: string; line: DiffLine }
  | { kind: "split"; id: string; left: DiffLine | null; right: DiffLine | null }
  | { kind: "annotation"; id: string; index: number };

type AnnotationTarget = { at: DiffLinePoint; key: string };

export type CodeDiffLineRole = "added" | "deleted" | "unchanged" | "original" | "modified";

export type CodeDiffProps<T = unknown> = Omit<ComponentProps<"figure">, "children" | "style"> & {
  // one path or other: `patch` is partial and cannot expand context, text pair can
  patch?: string;
  oldText?: string;
  newText?: string;
  lang?: string;
  name?: string;
  diffStyle?: DiffStyle;
  diffIndicators?: DiffIndicators;
  lineDiffType?: DiffLineKind;
  overflow?: CodeOverflow;
  maxLineDiffLength?: number;
  // past this edit distance the text pair renders as one replace block; 0 disables guard
  maxEditLength?: number;
  // "none" lets the page scroll the diff: every row renders, nothing virtualizes
  maxHeight?: string;
  header?: boolean;
  emptyLabel?: ReactNode;
  expandLabel?: string;
  getHiddenLinesLabel?: (count: number) => string;
  showAllLabel?: string;
  showFewerLabel?: string;
  noNewlineLabel?: string;
  copyLabel?: string;
  copiedLabel?: string;
  copyFailedLabel?: string;
  getStatsLabel?: (additions: number, deletions: number) => string;
  getLineLabel?: (role: CodeDiffLineRole, lineNumber: number | undefined, text: string) => string;
  getFileCountLabel?: (count: number) => string;
  // selection is enabled by the callback; ranges and annotations address the first file of a patch only
  selectedLines?: readonly DiffLineRange[];
  onSelectedLinesChange?: (lines: DiffLineRange[]) => void;
  annotations?: readonly CodeDiffAnnotation<T>[];
  renderAnnotation?: (annotation: CodeDiffAnnotation<T>) => ReactNode;
  // text pairs only: lines differing in leading or trailing whitespace read as unchanged
  ignoreWhitespace?: boolean;
  style?: CSSProperties & CodeDiffKnobStyle;
};

type DiffLabels = {
  empty: ReactNode;
  expand: string;
  hidden: (count: number) => string;
  noNewline: string;
  stats: (additions: number, deletions: number) => string;
  line: (role: CodeDiffLineRole, lineNumber: number | undefined, text: string) => string;
};

const LINE_ROLE_NAMES: Record<CodeDiffLineRole, string> = {
  added: "Added",
  deleted: "Deleted",
  unchanged: "Unchanged",
  original: "Original",
  modified: "Modified",
};

function defaultStatsLabel(additions: number, deletions: number): string {
  return `${additions} ${additions === 1 ? "addition" : "additions"}, ${deletions} ${deletions === 1 ? "deletion" : "deletions"}`;
}

function defaultLineLabel(role: CodeDiffLineRole, lineNumber: number | undefined, text: string): string {
  return `${LINE_ROLE_NAMES[role]} line ${lineNumber ?? "?"}: ${text}`;
}

function defaultHiddenLinesLabel(count: number): string {
  return `${count} unchanged ${count === 1 ? "line" : "lines"}`;
}

function defaultFileCountLabel(count: number): string {
  return `${count} files`;
}

// tokens are indexed by line number, so partial file's holes are rebuilt as blank lines to keep indices honest
function sideTexts(file: DiffFile): { old: string; new: string } {
  if (!file.isPartial) return { old: file.oldLines.join("\n"), new: file.newLines.join("\n") };
  const oldArr: string[] = [];
  const newArr: string[] = [];
  for (const hunk of file.hunks) {
    for (const line of hunk.lines) {
      if (line.oldNo !== undefined) oldArr[line.oldNo - 1] = line.text;
      if (line.newNo !== undefined) newArr[line.newNo - 1] = line.text;
    }
  }
  return { old: oldArr.join("\n"), new: newArr.join("\n") };
}

function useSideTokens(oldText: string, newText: string, lang: string | undefined, enabled: boolean): SideTokens {
  const [state, setState] = useState<{ lang: string; tokens: SideTokens } | null>(null);

  useEffect(() => {
    if (!enabled || !lang) return;
    let cancelled = false;
    const requested = lang;
    void Promise.all([highlightToTokens(oldText, requested), highlightToTokens(newText, requested)])
      .then(([oldTokens, newTokens]) => {
        if (!cancelled) setState({ lang: requested, tokens: { old: oldTokens, new: newTokens } });
      })
      .catch(() => {
        if (!cancelled) setState({ lang: requested, tokens: NO_SIDE_TOKENS });
      });
    return () => {
      cancelled = true;
    };
  }, [oldText, newText, lang, enabled]);

  // while the next highlight resolves, the previous lines stay; a line whose text has changed renders plain
  return enabled && state && state.lang === lang ? state.tokens : NO_SIDE_TOKENS;
}

function lineTokens(line: DiffLine, tokens: SideTokens): CodeTokenLines[number] | null {
  if (line.type === "del") return tokens.old?.[(line.oldNo ?? 1) - 1] ?? null;
  if (line.type === "add") return tokens.new?.[(line.newNo ?? 1) - 1] ?? null;
  return tokens.new?.[(line.newNo ?? 1) - 1] ?? tokens.old?.[(line.oldNo ?? 1) - 1] ?? null;
}

// context lines sit on both sides of pair
function splitPairs(lines: DiffLine[]): { left: DiffLine | null; right: DiffLine | null }[] {
  const rows: { left: DiffLine | null; right: DiffLine | null }[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (!line) break;
    if (line.type === "context") {
      rows.push({ left: line, right: line });
      index += 1;
      continue;
    }
    const delEnd = diffRunEnd(lines, index, "del");
    const addEnd = diffRunEnd(lines, delEnd, "add");
    const dels = lines.slice(index, delEnd);
    const adds = lines.slice(delEnd, addEnd);
    const count = Math.max(dels.length, adds.length);
    for (let pair = 0; pair < count; pair += 1) rows.push({ left: dels[pair] ?? null, right: adds[pair] ?? null });
    index = addEnd;
  }
  return rows;
}

// lines past the last hunk; only a full-text diff knows them
function hiddenAfter(file: DiffFile): number {
  const last = file.hunks.at(-1);
  return last && !file.isPartial ? Math.max(0, file.oldLines.length - (last.oldStart + last.oldCount) + 1) : 0;
}

// the unified format writes an empty range one line early
function hunkRange(start: number, count: number): string {
  return `${count === 0 ? start - 1 : start},${count}`;
}

type DiffHunk = DiffFile["hunks"][number];

function expandedRowId(gapIndex: number, line: DiffLine): string {
  return `exp-${gapIndex}-${line.oldNo ?? line.newNo ?? 0}`;
}

function gapRows(file: DiffFile, hunk: DiffHunk, gapIndex: number, diffStyle: DiffStyle, expanded: ReadonlySet<number>): VisualRow[] {
  const hasGap = gapIndex > 0 || hunk.collapsedBefore > 0;
  if (!hasGap) return [];
  if ((expanded.has(gapIndex) || hunk.collapsedBefore === 1) && !file.isPartial) {
    return hiddenContext(file, gapIndex).map((line) => rowForLine(diffStyle, line, expandedRowId(gapIndex, line)));
  }

  const range = `@@ -${hunkRange(hunk.oldStart, hunk.oldCount)} +${hunkRange(hunk.newStart, hunk.newCount)} @@`;
  const label = file.isPartial ? (hunk.header ?? range) : "";
  return [
    {
      kind: "separator",
      id: `sep-${gapIndex}`,
      gapIndex,
      label,
      hidden: file.isPartial ? 0 : hunk.collapsedBefore,
      canExpand: !file.isPartial && hunk.collapsedBefore > 0,
    },
  ];
}

function changedRows(hunk: DiffHunk, gapIndex: number, diffStyle: DiffStyle): VisualRow[] {
  if (diffStyle === "unified") {
    return hunk.lines.map((line, lineIndex) => rowForLine("unified", line, `u-${gapIndex}-${lineIndex}`));
  }
  return splitPairs(hunk.lines).map((pair, pairIndex) => ({
    kind: "split",
    id: `s-${gapIndex}-${pairIndex}`,
    left: pair.left,
    right: pair.right,
  }));
}

function trailingRows(file: DiffFile, diffStyle: DiffStyle, expanded: ReadonlySet<number>): VisualRow[] {
  const gapIndex = file.hunks.length;
  if (hiddenAfter(file) === 0) return [];
  if (expanded.has(gapIndex) || hiddenAfter(file) === 1) {
    return hiddenContext(file, gapIndex).map((line) => rowForLine(diffStyle, line, expandedRowId(gapIndex, line)));
  }
  return [{ kind: "separator", id: `sep-${gapIndex}`, gapIndex, label: "", hidden: hiddenAfter(file), canExpand: true }];
}

function pointKeys(line: DiffLine): string[] {
  const keys: string[] = [];
  if (line.type !== "add" && line.oldNo !== undefined) keys.push(`old:${line.oldNo}`);
  if (line.type !== "del" && line.newNo !== undefined) keys.push(`new:${line.newNo}`);
  return keys;
}

function rowLines(row: VisualRow): DiffLine[] {
  if (row.kind === "unified") return [row.line];
  if (row.kind !== "split") return [];
  if (row.left === row.right) return row.left ? [row.left] : [];
  return [row.left, row.right].filter((line) => line !== null);
}

// pushed one by one: spreading a hunk of 100k+ lines into push() overflows the call stack
function buildRows(
  file: DiffFile,
  diffStyle: DiffStyle,
  expanded: ReadonlySet<number>,
  annotations: readonly AnnotationTarget[],
): VisualRow[] {
  const annotationsAt = new Map<string, number[]>();
  for (const [index, annotation] of annotations.entries()) {
    const key = `${annotation.at.side}:${annotation.at.line}`;
    annotationsAt.set(key, [...(annotationsAt.get(key) ?? []), index]);
  }
  const rows: VisualRow[] = [];
  const push = (row: VisualRow) => {
    rows.push(row);
    if (annotationsAt.size === 0) return;
    const indexes = new Set(rowLines(row).flatMap((line) => pointKeys(line).flatMap((key) => annotationsAt.get(key) ?? [])));
    for (const index of indexes) rows.push({ kind: "annotation", id: `note-${annotations[index]?.key ?? index}`, index });
  };
  for (const [gapIndex, hunk] of file.hunks.entries()) {
    for (const row of gapRows(file, hunk, gapIndex, diffStyle, expanded)) push(row);
    for (const row of changedRows(hunk, gapIndex, diffStyle)) push(row);
  }
  for (const row of trailingRows(file, diffStyle, expanded)) push(row);
  return rows;
}

// unified view selects a deleted line by its old number and every other line by its new number
function lineTarget(rowId: string, rowIndex: number, column: DiffLineColumn, line: DiffLine): DiffLineTarget {
  const onOldSide = column === "left" || (column === "unified" && line.type === "del");
  const point: DiffLinePoint = onOldSide ? { side: "old", line: line.oldNo ?? 0 } : { side: "new", line: line.newNo ?? 0 };
  return { id: `${rowId}:${column}`, rowIndex, column, point, line };
}

function lineTargets(rows: readonly VisualRow[]): DiffLineTarget[] {
  const targets: DiffLineTarget[] = [];
  for (const [rowIndex, row] of rows.entries()) {
    if (row.kind === "unified") targets.push(lineTarget(row.id, rowIndex, "unified", row.line));
    if (row.kind !== "split") continue;
    if (row.left) targets.push(lineTarget(row.id, rowIndex, "left", row.left));
    if (row.right) targets.push(lineTarget(row.id, rowIndex, "right", row.right));
  }
  return targets;
}

function gutterDigits(file: DiffFile, expanded: ReadonlySet<number>): number {
  let last = 1;
  for (const hunk of file.hunks) last = Math.max(last, hunk.oldStart + hunk.oldCount - 1, hunk.newStart + hunk.newCount - 1);
  if (expanded.has(file.hunks.length) || hiddenAfter(file) === 1) last = Math.max(last, file.oldLines.length, file.newLines.length);
  return String(last).length;
}

function rowForLine(diffStyle: DiffStyle, line: DiffLine, id: string): VisualRow {
  if (diffStyle === "unified") return { kind: "unified", id, line };
  if (line.type === "context") return { kind: "split", id, left: line, right: line };
  if (line.type === "del") return { kind: "split", id, left: line, right: null };
  return { kind: "split", id, left: null, right: line };
}

const markerFor: Record<DiffLine["type"], string> = { add: "+", del: "-", context: "" };

function DiffCode({
  line,
  tokens,
  overflow,
  noNewlineLabel,
}: {
  line: DiffLine;
  tokens: CodeTokenLines[number] | null;
  overflow: CodeOverflow;
  noNewlineLabel: string;
}): ReactNode {
  const wrapClass = overflow === "wrap" ? "whitespace-pre-wrap break-words" : "whitespace-pre";
  const noNewline =
    line.noNewline && line.text !== "" ? (
      <span
        data-control-ui="code-diff"
        data-control-family="code-diff"
        data-slot="no-newline"
        title={noNewlineLabel}
        aria-hidden="true"
        className="select-none"
      >
        <SkinIcon name="noNewline" fallback={CircleSlash} className="inline size-[1em] align-[-0.125em]" aria-hidden="true" />
      </span>
    ) : null;
  if (line.segments && line.segments.length > 0) {
    const runs = mergeCodeTokenLineWithEmphasis(line.text, tokens, line.segments);
    return (
      <code aria-hidden="true" className={cn("min-w-0 flex-1", wrapClass)}>
        {runs.map((run) => {
          const style: CSSProperties | undefined = run.style || undefined;
          if (run.emphasis) {
            return (
              <span
                key={run.start}
                data-control-ui="code-diff"
                data-control-family="code-diff"
                data-slot="emphasis"
                data-line-type={line.type}
                style={style}
              >
                {run.content}
              </span>
            );
          }
          return (
            <span key={run.start} style={style}>
              {run.content}
            </span>
          );
        })}
        {noNewline}
      </code>
    );
  }
  return (
    <code aria-hidden="true" className={cn("min-w-0 flex-1", wrapClass)}>
      {/* a row holding no text node is skipped by text selection, losing the blank line on copy */}
      {line.text === "" ? "\n" : <CodeTokenLine tokens={tokens} plain={line.text} />}
      {noNewline}
    </code>
  );
}

function Gutter({
  children,
  type,
  selected,
  selectable,
}: {
  children: ReactNode;
  type: DiffLine["type"];
  selected: boolean;
  selectable: boolean;
}) {
  return (
    <span
      data-control-ui="code-diff"
      data-control-family="code-diff"
      data-line-type={type}
      data-slot="gutter"
      data-selected={selected ? "true" : undefined}
      data-selectable={selectable ? "true" : undefined}
      aria-hidden="true"
      className="shrink-0 select-none"
    >
      {children}
    </span>
  );
}

// the line numbers are the selection control: one tab stop per file, arrows move between lines
function LineButton({
  target,
  selection,
  label,
  children,
}: {
  target: DiffLineTarget | undefined;
  selection: DiffLineSelection;
  label: string;
  children: ReactNode;
}) {
  if (!selection.enabled || !target) return children;
  return (
    <button
      type="button"
      data-control-ui="code-diff"
      data-control-family="code-diff"
      data-slot="line-button"
      aria-label={label}
      {...selection.buttonProps(target)}
      className="flex shrink-0 select-none"
    >
      {children}
    </button>
  );
}

function Marker({ type }: { type: DiffLine["type"] }) {
  return (
    <span
      data-control-ui="code-diff"
      data-control-family="code-diff"
      data-slot="marker"
      data-line-type={type}
      aria-hidden="true"
      className="shrink-0 select-none"
    >
      {markerFor[type] || " "}
    </span>
  );
}

type LineRowProps = {
  tokens: CodeTokenLines[number] | null;
  indicators: DiffIndicators;
  overflow: CodeOverflow;
  noNewlineLabel: string;
  label: string;
  selection: DiffLineSelection;
  target: DiffLineTarget | undefined;
};

function UnifiedRow({ line, tokens, indicators, overflow, noNewlineLabel, label, selection, target }: LineRowProps & { line: DiffLine }) {
  const selected = selection.isSelected(line);
  return (
    <div
      ref={selection.enabled && target ? selection.lineRef(target) : undefined}
      data-control-ui="code-diff"
      data-control-family="code-diff"
      data-slot="line"
      data-line-type={line.type}
      data-indicators={indicators}
      data-selected={selected ? "true" : undefined}
      className="flex w-full"
    >
      <LineButton target={target} selection={selection} label={label}>
        <Gutter type={line.type} selected={selected} selectable={selection.enabled}>
          {line.oldNo ?? ""}
        </Gutter>
        <Gutter type={line.type} selected={selected} selectable={selection.enabled}>
          {line.newNo ?? ""}
        </Gutter>
      </LineButton>
      <Marker type={line.type} />
      <DiffCode line={line} tokens={tokens} overflow={overflow} noNewlineLabel={noNewlineLabel} />
    </div>
  );
}

function SplitHalf({
  line,
  tokens,
  indicators,
  overflow,
  side,
  noNewlineLabel,
  label,
  selection,
  target,
}: Omit<LineRowProps, "tokens"> & { line: DiffLine | null; tokens: LineRowProps["tokens"]; side: "left" | "right" }) {
  if (!line)
    return (
      <div
        data-control-ui="code-diff"
        data-control-family="code-diff"
        data-slot="empty-half"
        data-side={side}
        aria-hidden="true"
        className="flex min-w-0"
      />
    );
  const selected = selection.isSelected(line);
  return (
    <div
      ref={selection.enabled && target ? selection.lineRef(target) : undefined}
      data-control-ui="code-diff"
      data-control-family="code-diff"
      data-slot="line"
      data-line-type={line.type}
      data-indicators={indicators}
      data-side={side}
      data-selected={selected ? "true" : undefined}
      className="flex min-w-0"
    >
      <LineButton target={target} selection={selection} label={label}>
        <Gutter type={line.type} selected={selected} selectable={selection.enabled}>
          {side === "left" ? (line.oldNo ?? "") : (line.newNo ?? "")}
        </Gutter>
      </LineButton>
      <Marker type={line.type} />
      <DiffCode line={line} tokens={tokens} overflow={overflow} noNewlineLabel={noNewlineLabel} />
    </div>
  );
}

function fileTitle(file: DiffFile): string {
  return file.oldName && file.type === "rename" ? `${file.oldName} → ${file.name}` : file.name;
}

function DiffStats({ additions, deletions, label }: { additions: number; deletions: number; label: string }) {
  return (
    <span data-control-ui="code-diff" data-control-family="code-diff" data-slot="stat" className="flex items-center">
      <span data-control-ui="code-diff" data-control-family="code-diff" data-slot="stat-additions" aria-hidden="true">
        +{additions}
      </span>
      <span data-control-ui="code-diff" data-control-family="code-diff" data-slot="stat-deletions" aria-hidden="true">
        −{deletions}
      </span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

function lineDescription(labels: DiffLabels, role: CodeDiffLineRole, line: DiffLine, number: number | undefined): string {
  const description = labels.line(role, number, line.text);
  return line.noNewline ? `${description} (${labels.noNewline})` : description;
}

function unifiedLineDescription(labels: DiffLabels, line: DiffLine): string {
  if (line.type === "add") return lineDescription(labels, "added", line, line.newNo);
  if (line.type === "del") return lineDescription(labels, "deleted", line, line.oldNo);
  return lineDescription(labels, "unchanged", line, line.newNo ?? line.oldNo);
}

function splitHalfDescription(labels: DiffLabels, row: Extract<VisualRow, { kind: "split" }>, side: "left" | "right"): string {
  const line = side === "left" ? row.left : row.right;
  if (!line) return "";
  if (line.type === "context") return lineDescription(labels, "unchanged", line, line.newNo ?? line.oldNo);
  if (side === "left") return lineDescription(labels, row.right ? "original" : "deleted", line, line.oldNo);
  return lineDescription(labels, row.left ? "modified" : "added", line, line.newNo);
}

function splitRowDescriptions(labels: DiffLabels, row: Extract<VisualRow, { kind: "split" }>): string[] {
  if (row.left?.type === "context") return [splitHalfDescription(labels, row, "left")];
  const descriptions: string[] = [];
  if (row.left) descriptions.push(splitHalfDescription(labels, row, "left"));
  if (row.right) descriptions.push(splitHalfDescription(labels, row, "right"));
  return descriptions;
}

function rowDescriptions(labels: DiffLabels, row: VisualRow): string[] {
  if (row.kind === "separator" || row.kind === "annotation") return [];
  if (row.kind === "unified") return [unifiedLineDescription(labels, row.line)];
  return splitRowDescriptions(labels, row);
}

function accessibleDiffText(labels: DiffLabels, file: DiffFile, rows: VisualRow[]): string {
  return [fileTitle(file), ...rows.flatMap((row) => rowDescriptions(labels, row))].join("\n");
}

function fileIdentity(file: DiffFile): string {
  const hunks = file.hunks
    .map((hunk) => `${hunk.oldStart}:${hunk.newStart}:${hunk.lines.map((line) => `${line.type}:${line.text}`).join("\n")}`)
    .join("\n");
  return `${file.oldName ?? ""}->${file.name}:${file.type}:${hunks}`;
}

function DiffSeparator({
  row,
  labels,
  onExpand,
}: {
  row: Extract<VisualRow, { kind: "separator" }>;
  labels: DiffLabels;
  onExpand: () => void;
}) {
  const MoreGlyph = useSkinIcon("more", MoreHorizontal);
  const label = row.label || (row.hidden > 0 ? labels.hidden(row.hidden) : "");
  return (
    <div data-control-ui="code-diff" data-control-family="code-diff" data-slot="expander" className="flex items-center">
      {row.canExpand ? (
        <button
          type="button"
          data-control-ui="code-diff"
          data-control-family="code-diff"
          data-slot="expand-button"
          data-control="true"
          onClick={onExpand}
          className="inline-flex cursor-pointer items-center"
          aria-label={labels.expand}
        >
          <MoreGlyph className="size-3.5" aria-hidden="true" />
        </button>
      ) : (
        <span aria-hidden="true" className="inline-flex">
          <MoreGlyph className="size-3.5" aria-hidden="true" />
        </span>
      )}
      {label ? (
        <span data-control-ui="code-diff" data-control-family="code-diff" data-slot="expander-label" title={label} className="truncate">
          {label}
        </span>
      ) : null}
    </div>
  );
}

function CodeDiffFileSection({
  file,
  lang,
  diffStyle,
  diffIndicators,
  overflow,
  maxHeight,
  open,
  onOverflowingChange,
  showFileHeader,
  labels,
  selectedLines,
  onSelectedLinesChange,
  annotations,
  renderAnnotation,
}: {
  file: DiffFile;
  lang: string | undefined;
  diffStyle: DiffStyle;
  diffIndicators: DiffIndicators;
  overflow: CodeOverflow;
  maxHeight: string;
  open: boolean;
  onOverflowingChange: Dispatch<SetStateAction<number>>;
  showFileHeader: boolean;
  labels: DiffLabels;
  selectedLines: readonly DiffLineRange[] | undefined;
  onSelectedLinesChange: ((lines: DiffLineRange[]) => void) | undefined;
  annotations: readonly AnnotationTarget[];
  renderAnnotation: (index: number) => ReactNode;
}) {
  const identity = useMemo(() => fileIdentity(file), [file]);
  const [expansion, setExpansion] = useState(NO_EXPANSION);
  const { gaps: expanded, revealedRowId } = expansion.identity === identity ? expansion : NO_EXPANSION;
  const texts = useMemo(() => sideTexts(file), [file]);
  const tokens = useSideTokens(texts.old, texts.new, lang, Boolean(lang));
  const rows = useMemo(() => buildRows(file, diffStyle, expanded, annotations), [file, diffStyle, expanded, annotations]);
  const targets = useMemo(() => lineTargets(rows), [rows]);
  const targetById = useMemo(() => new Map(targets.map((target) => [target.id, target])), [targets]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const revealedRowRef = useRef<HTMLDivElement>(null);
  const bodyMaxHeight = open ? OPEN_MAX_HEIGHT : maxHeight;
  // a body that grows with its rows has nothing to scroll, so a virtual window would never move
  const shouldVirtualize = bodyMaxHeight !== "none" && rows.length > VIRTUALIZE_THRESHOLD;
  // react-doctor-disable-next-line react-hooks-js/incompatible-library
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: 24,
    enabled: shouldVirtualize,
  });
  const virtualItems = virtualizer.getVirtualItems();
  const selection = useDiffLineSelection({
    file,
    targets,
    selectedLines,
    onSelectedLinesChange,
    firstRenderedRow: shouldVirtualize ? (virtualItems[0]?.index ?? 0) : 0,
    lastRenderedRow: shouldVirtualize ? (virtualItems.at(-1)?.index ?? -1) : rows.length - 1,
    revealRow: (rowIndex) => {
      if (shouldVirtualize) virtualizer.scrollToIndex(rowIndex, { align: "auto" });
    },
  });
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const viewport = scrollRef.current;
    if (!viewport || open) return;
    const measure = () => setOverflows(viewport.scrollHeight > viewport.clientHeight + 1);
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    if (viewport.firstElementChild) observer.observe(viewport.firstElementChild);
    measure();
    return () => observer.disconnect();
  }, [open]);

  useLayoutEffect(() => {
    if (!overflows) return;
    onOverflowingChange((count) => count + 1);
    return () => onOverflowingChange((count) => count - 1);
  }, [overflows, onOverflowingChange]);

  function expandGap(gapIndex: number) {
    const firstLine = hiddenContext(file, gapIndex)[0];
    flushSync(() => {
      setExpansion((current) => ({
        identity,
        gaps: new Set(current.identity === identity ? current.gaps : undefined).add(gapIndex),
        revealedRowId: firstLine ? expandedRowId(gapIndex, firstLine) : null,
      }));
    });
    revealedRowRef.current?.focus();
  }

  function rowFrameProps(id: string) {
    if (id !== revealedRowId) return {};
    return { tabIndex: -1, "data-control-ui": "code-diff", "data-control-family": "code-diff", "data-slot": "revealed-row" };
  }

  function measureRevealedRow(node: HTMLDivElement | null) {
    revealedRowRef.current = node;
    virtualizer.measureElement(node);
  }

  const gridClassName = overflow === "scroll" ? "w-max min-w-full" : "w-full";
  const gridStyle: DiffGridStyle = { "--_code-gutter-digits": gutterDigits(file, expanded) };

  function renderRow(row: VisualRow): ReactNode {
    if (row.kind === "separator") {
      return <DiffSeparator row={row} labels={labels} onExpand={() => expandGap(row.gapIndex)} />;
    }
    if (row.kind === "annotation") {
      return (
        <div data-control-ui="code-diff" data-control-family="code-diff" data-slot="annotation">
          {renderAnnotation(row.index)}
        </div>
      );
    }
    const lineProps = { indicators: diffIndicators, overflow, noNewlineLabel: labels.noNewline, selection };
    if (row.kind === "unified") {
      return (
        <UnifiedRow
          {...lineProps}
          line={row.line}
          tokens={lineTokens(row.line, tokens)}
          label={unifiedLineDescription(labels, row.line)}
          target={targetById.get(`${row.id}:unified`)}
        />
      );
    }
    return (
      <div data-control-ui="code-diff" data-control-family="code-diff" data-slot="row" className="grid w-full grid-cols-2">
        <SplitHalf
          {...lineProps}
          line={row.left}
          tokens={row.left ? lineTokens(row.left, tokens) : null}
          side="left"
          label={splitHalfDescription(labels, row, "left")}
          target={targetById.get(`${row.id}:left`)}
        />
        <SplitHalf
          {...lineProps}
          line={row.right}
          tokens={row.right ? lineTokens(row.right, tokens) : null}
          side="right"
          label={splitHalfDescription(labels, row, "right")}
          target={targetById.get(`${row.id}:right`)}
        />
      </div>
    );
  }

  return (
    <section data-control-ui="code-diff" data-control-family="code-diff" data-slot="file" data-file-name={file.name}>
      {showFileHeader ? (
        <div
          data-control-ui="code-diff"
          data-control-family="code-diff"
          data-slot="file-header"
          className="flex items-center justify-between"
        >
          <span
            data-control-ui="code-diff"
            data-control-family="code-diff"
            data-slot="file-title"
            title={fileTitle(file)}
            className="min-w-0 truncate"
          >
            {fileTitle(file)}
          </span>
          <DiffStats additions={file.additions} deletions={file.deletions} label={labels.stats(file.additions, file.deletions)} />
        </div>
      ) : null}
      <pre data-control-ui="code-diff" data-control-family="code-diff" data-slot="accessible-source" className="sr-only">
        <code>{accessibleDiffText(labels, file, rows)}</code>
      </pre>
      <ScrollArea
        maxHeight={bodyMaxHeight}
        aria-label={fileTitle(file)}
        viewportProps={{
          "data-control-ui": "code-diff",
          "data-control-family": "code-diff",
          "data-slot": "body",
        }}
        viewportRef={scrollRef}
      >
        {shouldVirtualize ? (
          <div className={gridClassName} style={{ ...gridStyle, position: "relative", height: `${virtualizer.getTotalSize()}px` }}>
            {/* rows share one in-flow window, so each spans the widest rendered line as in the static grid */}
            <div
              className={cn("absolute start-0 top-0", gridClassName)}
              style={{ transform: `translateY(${virtualItems[0]?.start ?? 0}px)` }}
            >
              {virtualItems.map((item) => {
                const row = rows[item.index];
                if (!row) return null;
                return (
                  <div
                    key={row.id}
                    ref={row.id === revealedRowId ? measureRevealedRow : virtualizer.measureElement}
                    data-index={item.index}
                    {...rowFrameProps(row.id)}
                  >
                    {renderRow(row)}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className={gridClassName} style={gridStyle}>
            {rows.length === 0 ? (
              <div data-control-ui="code-diff" data-control-family="code-diff" data-slot="empty">
                {labels.empty}
              </div>
            ) : null}
            {rows.map((row) => (
              <div key={row.id} ref={row.id === revealedRowId ? revealedRowRef : undefined} {...rowFrameProps(row.id)}>
                {renderRow(row)}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </section>
  );
}

const NO_ANNOTATIONS: readonly AnnotationTarget[] = [];

export function CodeDiff<T = unknown>({
  patch,
  oldText,
  newText,
  lang,
  name,
  diffStyle = "unified",
  diffIndicators = "bars",
  lineDiffType = "word",
  overflow = "scroll",
  maxLineDiffLength,
  maxEditLength,
  maxHeight = "32rem",
  header = true,
  emptyLabel = "No changes",
  expandLabel = "Expand hidden lines",
  getHiddenLinesLabel = defaultHiddenLinesLabel,
  showAllLabel = "Show all lines",
  showFewerLabel = "Show fewer lines",
  noNewlineLabel = "No newline at end of file",
  copyLabel,
  copiedLabel,
  copyFailedLabel,
  getStatsLabel = defaultStatsLabel,
  getLineLabel = defaultLineLabel,
  getFileCountLabel = defaultFileCountLabel,
  selectedLines,
  onSelectedLinesChange,
  annotations,
  renderAnnotation,
  ignoreWhitespace,
  className,
  style,
  ...props
}: CodeDiffProps<T>) {
  const ChevronsDownUpGlyph = useSkinIcon("chevronsDownUp", ChevronsDownUp);
  const ChevronsUpDownGlyph = useSkinIcon("chevronsUpDown", ChevronsUpDown);
  const files = useMemo(() => {
    const options = { name, lang, lineDiffType, maxLineDiffLength, maxEditLength, ignoreWhitespace };
    const parsedFiles =
      patch === undefined ? [buildDiffFromFiles(oldText ?? "", newText ?? "", options)] : buildDiffFromPatch(patch, options);
    return parsedFiles.length > 0 ? parsedFiles : [emptyFile(name)];
  }, [patch, oldText, newText, name, lang, lineDiffType, maxLineDiffLength, maxEditLength, ignoreWhitespace]);
  const additions = files.reduce((total, file) => total + file.additions, 0);
  const deletions = files.reduce((total, file) => total + file.deletions, 0);
  const copyValue = patch ?? newText ?? "";
  const firstFile = files[0];
  const title = files.length === 1 && firstFile ? fileTitle(firstFile) : getFileCountLabel(files.length);
  const labels: DiffLabels = {
    empty: emptyLabel,
    expand: expandLabel,
    hidden: getHiddenLinesLabel,
    noNewline: noNewlineLabel,
    stats: getStatsLabel,
    line: getLineLabel,
  };
  const copyProps = { "aria-label": copyLabel, copiedAriaLabel: copiedLabel, copyFailedLabel };
  const [open, setOpen] = useState(false);
  const [overflowing, setOverflowing] = useState(0);
  const heightLabel = open ? showFewerLabel : showAllLabel;

  return (
    <figure
      data-control-ui="code-diff"
      data-control-family="code-diff"
      data-slot="root"
      data-surface="panel"
      dir="ltr"
      data-diff-style={diffStyle}
      data-file-count={files.length}
      data-header={header ? "true" : undefined}
      className={cn("overflow-hidden", className)}
      style={style}
      {...props}
    >
      {header ? (
        <figcaption
          data-control-ui="code-diff"
          data-control-family="code-diff"
          data-slot="header"
          className="flex items-center justify-between"
        >
          <span data-control-ui="code-diff" data-control-family="code-diff" data-slot="title" title={title} className="min-w-0 truncate">
            {title}
          </span>
          <div data-control-ui="code-diff" data-control-family="code-diff" data-slot="actions" className="flex shrink-0 items-center">
            <DiffStats additions={additions} deletions={deletions} label={getStatsLabel(additions, deletions)} />
            {open || overflowing > 0 ? (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="quiet"
                      size="xs"
                      aria-label={heightLabel}
                      aria-expanded={open}
                      onClick={() => setOpen(!open)}
                    >
                      {open ? <ChevronsDownUpGlyph aria-hidden="true" /> : <ChevronsUpDownGlyph aria-hidden="true" />}
                    </Button>
                  }
                />
                <TooltipContent side="inline-start">{heightLabel}</TooltipContent>
              </Tooltip>
            ) : null}
            <CodeDiffCopy value={copyValue} {...copyProps} />
          </div>
        </figcaption>
      ) : (
        <CodeFloatingCopy value={copyValue} {...copyProps} />
      )}
      {files.map((file, index) => (
        <CodeDiffFileSection
          // biome-ignore lint/suspicious/noArrayIndexKey: a patch can repeat a file name, position tells the sections apart
          key={`${index}:${file.name}`}
          file={file}
          lang={lang}
          diffStyle={diffStyle}
          diffIndicators={diffIndicators}
          overflow={overflow}
          maxHeight={maxHeight}
          open={open}
          onOverflowingChange={setOverflowing}
          showFileHeader={files.length > 1}
          labels={labels}
          selectedLines={index === 0 ? selectedLines : undefined}
          onSelectedLinesChange={index === 0 ? onSelectedLinesChange : undefined}
          annotations={index === 0 && annotations ? annotations : NO_ANNOTATIONS}
          renderAnnotation={(annotationIndex) => {
            const annotation = annotations?.[annotationIndex];
            return annotation && renderAnnotation ? renderAnnotation(annotation) : null;
          }}
        />
      ))}
    </figure>
  );
}

export type CodeDiffCopyProps = CodeCopyProps;

// IS CodeCopy, so diff header's copy and a code header's copy can never drift apart.
export function CodeDiffCopy(props: CodeDiffCopyProps) {
  return <CodeCopy {...props} />;
}

function emptyFile(name: string | undefined): DiffFile {
  return { name: name ?? "file", type: "change", hunks: [], oldLines: [], newLines: [], isPartial: true, additions: 0, deletions: 0 };
}
