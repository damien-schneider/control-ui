import { afterAll, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const directory = mkdtempSync(path.join(tmpdir(), "control-ui-skin-validator-"));
afterAll(() => rmSync(directory, { recursive: true, force: true }));

function validate(css: string) {
  const file = path.join(directory, "skin.css");
  writeFileSync(file, css);
  return Bun.spawnSync(["bun", "scripts/validate-skins.ts", `--skin=${file}`], { cwd: process.cwd() });
}

describe("skin validator", () => {
  test("accepts scoped contract selectors", () => {
    expect(validate('[data-skin="test"] [data-control-ui="button"][data-slot="root"] { color: red; }').exitCode).toBe(0);
    expect(validate('[data-skin="test"] [data-control-ui][data-control="true"] { color: red; }').exitCode).toBe(0);
  });

  test("rejects legacy, unknown, unscoped, and bare-host selectors", () => {
    const result = validate(`
      [data-ui="agent"] { color: red; }
      [data-control-ui="missing"][data-slot="root"] { color: red; }
      [data-skin="test"] button { color: red; }
    `);
    const error = result.stderr.toString();
    expect(result.exitCode).toBe(1);
    expect(error).toContain("legacy");
    expect(error).toContain("unknown scope missing");
    expect(error).toContain("not scoped by data-skin");
    expect(error).toContain("bare host selector");
  });

  test("validates reordered parts, pseudo selectors, and state values structurally", () => {
    const result = validate(`
      [data-skin="test"] [data-slot="missing"][data-control-ui="button"] { color: red; }
      [data-skin="test"] [data-control-ui="button"]:hover[data-slot="missing"] { color: red; }
      [data-skin="test"] [data-control-ui="button"][data-slot="root"][data-variant="definitely-not-real"] { color: red; }
    `);
    const error = result.stderr.toString();
    expect(result.exitCode).toBe(1);
    expect(error.match(/unknown part button:missing/g)).toHaveLength(2);
    expect(error).toContain("unsupported state value button:root data-variant=definitely-not-real");
  });

  test("requires semantic surface selectors to retain Control UI ownership", () => {
    const result = validate('[data-skin="test"] [data-surface="floating"] { color: red; }');
    expect(result.exitCode).toBe(1);
    expect(result.stderr.toString()).toContain("semantic selector is not Control UI scoped");
  });
});
