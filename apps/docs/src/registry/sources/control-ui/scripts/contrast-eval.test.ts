import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { THEME_AUDIT_PAIRS } from "@/app/(features)/theme-accessibility/audit-contract";
import { contrastRatio as referenceRatio } from "@/src/registry/lib/contrast";
import { composite, contrastRatio, evaluate, resolveColor, tokenMaps } from "./contrast-eval.mjs";
import { REQUIRED_PAIRS } from "./required-pairs.mjs";

const docsRoot = fileURLToPath(new URL("../../../../../", import.meta.url));
const readCss = (relativePath: string) => readFileSync(path.join(docsRoot, relativePath), "utf8");
const tailwindPalette = readFileSync(createRequire(import.meta.url).resolve("tailwindcss/theme.css"), "utf8");
const packsDir = path.join(docsRoot, "src/registry/skin-packs");
const packIds = readdirSync(packsDir).filter((entry) => statSync(path.join(packsDir, entry)).isDirectory());

const packTokens = (pack: string) =>
  tokenMaps([tailwindPalette, readCss("src/registry/sources/control-ui/theme.css"), readCss(`src/registry/skin-packs/${pack}/theme.css`)]);

const rgb = (value: string, tokens = new Map<string, string>()) => resolveColor(value, tokens);

describe("contrast-eval color grammar", () => {
  test("matches the browser-side ratio for literal colors", () => {
    expect(contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })).toBeCloseTo(
      referenceRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }),
      10,
    );
    expect(contrastRatio(rgb("#1f2937"), rgb("#f9fafb"))).toBeCloseTo(referenceRatio(rgb("#1f2937"), rgb("#f9fafb")), 10);
  });

  test("reads a relative color off the token it references", () => {
    const tokens = new Map([["--foreground", "oklch(0.2 0 0)"]]);
    expect(rgb("oklch(from var(--foreground) l c h / 0.5)", tokens)).toMatchObject({ alpha: 0.5 });
    expect(rgb("oklch(from var(--foreground) calc(l + 0.5) c h)", tokens).r).toBeGreaterThan(rgb("var(--foreground)", tokens).r);
  });

  test("composites a translucent wash onto its surface", () => {
    const over = { r: 0, g: 0, b: 0, alpha: 0.5 };
    const under = { r: 255, g: 255, b: 255, alpha: 1 };
    expect(composite(over, under)).toMatchObject({ r: 127.5, g: 127.5, b: 127.5, alpha: 1 });
  });

  test("refuses a self-referencing token instead of recursing", () => {
    const tokens = new Map([
      ["--a", "var(--b)"],
      ["--b", "var(--a)"],
    ]);
    expect(rgb("var(--a)", tokens).unresolved).toContain("refers to itself");
  });

  test("refuses a value grammar it does not model", () => {
    expect(rgb("color-mix(in oklab, red, blue)").unresolved).toContain("color-mix");
  });
});

describe("contrast-eval required pairs", () => {
  test("mirrors the theme-token-only projection of the audit contract", () => {
    const expected = THEME_AUDIT_PAIRS.filter(
      (pair) =>
        pair.severity === "error" &&
        !(pair.foregroundAnatomy || pair.backgroundAnatomy || pair.surfaceAnatomy || pair.backgroundPaint || pair.surfacePaint),
    ).map((pair) => pair.id);
    expect(REQUIRED_PAIRS.map((pair: { id: string }) => pair.id)).toEqual(expected);
  });

  test("routes a block to the modes its prelude names", () => {
    const { light, dark } = tokenMaps([
      '@theme default { --color-red-500: #f00; }\n:where(:not(.dark)) [data-skin="a"] { --background: #fff; }\n.dark [data-skin="a"] { --background: #000; }\n@theme inline { --background: var(--background); }',
    ]);
    expect([light.get("--color-red-500"), dark.get("--color-red-500")]).toEqual(["#f00", "#f00"]);
    expect([light.get("--background"), dark.get("--background")]).toEqual(["#fff", "#000"]);
  });

  for (const pack of packIds) {
    test(`resolves and passes every theme-only pair on the ${pack} pack, both modes`, () => {
      for (const [mode, tokens] of Object.entries(packTokens(pack))) {
        const results = evaluate(tokens, REQUIRED_PAIRS);
        const notPassing = results.filter((result: { status: string }) => result.status !== "pass");
        expect({ mode, notPassing: notPassing.map((result: { id: string; reason: string | null }) => [result.id, result.reason]) }).toEqual(
          {
            mode,
            notPassing: [],
          },
        );
      }
    });
  }
});
