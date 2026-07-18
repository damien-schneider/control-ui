"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { CodeOverflow, DiffIndicators, DiffLineKind, DiffStyle } from "@/components/control-ui/contracts";
import { useCopyToClipboard } from "@/components/control-ui/hooks/use-copy-to-clipboard";
import { cn } from "@/components/control-ui/lib/cn";
import { type CodeTokenLines, highlightToTokens, mergeCodeTokenLineWithEmphasis } from "@/components/control-ui/lib/code-tokens";
import { buildDiffFromFiles, buildDiffFromPatch, type DiffFile, type DiffLine } from "@/components/control-ui/lib/diff";
import { skinSlot } from "@/components/control-ui/skin";
import { Button } from "@/components/control-ui/ui/button";
import { CodeFloatingCopy, CodeTokenLine } from "@/components/control-ui/ui/code";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";

/*
 * CodeDiff — the diff view built on the Code surface. It parses a git/unified patch OR a before/after
 * pair into the pure DiffFile model (lib/diff), then renders unified or split rows through one TanStack
 * virtualizer over a single aligned-row list (no scroll-sync). Line numbers and +/- markers live in
 * select-none cells, so a text selection copies clean source. Intra-line word/char diff shows as an
 * emphasis background on changed lines; add/remove tint + gutter come from the --diff-* skin tokens.
 */

const ESTIMATED_ROW_HEIGHT = 20;
const VIRTUALIZE_THRESHOLD = 150;

type SideTokens = { old: CodeTokenLines | null; new: CodeTokenLines | null };

type VisualRow =
  | { kind: "separator"; id: string; gapIndex: number; label: string; canExpand: boolean }
  | { kind: "unified"; id: string; line: DiffLine }
  | { kind: "split"; id: string; left: DiffLine | null; right: DiffLine | null };

export type CodeDiffProps = Omit<ComponentProps<"figure">, "children"> & {
  // One input path or the other. `patch` is a unified/git diff string (partial: no expand-context).
  // `oldText`/`newText` compute a full diff (expandable).
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
  // Render the header row (name + +/− stat + copy). On by default.
  header?: boolean;
  children?: ReactNode;
};

// Reconstruct each side's full text so tokens can be indexed by line number. Non-partial files carry
// the whole text; partial (patch) files are rebuilt from the hunk lines (holes join as blank lines).
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

// Split a hunk's unified lines into aligned [left(del)|right(add)] rows; context sits on both sides.
function splitPairs(lines: DiffLine[]): { left: DiffLine | null; right: DiffLine | null }[] {
  const rows: { left: DiffLine | null; right: DiffLine | null }[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (line.type === "context") {
      rows.push({ left: line, right: line });
      index += 1;
      continue;
    }
    const dels: DiffLine[] = [];
    while (index < lines.length && lines[index].type === "del") {
      dels.push(lines[index]);
      index += 1;
    }
    const adds: DiffLine[] = [];
    while (index < lines.length && lines[index].type === "add") {
      adds.push(lines[index]);
      index += 1;
    }
    const count = Math.max(dels.length, adds.length);
    for (let pair = 0; pair < count; pair += 1) rows.push({ left: dels[pair] ?? null, right: adds[pair] ?? null });
  }
  return rows;
}

// Reveal a hidden gap as context lines, numbered from the file's full text (non-partial only).
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

const lineTint: Record<DiffLine["type"], string> = {
  add: "bg-[var(--diff-add-line)]",
  del: "bg-[var(--diff-del-line)]",
  context: "",
};

const markerFor: Record<DiffLine["type"], string> = { add: "+", del: "-", context: "" };

