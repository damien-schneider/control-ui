import { describe, expect, test } from "bun:test";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { themeArtifactCss } from "@/components/theme-drawer/theme-artifact";
import type { ControlUiThemeArtifactV1 } from "@/components/theme-drawer/types";
import { packThemeArtifacts } from "@/scripts/pack-theme-artifacts";
import { REQUIRED_PAIRS } from "./required-pairs.mjs";

const scriptsDir = fileURLToPath(new URL("./", import.meta.url));
const docsRoot = path.resolve(scriptsDir, "../../../../..");
const doctorPath = path.join(scriptsDir, "control-ui-doctor.mjs");
const tailwindDir = path.dirname(createRequire(import.meta.url).resolve("tailwindcss/package.json"));

function contrastDoctor(skinPack: string | null, override?: string) {
  const app = mkdtempSync(path.join(tmpdir(), "control-ui-contrast-"));
  try {
    const controlUi = path.join(app, "components/control-ui");
    mkdirSync(path.join(controlUi, "scripts"), { recursive: true });
    mkdirSync(path.join(controlUi, "styles"), { recursive: true });
    mkdirSync(path.join(app, "node_modules"));
    symlinkSync(tailwindDir, path.join(app, "node_modules/tailwindcss"));
    for (const script of ["control-ui-doctor.mjs", "contrast-eval.mjs", "required-pairs.mjs"]) {
      copyFileSync(path.join(scriptsDir, script), path.join(controlUi, "scripts", script));
    }
    copyFileSync(path.join(docsRoot, "src/registry/sources/control-ui/theme.css"), path.join(controlUi, "styles/theme.css"));
    if (skinPack)
      copyFileSync(path.join(docsRoot, `src/registry/skin-packs/${skinPack}/theme.css`), path.join(controlUi, "styles/skin-theme.css"));
    const imports = [
      '@import "tailwindcss";',
      '@import "./components/control-ui/styles/theme.css";',
      '@import "./components/control-ui/styles/skin-theme.css";',
    ];
    if (override) {
      writeFileSync(path.join(app, "brand.control-ui-theme.css"), override);
      imports.push('@import "./brand.control-ui-theme.css";');
    }
    writeFileSync(path.join(app, "components.json"), JSON.stringify({ tailwind: { css: "app.css" } }));
    writeFileSync(path.join(app, "app.css"), `${imports.join("\n")}\n`);
    const result = Bun.spawnSync(["node", path.join(controlUi, "scripts/control-ui-doctor.mjs"), "--contrast"]);
    return { exitCode: result.exitCode, stdout: result.stdout.toString(), stderr: result.stderr.toString() };
  } finally {
    rmSync(app, { recursive: true, force: true });
  }
}

describe("control-ui-doctor --contrast", () => {
  test("passes every required pair for an installed pack in both modes", () => {
    const run = contrastDoctor("refined");
    expect(run.exitCode).toBe(0);
    expect(run.stdout).toContain(`light: ${REQUIRED_PAIRS.length}/${REQUIRED_PAIRS.length} pass`);
    expect(run.stdout).toContain(`dark: ${REQUIRED_PAIRS.length}/${REQUIRED_PAIRS.length} pass`);
  });

  test("names the pair an app override breaks and exits non-zero", () => {
    const run = contrastDoctor("refined", '[data-skin="refined"][data-skin] { --foreground: var(--background); }\n');
    expect(run.exitCode).toBe(1);
    expect(run.stderr).toContain("fail        Body text on background: 1.00:1");
  });

  test("stops on a missing skin theme instead of reporting an empty pass", () => {
    const run = contrastDoctor(null);
    expect(run.exitCode).not.toBe(0);
    expect(run.stderr).toContain("skin-theme.css");
  });
});

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
