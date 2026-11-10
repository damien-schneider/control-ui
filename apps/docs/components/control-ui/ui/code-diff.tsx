"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { CodeDiffKnobStyle } from "@/components/control-ui/knob-contracts/code-diff-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { type CodeTokenLines, highlightToTokens, mergeCodeTokenLineWithEmphasis } from "@/components/control-ui/lib/code-tokens";
import { buildDiffFromFiles, buildDiffFromPatch, type DiffFile, type DiffLine, diffRunEnd } from "@/components/control-ui/lib/diff";
import type { CodeOverflow } from "@/components/control-ui/ui/code";
import { CodeCopy, type CodeCopyProps, CodeFloatingCopy, CodeTokenLine } from "@/components/control-ui/ui/code";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";

export type DiffStyle = "unified" | "split";

export type DiffIndicators = "classic" | "bars";

export type DiffLineKind = "word" | "char" | "none";

/*
 * Split mode virtualizes one aligned-row list rather than two synced panes, so there is no scroll-sync to drift.
 * Line numbers and +/- markers sit in select-none cells, so text selection copies clean source.
 */

const ESTIMATED_ROW_HEIGHT = 20;
const VIRTUALIZE_THRESHOLD = 150;

type SideTokens = { old: CodeTokenLines | null; new: CodeTokenLines | null };

const NO_SIDE_TOKENS: SideTokens = { old: null, new: null };

type DiffGridStyle = CSSProperties & { "--_code-gutter-digits": number };

// expansion belongs to one diff: a new identity starts collapsed without remounting the scroller
type Expansion = { identity: string; gaps: ReadonlySet<number>; revealedRowId: string | null };

const NO_EXPANSION: Expansion = { identity: "", gaps: new Set(), revealedRowId: null };

type VisualRow =
  | { kind: "separator"; id: string; gapIndex: number; label: string; canExpand: boolean }
  | { kind: "unified"; id: string; line: DiffLine }
  | { kind: "split"; id: string; left: DiffLine | null; right: DiffLine | null };

export type CodeDiffLineRole = "added" | "deleted" | "unchanged" | "original" | "modified";

export type CodeDiffProps = Omit<ComponentProps<"figure">, "children" | "style"> & {
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
  maxHeight?: string;
  header?: boolean;
  emptyLabel?: ReactNode;
  expandLabel?: string;
  noNewlineLabel?: string;
  copyLabel?: string;
  copiedLabel?: string;
  copyFailedLabel?: string;
  getStatsLabel?: (additions: number, deletions: number) => string;
  getLineLabel?: (role: CodeDiffLineRole, lineNumber: number | undefined, text: string) => string;
  getFileCountLabel?: (count: number) => string;
  style?: CSSProperties & CodeDiffKnobStyle;
};

