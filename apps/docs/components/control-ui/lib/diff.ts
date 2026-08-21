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

export type BuildDiffOptions = {
  name?: string;
  lang?: string;
  // unchanged lines kept around each change
  context?: number;
  lineDiffType?: LineDiffType;
  // skips intra-line diffing past old.length + new.length; 0 disables guard
  maxLineDiffLength?: number;
};

const DEFAULT_CONTEXT = 3;
const DEFAULT_MAX_LINE_DIFF_LENGTH = 2000;

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
  for (const change of changes) {
    if (change.value.length === 0) continue;
    if (change.added) {
      newSegments.push({ text: change.value, emphasis: true });
    } else if (change.removed) {
      oldSegments.push({ text: change.value, emphasis: true });
    } else {
      oldSegments.push({ text: change.value, emphasis: false });
      newSegments.push({ text: change.value, emphasis: false });
    }
  }
  return [oldSegments, newSegments];
}

// pairs each maximal [del…][add…] block across boundary
function attachWordDiff(lines: DiffLine[], kind: LineDiffType, maxLength: number): void {
  if (kind === "none") return;
  let index = 0;
  while (index < lines.length) {
    if (lines[index].type !== "del") {
      index += 1;
      continue;
    }
    let delEnd = index;
    while (delEnd < lines.length && lines[delEnd].type === "del") delEnd += 1;
    let addEnd = delEnd;
    while (addEnd < lines.length && lines[addEnd].type === "add") addEnd += 1;

    const pairCount = Math.min(delEnd - index, addEnd - delEnd);
    for (let pair = 0; pair < pairCount; pair += 1) {
      const delLine = lines[index + pair];
      const addLine = lines[delEnd + pair];
      const [oldSegments, newSegments] = computeWordDiff(delLine.text, addLine.text, kind, maxLength);
      delLine.segments = oldSegments;
      addLine.segments = newSegments;
    }
    index = addEnd;
  }
}

// patch prefixes: ' ' context, '+' add, '-' del, '\' no-newline marker
function hunkLines(hunk: StructuredPatchHunk): DiffLine[] {
  const lines: DiffLine[] = [];
  let oldNo = hunk.oldStart;
  let newNo = hunk.newStart;
  for (const raw of hunk.lines) {
    if (raw.length === 0) continue;
    const marker = raw[0];
    const text = raw.slice(1);
    if (marker === "\\") continue; // "\ No newline at end of file"
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

// keeps both full line arrays, so result is never partial and renderer can expand hidden context
export function buildDiffFromFiles(oldText: string, newText: string, options: BuildDiffOptions = {}): DiffFile {
  const name = options.name ?? "file";
  const context = options.context ?? DEFAULT_CONTEXT;
  const patch = structuredPatch(name, name, oldText, newText, "", "", { context });
  return toDiffFile(patch, options, splitLines(oldText), splitLines(newText), false);
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

function emptyStructuredPatch(): StructuredPatch {
  return { oldFileName: undefined, newFileName: undefined, oldHeader: undefined, newHeader: undefined, hunks: [] };
}

// git appends tab-separated timestamp after path
function patchFileName(rest: string): string {
  return rest.split("\t")[0].trim();
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
};

function ensureCurrentFile(state: LenientPatchState): StructuredPatch {
  state.current ??= emptyStructuredPatch();
  return state.current;
}

function closeLenientHunk(state: LenientPatchState): void {
  if (state.current && state.hunk) {
    reconcileHunkCounts(state.hunk);
    state.current.hunks.push(state.hunk);
  }
  state.hunk = undefined;
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

function consumeLenientPatchLine(state: LenientPatchState, line: string): void {
  if (line.startsWith("diff --git")) {
    closeLenientFile(state);
    state.current = emptyStructuredPatch();
    return;
  }
  if (line.startsWith("--- ")) {
    if (state.current) closeLenientHunk(state);
    ensureCurrentFile(state).oldFileName = patchFileName(line.slice(4));
    return;
  }
  if (line.startsWith("+++ ")) {
    ensureCurrentFile(state).newFileName = patchFileName(line.slice(4));
    return;
  }

  const header = lenientHunkHeader(line);
  if (header) {
    closeLenientHunk(state);
    ensureCurrentFile(state);
    state.hunk = { oldStart: header.oldStart, oldLines: 0, newStart: header.newStart, newLines: 0, lines: [] };
    hunkRawHeader.set(state.hunk, header.scope);
    return;
  }

  if (!state.hunk) return;
  if (isHunkBodyLine(line)) {
    state.hunk.lines.push(line);
    return;
  }
  closeLenientHunk(state);
}

// trusts body over header, so miscounted @@ lines still render; unknown or blank line closes current hunk
function parsePatchLenient(patchText: string): StructuredPatch[] {
  const state: LenientPatchState = { files: [] };

  for (const line of patchText.split("\n")) {
    consumeLenientPatchLine(state, line);
  }
  closeLenientFile(state);
  return state.files;
}

// matched positionally — jsdiff exposes no handle back to raw line
function indexRawHunkHeaders(patchText: string, patches: StructuredPatch[]): void {
  const scopes: string[] = [];
  for (const line of patchText.split("\n")) {
    const match = line.match(/^@@[^@]*@@(.*)$/);
    if (match) scopes.push(match[1]);
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
