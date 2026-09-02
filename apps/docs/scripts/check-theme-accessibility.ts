import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type Page } from "@playwright/test";
import type { ThemeAuditResult } from "../app/(features)/theme-accessibility/audit-contract";
import { evaluate, tokenMaps } from "../src/registry/sources/control-ui/scripts/contrast-eval.mjs";
import { REQUIRED_PAIRS } from "../src/registry/sources/control-ui/scripts/required-pairs.mjs";

const docsRoot = fileURLToPath(new URL("../", import.meta.url));
const defaultSkinRoot = path.join(docsRoot, "src/registry/skin-packs");
const jsonOutput = process.argv.includes("--json");
const suppliedPaths = process.argv.slice(2).filter((argument) => !argument.startsWith("--"));

function collectThemeFiles(inputPath: string): string[] {
  const resolvedPath = path.resolve(process.cwd(), inputPath);
  if (!existsSync(resolvedPath)) throw new Error(`Theme path does not exist: ${inputPath}`);
  if (!statSync(resolvedPath).isDirectory()) return [resolvedPath];

  const directTheme = path.join(resolvedPath, "theme.css");
  if (existsSync(directTheme)) return [directTheme];

  return readdirSync(resolvedPath, { withFileTypes: true }).flatMap((entry) => {
    if (!entry.isDirectory()) return [];
    const themeFile = path.join(resolvedPath, entry.name, "theme.css");
    return existsSync(themeFile) ? [themeFile] : [];
  });
}