type DiffLabels = {
  empty: ReactNode;
  expand: string;
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

function trailingContext(file: DiffFile): DiffLine[] {
  const last = file.hunks.at(-1);
  if (!last || file.isPartial) return [];
  const offset = last.newStart + last.newCount - (last.oldStart + last.oldCount);
  const lines: DiffLine[] = [];
  for (let oldNo = last.oldStart + last.oldCount; oldNo <= file.oldLines.length; oldNo += 1) {
    lines.push({ type: "context", oldNo, newNo: oldNo + offset, text: file.oldLines[oldNo - 1] ?? "" });
  }
  return lines;
}

// non-partial only — numbering comes from file's full text; the index past the last hunk is the file's tail
function expandedContext(file: DiffFile, gapIndex: number): DiffLine[] {
  if (gapIndex === file.hunks.length) return trailingContext(file);
  const hunk = file.hunks[gapIndex];
  if (!hunk) return [];
  const offset = hunk.newStart - hunk.oldStart;
  const lines: DiffLine[] = [];
  for (let oldNo = hunk.oldStart - hunk.collapsedBefore; oldNo < hunk.oldStart; oldNo += 1) {
    const text = file.oldLines[oldNo - 1] ?? "";
    lines.push({ type: "context", oldNo, newNo: oldNo + offset, text });
  }
  return lines;
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
  if (expanded.has(gapIndex) && !file.isPartial) {
    return expandedContext(file, gapIndex).map((line) => rowForLine(diffStyle, line, expandedRowId(gapIndex, line)));
  }

  const label = hunk.header ?? `@@ -${hunkRange(hunk.oldStart, hunk.oldCount)} +${hunkRange(hunk.newStart, hunk.newCount)} @@`;
  return [
    {
      kind: "separator",
      id: `sep-${gapIndex}`,
      gapIndex,
      label,
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
  if (expanded.has(gapIndex)) {
    return trailingContext(file).map((line) => rowForLine(diffStyle, line, expandedRowId(gapIndex, line)));
  }
  return [{ kind: "separator", id: `sep-${gapIndex}`, gapIndex, label: "", canExpand: true }];
}

// pushed one by one: spreading a hunk of 100k+ lines into push() overflows the call stack
function buildRows(file: DiffFile, diffStyle: DiffStyle, expanded: ReadonlySet<number>): VisualRow[] {
  const rows: VisualRow[] = [];
  for (const [gapIndex, hunk] of file.hunks.entries()) {
    for (const row of gapRows(file, hunk, gapIndex, diffStyle, expanded)) rows.push(row);
    for (const row of changedRows(hunk, gapIndex, diffStyle)) rows.push(row);
  }
  for (const row of trailingRows(file, diffStyle, expanded)) rows.push(row);
  return rows;
}

function gutterDigits(file: DiffFile, expanded: ReadonlySet<number>): number {
  let last = 1;
  for (const hunk of file.hunks) last = Math.max(last, hunk.oldStart + hunk.oldCount - 1, hunk.newStart + hunk.newCount - 1);
  if (expanded.has(file.hunks.length)) last = Math.max(last, file.oldLines.length, file.newLines.length);
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
        ⊘
      </span>
    ) : null;
  if (line.segments && line.segments.length > 0) {
    const runs = mergeCodeTokenLineWithEmphasis(line.text, tokens, line.segments);
    return (
      <code className={cn("min-w-0 flex-1", wrapClass)}>
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
    <code className={cn("min-w-0 flex-1", wrapClass)}>
      {/* a row holding no text node is skipped by text selection, losing the blank line on copy */}
      {line.text === "" ? "\n" : <CodeTokenLine tokens={tokens} plain={line.text} />}
      {noNewline}
    </code>
  );
}

function Gutter({ children, type }: { children: ReactNode; type: DiffLine["type"] }) {
  return (
    <span
      data-control-ui="code-diff"
      data-control-family="code-diff"
      data-line-type={type}
      data-slot="gutter"
      aria-hidden="true"
      className="shrink-0 select-none"
    >
      {children}
    </span>
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

function UnifiedRow({
  line,
  tokens,
  indicators,
  overflow,
  noNewlineLabel,
}: {
  line: DiffLine;
  tokens: CodeTokenLines[number] | null;
  indicators: DiffIndicators;
  overflow: CodeOverflow;
  noNewlineLabel: string;
}) {
  return (
    <div
      data-control-ui="code-diff"
      data-control-family="code-diff"
      data-slot="line"
      data-line-type={line.type}
      data-indicators={indicators}
      aria-hidden="true"
      className="flex w-full"
    >
      <Gutter type={line.type}>{line.oldNo ?? ""}</Gutter>
      <Gutter type={line.type}>{line.newNo ?? ""}</Gutter>
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
}: {
  line: DiffLine | null;
  tokens: CodeTokenLines[number] | null;
  indicators: DiffIndicators;
  overflow: CodeOverflow;
  side: "left" | "right";
  noNewlineLabel: string;
}) {
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
  return (
    <div
      data-control-ui="code-diff"
      data-control-family="code-diff"
      data-slot="line"
      data-line-type={line.type}
      data-indicators={indicators}
      data-side={side}
      aria-hidden="true"
      className="flex min-w-0"
    >
      <Gutter type={line.type}>{side === "left" ? (line.oldNo ?? "") : (line.newNo ?? "")}</Gutter>
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

function splitRowDescriptions(labels: DiffLabels, row: Extract<VisualRow, { kind: "split" }>): string[] {
  if (row.left?.type === "context") return [lineDescription(labels, "unchanged", row.left, row.left.newNo ?? row.left.oldNo)];
  const descriptions: string[] = [];
  if (row.left) descriptions.push(lineDescription(labels, row.right ? "original" : "deleted", row.left, row.left.oldNo));
  if (row.right) descriptions.push(lineDescription(labels, row.left ? "modified" : "added", row.right, row.right.newNo));
  return descriptions;
}

function rowDescriptions(labels: DiffLabels, row: VisualRow): string[] {
  if (row.kind === "separator") return [];
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

function CodeDiffFileSection({
  file,
  lang,
  diffStyle,
  diffIndicators,
  overflow,
  maxHeight,
  showFileHeader,
  labels,
}: {
  file: DiffFile;
  lang: string | undefined;
  diffStyle: DiffStyle;
  diffIndicators: DiffIndicators;
  overflow: CodeOverflow;
  maxHeight: string;
  showFileHeader: boolean;
  labels: DiffLabels;
}) {
  const identity = useMemo(() => fileIdentity(file), [file]);
  const [expansion, setExpansion] = useState(NO_EXPANSION);
  const { gaps: expanded, revealedRowId } = expansion.identity === identity ? expansion : NO_EXPANSION;
  const texts = useMemo(() => sideTexts(file), [file]);
  const tokens = useSideTokens(texts.old, texts.new, lang, Boolean(lang));
  const rows = useMemo(() => buildRows(file, diffStyle, expanded), [file, diffStyle, expanded]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const revealedRowRef = useRef<HTMLDivElement>(null);
  const shouldVirtualize = rows.length > VIRTUALIZE_THRESHOLD;
  // react-doctor-disable-next-line react-hooks-js/incompatible-library
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: 24,
    enabled: shouldVirtualize,
  });
  const virtualItems = virtualizer.getVirtualItems();

  function expandGap(gapIndex: number) {
    const firstLine = expandedContext(file, gapIndex)[0];
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
      return (
        <div data-control-ui="code-diff" data-control-family="code-diff" data-slot="expander" className="flex items-center">
          {row.canExpand ? (
            <button
              type="button"
              data-control-ui="code-diff"
              data-control-family="code-diff"
              data-slot="expand-button"
              data-control="true"
              onClick={() => expandGap(row.gapIndex)}
              className="cursor-pointer"
              aria-label={labels.expand}
            >
              ⋯
            </button>
          ) : (
            <span aria-hidden="true">⋯</span>
          )}
          {row.label ? (
            <span
              data-control-ui="code-diff"
              data-control-family="code-diff"
              data-slot="expander-label"
              title={row.label}
              className="truncate"
            >
              {row.label}
            </span>
          ) : null}
        </div>
      );
    }
    if (row.kind === "unified") {
      return (
        <UnifiedRow
          line={row.line}
          tokens={lineTokens(row.line, tokens)}
          indicators={diffIndicators}
          overflow={overflow}
          noNewlineLabel={labels.noNewline}
        />
      );
    }
    return (
      <div data-control-ui="code-diff" data-control-family="code-diff" data-slot="row" className="grid w-full grid-cols-2">
        <SplitHalf
          line={row.left}
          tokens={row.left ? lineTokens(row.left, tokens) : null}
          indicators={diffIndicators}
          overflow={overflow}
          side="left"
          noNewlineLabel={labels.noNewline}
        />
        <SplitHalf
          line={row.right}
          tokens={row.right ? lineTokens(row.right, tokens) : null}
          indicators={diffIndicators}
          overflow={overflow}
          side="right"
          noNewlineLabel={labels.noNewline}
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
        maxHeight={maxHeight}
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

export function CodeDiff({
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
  noNewlineLabel = "No newline at end of file",
  copyLabel,
  copiedLabel,
  copyFailedLabel,
  getStatsLabel = defaultStatsLabel,
  getLineLabel = defaultLineLabel,
  getFileCountLabel = defaultFileCountLabel,
  className,
  style,
  ...props
}: CodeDiffProps) {
  const files = useMemo(() => {
    const options = { name, lang, lineDiffType, maxLineDiffLength, maxEditLength };
    const parsedFiles =
      patch === undefined ? [buildDiffFromFiles(oldText ?? "", newText ?? "", options)] : buildDiffFromPatch(patch, options);
    return parsedFiles.length > 0 ? parsedFiles : [emptyFile(name)];
  }, [patch, oldText, newText, name, lang, lineDiffType, maxLineDiffLength, maxEditLength]);
  const additions = files.reduce((total, file) => total + file.additions, 0);
  const deletions = files.reduce((total, file) => total + file.deletions, 0);
  const copyValue = patch ?? newText ?? "";
  const firstFile = files[0];
  const title = files.length === 1 && firstFile ? fileTitle(firstFile) : getFileCountLabel(files.length);
  const labels: DiffLabels = {
    empty: emptyLabel,
    expand: expandLabel,
    noNewline: noNewlineLabel,
    stats: getStatsLabel,
    line: getLineLabel,
  };
  const copyProps = { "aria-label": copyLabel, copiedAriaLabel: copiedLabel, copyFailedLabel };

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
          showFileHeader={files.length > 1}
          labels={labels}
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
