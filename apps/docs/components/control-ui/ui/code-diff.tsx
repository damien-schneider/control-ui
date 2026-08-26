"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CodeDiffKnobStyle } from "@/components/control-ui/knob-contracts/code-diff-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { type CodeTokenLines, highlightToTokens, mergeCodeTokenLineWithEmphasis } from "@/components/control-ui/lib/code-tokens";
import { buildDiffFromFiles, buildDiffFromPatch, type DiffFile, type DiffLine, diffRunEnd } from "@/components/control-ui/lib/diff";
import type { CodeOverflow } from "@/components/control-ui/ui/code";
import { CodeCopy, type CodeCopyProps, CodeFloatingCopy, CodeTokenLine } from "@/components/control-ui/ui/code";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";

export type DiffStyle = "unified" | "split";

export type DiffIndicators = "classic" | "bars" | "none";

export type DiffLineKind = "word" | "char" | "none";

/*
 * Split mode virtualizes one aligned-row list rather than two synced panes, so there is no scroll-sync to drift.
 * Line numbers and +/- markers sit in select-none cells, so text selection copies clean source.
 */

const ESTIMATED_ROW_HEIGHT = 20;
const VIRTUALIZE_THRESHOLD = 150;

type SideTokens = { old: CodeTokenLines | null; new: CodeTokenLines | null };

type VisualRow =
  | { kind: "separator"; id: string; gapIndex: number; label: string; canExpand: boolean }
  | { kind: "unified"; id: string; line: DiffLine }
  | { kind: "split"; id: string; left: DiffLine | null; right: DiffLine | null };

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
  maxHeight?: string;
  header?: boolean;
  children?: ReactNode;
  style?: CSSProperties & CodeDiffKnobStyle;
};

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
  const requestKey = `${lang ?? ""}\n${oldText.length}:${oldText}${newText}`;
  const [state, setState] = useState<{ key: string; tokens: SideTokens } | null>(null);

  useEffect(() => {
    if (!enabled || !lang) return;
    let cancelled = false;
    void Promise.all([highlightToTokens(oldText, lang), highlightToTokens(newText, lang)])
      .then(([oldTokens, newTokens]) => {
        if (!cancelled) setState({ key: requestKey, tokens: { old: oldTokens, new: newTokens } });
      })
      .catch(() => {
        if (!cancelled) setState({ key: requestKey, tokens: { old: null, new: null } });
      });
    return () => {
      cancelled = true;
    };
  }, [oldText, newText, lang, enabled, requestKey]);

  if (!enabled) return { old: null, new: null };
  return state?.key === requestKey ? state.tokens : { old: null, new: null };
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

