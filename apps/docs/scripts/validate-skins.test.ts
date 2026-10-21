import { afterAll, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { knobPrefix } from "./knob-contracts/collect";
import { validateSkinFiles } from "./validate-skins";

const directory = mkdtempSync(path.join(tmpdir(), "control-ui-skin-validator-"));
afterAll(() => rmSync(directory, { recursive: true, force: true }));

function writeSkin(css: string): string {
  const file = path.join(directory, "skin.css");
  writeFileSync(file, css);
  return file;
}

function validate(css: string) {
  const failures = validateSkinFiles([writeSkin(css)]);
  return { exitCode: failures.length > 0 ? 1 : 0, stderr: failures.join("\n") };
}

describe("skin validator", () => {
  test("the CLI rejects semantic surface selectors without Control UI ownership, exiting non-zero", () => {
    const file = writeSkin('[data-skin="test"] [data-surface="floating"] { color: red; }');
    const result = Bun.spawnSync(["bun", "scripts/validate-skins.ts", `--skin=${file}`], { cwd: process.cwd() });
    expect(result.exitCode).toBe(1);
    expect(result.stderr.toString()).toContain("semantic selector is not Control UI scoped");
  });

  test("accepts scoped contract selectors", () => {
    expect(
      validate('@layer components { [data-skin="test"] [data-slot="root"][data-control-family="button"] { --button-bg: red; } }').exitCode,
    ).toBe(0);
    expect(
      validate('@layer components { [data-skin="test"] [data-control-family][data-control="true"] { cursor: crosshair; } }').exitCode,
    ).toBe(0);
  });

  test("rejects paint outside @layer components, where it outranks the consumer's className", () => {
    const unlayered = validate('[data-skin="test"] [data-control-ui="button"][data-slot="content"] { letter-spacing: 0.02em; }');
    expect(unlayered.exitCode).toBe(1);
    expect(unlayered.stderr).toContain("paints outside every @layer");

    const utilities = validate('@layer utilities { [data-skin="test"] [data-control-ui="button"][data-slot="content"] { gap: 2px; } }');
    expect(utilities.exitCode).toBe(1);
    expect(utilities.stderr).toContain("loses to the recipe in @layer components");
  });

  test("rejects paint that bypasses a knob, and @apply that hides it", () => {
    const result = validate(`
      @layer components {
        [data-skin="test"] [data-control-ui="button"][data-slot="root"] { color: red; }
        [data-skin="test"] [data-control-ui="button"][data-slot="root"] { @apply p-2; }
      }
    `);
    const error = result.stderr;
    expect(result.exitCode).toBe(1);
    expect(error).toContain("paints color directly");
    expect(error).toContain(`${knobPrefix}button-foreground`);
    expect(error).toContain("@apply p-2 on Control UI anatomy");
  });

  test("rejects generic anatomy paint that bypasses family knobs", () => {
    const result = validate('@layer components { [data-skin="test"] [data-control-family][data-control="true"] { background: red; } }');
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("paints background directly");
  });

  test("accepts the library's own effects, which compose through @apply", () => {
    expect(
      validate('@layer components { [data-skin="test"] [data-slot="root"][data-control-family="button"] { @apply shimmer-text; } }')
        .exitCode,
    ).toBe(0);
  });

  test("rejects a part keyed by identity, which no longer selects the family's knobs", () => {
    const result = validate('@layer components { [data-skin="test"] [data-control-ui="button"][data-slot="root"] { --button-bg: red; } }');
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("anatomy part keys data-slot without data-control-family");
  });

  test("rejects unknown, unscoped, and bare-host selectors", () => {
    const result = validate(`
      [data-control-ui="missing"][data-slot="root"] { color: red; }
      [data-skin="test"] button { color: red; }
    `);
    const error = result.stderr;
    expect(result.exitCode).toBe(1);
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
    const error = result.stderr;
    expect(result.exitCode).toBe(1);
    expect(error.match(/unknown part button:missing/g)).toHaveLength(2);
    expect(error).toContain("unsupported state value button:root data-variant=definitely-not-real");
  });
});
