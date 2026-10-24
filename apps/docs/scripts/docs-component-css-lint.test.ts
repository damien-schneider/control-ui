import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const repoRoot = path.join(import.meta.dir, "../../..");
const rule = path.join(repoRoot, "lint/no-docs-component-css.grit");
const biome = path.join(repoRoot, "node_modules/.bin/biome");

function flaggedLines(source: string) {
  const dir = mkdtempSync(path.join(tmpdir(), "cui-docs-css-"));
  try {
    writeFileSync(path.join(dir, "biome.json"), JSON.stringify({ plugins: [rule], linter: { rules: { recommended: false } } }));
    writeFileSync(path.join(dir, "sample.css"), source);
    const result = spawnSync(biome, ["lint", "--max-diagnostics=100", "sample.css"], { cwd: dir, encoding: "utf8" });
    const output = `${result.stdout}${result.stderr}`;
    return [...output.matchAll(/sample\.css:(\d+):\d+ plugin/g)].map((match) => Number(match[1]));
  } finally {
    rmSync(dir, { recursive: true });
  }
}

test("flags knob writes, knob reads, and declarations on component parts", () => {
  const source = [
    ":where([data-docs-shell]) {",
    "  --cui-sidebar-inset-radius: 1px;",
    "}",
    ":where([data-docs-content]) {",
    "  margin: var(--cui-sidebar-inset-inset);",
    "}",
    `[data-docs-content] :where([data-control-family="page-layout"][data-slot="aside"]) {`,
    "  padding-block: 3rem;",
    "}",
    "@media (width >= 64rem) {",
    `  [data-control-ui="button"] { color: red; }`,
    "}",
  ].join("\n");
  expect(flaggedLines(source)).toEqual([2, 5, 8, 11]);
});

test("leaves docs-owned styling and local custom properties alone", () => {
  const source = [
    ":where([data-docs-content]) {",
    "  margin: 0;",
    "  color: var(--primary);",
    "}",
    `[data-docs-layout="page"] :where([data-docs-sidebar-navigation]) {`,
    "  padding-block: 8px;",
    "}",
    `[data-control-family="sidebar"] {`,
    "  --docs-gap: 1rem;",
    "}",
    `[data-control-family="sidebar"][data-state="collapsed"] ~ [data-docs-inset] :where([data-docs-trigger]) {`,
    "  display: flex;",
    "}",
  ].join("\n");
  expect(flaggedLines(source)).toEqual([]);
});
