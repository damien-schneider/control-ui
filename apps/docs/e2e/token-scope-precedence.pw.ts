import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, type Page, test } from "@playwright/test";
import { buildOverrideSheetCss } from "../components/theme-drawer/override-decls";

const SKIN = "refined";
const DOCS_ROOT = fileURLToPath(new URL("../", import.meta.url));
const PACK_THEME = readFileSync(path.join(DOCS_ROOT, "src/registry/skin-packs", SKIN, "theme.css"), "utf8");
const APP_PRIMARY = "rgb(123, 45, 67)";
const APP_ROOT_BLOCK = `:root { --primary: ${APP_PRIMARY}; }`;
const OVERRIDE = "rgb(7, 7, 7)";

const compact = (value: string) => value.replace(/\s/g, "");

// Pack, app :root block and editor override all declare the same names on the same element; weight alone orders them.
// #inherits reads that fight from the root. #portal re-asserts the scope the way a portalled surface does, where a rule
// matching the element directly beats anything inherited and only equal-or-greater weight wins it back.
async function resolvePrimary(page: Page, sheets: string[], target: "#inherits" | "#portal"): Promise<string> {
  await page.setContent(
    `<!doctype html><html data-skin="${SKIN}"><body><div id="inherits"></div><div id="portal" data-skin="${SKIN}"></div></body></html>`,
  );
  for (const sheet of sheets) await page.addStyleTag({ content: sheet });
  const value = await page.evaluate((selector) => {
    const element = document.querySelector(selector);
    if (!element) throw new Error(`No element matches ${selector}`);
    return getComputedStyle(element).getPropertyValue("--primary");
  }, target);
  return compact(value);
}

test("an installed pack outranks an app's own :root token block in either order", async ({ page }) => {
  expect(await resolvePrimary(page, [APP_ROOT_BLOCK, PACK_THEME], "#inherits")).not.toBe(compact(APP_PRIMARY));
  expect(await resolvePrimary(page, [PACK_THEME, APP_ROOT_BLOCK], "#inherits")).not.toBe(compact(APP_PRIMARY));
});

test("a theme editor override reaches a surface that re-asserts the skin scope", async ({ page }) => {
  const overrideSheet = buildOverrideSheetCss(SKIN, [["--primary", OVERRIDE]]);
  if (!overrideSheet) throw new Error("The editor emitted no sheet for a non-empty diff");
  expect(await resolvePrimary(page, [PACK_THEME, overrideSheet], "#portal")).toBe(compact(OVERRIDE));
});