function skinIdFromCss(file: string, source: string): string {
  const match = source.match(/\[data-skin=(?:"([^"]+)"|'([^']+)')\]/);
  const skinId = match?.[1] ?? match?.[2];
  if (!skinId) throw new Error(`${file} does not contain a [data-skin="…"] selector.`);
  return skinId;
}

function resultLine(result: ThemeAuditResult): string {
  const ratio = result.ratio === null ? "unresolved" : `${result.ratio.toFixed(2)}:1`;
  return `${result.category} › ${result.label}: ${ratio} (needs ${result.threshold}:1; ${result.foreground} on ${result.background})`;
}

type RenderedFocusProbe = {
  focused: boolean;
  style: string;
  width: number;
  color: string;
  alpha: number;
  forcedColorAdjust: string;
};

async function labelFocusProbe(page: Page): Promise<RenderedFocusProbe> {
  return page.evaluate(() => {
    const label = document.createElement("label");
    label.dataset.controlUi = "button";
    label.dataset.controlFamily = "button";
    label.dataset.slot = "root";
    label.dataset.control = "true";
    const input = document.createElement("input");
    input.type = "checkbox";
    label.append(input, "Label control");
    document.body.append(label);
    input.focus();
    const styles = getComputedStyle(label);
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (context) {
      context.fillStyle = styles.outlineColor;
      context.fillRect(0, 0, 1, 1);
    }
    const result = {
      focused: label.matches(":has(:focus-visible)"),
      style: styles.outlineStyle,
      width: Number.parseFloat(styles.outlineWidth),
      color: styles.outlineColor,
      alpha: context?.getImageData(0, 0, 1, 1).data[3] ?? 0,
      forcedColorAdjust: styles.forcedColorAdjust,
    };
    label.remove();
    return result;
  });
}

function focusProbeRendered(probe: RenderedFocusProbe): boolean {
  return probe.focused && probe.style !== "none" && probe.width > 0 && probe.alpha > 0 && probe.forcedColorAdjust !== "none";
}

const requestedPaths = suppliedPaths.length > 0 ? suppliedPaths : [defaultSkinRoot];
const themeFiles = requestedPaths.flatMap(collectThemeFiles);
if (themeFiles.length === 0) throw new Error("No theme.css files found at the supplied path.");

const tailwindPalette = readFileSync(createRequire(import.meta.url).resolve("tailwindcss/theme.css"), "utf8");
const tailwindTheme = tailwindPalette.replace("@theme default", ":root");
// The audit renders real anatomy, so it needs the same core sheets the app imports — theme tokens
// alone leave every recipe-owned knob unresolved. globals.css is the one list of what core ships.
const globalsCss = readFileSync(path.join(docsRoot, "app/globals.css"), "utf8");
const coreTheme = [...globalsCss.matchAll(/@import "(\.\.\/src\/registry\/[^"]+)";/g)]
  .map((match) => readFileSync(path.join(docsRoot, "app", match[1]), "utf8"))
  .join("\n");
const installedTokenSources = [tailwindPalette, readFileSync(path.join(docsRoot, "src/registry/sources/control-ui/theme.css"), "utf8")];
const browserEntry = path.join(docsRoot, "scripts/theme-accessibility-browser.ts");
const bundle = await Bun.build({ entrypoints: [browserEntry], target: "browser", minify: true });
if (!bundle.success || !bundle.outputs[0]) throw new Error("Could not build the browser accessibility audit.");
const auditScript = await bundle.outputs[0].text();
const browser = await chromium.launch({ headless: true });
const reports: Array<{ file: string; skin: string; mode: "light" | "dark"; results: ThemeAuditResult[] }> = [];
let forcedColorsChecked = 0;
let labelFocusChecked = 0;

try {
  for (const file of themeFiles) {
    const source = readFileSync(file, "utf8");
    const skin = skinIdFromCss(file, source);
    const skinCssPath = path.join(path.dirname(file), "skin.css");
    const skinCss = existsSync(skinCssPath) ? readFileSync(skinCssPath, "utf8") : "";
    const page = await browser.newPage();
    await page.setContent("<!doctype html><html><body></body></html>");
    await page.addStyleTag({ content: `${tailwindTheme}\n${coreTheme}\n${source}\n${skinCss}` });
    await page.addScriptTag({ content: auditScript });

    for (const mode of ["light", "dark"] as const) {
      await page.evaluate(
        ({ activeSkin, activeMode }) => {
          document.documentElement.dataset.skin = activeSkin;
          document.documentElement.classList.toggle("dark", activeMode === "dark");
        },
        { activeSkin: skin, activeMode: mode },
      );
      const results = await page.evaluate<ThemeAuditResult[]>(() => {
        const audit = Reflect.get(window, "runControlUiThemeAudit");
        if (typeof audit !== "function") throw new Error("Theme accessibility audit did not load.");
        return audit();
      });
      reports.push({ file: path.relative(docsRoot, file), skin, mode, results });
      const labelFocus = await labelFocusProbe(page);
      if (!focusProbeRendered(labelFocus)) {
        throw new Error(`${skin} ${mode}: label-wrapped focus outline did not render (${JSON.stringify(labelFocus)})`);
      }
      labelFocusChecked += 1;
    }
    await page.emulateMedia({ forcedColors: "active" });
    const forcedColorsFocus = await page.evaluate(() => {
      const control = document.createElement("button");
      control.dataset.controlUi = "button";
      control.dataset.controlFamily = "button";
      control.dataset.slot = "root";
      control.dataset.control = "true";
      document.body.append(control);
      control.focus();
      const styles = getComputedStyle(control);
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (context) {
        context.fillStyle = styles.outlineColor;
        context.fillRect(0, 0, 1, 1);
      }
      const result = {
        focused: control.matches(":focus-visible"),
        style: styles.outlineStyle,
        width: Number.parseFloat(styles.outlineWidth),
        color: styles.outlineColor,
        alpha: context?.getImageData(0, 0, 1, 1).data[3] ?? 0,
        forcedColorAdjust: styles.forcedColorAdjust,
      };
      control.remove();
      return result;
    });
    if (
      !forcedColorsFocus.focused ||
      forcedColorsFocus.style === "none" ||
      forcedColorsFocus.width === 0 ||
      forcedColorsFocus.alpha === 0 ||
      forcedColorsFocus.forcedColorAdjust === "none"
    ) {
      throw new Error(`${skin}: forced-colors focus outline did not render (${JSON.stringify(forcedColorsFocus)})`);
    }
    const forcedColorsLabelFocus = await labelFocusProbe(page);
    if (!focusProbeRendered(forcedColorsLabelFocus)) {
      throw new Error(`${skin}: forced-colors label focus outline did not render (${JSON.stringify(forcedColorsLabelFocus)})`);
    }
    forcedColorsChecked += 1;
    await page.emulateMedia({ forcedColors: "none" });
    await page.close();
  }
} finally {
  await browser.close();
}

const parityDrift = reports.flatMap((report) => {
  const tokens = tokenMaps([...installedTokenSources, readFileSync(path.join(docsRoot, report.file), "utf8")])[report.mode];
  return evaluate(tokens, REQUIRED_PAIRS).flatMap((evaluated: { id: string; status: string; ratio: number; reason: string | null }) => {
    if (evaluated.status === "unverified")
      return [`${report.skin} ${report.mode}: ${evaluated.id} — contrast-eval cannot resolve it: ${evaluated.reason}`];
    const rendered = report.results.find((result) => result.id === evaluated.id);
    if (rendered?.ratio == null) return [];
    // The browser probe paints through a canvas, which quantizes each layer's alpha to 8 bits; that costs ~0.1 of ratio.
    if (Math.abs(rendered.ratio - evaluated.ratio) <= 0.25) return [];
    return [
      `${report.skin} ${report.mode}: ${evaluated.id} — contrast-eval reads ${evaluated.ratio.toFixed(2)}:1, the browser renders ` +
        `${rendered.ratio.toFixed(2)}:1 (${rendered.foreground} ${rendered.resolvedForeground} on ${rendered.background} ${rendered.resolvedBackground})`,
    ];
  });
});
if (parityDrift.length > 0) throw new Error(`contrast-eval disagrees with the browser:\n  ${parityDrift.join("\n  ")}`);

if (jsonOutput) {
  console.log(JSON.stringify(reports, null, 2));
} else {
  for (const report of reports) {
    const errors = report.results.filter((result) => result.severity === "error" && result.status !== "pass");
    const warnings = report.results.filter((result) => result.severity === "warning" && result.status !== "pass");
    const requiredCount = report.results.filter((result) => result.severity === "error").length;
    console.log(`\n${report.skin} · ${report.mode} · ${report.file}`);
    console.log(
      `${errors.length === 0 ? "PASS" : "FAIL"} ${requiredCount - errors.length}/${requiredCount} required checks clear WCAG AA.`,
    );
    for (const error of errors) console.error(`  ERROR ${resultLine(error)}`);
    for (const warning of warnings) console.warn(`  WARN  ${resultLine(warning)}`);
  }
  console.log(`\nForced colors focus indicators: PASS ${forcedColorsChecked}/${themeFiles.length} skins.`);
  console.log(`Label-wrapped focus indicators: PASS ${labelFocusChecked}/${themeFiles.length * 2} skin modes.`);
}

const hasErrors = reports.some((report) => report.results.some((result) => result.severity === "error" && result.status !== "pass"));
if (hasErrors) process.exitCode = 1;