// non-partial only — numbering comes from file's full text
function expandedContext(file: DiffFile, gapIndex: number): DiffLine[] {
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

type DiffHunk = DiffFile["hunks"][number];

function gapRows(file: DiffFile, hunk: DiffHunk, gapIndex: number, diffStyle: DiffStyle, expanded: ReadonlySet<number>): VisualRow[] {
  const hasGap = gapIndex > 0 || hunk.collapsedBefore > 0;
  if (!hasGap) return [];
  if (expanded.has(gapIndex) && !file.isPartial) {
    return expandedContext(file, gapIndex).map((line) => rowForLine(diffStyle, line, `exp-${gapIndex}-${line.oldNo ?? line.newNo ?? 0}`));
  }

  const label = hunk.header ?? `@@ -${hunk.oldStart},${hunk.oldCount} +${hunk.newStart},${hunk.newCount} @@`;
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

function buildRows(file: DiffFile, diffStyle: DiffStyle, expanded: ReadonlySet<number>): VisualRow[] {
  const rows: VisualRow[] = [];
  for (const [gapIndex, hunk] of file.hunks.entries()) {
    rows.push(...gapRows(file, hunk, gapIndex, diffStyle, expanded));
    rows.push(...changedRows(hunk, gapIndex, diffStyle));
  }
  return rows;
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
}: {
  line: DiffLine;
  tokens: CodeTokenLines[number] | null;
  overflow: CodeOverflow;
}): ReactNode {
  const wrapClass = overflow === "wrap" ? "whitespace-pre-wrap break-words" : "whitespace-pre";
  if (line.segments && line.segments.length > 0) {
    const runs = mergeCodeTokenLineWithEmphasis(line.text, tokens, line.segments);
    return (
      <code className={cn("min-w-0 flex-1 pr-4", wrapClass)}>
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
      </code>
    );
  }
  return (
    <code className={cn("min-w-0 flex-1 pr-4", wrapClass)}>
      <CodeTokenLine tokens={tokens} plain={line.text} />
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
      className="shrink-0 select-none px-2"
      style={{ minWidth: "2.75rem" }}
    >
      {children}
    </span>
  );
}

function Marker({ type, indicators }: { type: DiffLine["type"]; indicators: DiffIndicators }) {
  if (indicators !== "classic") return null;
  return (
    <span
      data-control-ui="code-diff"
      data-control-family="code-diff"
      data-slot="marker"
      data-line-type={type}
      aria-hidden="true"
      className="shrink-0 select-none pl-1 pr-1"
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
}: {
  line: DiffLine;
  tokens: CodeTokenLines[number] | null;
  indicators: DiffIndicators;
  overflow: CodeOverflow;
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
      <Marker type={line.type} indicators={indicators} />
      <DiffCode line={line} tokens={tokens} overflow={overflow} />
    </div>
  );
}

function SplitHalf({
  line,
  tokens,
  indicators,
  overflow,
  side,
}: {
  line: DiffLine | null;
  tokens: CodeTokenLines[number] | null;
  indicators: DiffIndicators;
  overflow: CodeOverflow;
  side: "left" | "right";
}) {
  if (!line)
    return (
      <div
        data-control-ui="code-diff"
        data-control-family="code-diff"
        data-slot="empty-half"
        data-side={side}
        aria-hidden="true"
        className="flex min-w-0 flex-1"
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
      className="flex min-w-0 flex-1"
    >
      <Gutter type={line.type}>{side === "left" ? (line.oldNo ?? "") : (line.newNo ?? "")}</Gutter>
      <Marker type={line.type} indicators={indicators} />
      <DiffCode line={line} tokens={tokens} overflow={overflow} />
    </div>
  );
}

function fileTitle(file: DiffFile): string {
  return file.oldName && file.type === "rename" ? `${file.oldName} → ${file.name}` : file.name;
}

function DiffStats({ additions, deletions }: { additions: number; deletions: number }) {
  return (
    <span data-control-ui="code-diff" data-control-family="code-diff" data-slot="stat" className="flex items-center gap-1.5">
      <span data-control-ui="code-diff" data-control-family="code-diff" data-slot="stat-additions">
        +{additions}
      </span>
      <span data-control-ui="code-diff" data-control-family="code-diff" data-slot="stat-deletions">
        −{deletions}
      </span>
    </span>
  );
}

function lineDescription(label: string, line: DiffLine, number: number | undefined): string {
  return `${label} line ${number ?? "?"}: ${line.text}`;
}

function unifiedLineDescription(line: DiffLine): string {
  if (line.type === "add") return lineDescription("Added", line, line.newNo);
  if (line.type === "del") return lineDescription("Deleted", line, line.oldNo);
  return lineDescription("Unchanged", line, line.newNo ?? line.oldNo);
}

function splitRowDescriptions(row: Extract<VisualRow, { kind: "split" }>): string[] {
  if (row.left?.type === "context") return [lineDescription("Unchanged", row.left, row.left.newNo ?? row.left.oldNo)];
  const descriptions: string[] = [];
  if (row.left) descriptions.push(lineDescription(row.right ? "Original" : "Deleted", row.left, row.left.oldNo));
  if (row.right) descriptions.push(lineDescription(row.left ? "Modified" : "Added", row.right, row.right.newNo));
  return descriptions;
}

function rowDescriptions(row: VisualRow): string[] {
  if (row.kind === "separator") return [];
  if (row.kind === "unified") return [unifiedLineDescription(row.line)];
  return splitRowDescriptions(row);
}

function accessibleDiffText(file: DiffFile, rows: VisualRow[]): string {
  return [fileTitle(file), ...rows.flatMap(rowDescriptions)].join("\n");
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
}: {
  file: DiffFile;
  lang: string | undefined;
  diffStyle: DiffStyle;
  diffIndicators: DiffIndicators;
  overflow: CodeOverflow;
  maxHeight: string;
  showFileHeader: boolean;
}) {
  const [expanded, setExpanded] = useState<ReadonlySet<number>>(() => new Set());
  const texts = useMemo(() => sideTexts(file), [file]);
  const tokens = useSideTokens(texts.old, texts.new, lang, Boolean(lang));
  const rows = useMemo(() => buildRows(file, diffStyle, expanded), [file, diffStyle, expanded]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldVirtualize = rows.length > VIRTUALIZE_THRESHOLD;
  // react-doctor-disable-next-line react-hooks-js/incompatible-library
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: 24,
    enabled: shouldVirtualize,
  });

  function expandGap(gapIndex: number) {
    setExpanded((current) => new Set(current).add(gapIndex));
  }

  const gridClassName = overflow === "scroll" ? "w-max min-w-full" : "w-full";

  function renderRow(row: VisualRow): ReactNode {
    if (row.kind === "separator") {
      return (
        <div data-control-ui="code-diff" data-control-family="code-diff" data-slot="expander" className="flex items-center gap-2 px-3 py-1">
          {row.canExpand ? (
            <button
              type="button"
              data-control-ui="code-diff"
              data-control-family="code-diff"
              data-slot="expand-button"
              data-control="true"
              onClick={() => expandGap(row.gapIndex)}
              className="cursor-pointer px-1.5 py-0.5"
              aria-label="Expand hidden lines"
            >
              ⋯
            </button>
          ) : (
            <span aria-hidden="true" className="px-1.5">
              ⋯
            </span>
          )}
          <span data-control-ui="code-diff" data-control-family="code-diff" data-slot="expander-label" className="truncate">
            {row.label}
          </span>
        </div>
      );
    }
    if (row.kind === "unified") {
      return <UnifiedRow line={row.line} tokens={lineTokens(row.line, tokens)} indicators={diffIndicators} overflow={overflow} />;
    }
    return (
      <div data-control-ui="code-diff" data-control-family="code-diff" data-slot="row" className="flex w-full">
        <SplitHalf
          line={row.left}
          tokens={row.left ? lineTokens(row.left, tokens) : null}
          indicators={diffIndicators}
          overflow={overflow}
          side="left"
        />
        <SplitHalf
          line={row.right}
          tokens={row.right ? lineTokens(row.right, tokens) : null}
          indicators={diffIndicators}
          overflow={overflow}
          side="right"
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
          className="flex min-h-9 items-center justify-between gap-3 px-3 py-1.5"
        >
          <span data-control-ui="code-diff" data-control-family="code-diff" data-slot="file-title" className="min-w-0 truncate">
            {fileTitle(file)}
          </span>
          <DiffStats additions={file.additions} deletions={file.deletions} />
        </div>
      ) : null}
      <pre data-control-ui="code-diff" data-control-family="code-diff" data-slot="accessible-source" className="sr-only">
        <code>{accessibleDiffText(file, rows)}</code>
      </pre>
      <ScrollArea
        maxHeight={maxHeight}
        viewportClassName={undefined}
        viewportProps={{
          "data-control-ui": "code-diff",
          "data-control-family": "code-diff",
          "data-slot": "body",
        }}
        viewportRef={scrollRef}
      >
        {shouldVirtualize ? (
          <div className={gridClassName} style={{ position: "relative", height: `${virtualizer.getTotalSize()}px` }}>
            {virtualizer.getVirtualItems().map((item) => {
              const row = rows[item.index];
              if (!row) return null;
              return (
                <div
                  key={row.id}
                  ref={virtualizer.measureElement}
                  data-index={item.index}
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${item.start}px)` }}
                >
                  {renderRow(row)}
                </div>
              );
            })}
          </div>
        ) : (
          <div className={gridClassName}>
            {rows.map((row) => (
              <div key={row.id}>{renderRow(row)}</div>
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
  maxHeight = "32rem",
  header = true,
  className,
  style,
  ...props
}: CodeDiffProps) {
  const options = { name, lang, lineDiffType, maxLineDiffLength };
  const parsedFiles =
    patch === undefined ? [buildDiffFromFiles(oldText ?? "", newText ?? "", options)] : buildDiffFromPatch(patch, options);
  const files: DiffFile[] = parsedFiles.length > 0 ? parsedFiles : [emptyFile(name)];
  const additions = files.reduce((total, file) => total + file.additions, 0);
  const deletions = files.reduce((total, file) => total + file.deletions, 0);
  const copyValue = patch ?? newText ?? "";
  const firstFile = files[0];

  return (
    <figure
      data-control-ui="code-diff"
      data-control-family="code-diff"
      data-slot="root"
      data-surface="panel"
      data-diff-style={diffStyle}
      data-file-count={files.length}
      data-header={header ? "true" : undefined}
      className={cn("my-4 overflow-hidden", !header && "relative pt-9", className)}
      style={style}
      {...props}
    >
      {header ? (
        <figcaption
          data-control-ui="code-diff"
          data-control-family="code-diff"
          data-slot="header"
          className="flex min-h-10 items-center justify-between gap-3 px-3 py-1.5"
        >
          <span data-control-ui="code-diff" data-control-family="code-diff" data-slot="title" className="min-w-0 truncate">
            {files.length === 1 && firstFile ? fileTitle(firstFile) : `${files.length} files`}
          </span>
          <div data-control-ui="code-diff" data-control-family="code-diff" data-slot="actions" className="flex shrink-0 items-center gap-2">
            <DiffStats additions={additions} deletions={deletions} />
            <CodeDiffCopy value={copyValue} />
          </div>
        </figcaption>
      ) : (
        <CodeFloatingCopy value={copyValue} />
      )}
      {files.map((file) => (
        <CodeDiffFileSection
          key={fileIdentity(file)}
          file={file}
          lang={lang}
          diffStyle={diffStyle}
          diffIndicators={diffIndicators}
          overflow={overflow}
          maxHeight={maxHeight}
          showFileHeader={files.length > 1}
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
