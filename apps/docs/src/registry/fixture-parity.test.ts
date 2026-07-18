import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/*
 * components/control-ui/** = synced fixture of src/registry (WYSIWYG: docs preview = what an installer gets).
 * scripts/sync-installed-fixture.mjs --watch keeps it synced; this test fails `bun test` on drift too, via:
 * 1) spawning the sync script's own --check (walks every manifest mapping, one source of truth)
 * 2) byte-parity on skin.ts/contracts.ts + a fixture-driven sweep of ui/ (catches orphan fixture files).
 */

const APP_ROOT = fileURLToPath(new URL("../../", import.meta.url));

describe("installed fixtures mirror their src/registry sources", () => {
  test("sync-installed-fixture.mjs --check reports no drift", () => {
    const result = spawnSync(process.execPath, ["scripts/sync-installed-fixture.mjs", "--check"], {
      cwd: APP_ROOT,
      encoding: "utf8",
    });
    if (result.status !== 0) {
      throw new Error(`fixture drift (run \`bun run sync\`):\n${result.stdout}${result.stderr}`);
    }
    expect(result.status).toBe(0);
  });

  const BYTE_PAIRS: [fixture: string, source: string][] = [
    ["components/control-ui/skin.ts", "src/registry/skin.ts"],
    ["components/control-ui/contracts.ts", "src/registry/contracts.ts"],
  ];

  for (const [fixture, source] of BYTE_PAIRS) {
    test(`${fixture} is byte-identical to ${source}`, () => {
      const fixtureContent = readFileSync(path.join(APP_ROOT, fixture), "utf8");
      const sourceContent = readFileSync(path.join(APP_ROOT, source), "utf8");
      expect(fixtureContent).toBe(sourceContent);
    });
  }

  test("every components/control-ui/ui file is byte-identical to sources/control-ui/ui", () => {
    const fixtureDir = path.join(APP_ROOT, "components/control-ui/ui");
    const sourceDir = path.join(APP_ROOT, "src/registry/sources/control-ui/ui");
    const failures: string[] = [];
    // Fixture-driven on purpose: source dir also has *.test.* files never installed; a fixture file w/o a source counterpart is an orphan sync can't refresh.
    for (const entry of readdirSync(fixtureDir).sort()) {
      const sourcePath = path.join(sourceDir, entry);
      if (!existsSync(sourcePath)) {
        failures.push(`${entry}: no counterpart in sources/control-ui/ui`);
        continue;
      }
      if (readFileSync(path.join(fixtureDir, entry), "utf8") !== readFileSync(sourcePath, "utf8")) {
        failures.push(`${entry}: differs from source (run \`bun run sync\`)`);
      }
    }
    expect(failures).toEqual([]);
  });
});
