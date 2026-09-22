import { expect, test } from "bun:test";
import googleFontCatalogue from "./google-fonts.json";
import { BUNDLED_FONTS, CURATED_FONTS, findThemeFont, themeFontCatalogueBrief, themeFontUrl } from "./theme-fonts";

const catalogue: Record<string, { family: string; weights: number[] }> = googleFontCatalogue;

function catalogueFont(name: string) {
  const font = findThemeFont(name);
  if (!font) throw new Error(`${name} is not a resolvable family`);
  return font;
}

// The same lookup runs on every streamed chunk, where a half-arrived name is indistinguishable from a
// wrong one. Resolving either to a default would paint a face the theme never asked for.
test("an unresolvable request names no font at all", () => {
  for (const request of ["", "   ", "???", "Playf", "definitely not a typeface 42"]) {
    expect(findThemeFont(request)).toBeNull();
  }
});

test("a curated family resolves from its id and from its raw display name", () => {
  const byId = catalogueFont("playfair-display");
  expect(byId.source).toBe("curated");
  expect(catalogueFont("Playfair Display")).toEqual(byId);
  expect(catalogueFont("  playfair  display ")).toEqual(byId);
  expect(byId.family).toBe("Playfair Display");
});

test("a Google family outside the curated set resolves from the catalogue", () => {
  const font = catalogueFont("Cormorant Garamond");
  expect(font.source).toBe("google");
  expect(font.id).toBe("cormorant-garamond");
  expect(font.family).toBe("Cormorant Garamond");
  expect(font.stack).toBe('"Cormorant Garamond", ui-serif, Georgia, serif');
  expect(font.weights).toContain(400);
});

test("every bundled stack keeps its named face inside the var() fallback", () => {
  for (const font of BUNDLED_FONTS) {
    if (!font.stack.includes("var(")) continue;
    expect(font.stack).toMatch(/^var\(--[a-z0-9-]+, "[^"]+"\)/);
    expect(font.stack).toContain(`, "${font.family}")`);
    expect(font.stack).not.toMatch(/var\([^)]*\), *"/);
  }
});

test("bundled fonts need no webfont request", () => {
  for (const font of BUNDLED_FONTS) {
    expect(themeFontUrl(font)).toBeNull();
  }
});

test("a webfont url is one safe line of at most four weights", () => {
  for (const font of [...CURATED_FONTS, catalogueFont("Cormorant Garamond")]) {
    const url = themeFontUrl(font);
    expect(url).not.toBeNull();
    const request = String(url);
    expect(request).not.toInclude("\n");
    expect(request).not.toInclude('"');
    expect(request).not.toInclude("'");
    expect(request).toStartWith("https://fonts.googleapis.com/css2?family=");
    expect(request).toEndWith("&display=swap");
    expect(request.split("family=")[1].split(":wght@")[0]).not.toInclude(" ");

    const weights = request.split("wght@")[1].split("&")[0].split(";").map(Number);
    expect(weights.length).toBeGreaterThan(0);
    expect(weights.length).toBeLessThanOrEqual(4);
    expect(weights).toEqual([...weights].sort((left, right) => left - right));
    expect(new Set(weights).size).toBe(weights.length);
    for (const weight of weights) expect(font.weights).toContain(weight);
    if (font.weights.includes(400)) expect(weights).toContain(400);
  }
});

test("every curated font is a real catalogue family that resolves to itself", () => {
  expect(CURATED_FONTS.length).toBeGreaterThanOrEqual(12);
  for (const font of CURATED_FONTS) {
    const entry = catalogue[font.id];
    expect(entry).toBeDefined();
    expect(font.family).toBe(entry.family);
    expect(font.weights).toEqual(entry.weights);
    expect(findThemeFont(font.family)).toEqual(font);
    expect(findThemeFont(font.id)).toEqual(font);
  }
});

test("the catalogue brief lists every offered font in one short prompt block", () => {
  const brief = themeFontCatalogueBrief();
  expect(brief.length).toBeLessThan(900);
  expect(brief.split("\n")).toHaveLength(BUNDLED_FONTS.length + CURATED_FONTS.length);
  for (const font of [...BUNDLED_FONTS, ...CURATED_FONTS]) {
    expect(brief).toInclude(`${font.id} — ${font.family} (`);
  }
});

test("a bundled face named by its family resolves to the bundled font, not a Google request", () => {
  expect(findThemeFont("Inter")?.source).toBe("bundled");
  expect(findThemeFont("JetBrains Mono")?.source).toBe("bundled");
  expect(findThemeFont("System UI")?.source).toBe("bundled");
});
