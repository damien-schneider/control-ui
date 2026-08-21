import { afterAll, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { knobPrefix } from "./knob-contracts/collect";

const directory = mkdtempSync(path.join(tmpdir(), "control-ui-skin-validator-"));
afterAll(() => rmSync(directory, { recursive: true, force: true }));

function validate(css: string) {
  const file = path.join(directory, "skin.css");
  writeFileSync(file, css);
  return Bun.spawnSync(["bun", "scripts/validate-skins.ts", `--skin=${file}`], { cwd: process.cwd() });
}

describe("skin validator", () => {
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
    expect(unlayered.stderr.toString()).toContain("paints outside every @layer");

    const utilities = validate('@layer utilities { [data-skin="test"] [data-control-ui="button"][data-slot="content"] { gap: 2px; } }');
    expect(utilities.exitCode).toBe(1);
    expect(utilities.stderr.toString()).toContain("loses to the recipe in @layer components");
  });

  test("rejects paint that bypasses a knob, and @apply that hides it", () => {
    const result = validate(`
      @layer components {
        [data-skin="test"] [data-control-ui="button"][data-slot="root"] { color: red; }
        [data-skin="test"] [data-control-ui="button"][data-slot="root"] { @apply p-2; }
      }
    `);
    const error = result.stderr.toString();
    expect(result.exitCode).toBe(1);
    expect(error).toContain("paints color directly");
    expect(error).toContain(`${knobPrefix}button-foreground`);
    expect(error).toContain("@apply p-2 on Control UI anatomy");
  });

  test("rejects generic anatomy paint that bypasses family knobs", () => {
    const result = validate('@layer components { [data-skin="test"] [data-control-family][data-control="true"] { background: red; } }');
    expect(result.exitCode).toBe(1);
    expect(result.stderr.toString()).toContain("paints background directly");
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
    expect(result.stderr.toString()).toContain("anatomy part keys data-slot without data-control-family");
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
