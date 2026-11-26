import type { StructuredPatch, StructuredPatchHunk } from "diff";
import { diffChars, diffWordsWithSpace, parsePatch, structuredPatch } from "diff";

export type CodeDiffLineType = "add" | "del" | "context";

export type CodeLineType = CodeDiffLineType;
export type LineDiffType = "word" | "char" | "none";
export type DiffFileType = "change" | "new" | "deleted" | "rename";

// one run of same-emphasis text inside changed line
export type DiffSegment = { text: string; emphasis: boolean };

export type DiffLine = {
  type: CodeLineType;
  // 1-based, only on side line exists on
  oldNo?: number;
  newNo?: number;
  text: string;
  // only on change lines paired across del/add boundary
  segments?: DiffSegment[];
  // this side ends on this line without the final newline the other side has
  noNewline?: boolean;
};

export type DiffHunk = {
  // scope trailing the @@ marker, when patch carries one
  header?: string;
  oldStart: number;
  oldCount: number;
  newStart: number;
  newCount: number;
  lines: DiffLine[];
  // unchanged lines hidden immediately before this hunk — drives expand affordance
  collapsedBefore: number;
};

export type DiffFile = {
  name: string;
  oldName?: string;
  type: DiffFileType;
  lang?: string;
  hunks: DiffHunk[];
  // indexed 1:1 with line numbers so expand-context is range read; empty for isPartial files
  oldLines: string[];
  newLines: string[];
  isPartial: boolean;
  additions: number;
  deletions: number;
};

export type DiffSide = "old" | "new";
// 1-based line number on that side; an unchanged line answers to either side's number
export type DiffLinePoint = { side: DiffSide; line: number };
// inclusive, in unified display order, hidden unchanged lines included
export type DiffLineRange = { from: DiffLinePoint; to: DiffLinePoint };
export type CodeDiffAnnotation<T> = { at: DiffLinePoint; key: string; data: T };

export type BuildDiffOptions = {
  name?: string;
  lang?: string;
  // unchanged lines kept around each change
  context?: number;
  lineDiffType?: LineDiffType;
  // skips intra-line diffing past old.length + new.length; 0 disables guard
  maxLineDiffLength?: number;
  // past this edit distance the whole change renders as one replace block; 0 disables guard
  maxEditLength?: number;
  // lines differing only in leading or trailing whitespace read as unchanged; text pairs only
  ignoreWhitespace?: boolean;
};

const DEFAULT_CONTEXT = 3;
const DEFAULT_MAX_LINE_DIFF_LENGTH = 2000;
// line diff cost grows with the square of the edit distance
const DEFAULT_MAX_EDIT_LENGTH = 2000;

