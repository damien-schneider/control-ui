import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { buildOverrideDecls, buildOverrideSheetCss } from "./override-decls";
import type { ThemeState } from "./types";

// SPEC for editor→skin override path + portal fix: Overlay/Popover opacity tokens did nothing on portalled surfaces (XP dialogs) because inline <html> vars don't reach body-portalled elements that re-assert data-skin.
// buildOverrideSheetCss carries the diff to them, scoped to the ACTIVE skin so it wins the cascade there.
// DOM-free pure serializers, run under bun test.

const BASE: ThemeState = {
  skin: "xp",
  customThemeId: null,
  reduceMotion: false,
  labelMode: "friendly",
  overrides: {},
  light: {},
  dark: {},
  textFixes: {},
};

const theme = (patch: Partial<ThemeState>): ThemeState => ({ ...BASE, ...patch });

const declMap = (t: ThemeState, isDark = false): Record<string, string> => Object.fromEntries(buildOverrideDecls(t, isDark));

describe("buildOverrideDecls — authors ONLY the overridden tokens", () => {
  test("a fresh skin (no overrides) authors nothing, in either mode", () => {
    expect(buildOverrideDecls(BASE, false)).toEqual([]);
    expect(buildOverrideDecls(BASE, true)).toEqual([]);
  });

  test("a mode-agnostic token authors exactly itself, in BOTH modes", () => {
    const t = theme({ overrides: { "--overlay-opacity": "0.5" } });
    expect(declMap(t, false)).toEqual({ "--overlay-opacity": "0.5" });
    expect(declMap(t, true)).toEqual({ "--overlay-opacity": "0.5" });
  });

  test("editing one token never drags companions along (per-token contract)", () => {
    const m = declMap(theme({ overrides: { "--radius": "10px" } }));
    expect(m["--radius"]).toBe("10px");
    // Derived rungs stay derived in theme.css — the editor must not pin them.
    expect(m["--radius-control"]).toBeUndefined();
    expect(Object.keys(m)).toHaveLength(1);
  });

  test("independent tokens accumulate; untouched tokens stay absent", () => {
    const m = declMap(theme({ overrides: { "--radius": "4px", "--overlay-opacity": "0.6", "--duration-base": "240ms" } }));
    expect(m).toEqual({ "--radius": "4px", "--overlay-opacity": "0.6", "--duration-base": "240ms" });
  });

  test("a light color edit applies in light mode only — dark keeps the skin's own stack", () => {
    const t = theme({ light: { "--background": "oklch(0.98 0 0)" } });
    expect(declMap(t, false)["--background"]).toBe("oklch(0.98 0 0)");
    expect(declMap(t, true)["--background"]).toBeUndefined();
  });

  test("a dark color edit applies in dark mode only", () => {
    const t = theme({ dark: { "--background": "oklch(0.2 0 0)" } });
    expect(declMap(t, true)["--background"]).toBe("oklch(0.2 0 0)");
    expect(declMap(t, false)["--background"]).toBeUndefined();
  });

  test("the light brand CARRIES into dark (adapted), with a readable foreground", () => {
    const t = theme({ light: { "--primary": "oklch(0.55 0.2 260)" } });
    const dark = declMap(t, true);
    expect(dark["--primary"]).toBeDefined();
    expect(dark["--primary"]).not.toBe("oklch(0.55 0.2 260)"); // adapted, not copied
    expect(dark["--primary-foreground"]).toBeDefined();
  });

  test("an explicit dark brand beats the carry", () => {
    const t = theme({
      light: { "--primary": "oklch(0.55 0.2 260)" },
      dark: { "--primary": "oklch(0.8 0.1 100)" },
    });
    expect(declMap(t, true)["--primary"]).toBe("oklch(0.8 0.1 100)");
  });

  test("the light text choice carries into dark via darkText; other colors do NOT carry", () => {
    const t = theme({ light: { "--foreground": "oklch(0.2 0.05 260)", "--card": "oklch(0.99 0 0)" } });
    const dark = declMap(t, true);
    expect(dark["--foreground"]).toBeDefined();
    expect(dark["--card"]).toBeUndefined();
  });

  test("textFixes land LAST and win over the color branch, in both modes", () => {
    const t = theme({
      light: { "--foreground": "oklch(0.5 0 0)" },
      textFixes: { "--foreground": "#112233" },
    });
    const light = buildOverrideDecls(t, false);
    expect(light[light.length - 1][0]).toBe("--foreground");
    expect(Object.fromEntries(light)["--foreground"]).not.toBe("oklch(0.5 0 0)");
    const dark = declMap(t, true);
    expect(dark["--foreground"]).toBe(Object.fromEntries(light)["--foreground"]);
  });
});

describe("buildOverrideSheetCss — the portal fix: scope the diff to the ACTIVE skin", () => {
  test("empty diff → null (sheet removed so the pack's own values win again)", () => {
    expect(buildOverrideSheetCss("xp", [])).toBeNull();
  });

  test("wraps the decls in a rule scoped to the active skin id", () => {
    const css = buildOverrideSheetCss("xp", [
      ["--overlay-opacity", "0.5"],
      ["--backdrop-blur-overlay", "8px"],
    ]);
    expect(css).toBe(`[data-skin="xp"] {\n  --overlay-opacity: 0.5;\n  --backdrop-blur-overlay: 8px;\n}`);
  });

  test("the selector targets the active skin — so it matches that skin's portalled surfaces", () => {
    expect(buildOverrideSheetCss("rig", [["--radius", "4px"]])).toContain(`[data-skin="rig"]`);
    // NOT an unscoped `[data-skin]` — that would leak edits onto every skin on a multi-skin page.
    expect(buildOverrideSheetCss("rig", [["--radius", "4px"]])).not.toContain("[data-skin] {");
  });

  test("end-to-end: an overlay-opacity override on XP produces a rule that reaches XP dialogs", () => {
    const t = theme({ overrides: { "--overlay-opacity": "0.5" } });
    const css = buildOverrideSheetCss(t.skin, buildOverrideDecls(t, false));
    expect(css).toContain(`[data-skin="xp"]`);
    expect(css).toContain("--overlay-opacity: 0.5;");
  });
});

// Controls only matter if components still READ these tokens; guards against silent regression to hardcoded backdrop (e.g. bg-black/50) ignoring --overlay-*.
describe("component contract: portalled surfaces still consume the overlay/popover tokens", () => {
  const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");

  test("dialog backdrop reads --overlay-opacity + --backdrop-blur-overlay", () => {
    const src = read("../control-ui/ui/dialog.tsx");
    expect(src).toContain("var(--overlay-opacity)");
    expect(src).toContain("var(--backdrop-blur-overlay)");
  });

  test("sheet backdrop reads --overlay-opacity + --backdrop-blur-overlay", () => {
    const src = read("../control-ui/ui/sheet.tsx");
    expect(src).toContain("var(--overlay-opacity)");
    expect(src).toContain("var(--backdrop-blur-overlay)");
  });

  test("the backdrop is token-driven, not a hardcoded bg-black/xx that ignores the token", () => {
    expect(read("../control-ui/ui/dialog.tsx")).not.toMatch(/bg-black\/\d/);
    expect(read("../control-ui/ui/sheet.tsx")).not.toMatch(/bg-black\/\d/);
  });

  test("portalled surfaces re-assert data-skin (so they need the scoped override sheet)", () => {
    // Reason buildOverrideSheetCss exists: without re-assertion they'd inherit inline <html> override and sheet would be redundant.
    expect(read("../control-ui/ui/dialog.tsx")).toContain("data-skin={skinId()}");
  });
});
