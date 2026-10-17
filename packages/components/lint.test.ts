import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const rule = path.join(import.meta.dir, "lint/no-raw-type-classes.grit");
const biome = path.join(import.meta.dir, "../../node_modules/.bin/biome");

function flaggedLines(source: string) {
  const dir = mkdtempSync(path.join(tmpdir(), "cui-lint-"));
  try {
    writeFileSync(path.join(dir, "biome.json"), JSON.stringify({ plugins: [rule], linter: { rules: { recommended: false } } }));
    writeFileSync(path.join(dir, "sample.tsx"), source);
    const result = spawnSync(biome, ["lint", "--max-diagnostics=100", "sample.tsx"], { cwd: dir, encoding: "utf8" });
    const output = `${result.stdout}${result.stderr}`;
    return [...output.matchAll(/sample\.tsx:(\d+):\d+ plugin/g)].map((match) => Number(match[1]));
  } finally {
    rmSync(dir, { recursive: true });
  }
}

test("flags type rungs and Tailwind font sizes in className, including inside a class merger", () => {
  const source = [
    `export const a = <p className="text-caption text-muted-foreground">x</p>;`,
    `export const b = <span className={cn("font-medium text-micro", "text-muted-foreground")}>x</span>;`,
    `export const c = <h2 className="text-heading-2">x</h2>;`,
    `export const d = <p className="text-body-lg">x</p>;`,
    `export const e = <p className="text-sm text-muted-foreground">x</p>;`,
    `export const f = <h3 className="text-2xl">x</h3>;`,
    `export const g = <span className="text-[13px]">x</span>;`,
    `export const h = <p className="md:text-lg hover:!text-sm">x</p>;`,
  ].join("\n");
  expect(flaggedLines(source)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
});

test("leaves layout classes, typed props, and look-alike utilities alone", () => {
  const source = [
    `export const a = <div className="flex gap-2 text-center text-balance">x</div>;`,
    `export const b = <Text size="micro" tone="muted" className="w-14 shrink-0">x</Text>;`,
    `export const c = <p className="text-bodyx text-labelled">x</p>;`,
    `export const d = <p className="text-[#fff] text-[var(--brand)]">x</p>;`,
    `export const e = <button className="[--cui-button-font-size:var(--text-micro)]">x</button>;`,
  ].join("\n");
  expect(flaggedLines(source)).toEqual([]);
});