function splitLines(text: string): string[] {
  // trailing newline yields phantom final "" — drop it so counts match file
  if (text.length === 0) return [];
  const lines = text.split("\n");
  if (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

// /dev/null and bare names pass through untouched
function stripGitPrefix(name: string | undefined): string | undefined {
  if (name === undefined) return undefined;
  if (name === "/dev/null") return name;
  return name.replace(/^[ab]\//, "");
}

// [undefined, undefined] when diff is disabled or pair is too long
// below this share of unchanged text a pair is a rewrite: per-word chips would flag nearly every word
const MIN_SHARED_FOR_EMPHASIS = 0.4;

function visibleLength(text: string): number {
  return text.replace(/\s/g, "").length;
}

function pushSegment(segments: DiffSegment[], segment: DiffSegment): void {
  const last = segments.at(-1);
  if (last?.emphasis === segment.emphasis) {
    last.text += segment.text;
    return;
  }
  segments.push({ ...segment });
}

function joinChangedRuns(segments: DiffSegment[]): DiffSegment[] {
  const joined: DiffSegment[] = [];
  segments.forEach((segment, index) => {
    const bridges = !segment.emphasis && segment.text.trim() === "" && segments[index - 1]?.emphasis && segments[index + 1]?.emphasis;
    pushSegment(joined, bridges ? { text: segment.text, emphasis: true } : segment);
  });
  return joined;
}

export function computeWordDiff(
  oldText: string,
  newText: string,
  kind: LineDiffType,
  maxLength: number,
): [DiffSegment[] | undefined, DiffSegment[] | undefined] {
  if (kind === "none") return [undefined, undefined];
  if (maxLength > 0 && oldText.length + newText.length > maxLength) return [undefined, undefined];

  const changes = kind === "char" ? diffChars(oldText, newText) : diffWordsWithSpace(oldText, newText);

  const oldSegments: DiffSegment[] = [];
  const newSegments: DiffSegment[] = [];
  let shared = 0;
  for (const change of changes) {
    if (change.value.length === 0) continue;
    if (change.added) {
      pushSegment(newSegments, { text: change.value, emphasis: true });
    } else if (change.removed) {
      pushSegment(oldSegments, { text: change.value, emphasis: true });
    } else {
      shared += visibleLength(change.value);
      pushSegment(oldSegments, { text: change.value, emphasis: false });
      pushSegment(newSegments, { text: change.value, emphasis: false });
    }
  }
  const longest = Math.max(visibleLength(oldText), visibleLength(newText));
  if (longest > 0 && shared / longest < MIN_SHARED_FOR_EMPHASIS) return [undefined, undefined];
  return [joinChangedRuns(oldSegments), joinChangedRuns(newSegments)];
}

export function diffRunEnd(lines: readonly DiffLine[], start: number, type: DiffLine["type"]): number {
  let end = start;
  while (lines[end]?.type === type) end += 1;
  return end;
}

// pairs each maximal [del…][add…] block across boundary
function attachWordDiff(lines: DiffLine[], kind: LineDiffType, maxLength: number): void {
  if (kind === "none") return;
  let index = 0;
  while (index < lines.length) {
    if (lines[index]?.type !== "del") {
      index += 1;
      continue;
    }
    const delEnd = diffRunEnd(lines, index, "del");
    const addEnd = diffRunEnd(lines, delEnd, "add");
    const pairCount = Math.min(delEnd - index, addEnd - delEnd);
    for (let pair = 0; pair < pairCount; pair += 1) {
      const delLine = lines[index + pair];
      const addLine = lines[delEnd + pair];
      if (!delLine || !addLine) continue;
      const [oldSegments, newSegments] = computeWordDiff(delLine.text, addLine.text, kind, maxLength);
      delLine.segments = oldSegments;
      addLine.segments = newSegments;
    }
    index = addEnd;
  }
}

// patch prefixes: ' ' context, '+' add, '-' del, '\' no-newline marker; an empty line is blank context with its space stripped
function hunkLines(hunk: StructuredPatchHunk): DiffLine[] {
  const lines: DiffLine[] = [];
  const unterminated: DiffLine[] = [];
  let oldNo = hunk.oldStart;
  let newNo = hunk.newStart;
  for (const raw of hunk.lines) {
    const marker = raw[0];
    const text = raw.slice(1);
    if (marker === "\\") {
      // "\ No newline at end of file" describes the line above it
      const previous = lines[lines.length - 1];
      if (previous) unterminated.push(previous);
      continue;
    }
    if (marker === "-") {
      lines.push({ type: "del", oldNo, text });
      oldNo += 1;
    } else if (marker === "+") {
      lines.push({ type: "add", newNo, text });
      newNo += 1;
    } else {
      lines.push({ type: "context", oldNo, newNo, text });
      oldNo += 1;
      newNo += 1;
    }
  }
  // a final newline missing on both sides is not a change, so only a one-sided gap is flagged
  const oldSideUnterminated = unterminated.some((line) => line.type !== "add");
  const newSideUnterminated = unterminated.some((line) => line.type !== "del");
  if (oldSideUnterminated !== newSideUnterminated) for (const line of unterminated) line.noNewline = true;
  return lines;
}

// git puts its scope hint after second "@@"
function hunkHeaderScope(hunk: StructuredPatchHunk): string | undefined {
  const raw = hunkRawHeader.get(hunk);
  if (!raw) return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

// jsdiff drops the @@-line scope, so it is recovered from raw patch
const hunkRawHeader = new WeakMap<StructuredPatchHunk, string>();

function toDiffFile(
  patch: StructuredPatch,
  options: BuildDiffOptions,
  oldLines: string[],
  newLines: string[],
  isPartial: boolean,
): DiffFile {
  const kind = options.lineDiffType ?? "word";
  const maxLength = options.maxLineDiffLength ?? DEFAULT_MAX_LINE_DIFF_LENGTH;
  const summary = summarizeHunks(patch.hunks, kind, maxLength);
  const oldName = stripGitPrefix(patch.oldFileName);
  const newName = stripGitPrefix(patch.newFileName);
  const name = resolveDiffFileName(options.name, oldName, newName);
  const type = resolveDiffFileType(oldName, newName, oldLines, newLines, isPartial);

  return {
    name,
    oldName: type === "rename" ? oldName : undefined,
    type,
    lang: options.lang,
    hunks: summary.hunks,
    oldLines,
    newLines,
    isPartial,
    additions: summary.additions,
    deletions: summary.deletions,
  };
}

function countLineChanges(lines: DiffLine[]): { additions: number; deletions: number } {
  let additions = 0;
  let deletions = 0;
  for (const line of lines) {
    if (line.type === "add") additions += 1;
    if (line.type === "del") deletions += 1;
  }
  return { additions, deletions };
}

function summarizeHunks(
  rawHunks: StructuredPatchHunk[],
  kind: LineDiffType,
  maxLength: number,
): { hunks: DiffHunk[]; additions: number; deletions: number } {
  const hunks: DiffHunk[] = [];
  let additions = 0;
  let deletions = 0;
  let previousOldEnd = 0;

  for (const raw of rawHunks) {
    const lines = hunkLines(raw);
    attachWordDiff(lines, kind, maxLength);
    const changes = countLineChanges(lines);
    additions += changes.additions;
    deletions += changes.deletions;
    hunks.push({
      header: hunkHeaderScope(raw),
      oldStart: raw.oldStart,
      oldCount: raw.oldLines,
      newStart: raw.newStart,
      newCount: raw.newLines,
      lines,
      collapsedBefore: Math.max(0, raw.oldStart - 1 - previousOldEnd),
    });
    previousOldEnd = raw.oldStart - 1 + raw.oldLines;
  }

  return { hunks, additions, deletions };
}

function resolveDiffFileName(explicitName: string | undefined, oldName: string | undefined, newName: string | undefined): string {
  if (explicitName !== undefined) return explicitName;
  if (newName && newName !== "/dev/null") return newName;
  return oldName ?? "file";
}

function resolveDiffFileType(
  oldName: string | undefined,
  newName: string | undefined,
  oldLines: string[],
  newLines: string[],
  isPartial: boolean,
): DiffFileType {
  if (oldName === "/dev/null" || (!isPartial && oldLines.length === 0 && newLines.length > 0)) return "new";
  if (newName === "/dev/null" || (!isPartial && newLines.length === 0 && oldLines.length > 0)) return "deleted";
  if (oldName !== undefined && newName !== undefined && oldName !== newName) return "rename";
  return "change";
}

// one replace block between the shared leading and trailing lines
function replacementPatch(name: string, oldLines: string[], newLines: string[], context: number): StructuredPatch {
  const shared = Math.min(oldLines.length, newLines.length);
  let prefix = 0;
  while (prefix < shared && oldLines[prefix] === newLines[prefix]) prefix += 1;
  let suffix = 0;
  while (suffix < shared - prefix && oldLines[oldLines.length - 1 - suffix] === newLines[newLines.length - 1 - suffix]) suffix += 1;

  const lead = Math.min(context, prefix);
  const trail = Math.min(context, suffix);
  const oldEnd = oldLines.length - suffix;
  const newEnd = newLines.length - suffix;
  const lines: string[] = [];
  for (let index = prefix - lead; index < prefix; index += 1) lines.push(` ${oldLines[index]}`);
  for (let index = prefix; index < oldEnd; index += 1) lines.push(`-${oldLines[index]}`);
  for (let index = prefix; index < newEnd; index += 1) lines.push(`+${newLines[index]}`);
  for (let index = oldEnd; index < oldEnd + trail; index += 1) lines.push(` ${oldLines[index]}`);

  const start = prefix - lead + 1;
  return {
    oldFileName: name,
    newFileName: name,
    oldHeader: "",
    newHeader: "",
    hunks: [
      { oldStart: start, oldLines: oldEnd - prefix + lead + trail, newStart: start, newLines: newEnd - prefix + lead + trail, lines },
    ],
  };
}

// keeps both full line arrays, so result is never partial and renderer can expand hidden context
export function buildDiffFromFiles(oldText: string, newText: string, options: BuildDiffOptions = {}): DiffFile {
  const name = options.name ?? "file";
  const context = options.context ?? DEFAULT_CONTEXT;
  const oldLines = splitLines(oldText);
  const newLines = splitLines(newText);
  const maxEditLength = options.maxEditLength ?? DEFAULT_MAX_EDIT_LENGTH;
  const patch = structuredPatch(name, name, oldText, newText, "", "", {
    context,
    maxEditLength: maxEditLength > 0 ? maxEditLength : Number.POSITIVE_INFINITY,
    ignoreWhitespace: options.ignoreWhitespace ?? false,
  });
  if (patch) return toDiffFile(patch, options, oldLines, newLines, false);
  return toDiffFile(replacementPatch(name, oldLines, newLines, context), { ...options, lineDiffType: "none" }, oldLines, newLines, false);
}

// one DiffFile per patch section; all are isPartial, so renderer disables expand-context
export function buildDiffFromPatch(patchText: string, options: BuildDiffOptions = {}): DiffFile[] {
  let patches: StructuredPatch[];
  try {
    patches = parsePatch(patchText);
    indexRawHunkHeaders(patchText, patches);
  } catch {
    // jsdiff throws when @@-header counts disagree with body — agent and hand-authored patches get this wrong often
    patches = parsePatchLenient(patchText);
  }
  return patches.map((patch) => toDiffFile(patch, options, [], [], true));
}

// unchanged lines a text pair hides before hunk `gapIndex`; the index past the last hunk is the file's tail
export function hiddenContext(file: DiffFile, gapIndex: number): DiffLine[] {
  if (file.isPartial) return [];
  const hunk = file.hunks[gapIndex];
  const last = file.hunks.at(-1);
  let firstOld: number;
  let endOld: number;
  let offset: number;
  if (hunk) {
    firstOld = hunk.oldStart - hunk.collapsedBefore;
    endOld = hunk.oldStart;
    offset = hunk.newStart - hunk.oldStart;
  } else if (gapIndex === file.hunks.length && last) {
    firstOld = last.oldStart + last.oldCount;
    endOld = file.oldLines.length + 1;
    offset = last.newStart + last.newCount - firstOld;
  } else {
    return [];
  }
  const lines: DiffLine[] = [];
  for (let oldNo = firstOld; oldNo < endOld; oldNo += 1) {
    const newNo = oldNo + offset;
    // ignoring whitespace keeps the new side's indentation, as jsdiff does for its own context lines
    lines.push({ type: "context", oldNo, newNo, text: file.newLines[newNo - 1] ?? file.oldLines[oldNo - 1] ?? "" });
  }
  return lines;
}

type DiffLineIndex = { lines: DiffLine[]; positions: Map<string, number> };

const lineIndexes = new WeakMap<DiffFile, DiffLineIndex>();

function pointKey(side: DiffSide, line: number): string {
  return `${side}:${line}`;
}

// every line of the file in unified display order, hidden context included
function lineIndex(file: DiffFile): DiffLineIndex {
  const cached = lineIndexes.get(file);
  if (cached) return cached;
  const index: DiffLineIndex = { lines: [], positions: new Map() };
  const add = (line: DiffLine) => {
    const position = index.lines.push(line) - 1;
    if (line.type !== "add" && line.oldNo !== undefined) index.positions.set(pointKey("old", line.oldNo), position);
    if (line.type !== "del" && line.newNo !== undefined) index.positions.set(pointKey("new", line.newNo), position);
  };
  for (const [gapIndex, hunk] of file.hunks.entries()) {
    for (const line of hiddenContext(file, gapIndex)) add(line);
    for (const line of hunk.lines) add(line);
  }
  for (const line of hiddenContext(file, file.hunks.length)) add(line);
  lineIndexes.set(file, index);
  return index;
}

// display position of a line, or -1 when the file has no such line on that side
export function diffLinePosition(file: DiffFile, point: DiffLinePoint): number {
  return lineIndex(file).positions.get(pointKey(point.side, point.line)) ?? -1;
}

export function linesInRange(file: DiffFile, range: DiffLineRange): DiffLine[] {
  const from = diffLinePosition(file, range.from);
  const to = diffLinePosition(file, range.to);
  if (from < 0 || to < 0) return [];
  return lineIndex(file).lines.slice(Math.min(from, to), Math.max(from, to) + 1);
}

function emptyStructuredPatch(): StructuredPatch {
  return { oldFileName: undefined, newFileName: undefined, oldHeader: undefined, newHeader: undefined, hunks: [] };
}

// git appends tab-separated timestamp after path
function patchFileName(rest: string): string {
  return rest.split("\t", 1)[0]?.trim() ?? "";
}

// header numbers are not trusted — counted from body instead
function reconcileHunkCounts(hunk: StructuredPatchHunk): void {
  let oldCount = 0;
  let newCount = 0;
  for (const line of hunk.lines) {
    const marker = line[0];
    if (marker === "+") newCount += 1;
    else if (marker === "-") oldCount += 1;
    else if (marker === "\\")
      continue; // "\ No newline at end of file"
    else {
      oldCount += 1;
      newCount += 1;
    }
  }
  hunk.oldLines = oldCount;
  hunk.newLines = newCount;
}

type LenientPatchState = {
  files: StructuredPatch[];
  current?: StructuredPatch;
  hunk?: StructuredPatchHunk;
  // blank lines seen inside the open hunk, kept only if its body continues
  pendingBlankLines: number;
};

function ensureCurrentFile(state: LenientPatchState): StructuredPatch {
  state.current ??= emptyStructuredPatch();
  return state.current;
}

function closeLenientHunk(state: LenientPatchState): void {
  if (state.current && state.hunk) {
    reconcileHunkCounts(state.hunk);
    // the format writes an empty range one line early; the strict parser undoes that too
    if (state.hunk.oldLines === 0) state.hunk.oldStart += 1;
    if (state.hunk.newLines === 0) state.hunk.newStart += 1;
    state.current.hunks.push(state.hunk);
  }
  state.hunk = undefined;
  state.pendingBlankLines = 0;
}

function closeLenientFile(state: LenientPatchState): void {
  closeLenientHunk(state);
  if (state.current) state.files.push(state.current);
  state.current = undefined;
}

function lenientHunkHeader(line: string): { oldStart: number; newStart: number; scope: string } | undefined {
  const match = line.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@(.*)$/);
  if (!match) return undefined;
  return { oldStart: Number(match[1]), newStart: Number(match[2]), scope: match[3] ?? "" };
}

function isHunkBodyLine(line: string): boolean {
  const marker = line[0];
  return marker === " " || marker === "+" || marker === "-" || marker === "\\";
}

function consumeLenientFileHeader(state: LenientPatchState, line: string, next: string | undefined): boolean {
  if (line.startsWith("diff --git")) {
    closeLenientFile(state);
    state.current = emptyStructuredPatch();
    return true;
  }
  // inside a hunk "--- x" is a deleted "-- x" line unless its "+++" header follows, and "+++ x" is always an added "++ x" line
  if (line.startsWith("--- ") && (!state.hunk || next?.startsWith("+++ "))) {
    // plain unified patches carry no "diff --git" line, so a second file starts here
    if (state.current && (state.hunk || state.current.hunks.length > 0)) closeLenientFile(state);
    ensureCurrentFile(state).oldFileName = patchFileName(line.slice(4));
    return true;
  }
  if (line.startsWith("+++ ") && !state.hunk) {
    ensureCurrentFile(state).newFileName = patchFileName(line.slice(4));
    return true;
  }
  return false;
}

function consumeLenientPatchLine(state: LenientPatchState, line: string, next: string | undefined): void {
  if (consumeLenientFileHeader(state, line, next)) return;

  const header = lenientHunkHeader(line);
  if (header) {
    closeLenientHunk(state);
    ensureCurrentFile(state);
    state.hunk = { oldStart: header.oldStart, oldLines: 0, newStart: header.newStart, newLines: 0, lines: [] };
    hunkRawHeader.set(state.hunk, header.scope);
    return;
  }

  if (!state.hunk) return;
  if (line === "" || line === "\r") {
    state.pendingBlankLines += 1;
    return;
  }
  if (isHunkBodyLine(line)) {
    for (; state.pendingBlankLines > 0; state.pendingBlankLines -= 1) state.hunk.lines.push("");
    state.hunk.lines.push(line);
    return;
  }
  closeLenientHunk(state);
}

// trusts body over header, so miscounted @@ lines still render; unknown line closes current hunk, blank line stays context while body continues
function parsePatchLenient(patchText: string): StructuredPatch[] {
  const state: LenientPatchState = { files: [], pendingBlankLines: 0 };

  const lines = patchText.split("\n");
  for (const [index, line] of lines.entries()) {
    consumeLenientPatchLine(state, line, lines[index + 1]);
  }
  closeLenientFile(state);
  return state.files;
}

// matched positionally — jsdiff exposes no handle back to raw line
function indexRawHunkHeaders(patchText: string, patches: StructuredPatch[]): void {
  const scopes: string[] = [];
  for (const line of patchText.split("\n")) {
    const match = line.match(/^@@[^@]*@@(.*)$/);
    const scope = match?.[1];
    if (scope !== undefined) scopes.push(scope);
  }
  let hunkIndex = 0;
  for (const patch of patches) {
    for (const hunk of patch.hunks) {
      const scope = scopes[hunkIndex];
      if (scope !== undefined) hunkRawHeader.set(hunk, scope);
      hunkIndex += 1;
    }
  }
}