// One code cell: word-diff emphasis when the line carries segments, else syntax tokens.
function DiffCode({
  line,
  tokens,
  overflow,
}: {
  line: DiffLine;
  tokens: CodeTokenLines[number] | null;
  overflow: CodeOverflow;
}): ReactNode {
  const emphasisVar = line.type === "del" ? "var(--diff-del-emphasis)" : "var(--diff-add-emphasis)";
  const wrapClass = overflow === "wrap" ? "whitespace-pre-wrap break-words" : "whitespace-pre";
  if (line.segments && line.segments.length > 0) {
    const runs = mergeCodeTokenLineWithEmphasis(line.text, tokens, line.segments);
    return (
      <code className={cn("min-w-0 flex-1 pr-4", wrapClass)}>
        {runs.map((run, index) => {
          const style: CSSProperties | undefined =
            run.style || run.emphasis
              ? {
                  ...run.style,
                  ...(run.emphasis ? { backgroundColor: emphasisVar, borderRadius: "2px" } : {}),
                }
              : undefined;
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: run order is the identity within a line
            <span key={index} style={style}>
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

const gutterTint: Record<DiffLine["type"], string> = {
  add: "bg-[var(--diff-add-gutter)]",
  del: "bg-[var(--diff-del-gutter)]",
  context: "",
};

function Gutter({ children, type }: { children: ReactNode; type: DiffLine["type"] }) {
  return (
    <span
      data-control-ui="code-diff"
      data-slot="gutter"
      aria-hidden="true"
      className={cn(
        "shrink-0 select-none px-2 text-right tabular-nums text-[var(--diff-context-fg)] opacity-70",
        gutterTint[type],
        skinSlot("code-diff", "gutter", {}),
      )}
      style={{ minWidth: "2.75rem" }}
    >
      {children}
    </span>
  );
}

function Marker({ type, indicators }: { type: DiffLine["type"]; indicators: DiffIndicators }) {
  if (indicators !== "classic") return null;
  let color = "text-transparent";
  if (type === "add") color = "text-[var(--diff-add-fg)]";
  else if (type === "del") color = "text-[var(--diff-del-fg)]";
  return (
    <span aria-hidden="true" className={cn("shrink-0 select-none pl-1 pr-1 tabular-nums", color)}>
      {markerFor[type] || " "}
    </span>
  );
}

function barClass(type: DiffLine["type"], indicators: DiffIndicators): string {
  if (indicators !== "bars" || type === "context") return "";
  return type === "add" ? "border-l-2 border-[var(--diff-add-fg)]" : "border-l-2 border-[var(--diff-del-fg)]";
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
      data-slot="line"
      data-line-type={line.type}
      aria-hidden="true"
      className={cn(
        "flex w-full",
        lineTint[line.type],
        barClass(line.type, indicators),
        skinSlot("code-diff", "line", { lineType: line.type }),
      )}
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
        aria-hidden="true"
        className={cn("flex min-w-0 flex-1 bg-[var(--diff-gutter-bg)]", side === "left" && "border-r border-border/60")}
      />
    );
  return (
    <div
      data-control-ui="code-diff"
      data-slot="line"
      data-line-type={line.type}
      aria-hidden="true"
      className={cn(
        "flex min-w-0 flex-1",
        lineTint[line.type],
        barClass(line.type, indicators),
        side === "left" && "border-r border-border/60",
        skinSlot("code-diff", "line", { lineType: line.type }),
      )}
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
    <span
      data-control-ui="code-diff"
      data-slot="stat"
      className={cn("flex items-center gap-1.5 text-micro tabular-nums", skinSlot("code-diff", "stat", {}))}
    >
      <span className="text-[var(--diff-add-fg)]">+{additions}</span>
      <span className="text-[var(--diff-del-fg)]">−{deletions}</span>
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

  const gridClassName = cn(
    "font-mono text-label leading-5 text-[color:var(--code-foreground)]",
    overflow === "scroll" ? "w-max min-w-full" : "w-full",
  );

  function renderRow(row: VisualRow): ReactNode {
    if (row.kind === "separator") {
      return (
        <div
          data-control-ui="code-diff"
          data-slot="expander"
          className={cn(
            "flex items-center gap-2 bg-[var(--diff-gutter-bg)] px-3 py-1 text-micro text-muted-foreground",
            skinSlot("code-diff", "expander", {}),
          )}
        >
          {row.canExpand ? (
            <button
              type="button"
              data-control-ui="code-diff"
              data-slot="expand-button"
              data-control="true"
              onClick={() => expandGap(row.gapIndex)}
              className="cursor-pointer rounded-control px-1.5 py-0.5 text-muted-foreground outline-none hover:bg-foreground/8 hover:text-foreground focus-visible:ring-2 focus-visible:ring-foreground/20"
              aria-label="Expand hidden lines"
            >
              ⋯
            </button>
          ) : (
            <span aria-hidden="true" className="px-1.5">
              ⋯
            </span>
          )}
          <span className="truncate font-mono">{row.label}</span>
        </div>
      );
    }
    if (row.kind === "unified") {
      return <UnifiedRow line={row.line} tokens={lineTokens(row.line, tokens)} indicators={diffIndicators} overflow={overflow} />;
    }
    return (
      <div data-control-ui="code-diff" data-slot="row" className={cn("flex w-full", skinSlot("code-diff", "row", {}))}>
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
    <section data-control-ui="code-diff" data-slot="file" data-file-name={file.name}>
      {showFileHeader ? (
        <div
          data-control-ui="code-diff"
          data-slot="file-header"
          className="flex min-h-9 items-center justify-between gap-3 border-b bg-[var(--diff-gutter-bg)] px-3 py-1.5"
        >
          <span className="min-w-0 truncate font-mono text-label text-muted-foreground">{fileTitle(file)}</span>
          <DiffStats additions={file.additions} deletions={file.deletions} />
        </div>
      ) : null}
      <pre data-control-ui="code-diff" data-slot="accessible-source" className="sr-only">
        <code>{accessibleDiffText(file, rows)}</code>
      </pre>
      <ScrollArea
        maxHeight={maxHeight}
        viewportClassName={skinSlot("code-diff", "body", {})}
        viewportProps={{ "data-control-ui": "code-diff", "data-slot": "body" }}
        viewportRef={scrollRef}
      >
        {shouldVirtualize ? (
          <div className={gridClassName} style={{ position: "relative", height: `${virtualizer.getTotalSize()}px` }}>
            {virtualizer.getVirtualItems().map((item) => (
              <div
                key={rows[item.index].id}
                ref={virtualizer.measureElement}
                data-index={item.index}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${item.start}px)` }}
              >
                {renderRow(rows[item.index])}
              </div>
            ))}
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
  ...props
}: CodeDiffProps) {
  const options = { name, lang, lineDiffType, maxLineDiffLength };
  const parsedFiles =
    patch === undefined ? [buildDiffFromFiles(oldText ?? "", newText ?? "", options)] : buildDiffFromPatch(patch, options);
  const files: DiffFile[] = parsedFiles.length > 0 ? parsedFiles : [emptyFile(name)];
  const additions = files.reduce((total, file) => total + file.additions, 0);
  const deletions = files.reduce((total, file) => total + file.deletions, 0);
  const copyValue = patch ?? newText ?? "";

  return (
    <figure
      data-control-ui="code-diff"
      data-slot="root"
      data-surface="panel"
      data-diff-style={diffStyle}
      data-file-count={files.length}
      data-header={header ? "true" : undefined}
      className={cn(
        "my-4 overflow-hidden rounded-panel bg-muted shadow-sm ring-1 ring-inset ring-border",
        !header && "relative pt-10",
        skinSlot("code-diff", "root", { diffStyle }),
        className,
      )}
      {...props}
    >
      {header ? (
        <figcaption
          data-control-ui="code-diff"
          data-slot="header"
          className={cn("flex min-h-10 items-center justify-between gap-3 border-b px-3 py-1.5", skinSlot("code-diff", "header", {}))}
        >
          <span
            data-control-ui="code-diff"
            data-slot="title"
            className={cn("min-w-0 truncate font-mono text-label text-muted-foreground", skinSlot("code-diff", "title", {}))}
          >
            {files.length === 1 ? fileTitle(files[0]) : `${files.length} files`}
          </span>
          <div
            data-control-ui="code-diff"
            data-slot="actions"
            className={cn("flex shrink-0 items-center gap-2", skinSlot("code-diff", "actions", {}))}
          >
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

export type CodeDiffCopyProps = Omit<ComponentProps<typeof Button>, "children" | "onClick"> & {
  value: string;
  children?: ReactNode;
  copiedLabel?: ReactNode;
};

// Same as CodeCopy: the library Button (quiet variant) so the diff header's copy matches every
// other control instead of re-implementing the ghost chrome by hand.
export function CodeDiffCopy({ value, copiedLabel = "Copied", children = "Copy", ...props }: CodeDiffCopyProps) {
  const { isCopied, handleCopy } = useCopyToClipboard({ text: value });
  return (
    <Button type="button" variant="quiet" size="xs" aria-live="polite" {...props} onClick={handleCopy}>
      {isCopied ? copiedLabel : children}
    </Button>
  );
}

function emptyFile(name: string | undefined): DiffFile {
  return { name: name ?? "file", type: "change", hunks: [], oldLines: [], newLines: [], isPartial: true, additions: 0, deletions: 0 };
}
