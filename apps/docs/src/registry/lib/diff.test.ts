import { describe, expect, test } from "bun:test";
import { buildDiffFromFiles, buildDiffFromPatch, computeWordDiff, type DiffLine } from "./diff";

const OLD = `line one
line two
line three
line four
line five`;

const NEW = `line one
line two changed
line three
added line
line four
line five`;

function typesOf(lines: DiffLine[]): string {
  return lines.map((line) => line.type[0]).join("");
}

describe("buildDiffFromFiles — before/after pair", () => {
  const file = buildDiffFromFiles(OLD, NEW, { name: "demo.txt", lang: "text" });

  test("is a full (non-partial) change with the whole text retained by index", () => {
    expect(file.isPartial).toBe(false);
    expect(file.type).toBe("change");
    expect(file.oldLines).toHaveLength(5);
    expect(file.newLines).toHaveLength(6);
    expect(file.name).toBe("demo.txt");
  });

  test("counts one modified line (del+add) and one pure addition", () => {
    expect(file.additions).toBe(2); // "line two changed" + "added line"
    expect(file.deletions).toBe(1); // "line two"
  });

  test("line numbers are 1-based and side-correct", () => {
    const allLines = file.hunks.flatMap((hunk) => hunk.lines);
    const del = allLines.find((line) => line.type === "del");
    const pureAdd = allLines.find((line) => line.type === "add" && line.text === "added line");
    expect(del?.oldNo).toBe(2);
    expect(del?.newNo).toBeUndefined();
    expect(pureAdd?.newNo).toBe(4);
    expect(pureAdd?.oldNo).toBeUndefined();
  });

  test("paired change lines carry intra-line word segments; pure adds do not", () => {
    const allLines = file.hunks.flatMap((hunk) => hunk.lines);
    const modifiedAdd = allLines.find((line) => line.type === "add" && line.text === "line two changed");
    expect(modifiedAdd?.segments).toBeDefined();
    // "changed" is the emphasized (added) run; the shared "line two " prefix is not emphasized.
    expect(modifiedAdd?.segments?.some((segment) => segment.emphasis && segment.text.includes("changed"))).toBe(true);
    expect(modifiedAdd?.segments?.some((segment) => !segment.emphasis)).toBe(true);

    const pureAdd = allLines.find((line) => line.type === "add" && line.text === "added line");
    expect(pureAdd?.segments).toBeUndefined();
  });

  test("collapsedBefore reflects hidden leading context", () => {
    expect(file.hunks[0].collapsedBefore).toBe(0); // change starts at line 1's neighborhood
  });
});

describe("buildDiffFromFiles — new and deleted", () => {
  test("empty old → new file", () => {
    const file = buildDiffFromFiles("", "a\nb\n", { name: "x" });
    expect(file.type).toBe("new");
    expect(file.deletions).toBe(0);
    expect(file.additions).toBe(2);
  });

  test("empty new → deleted file", () => {
    const file = buildDiffFromFiles("a\nb\n", "", { name: "x" });
    expect(file.type).toBe("deleted");
    expect(file.additions).toBe(0);
    expect(file.deletions).toBe(2);
  });
});

describe("buildDiffFromPatch — unified/git patch string", () => {
  const patch = `diff --git a/src/hello.ts b/src/hello.ts
index 000..111 100644
--- a/src/hello.ts
+++ b/src/hello.ts
@@ -1,3 +1,3 @@ export function hello()
 const a = 1;
-const b = 2;
+const b = 3;
 const c = 4;
`;

  const files = buildDiffFromPatch(patch, { lang: "ts" });

  test("parses one partial file with stripped git path", () => {
    expect(files).toHaveLength(1);
    expect(files[0].isPartial).toBe(true);
    expect(files[0].name).toBe("src/hello.ts");
    expect(files[0].type).toBe("change");
  });

  test("hunk carries the @@-line scope hint", () => {
    expect(files[0].hunks[0].header).toBe("export function hello()");
  });

  test("unified line order and numbering are preserved", () => {
    const lines = files[0].hunks[0].lines;
    expect(typesOf(lines)).toBe("cdac"); // context, del, add, context
    expect(lines[0].oldNo).toBe(1);
    expect(lines[1].oldNo).toBe(2); // del
    expect(lines[2].newNo).toBe(2); // add
  });

  test("multi-file patch yields one DiffFile per section", () => {
    const twoFilePatch = `${patch}diff --git a/b.txt b/b.txt
--- a/b.txt
+++ b/b.txt
@@ -1 +1 @@
-old
+new
`;
    const many = buildDiffFromPatch(twoFilePatch);
    expect(many).toHaveLength(2);
    expect(many[1].name).toBe("b.txt");
    expect(many[1].hunks[0].header).toBeUndefined();
  });

  test("tolerates a hunk whose @@-header counts disagree with its body (lenient fallback)", () => {
    // jsdiff's strict parsePatch throws here (header claims 4/4, body is 3/3); lenient fallback must recover + recompute counts
    const miscounted = `--- a/src/utils.ts
+++ b/src/utils.ts
@@ -1,4 +1,4 @@ export function slugify()
 export function slugify(input) {
-  return input.toLowerCase();
+  return input.trim().toLowerCase();
 }
`;
    const recoveredFiles = buildDiffFromPatch(miscounted, { lang: "ts" });
    expect(recoveredFiles).toHaveLength(1);
    expect(recoveredFiles[0].name).toBe("src/utils.ts");
    expect(recoveredFiles[0].isPartial).toBe(true);
    expect(recoveredFiles[0].hunks[0].header).toBe("export function slugify()");
    expect(typesOf(recoveredFiles[0].hunks[0].lines)).toBe("cdac");
    expect(recoveredFiles[0].additions).toBe(1);
    expect(recoveredFiles[0].deletions).toBe(1);
  });
});

describe("computeWordDiff — perf guard and modes", () => {
  test("word mode splits shared vs changed runs on both sides", () => {
    const [oldSeg, newSeg] = computeWordDiff("the quick fox", "the slow fox", "word", 2000);
    expect(oldSeg?.some((segment) => segment.emphasis && segment.text.includes("quick"))).toBe(true);
    expect(newSeg?.some((segment) => segment.emphasis && segment.text.includes("slow"))).toBe(true);
    expect(oldSeg?.some((segment) => !segment.emphasis && segment.text.includes("fox"))).toBe(true);
  });

  test("none mode returns no segments", () => {
    expect(computeWordDiff("a", "b", "none", 2000)).toEqual([undefined, undefined]);
  });

  test("maxLength guard disables diffing on long pairs", () => {
    const long = "x".repeat(50);
    expect(computeWordDiff(long, `${long}y`, "word", 10)).toEqual([undefined, undefined]);
  });

  test("char mode works at character granularity", () => {
    const [, newSeg] = computeWordDiff("cat", "cart", "char", 2000);
    expect(newSeg?.some((segment) => segment.emphasis)).toBe(true);
  });
});
