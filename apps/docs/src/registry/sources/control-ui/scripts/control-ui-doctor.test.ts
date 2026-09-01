import { describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { themeArtifactCss } from "@/components/theme-drawer/theme-artifact";
import type { ControlUiThemeArtifactV1 } from "@/components/theme-drawer/types";
import { packThemeArtifacts } from "@/scripts/pack-theme-artifacts";

const doctorPath = fileURLToPath(new URL("./control-ui-doctor.mjs", import.meta.url));

// The doctor ships inside an install and cannot import the docs app, so the emitter lives twice; this is the guard.
function emitCss(artifact: ControlUiThemeArtifactV1) {
  const directory = mkdtempSync(path.join(tmpdir(), "control-ui-emit-"));
  try {
    const artifactPath = path.join(directory, `${artifact.baseSkin}.control-ui-theme.json`);
    writeFileSync(artifactPath, `${JSON.stringify(artifact, null, 2)}\n`);
    const result = Bun.spawnSync(["node", doctorPath, "--emit-css", artifactPath]);
    if (result.exitCode !== 0) throw new Error(result.stderr.toString());
    return { css: readFileSync(artifactPath.replace(/\.json$/, ".css"), "utf8"), stdout: result.stdout.toString() };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

describe("control-ui-doctor --emit-css", () => {
  for (const artifact of packThemeArtifacts()) {
    test(`emits the same CSS as the drawer for the ${artifact.baseSkin} pack`, () => {
      expect(emitCss(artifact).css).toBe(themeArtifactCss(artifact));
    });
  }

  test("reminds the reader to stamp data-motion when the theme reduces motion", () => {
    const artifact = packThemeArtifacts().find((pack) => pack.reduceMotion);
    if (!artifact) throw new Error("no shipped pack artifact reduces motion");
    expect(emitCss(artifact).stdout).toContain('data-motion="reduced"');
    expect(emitCss({ ...artifact, reduceMotion: false }).stdout).not.toContain('data-motion="reduced"');
  });

  test("refuses a path that is not a theme artifact", () => {
    const result = Bun.spawnSync(["node", doctorPath, "--emit-css", "theme.css"]);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr.toString()).toContain("<name>.control-ui-theme.json");
  });
});
