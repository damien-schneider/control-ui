import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, type Page, test } from "@playwright/test";
import { buildOverrideSheetCss } from "../components/theme-drawer/override-decls";
import { knobsForFamily, validateKnobOverrides } from "../mastra/theme-knobs";

const SKIN = "refined";
const DOCS_ROOT = fileURLToPath(new URL("../", import.meta.url));
const PACK_THEME = readFileSync(path.join(DOCS_ROOT, "src/registry/skin-packs", SKIN, "theme.css"), "utf8");
const APP_PRIMARY = "rgb(123, 45, 67)";
const APP_ROOT_BLOCK = `:root { --primary: ${APP_PRIMARY}; }`;
const OVERRIDE = "rgb(7, 7, 7)";
const KNOB_RADIUS = "13px";
const BUTTON_RECIPE = readFileSync(path.join(DOCS_ROOT, "src/registry/sources/control-ui/recipes/button.css"), "utf8");

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
  const overrideSheet = buildOverrideSheetCss(SKIN, [["--primary", OVERRIDE]], []);
  if (!overrideSheet) throw new Error("The editor emitted no sheet for a non-empty diff");
  expect(await resolvePrimary(page, [PACK_THEME, overrideSheet], "#portal")).toBe(compact(OVERRIDE));
});

// A knob is declared on the component element itself, so nothing authored on the root can reach it. The
// generated rule has to carry the recipe's own selector, and the whole chain — registry lookup, value
// validation, CSS emission — is what decides whether it lands.
test("a generated knob override reaches the component the recipe declares it on", async ({ page }) => {
  const knob = knobsForFamily("button").find((entry) => entry.name === "--cui-button-radius");
  if (!knob) throw new Error("The button family no longer registers --cui-button-radius");

  const { rules } = validateKnobOverrides({ [knob.name]: KNOB_RADIUS });
  const sheet = buildOverrideSheetCss(SKIN, [], rules);
  if (!sheet) throw new Error("The editor emitted no sheet for a valid knob override");

  await page.setContent(
    `<!doctype html><html data-skin="${SKIN}"><body><button id="target" data-control-family="button" data-control="true"></button></body></html>`,
  );
  await page.addStyleTag({ content: BUTTON_RECIPE });
  await page.addStyleTag({ content: sheet });

  const radius = await page.evaluate(() => {
    const target = document.querySelector("#target");
    if (!target) throw new Error("The button never rendered");
    return getComputedStyle(target).borderRadius;
  });

  expect(radius).toBe(KNOB_RADIUS);
});
