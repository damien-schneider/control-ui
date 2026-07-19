import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import type { ThemeAuditResult } from "../app/(features)/theme-accessibility/audit-contract";

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

const requestedPaths = suppliedPaths.length > 0 ? suppliedPaths : [defaultSkinRoot];
const themeFiles = requestedPaths.flatMap(collectThemeFiles);
if (themeFiles.length === 0) throw new Error("No theme.css files found at the supplied path.");

const tailwindTheme = readFileSync(path.join(docsRoot, "node_modules/tailwindcss/theme.css"), "utf8").replace("@theme default", ":root");
const coreTheme = readFileSync(path.join(docsRoot, "src/registry/sources/control-ui/theme.css"), "utf8");
const browserEntry = path.join(docsRoot, "scripts/theme-accessibility-browser.ts");
const bundle = await Bun.build({ entrypoints: [browserEntry], target: "browser", minify: true });
if (!bundle.success || !bundle.outputs[0]) throw new Error("Could not build the browser accessibility audit.");
const auditScript = await bundle.outputs[0].text();
const browser = await chromium.launch({ headless: true });
const reports: Array<{ file: string; skin: string; mode: "light" | "dark"; results: ThemeAuditResult[] }> = [];

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
      reports.push({ file: path.relative(process.cwd(), file), skin, mode, results });
    }
    await page.close();
  }
} finally {
  await browser.close();
}

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
}

const hasErrors = reports.some((report) => report.results.some((result) => result.severity === "error" && result.status !== "pass"));
if (hasErrors) process.exitCode = 1;
